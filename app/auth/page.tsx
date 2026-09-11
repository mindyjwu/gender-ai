'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { browserClient } from '@/lib/supabase-browser'

type Mode = 'signin' | 'signup' | 'forgot'

const COPY: Record<Mode, { title: string; subtitle: string; button: string }> = {
  signin: { title: 'Welcome back', subtitle: 'Sign in to continue your conversations', button: 'Sign in' },
  signup: { title: 'Create your account', subtitle: 'Start discovering your communication style', button: 'Create account' },
  forgot: { title: 'Reset your password', subtitle: 'We’ll email you a link to choose a new one', button: 'Send reset link' },
}

const INPUT_CLASS =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = browserClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link!')
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      if (error) setError(error.message)
      else setMessage('If an account exists for that email, a reset link is on its way. Open it on this device to choose a new password.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/chat')
        return
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold gradient-text tracking-tight">GenAI</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{COPY[mode].title}</h1>
            <p className="text-sm text-gray-400">{COPY[mode].subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={INPUT_CLASS}
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-500">Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-violet-500 hover:text-violet-700 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={INPUT_CLASS}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:bg-gray-800 transition-colors shadow-sm mt-1"
            >
              {loading ? 'Loading...' : COPY[mode].button}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">What your account saves</p>
              <ul className="text-xs text-gray-500 leading-relaxed list-disc pl-4 flex flex-col gap-1">
                <li><strong>Every conversation</strong> — your messages and both Kyle and Kylie’s answers, so you can pick up where you left off.</li>
                <li><strong>Every pick</strong> — which answer you chose on each turn. This is the data your style report is built from.</li>
                <li><strong>Your reports</strong> — the communication-style analysis generated at the end of a conversation.</li>
              </ul>
              <p className="text-xs text-gray-400 leading-relaxed">
                Everything is keyed to your account and visible only when you are signed in. Nothing is shared with other users.
              </p>
            </div>
          )}

          <div className="text-center flex flex-col gap-2">
            {mode === 'forgot' ? (
              <button onClick={() => switchMode('signin')} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Back to sign in
              </button>
            ) : (
              <button onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
