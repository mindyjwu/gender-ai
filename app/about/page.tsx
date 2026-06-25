import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold gradient-text tracking-tight">GenAI</Link>
            <Link href="/about" className="text-sm font-medium text-gray-900">About</Link>
          </div>
          <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto px-8 py-20">
        <article className="flex flex-col gap-12">
          <div>
            <p className="text-sm font-medium text-violet-500 tracking-wide uppercase mb-3">About the project</p>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">What is GenAI?</h1>
            <p className="text-base text-gray-500 leading-relaxed">
              A play on words, a mirror for how you communicate, and a bridge between linguistics research and everyday conversation.
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">The name</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              &ldquo;GenAI&rdquo; is everywhere as shorthand for <em>generative AI</em>. We took the &ldquo;Gen&rdquo; in a different direction: <strong>Gen</strong>der + <strong>AI</strong>. Instead of just generating text, we explore how gender shapes communication &mdash; and what your preferences reveal about you.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              When you ask a question, you receive two responses &mdash; one from <span className="text-violet-600 font-medium">Kyle</span> and one from <span className="text-sky-600 font-medium">Kylie</span>. Both are equally knowledgeable and thoughtful. The difference is <em>how</em> they communicate.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kyle tends toward directness, solution-orientation, and concision. Kylie tends toward empathy, collaboration, and nuance. These reflect patterns documented by decades of linguistics research &mdash; not stereotypes.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You pick the response you prefer. After several rounds, GenAI surfaces insights about your communication style: are you drawn to directness or empathy? Action or context? Efficiency or connection?
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">The research</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              GenAI&apos;s response styles are grounded in real linguistics and communication research:
            </p>
            <div className="flex flex-col gap-3">
              {[
                { author: 'Deborah Tannen', work: 'You Just Don\'t Understand (1990)', note: 'Pioneered "rapport talk" vs. "report talk" in gendered communication.' },
                { author: 'Carol Gilligan', work: 'In a Different Voice (1982)', note: 'Explored justice vs. care frameworks in moral decision-making.' },
                { author: 'Robin Lakoff', work: 'Language and Woman\'s Place (1975)', note: 'Early research on gendered language patterns.' },
                { author: 'Eckert & McConnell-Ginet', work: 'Language and Gender (2003)', note: 'Research on hedging, inclusive language, and collaborative styles.' },
                { author: 'Janet Holmes', work: 'Women, Men and Politeness (1995)', note: 'Studies on apology, compliment, and feedback patterns across genders.' },
              ].map(r => (
                <div key={r.author} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-900">{r.author}</p>
                  <p className="text-xs text-violet-500 mt-0.5">{r.work}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">What this is not</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This is not about who communicates &ldquo;better.&rdquo; There is no right answer. Both styles are effective, valuable, and used by people of all genders. The point is self-awareness &mdash; understanding <em>why</em> you prefer how something is said, not just what is said.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">&larr; Home</Link>
            <Link
              href="/auth"
              className="bg-gray-900 text-white font-semibold text-sm py-2.5 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Try GenAI
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-xs text-gray-400">GenAI &mdash; Gender + AI</p>
          <a href="https://en.wikipedia.org/wiki/Language_and_gender" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Research</a>
        </div>
      </footer>
    </div>
  )
}
