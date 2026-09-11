import Link from 'next/link'
import { SOURCES, TIERS, WEIGHTS, sourcesByTier, weightedScore, type Source, type SourceType, type Tier } from '@/lib/sources'

const TYPE_LABEL: Record<SourceType, string> = {
  'meta-analysis': 'Meta-analysis',
  study: 'Empirical study',
  book: 'Scholarly book',
  textbook: 'Textbook',
  critique: 'Academic critique',
  popular: 'Popular science',
  documentary: 'Documentary',
  fiction: 'Fiction',
}

const TIER_COLOR: Record<Tier, string> = {
  1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  2: 'bg-sky-50 text-sky-700 border-sky-200',
  3: 'bg-amber-50 text-amber-700 border-amber-200',
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2" title={`${label}: ${value}/5`}>
      <span className="text-[10px] uppercase tracking-wide text-gray-400 w-16 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`h-1.5 w-3 rounded-sm ${i <= value ? 'bg-gray-700' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  )
}

function SourceCard({ s }: { s: Source }) {
  const score = weightedScore(s.scores)
  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm ${s.excluded ? 'border-red-100 opacity-80' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{s.author}</p>
          <p className="text-xs text-violet-500 mt-0.5">
            {s.work} ({s.year})
          </p>
          {s.venue && <p className="text-[11px] text-gray-400 mt-0.5">{s.venue}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-gray-900 leading-none">{score.toFixed(1)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">/ 5 weighted</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.finding}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
        <ScoreBar label="Authority" value={s.scores.authority} />
        <ScoreBar label="Factual" value={s.scores.factualness} />
        <ScoreBar label="Consensus" value={s.scores.consensus} />
        <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">{TYPE_LABEL[s.type]}</span>
      </div>
      {s.excluded && <p className="mt-2 text-[11px] text-red-500 font-medium">{s.excluded}</p>}
    </div>
  )
}

