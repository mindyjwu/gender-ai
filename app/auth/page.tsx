'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { browserClient } from '@/lib/supabase-browser'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = browserClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setMessage('Check your email for a confirmation link!')
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/chat')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold gradient-text tracking-tight">GenAI</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Start discovering your communication style' : 'Sign in to continue your conversations'}
            </p>
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
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
              />
            </div>

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
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
