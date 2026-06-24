'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { browserClient } from '@/lib/supabase-browser'

type Turn = {
  message_id: string
  turn_number: number
  user_prompt: string
  male_response: string
  female_response: string
  user_pick: 'male' | 'female' | null
}

type Summary = {
  summary: string
  style_label: string
  traits: string[]
} | null

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState<Summary>(null)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const totalPicks = turns.filter(t => t.user_pick).length
  const latestNeedsPick = turns.length > 0 && !turns[turns.length - 1].user_pick

  useEffect(() => {
    browserClient().auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUserId(data.user.id)
    })
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, loading, summary])

  async function sendMessage() {
    if (!input.trim() || loading || !userId || latestNeedsPick) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_prompt: input.trim(),
          user_id: userId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to get response')

      if (!conversationId) setConversationId(data.conversation_id)

      setTurns(prev => [...prev, {
        message_id: data.message_id,
        turn_number: data.turn_number,
        user_prompt: input.trim(),
        male_response: data.male_response,
        female_response: data.female_response,
        user_pick: null,
      }])
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function pickResponse(turnIndex: number, pick: 'male' | 'female') {
    const turn = turns[turnIndex]
    if (!turn || turn.user_pick || !userId) return

    setTurns(prev => prev.map((t, i) => i === turnIndex ? { ...t, user_pick: pick } : t))

    await fetch('/api/chat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: turn.message_id, pick, user_id: userId }),
    })
  }

  async function generateSummary() {
    if (!conversationId || !userId || summaryLoading || totalPicks < 2) return
    setSummaryLoading(true)
    setError('')

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, user_id: userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate summary')
      setSummary({
        summary: data.summary,
        style_label: data.communication_style?.primary_style ?? '',
        traits: data.personality_insights?.values_in_communication ?? [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSummaryLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-10 bg-[var(--background)]">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-base font-bold gradient-text">GenAI</Link>
            <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">About</Link>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {turns.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20">
            <h2 className="text-xl font-semibold text-gray-800">Ask me anything</h2>
            <p className="text-sm text-gray-400 max-w-sm">
              Get two perspectives — <span className="text-violet-500 font-medium">Kyle</span> and <span className="text-sky-500 font-medium">Kylie</span> each respond in their own style. Pick the one you prefer.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                'How should I negotiate a raise?',
                'My friend is going through a hard time',
                'Should I change careers at 30?',
                'How do I deal with a difficult coworker?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, idx) => (
          <div key={turn.message_id} className="flex flex-col gap-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-gray-100 rounded-2xl rounded-br-md px-4 py-2.5 max-w-md">
                <p className="text-sm text-gray-800">{turn.user_prompt}</p>
              </div>
            </div>

            {/* Dual responses */}
            <div className="grid grid-cols-2 gap-3">
              {/* Kyle — purple */}
              <button
                onClick={() => pickResponse(idx, 'male')}
                disabled={!!turn.user_pick}
                className={`text-left rounded-xl border p-4 transition-all ${
                  turn.user_pick === 'male'
                    ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-200'
                    : turn.user_pick === 'female'
                    ? 'opacity-40 border-gray-200 bg-white'
                    : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-violet-500 font-semibold text-xs">Kyle</span>
                  {turn.user_pick === 'male' && (
                    <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">chosen</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{turn.male_response}</p>
              </button>

              {/* Kylie — baby blue */}
              <button
                onClick={() => pickResponse(idx, 'female')}
                disabled={!!turn.user_pick}
                className={`text-left rounded-xl border p-4 transition-all ${
                  turn.user_pick === 'female'
                    ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-200'
                    : turn.user_pick === 'male'
                    ? 'opacity-40 border-gray-200 bg-white'
                    : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sky-500 font-semibold text-xs">Kylie</span>
                  {turn.user_pick === 'female' && (
                    <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full font-medium">chosen</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{turn.female_response}</p>
              </button>
            </div>

            {!turn.user_pick && (
              <p className="text-xs text-gray-400 text-center">Pick the response you prefer to continue</p>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>
        )}

        {/* Inline summary */}
        {summary && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">What we've noticed</h3>
              <button onClick={() => setSummary(null)} className="text-xs text-gray-400 hover:text-gray-600">dismiss</button>
            </div>
            {summary.style_label && (
              <p className="text-xs font-medium text-violet-600">{summary.style_label}</p>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">{summary.summary}</p>
            {summary.traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {summary.traits.map(t => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-gray-200 bg-[var(--background)] sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={latestNeedsPick ? 'Pick a response above to continue...' : 'Ask anything...'}
              disabled={loading || latestNeedsPick}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all disabled:opacity-40"
            />
            {totalPicks >= 2 && (
              <button
                onClick={generateSummary}
                disabled={summaryLoading}
                className="px-3 py-2.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0"
              >
                {summaryLoading ? '...' : 'Insights'}
              </button>
            )}
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || latestNeedsPick}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-30 hover:bg-gray-800 transition-colors shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