export default function AboutPage() {
  const tiers: Tier[] = [1, 2, 3]

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
              Every message you send produces two answers from the same model with the same knowledge. One is labelled <span className="text-violet-600 font-medium">Kyle</span>, the other <span className="text-sky-600 font-medium">Kylie</span>. The content is held constant; the only variable is the <em>register</em> &mdash; the measurable verbal features the answer is written in.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The two registers are defined by features that linguistics research has actually measured, not by personality traits. Kyle is written at the <strong>assertive / report</strong> end of the continuum: declarative sentences, few hedges, references to quantity and procedure, directives, the solution stated first. Kylie is written at the <strong>affiliative / rapport</strong> end: hedges and tag questions, first- and second-person pronouns, emotion and relationship vocabulary, questions that invite the other person in, acknowledgement before advice. These feature lists come from Mulac et al. (2001), Newman et al. (2008) and the Leaper meta-analyses below.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The names are labels for the two ends of that continuum. They are not a claim that men speak like Kyle or that women speak like Kylie. In the pooled evidence the average gender difference on these features is small (Cohen&apos;s <em>d</em> of roughly 0.1 to 0.3), variation <em>within</em> each gender is far larger than the gap <em>between</em> them, and the same person moves along the continuum depending on audience, setting and power. Kyle and Kylie are therefore two points on a scale that every speaker uses.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You choose the answer you prefer. After several rounds GenAI reports which verbal features you gravitate toward &mdash; directness or acknowledgement, assertion or hedging, procedure or context. The result describes your preference for a register. It does not infer, and cannot infer, anything about your gender.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Similarities and differences: what the studies conclude</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Mostly similar.</strong> The largest body of evidence points to similarity. Across 46 meta-analyses, about 78% of measured gender differences are small or near zero, and verbal variables sit firmly in that group (Hyde 2005). Verbal ability is equal for practical purposes (<em>d</em> = 0.11 across 1.4 million people; Hyde &amp; Linn 1988). Men and women speak the same amount &mdash; about 16,000 words a day each when recorded in daily life (Mehl et al. 2007). In natural online writing, women and men are equally assertive (Park et al. 2016). None of the classic claims about who talks more, who is more articulate, or who is more forceful survive large samples.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Small, real, situational differences.</strong> Where differences appear they are consistent but modest, and they move with context. Women use slightly more tentative language &mdash; hedges, tag questions, disclaimers (<em>d</em> = 0.23) &mdash; but chiefly in groups, with strangers and in lab tasks; in familiar settings the gap nearly closes (Leaper &amp; Robnett 2011). Women use slightly more affiliative speech and men slightly more assertive speech, each by a hair (<em>d</em> = 0.12 and 0.09; Leaper &amp; Ayres 2007). Word choice differs in aggregate: more pronouns, emotion and social words from women; more numbers, articles and object references from men (Newman et al. 2008), reliably enough that gender can be predicted from vocabulary at about 92% on very large samples (Schwartz et al. 2013) even though any two individuals overlap heavily. Women self-disclose slightly more, mainly to close partners (<em>d</em> = 0.18; Dindia &amp; Allen 1992). Men make more floor-taking interruptions (<em>d</em> = 0.33), though overall interruption rates are close (Anderson &amp; Leaper 1998).
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Context beats gender.</strong> The strongest predictors of how someone talks are who they are talking to, where, and with how much power. Tentative language rises when women address men and is more persuasive to them (Carli 1990). Floor time rises with power for men but not for women, who face backlash for the same behaviour (Brescoll 2011). In deliberating groups women speak as much as men only when they are the majority or the group must decide unanimously (Karpowitz &amp; Mendelberg 2014). Even at the Supreme Court, female justices are interrupted about three times as often as their male colleagues (Jacobi &amp; Schweers 2017). These patterns describe the situation, not a fixed trait of the speaker.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>What the model concludes.</strong> Gendered communication is a distribution, not a dichotomy: two heavily overlapping curves whose means differ by a fraction of a standard deviation, shifted further by setting than by sex. GenAI therefore treats &ldquo;masculine&rdquo; and &ldquo;feminine&rdquo; register as ends of a continuum every speaker uses, keeps the measured effect sizes in view when it describes your preferences, and does not use sources whose claims fail at scale.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">The research</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every source the model draws on is listed below, restricted to the verbal layer of communication &mdash; word choice, hedging, turn-taking, floor time and disclosure &mdash; because GenAI is a text conversation. Sources are grouped into three tiers by the kind of evidence they provide, and each is scored on three criteria.
            </p>

            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">How sources are scored</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Each source receives 1&ndash;5 on <strong>Authority</strong> (who published it and where: flagship peer-reviewed journal or university press = 5, trade publisher or broadcaster = 1&ndash;2), <strong>Factualness</strong> (quality of the evidence: sample size, method, replication; fiction is 1 by definition) and <strong>Consensus</strong> (how widely the finding is accepted, or the work is used, by scholars in language-and-gender research). The weighted score is {Math.round(WEIGHTS.authority * 100)}% authority + {Math.round(WEIGHTS.factualness * 100)}% factualness + {Math.round(WEIGHTS.consensus * 100)}% consensus. Factualness is weighted highest because the app makes empirical claims.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Note on the tier names: in library terms a meta-analysis is a &ldquo;secondary&rdquo; source because it analyses other studies. Here the tiers rank <em>evidentiary role in this app</em>, so pooled quantitative evidence is Tier 1.
              </p>
            </div>

            {tiers.map(t => {
              const list = sourcesByTier(t)
              return (
                <div key={t} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 pt-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TIER_COLOR[t]}`}>{TIERS[t].label}</span>
                    <h3 className="text-base font-semibold text-gray-900">{TIERS[t].name}</h3>
                    <span className="text-xs text-gray-400 ml-auto">{list.length} sources</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{TIERS[t].why}</p>
                  {t === 3 && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      The novels and stories are here deliberately. Fiction has no evidentiary weight, but it shows the phenomenon the research measures &mdash; indirectness, floor-holding, the same exchange remembered two ways &mdash; and sets the tone for how Kyle and Kylie are written. They are scored on the same scale for consistency, which is why their factualness is 1.
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    {list.map(s => <SourceCard key={s.id} s={s} />)}
                  </div>
                </div>
              )
            })}

            <p className="text-xs text-gray-400 leading-relaxed">
              {SOURCES.length} sources catalogued; {SOURCES.filter(s => !s.excluded).length} used by the model. Effect sizes are Cohen&apos;s <em>d</em>: 0.2 is conventionally small, 0.5 medium, 0.8 large.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Your account and your data</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              GenAI needs an account because the insight comes from a pattern, not a single answer. Everything is stored against your account and nothing else: each <strong>conversation</strong> (your messages and both responses), each <strong>pick</strong> you make per turn, and each <strong>report</strong> generated from those picks. Sign in from any device and your conversations, pinned chats and reports are there; sign out and they are invisible to anyone else. Delete a conversation and its messages and picks go with it. Forgot your password? Use the reset link on the sign-in page &mdash; your data is unaffected.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900">What this is not</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This is not about who communicates &ldquo;better,&rdquo; and it is not a test of your gender. There is no right answer. Both registers are effective, both are used by people of every gender, and most people use both in a single day. The point is self-awareness &mdash; understanding <em>why</em> you prefer how something is said, not just what is said.
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
