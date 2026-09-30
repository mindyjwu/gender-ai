import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold gradient-text tracking-tight">GenAI</span>
            <Link href="/about" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              About
            </Link>
          </div>
          <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="max-w-2xl flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-violet-500 tracking-wide uppercase">Communication Style Discovery</p>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
              Two voices.<br />
              <span className="gradient-text">Your preference.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
              Ask any question and get responses from <span className="text-violet-600 font-medium">Kyle</span> and <span className="text-sky-600 font-medium">Kylie</span> — two AI personas with distinct communication styles. Your choices reveal how you prefer to connect.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Ask anything</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Career, relationships, decisions — whatever is on your mind.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Two perspectives</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Kyle and Kylie respond in their own voice. Pick the one that resonates.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Discover your style</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Get personalized insights into your communication preferences.</p>
            </div>
          </div>

          {/* Example — lets visitors see the idea before signing up */}
          <section aria-labelledby="example-heading" className="w-full mt-2 text-left">
            <p id="example-heading" className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 text-center">
              Example
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-900 font-medium mb-4">
                &ldquo;I missed a deadline. How do I tell my manager?&rdquo;
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-4">
                  <p className="text-xs font-semibold text-violet-600 mb-1.5">Kyle</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Tell them before they find out. Lead with the facts: what slipped, why, and a new date you can
                    actually hit. Bring one change that keeps it from happening again — that&rsquo;s what they&rsquo;ll remember.
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-4">
                  <p className="text-xs font-semibold text-sky-600 mb-1.5">Kylie</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    That&rsquo;s a stressful conversation, and it says a lot that you want to face it. Maybe start by
                    acknowledging how it affects them and the team, then share what happened and a realistic new date.
                    Asking what would help most right now can make it feel like you&rsquo;re solving it together.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Illustrative answers in each persona&rsquo;s style. Which one sounds more like you? Sign in to ask your own.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <Link
              href="/auth"
              className="bg-gray-900 text-white font-semibold text-base py-3.5 px-10 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Get started
            </Link>
            <p className="text-xs text-gray-400">
              Free to use &middot; <Link href="/about" className="text-violet-500 hover:text-violet-700 transition-colors">Learn how it works</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-xs text-gray-400">GenAI &mdash; Gender + AI</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">About</Link>
            <a href="https://en.wikipedia.org/wiki/Language_and_gender" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Research</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
