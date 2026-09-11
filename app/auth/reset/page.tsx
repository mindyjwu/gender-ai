'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { browserClient } from '@/lib/supabase-browser'

const INPUT_CLASS =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all'

// Landing page for the Supabase password-recovery link.
// The link carries a recovery token; supabase-js picks it up from the URL and
// creates a temporary session, after which updateUser() may set a new password.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let supabase: ReturnType<typeof browserClient>
    try {
      supabase = browserClient()
    } catch {
      // No Supabase config on this deployment — the link can't be verified.
      queueMicrotask(() => setReady('invalid'))
      return
    }

    // Recovery sessions arrive either via the PASSWORD_RECOVERY event or as an
    // already-established session if the token was processed before we subscribed.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady('ready')
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady('ready')
    })

    // If nothing arrives, the link was expired, already used, or opened elsewhere.
    const timer = setTimeout(() => setReady(r => (r === 'checking' ? 'invalid' : r)), 4000)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await browserClient().auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/chat')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold gradient-text tracking-tight">GenAI</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Choose a new password</h1>
            <p className="text-sm text-gray-400">
              {ready === 'checking' && 'Verifying your reset link…'}
              {ready === 'ready' && 'Your account and conversations are untouched — only the password changes.'}
              {ready === 'invalid' && 'This link is invalid or has expired.'}
            </p>
          </div>

          {ready === 'ready' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1.5">New password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-xs font-medium text-gray-500 mb-1.5">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className={INPUT_CLASS}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:bg-gray-800 transition-colors shadow-sm mt-1"
              >
                {loading ? 'Saving…' : 'Save and sign in'}
              </button>
            </form>
          )}

          {ready === 'invalid' && (
            <div className="text-center">
              <Link href="/auth" className="text-sm text-violet-500 hover:text-violet-700 transition-colors">
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
