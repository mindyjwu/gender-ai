import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callStructured } from '@/lib/claude'
import { serverClient } from '@/lib/supabase-server'

const ReportSchema = z.object({
  summary: z.string(),
  communication_style: z.object({
    primary_style: z.string(),
    spectrum_position: z.number().min(0).max(100),
    directness: z.number().min(0).max(100),
    empathy_focus: z.number().min(0).max(100),
    solution_orientation: z.number().min(0).max(100),
    collaborative_tendency: z.number().min(0).max(100),
    description: z.string(),
  }),
  personality_insights: z.object({
    conflict_style: z.string(),
    leadership_style: z.string(),
    decision_making: z.string(),
    information_processing: z.string(),
    values_in_communication: z.array(z.string()),
  }),
  pick_breakdown: z.object({
    total_picks: z.number(),
    male_picks: z.number(),
    female_picks: z.number(),
    pattern_analysis: z.string(),
    topic_preferences: z.array(z.object({
      topic: z.string(),
      preferred_style: z.string(),
      insight: z.string(),
    })),
  }),
  comparison_chart: z.object({
    traits: z.array(z.object({
      trait: z.string(),
      your_score: z.number().min(0).max(100),
      description: z.string(),
    })),
  }),
  fun_takeaway: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { conversation_id, user_id } = await req.json() as {
      conversation_id: string
      user_id: string
    }

    if (!conversation_id || !user_id) {
      return NextResponse.json({ error: 'Provide conversation_id and user_id' }, { status: 400 })
    }

    const db = serverClient()

    // Fetch full conversation
    const [convRes, msgsRes] = await Promise.all([
      db.from('conversations').select('*').eq('id', conversation_id).eq('user_id', user_id).single(),
      db.from('messages').select('*').eq('conversation_id', conversation_id).order('turn_number', { ascending: true }),
    ])

    if (convRes.error) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    if (!msgsRes.data?.length) return NextResponse.json({ error: 'No messages to analyze' }, { status: 400 })

    const messages = msgsRes.data as Array<{
      user_prompt: string
      male_response: string
      female_response: string
      user_pick: string | null
      turn_number: number
    }>

    const pickedMessages = messages.filter(m => m.user_pick)
    if (pickedMessages.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 picks to generate a report' }, { status: 400 })
    }

    const conversationLog = messages.map(m => {
      return `Turn ${m.turn_number}:
User asked: "${m.user_prompt}"
Male-style response: "${m.male_response}"
Female-style response: "${m.female_response}"
User chose: ${m.user_pick ?? 'no pick'}`
    }).join('\n\n')

    const malePicks = pickedMessages.filter(m => m.user_pick === 'male').length
    const femalePicks = pickedMessages.filter(m => m.user_pick === 'female').length

    const prompt = `Analyze this user's conversation choices and generate a communication style report.

## Conversation log:
${conversationLog}

## Pick summary:
- Total picks: ${pickedMessages.length}
- Report-register picks (Kyle / "male"): ${malePicks} (${((malePicks / pickedMessages.length) * 100).toFixed(0)}%)
- Rapport-register picks (Kylie / "female"): ${femalePicks} (${((femalePicks / pickedMessages.length) * 100).toFixed(0)}%)

The spectrum_position is 0 = strong preference for the report register (direct, declarative, solution-first), 100 = strong preference for the rapport register (acknowledging, hedged, relationship-first), 50 = balanced. All other scores are 0-100 where higher means more of that trait. In pick_breakdown.total_picks, male_picks and female_picks, copy the numbers above exactly. Use "male" or "female" for preferred_style values.

Be specific about WHICH responses they chose and WHY that reveals something about their preferences — reference their actual choices, not generalities. Keep each text field to 1-3 sentences and list at most 4 topic_preferences and 5 traits.`

    const system = `You are a communication style analyst. The user chose between two responses per turn: one written in an assertive "report" register and one in an affiliative "rapport" register. These registers are ends of a continuum every speaker uses; linguistics research finds the average gender difference on them is small, so the labels "male" and "female" are style labels only. Describe the user's PREFERENCE for a register. Never infer, guess or comment on the user's own gender. Be specific, reference their actual choices, and make it feel personalized — warm, insightful and fun, like a really good personality test result. Never be judgmental: both registers are effective.`

    const report = await callStructured(prompt, system, ReportSchema, 'generate_report', undefined, 4096)

    // Save report
    const { data, error } = await db
      .from('reports')
      .insert({
        user_id,
        conversation_id,
        summary: report.summary,
        communication_style: report.communication_style,
        personality_insights: report.personality_insights,
        pick_breakdown: report.pick_breakdown,
        comparison_chart: report.comparison_chart,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Mark conversation as completed
    await db
      .from('conversations')
      .update({ status: 'completed' })
      .eq('id', conversation_id)

    return NextResponse.json({ report_id: data.id, ...report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
