import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <nav className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold gradient-text">GenAI</Link>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-sm font-medium text-gray-900">About</Link>
            <Link href="/auth" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <article className="flex flex-col gap-10">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">About GenAI</h1>
            <p className="text-gray-400 text-sm">The name. The idea. The why.</p>
          </div>

          {/* The name */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Why "GenAI"?</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You've heard "GenAI" everywhere — it's shorthand for <em>generative AI</em>, the technology behind tools like ChatGPT and Claude. But we thought: what if we took the "Gen" in a different direction?
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>GenAI</strong> = <strong>Gen</strong>der + <strong>AI</strong>. Instead of just generating text, we're exploring how gender shapes the way we communicate — and what your preferences say about you.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Same abbreviation. Completely different meaning. That's the point.
            </p>
          </section>

          {/* What it does */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">What GenAI does</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              When you ask GenAI a question, you get two responses — one from <span className="text-violet-500 font-medium">Kyle</span> and one from <span className="text-sky-500 font-medium">Kylie</span>. They're both answering the same question with equal knowledge and thoughtfulness, but their <em>communication styles</em> are different.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kyle tends to be more direct, solution-oriented, and concise. Kylie tends to be more empathetic, collaborative, and nuanced. These aren't stereotypes — they're patterns documented by decades of linguistics research.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You pick the response you prefer. After a few rounds, GenAI can tell you something interesting about how you like to communicate — are you drawn to directness or empathy? Action or context? Efficiency or connection?
            </p>
          </section>

          {/* The research */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">The research behind it</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              GenAI's responses are grounded in real linguistics and communication research, including:
            </p>
            <ul className="text-sm text-gray-600 leading-relaxed flex flex-col gap-2 pl-4">
              <li><strong>Deborah Tannen</strong> — <em>You Just Don't Understand</em> (1990). Pioneered the concepts of "rapport talk" vs. "report talk" in gendered communication.</li>
              <li><strong>Carol Gilligan</strong> — <em>In a Different Voice</em> (1982). Explored how men and women frame moral decisions through different lenses — justice vs. care.</li>
              <li><strong>Robin Lakoff</strong> — <em>Language and Woman's Place</em> (1975). Early research on how language patterns differ across genders.</li>
              <li><strong>Penelope Eckert & Sally McConnell-Ginet</strong> — Research on hedging, inclusive language, and collaborative communication styles.</li>
              <li><strong>Janet Holmes</strong> — Studies on apology behavior, compliment patterns, and feedback styles across genders.</li>
            </ul>
          </section>

          {/* What it's not */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">What GenAI is not</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This isn't about who communicates "better." There's no right or wrong answer when you pick between Kyle and Kylie. Both styles are effective, valuable, and widely used by people of all genders.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The point is self-awareness. Most of us have never thought about <em>why</em> we prefer the way someone says something over what they actually say. GenAI gives you a mirror for that.
            </p>
          </section>

          {/* CTA */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back home</Link>
            <Link
              href="/auth"
              className="bg-gray-900 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try GenAI →
            </Link>
          </div>
        </article>
      </main>
    </div>
  )
}
