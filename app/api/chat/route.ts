import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callStructured, call } from '@/lib/claude'
import { serverClient } from '@/lib/supabase-server'

const DualResponseSchema = z.object({
  male_response: z.string(),
  female_response: z.string(),
  male_style_notes: z.string(),
  female_style_notes: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { conversation_id, user_prompt, user_id, model } = await req.json() as {
      conversation_id?: string
      user_prompt: string
      user_id: string
      model?: string
    }

    if (!user_prompt?.trim()) {
      return NextResponse.json({ error: 'Provide a prompt' }, { status: 400 })
    }
    if (!user_id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = serverClient()

    // Fetch relevant source chunks for RAG context
    const { data: sources } = await db
      .from('source_chunks')
      .select('content, source_title, author, gender_perspective')
      .limit(8)

    const ragContext = (sources ?? [])
      .map((s: { content: string; source_title: string; author: string }) =>
        `[${s.source_title} — ${s.author}]: ${s.content}`
      )
      .join('\n\n')

    // Create or fetch conversation
    let convId = conversation_id
    if (!convId) {
      const title = await call(
        `Summarize this message in 3-5 words as a short chat title. No quotes, no punctuation, just the title:\n\n"${user_prompt}"`,
        'You generate ultra-short chat titles. Respond with ONLY the 3-5 word title, nothing else.',
        'claude-haiku-4-5-20251001',
      ).then(t => t.trim()).catch(() => user_prompt.slice(0, 40))

      const { data: conv, error } = await db
        .from('conversations')
        .insert({ user_id, title })
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      convId = conv.id
    }

    // Get conversation history for context
    const { data: history } = await db
      .from('messages')
      .select('user_prompt, male_response, female_response, user_pick')
      .eq('conversation_id', convId)
      .order('turn_number', { ascending: true })

    const historyContext = (history ?? [])
      .map((m: { user_prompt: string; male_response: string; female_response: string; user_pick: string | null }) => {
        const picked = m.user_pick === 'male' ? m.male_response : m.female_response
        return `User: ${m.user_prompt}\nChosen response (${m.user_pick} style): ${picked}`
      })
      .join('\n\n')

    const turnNumber = (history?.length ?? 0) + 1

    const system = `You generate two responses to every user message — one from "Kyle" and one from "Kylie." They represent different communication styles grounded in linguistics research. Both are equally smart, helpful, and thoughtful — the difference is HOW they communicate, not WHAT they know.

## IMPORTANT — Response length:
Keep responses concise by default — 2-4 sentences. Only give longer, more detailed responses when the user explicitly asks for more depth, detail, or elaboration (e.g. "tell me more," "can you explain further," "go deeper on that"). Match the depth of your answer to the specificity of their question.

## Research context:
${ragContext}

## Kyle's style (masculine communication patterns):
- Direct and solution-oriented — leads with action steps
- Uses declarative statements, fewer hedges
- "Report talk" — demonstrates knowledge, gets to the point
- Less emotional vocabulary, more precise/technical language
- Frames advice in terms of fairness, logic, and individual agency
- Concise — says what needs to be said, no fluff

## Kylie's style (feminine communication patterns):
- Empathy-first — acknowledges feelings before solutions
- Uses inclusive language ("we," "let's"), questions, hedges ("I think," "maybe")
- "Rapport talk" — builds connection, validates the person
- Richer emotional vocabulary, more expressive
- Frames advice in terms of relationships, context, and care
- Explores nuance — considers how things affect people involved

${historyContext ? `## Conversation so far:\n${historyContext}` : ''}

Both responses must fully answer the question. Make them feel like two real people with distinct voices — natural, not exaggerated.`

    const result = await callStructured(
      `User message: ${user_prompt}`,
      system,
      DualResponseSchema,
      'dual_response',
      model,
    )

    // Save message
    const { data: message, error: msgError } = await db
      .from('messages')
      .insert({
        conversation_id: convId,
        turn_number: turnNumber,
        user_prompt,
        male_response: result.male_response,
        female_response: result.female_response,
        sources_used: (sources ?? []).map((s: { source_title: string; author: string }) => ({ title: s.source_title, author: s.author })),
      })
      .select('id')
      .single()

    if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

    return NextResponse.json({
      conversation_id: convId,
      message_id: message.id,
      turn_number: turnNumber,
      male_response: result.male_response,
      female_response: result.female_response,
      male_style_notes: result.male_style_notes,
      female_style_notes: result.female_style_notes,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Record user's pick
export async function PATCH(req: NextRequest) {
  try {
    const { message_id, pick, user_id } = await req.json() as {
      message_id: string
      pick: 'male' | 'female'
      user_id: string
    }

    if (!message_id || !pick || !user_id) {
      return NextResponse.json({ error: 'Provide message_id, pick, and user_id' }, { status: 400 })
    }

    const db = serverClient()

    // Update message with pick
    const { data: msg, error } = await db
      .from('messages')
      .update({ user_pick: pick })
      .eq('id', message_id)
      .select('conversation_id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update conversation pick counts
    const { data: conv } = await db
      .from('conversations')
      .select('total_picks, male_picks, female_picks')
      .eq('id', msg.conversation_id)
      .single()

    if (conv) {
      await db
        .from('conversations')
        .update({
          total_picks: (conv.total_picks ?? 0) + 1,
          male_picks: pick === 'male' ? (conv.male_picks ?? 0) + 1 : conv.male_picks,
          female_picks: pick === 'female' ? (conv.female_picks ?? 0) + 1 : conv.female_picks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', msg.conversation_id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
