'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

type Conversation = {
  id: string
  title: string
  total_picks: number
  pinned: boolean
  created_at: string
  updated_at: string
}

type ModelOption = {
  id: string
  label: string
  description: string
}

const DEFAULT_MODEL = 'claude-sonnet-4-6'

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState<Summary>(null)
  const [insightsDismissedAtPick, setInsightsDismissedAtPick] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [models, setModels] = useState<ModelOption[]>([])
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalPicks = turns.filter(t => t.user_pick).length
  const latestNeedsPick = turns.length > 0 && !turns[turns.length - 1].user_pick
  const showInsightsBadge = insightsDismissedAtPick !== null && totalPicks >= insightsDismissedAtPick + 2

  const currentModel = models.find(m => m.id === selectedModel)

  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then(data => {
      if (data.models) setModels(data.models)
    })
  }, [])

  const loadConversations = useCallback(async (uid: string) => {
    const res = await fetch(`/api/conversations?user_id=${uid}`)
    const data = await res.json()
    if (data.conversations) setConversations(data.conversations)
  }, [])

  const loadConversation = useCallback(async (convId: string) => {
    const res = await fetch(`/api/conversations/${convId}/messages`)
    const data = await res.json()
    if (data.messages) {
      setTurns(data.messages.map((m: { id: string; turn_number: number; user_prompt: string; male_response: string; female_response: string; user_pick: string | null }) => ({
        message_id: m.id,
        turn_number: m.turn_number,
        user_prompt: m.user_prompt,
        male_response: m.male_response,
        female_response: m.female_response,
        user_pick: m.user_pick as 'male' | 'female' | null,
      })))
    }
    setConversationId(convId)
    setSummary(null)
    setInsightsDismissedAtPick(null)
  }, [])

  useEffect(() => {
    browserClient().auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUserId(data.user.id)
      loadConversations(data.user.id)
    })
  }, [router, loadConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, loading, summary])

  function autoResizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  function startNewChat() {
    setConversationId(null)
    setTurns([])
    setSummary(null)
    setInsightsDismissedAtPick(null)
    setInput('')
    setError('')
  }

  async function switchToConversation(convId: string) {
    if (convId === conversationId) return
    await loadConversation(convId)
    setInput('')
    setError('')
  }

  async function deleteConversation(convId: string) {
    if (!userId) return
    await fetch('/api/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: convId, user_id: userId }),
    })
    if (convId === conversationId) startNewChat()
    loadConversations(userId)
  }

  async function togglePin(convId: string, currentlyPinned: boolean) {
    if (!userId) return
    await fetch('/api/conversations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: convId, user_id: userId, pinned: !currentlyPinned }),
    })
    loadConversations(userId)
  }

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
          model: selectedModel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to get response')

      if (!conversationId) {
        setConversationId(data.conversation_id)
        loadConversations(userId)
      }

      setTurns(prev => [...prev, {
        message_id: data.message_id,
        turn_number: data.turn_number,
        user_prompt: input.trim(),
        male_response: data.male_response,
        female_response: data.female_response,
        user_pick: null,
      }])
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '100px'
      }
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

    if (userId) loadConversations(userId)
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
      setInsightsDismissedAtPick(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSummaryLoading(false)
    }
  }

  function dismissSummary() {
    setSummary(null)
    setInsightsDismissedAtPick(totalPicks)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 border-r border-gray-200/60 bg-white/80 backdrop-blur-sm flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between min-w-[256px]">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversations</span>
          <button
            onClick={startNewChat}
            className="text-xs bg-violet-50 text-violet-600 hover:bg-violet-100 font-medium px-2.5 py-1 rounded-lg transition-colors"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-w-[256px]">
          {conversations.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400">No conversations yet</p>
              <p className="text-[10px] text-gray-300 mt-1">Start one above</p>
            </div>
          )}
          {conversations.some(c => c.pinned) && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-5 3-3-1-2 2 5 5-4 6 1 1 6-4 5 5 2-2-1-3 3-5 4-4z"/></svg>
                Pinned
              </p>
            </div>
          )}
          {conversations.filter(c => c.pinned).map(conv => (
            <div
              key={conv.id}
              className={`group flex items-center border-b border-gray-50 transition-all ${
                conv.id === conversationId
                  ? 'bg-violet-50/80 border-l-2 border-l-violet-500'
                  : 'hover:bg-gray-50/80'
              }`}
            >
              <button
                onClick={() => switchToConversation(conv.id)}
                className="flex-1 text-left px-4 py-3 min-w-0"
              >
                <p className={`text-sm truncate ${conv.id === conversationId ? 'text-violet-900 font-medium' : 'text-gray-700'}`}>{conv.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {conv.total_picks} pick{conv.total_picks !== 1 ? 's' : ''}
                </p>
              </button>
              <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => togglePin(conv.id, conv.pinned)} title="Unpin" className="p-1 text-violet-400 hover:text-violet-600 rounded transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-5 3-3-1-2 2 5 5-4 6 1 1 6-4 5 5 2-2-1-3 3-5 4-4z"/></svg>
                </button>
                <button onClick={() => deleteConversation(conv.id)} title="Delete" className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
          {conversations.some(c => c.pinned) && conversations.some(c => !c.pinned) && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recent</p>
            </div>
          )}
          {conversations.filter(c => !c.pinned).map(conv => (
            <div
              key={conv.id}
              className={`group flex items-center border-b border-gray-50 transition-all ${
                conv.id === conversationId
                  ? 'bg-violet-50/80 border-l-2 border-l-violet-500'
                  : 'hover:bg-gray-50/80'
              }`}
            >
              <button
                onClick={() => switchToConversation(conv.id)}
                className="flex-1 text-left px-4 py-3 min-w-0"
              >
                <p className={`text-sm truncate ${conv.id === conversationId ? 'text-violet-900 font-medium' : 'text-gray-700'}`}>{conv.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {conv.total_picks} pick{conv.total_picks !== 1 ? 's' : ''}
                </p>
              </button>
              <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => togglePin(conv.id, conv.pinned)} title="Pin" className="p-1 text-gray-300 hover:text-violet-500 rounded transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 2l-4 4-5 3-3-1-2 2 5 5-4 6 1 1 6-4 5 5 2-2-1-3 3-5 4-4z"/></svg>
                </button>
                <button onClick={() => deleteConversation(conv.id)} title="Delete" className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* External links */}
        <div className="border-t border-gray-100 p-4 flex flex-col gap-2 min-w-[256px]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Research</p>
          {[
            { href: 'https://en.wikipedia.org/wiki/Language_and_gender', label: 'Language & Gender' },
            { href: 'https://en.wikipedia.org/wiki/Deborah_Tannen', label: 'Deborah Tannen' },
            { href: 'https://en.wikipedia.org/wiki/Carol_Gilligan', label: 'Carol Gilligan' },
            { href: 'https://en.wikipedia.org/wiki/Robin_Lakoff', label: 'Robin Lakoff' },
          ].map(link => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-violet-600 transition-colors flex items-center gap-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {link.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-gray-200/60 sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Toggle sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <Link href="/" className="text-base font-bold gradient-text">GenAI</Link>
              <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">About</Link>
            </div>

            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                {currentModel?.label ?? 'Sonnet 4.6'}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {modelDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setModelDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                    {models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false) }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                          m.id === selectedModel ? 'bg-violet-50' : ''
                        }`}
                      >
                        <p className={`text-sm font-medium ${m.id === selectedModel ? 'text-violet-700' : 'text-gray-800'}`}>{m.label}</p>
                        <p className="text-[10px] text-gray-400">{m.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
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
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-2xl rounded-br-md px-4 py-2.5 max-w-md">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{turn.user_prompt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

          {summary && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">What we&apos;ve noticed</h3>
                <button onClick={dismissSummary} className="text-xs text-gray-400 hover:text-gray-600">dismiss</button>
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

        {/* Input area */}
        <footer className="border-t border-gray-200 bg-[var(--background)] sticky bottom-0">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResizeTextarea() }}
                onKeyDown={handleKeyDown}
                placeholder={latestNeedsPick ? 'Pick a response above to continue...' : 'Ask anything — Shift+Enter for new line'}
                disabled={loading || latestNeedsPick}
                rows={3}
                className="w-full px-4 pt-3 pb-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-40 resize-none leading-relaxed bg-transparent rounded-t-xl"
                style={{ minHeight: '100px', maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-[10px] text-gray-300">
                  {currentModel?.label ?? 'Sonnet 4.6'}
                </span>
                <div className="flex items-center gap-2">
                  {totalPicks >= 2 && (
                    <button
                      onClick={generateSummary}
                      disabled={summaryLoading}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 relative ${
                        showInsightsBadge
                          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {summaryLoading ? '...' : 'Insights'}
                      {showInsightsBadge && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim() || latestNeedsPick}
                    className="px-4 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-30 hover:bg-gray-800 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
