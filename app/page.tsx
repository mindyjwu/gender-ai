import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <nav className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold gradient-text">GenAI</span>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
              About
            </Link>
            <Link href="/auth" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-xl flex flex-col gap-8">
          <div>
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              <span className="gradient-text">GenAI</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              Ask anything. Get two perspectives — <span className="text-violet-500 font-medium">Kyle</span> and <span className="text-sky-500 font-medium">Kylie</span> each respond in their own voice. Pick what resonates. Learn about yourself.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xl mb-2">💬</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Ask anything</h3>
              <p className="text-xs text-gray-400">Career, relationships, decisions — whatever's on your mind.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xl mb-2">⚡</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Two voices</h3>
              <p className="text-xs text-gray-400">Kyle and Kylie each respond in their own style. Pick the one you prefer.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xl mb-2">📊</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Your insights</h3>
              <p className="text-xs text-gray-400">Get a summary of your communication preferences anytime.</p>
            </div>
          </div>

          <Link
            href="/auth"
            className="bg-gray-900 text-white font-semibold text-base py-3 px-8 rounded-xl self-center hover:bg-gray-800 transition-colors"
          >
            Try it free →
          </Link>

          <p className="text-xs text-gray-400">
            No credit card required. <Link href="/about" className="text-violet-500 hover:underline">Learn more about GenAI →</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
