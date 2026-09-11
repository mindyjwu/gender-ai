import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverClient } from '@/lib/supabase-server'

type Params = Promise<{ id: string }>

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function BarChart({ label, value, color }: { label: string; value: number; color: string }) {
  const v = clamp(value)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <span className="text-xs text-gray-400">{v}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default async function ReportPage({ params }: { params: Params }) {
  const { id } = await params
  const db = serverClient()

  const { data: report, error } = await db
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !report) notFound()

  const style = report.communication_style as {
    primary_style: string
    spectrum_position: number
    directness: number
    empathy_focus: number
    solution_orientation: number
    collaborative_tendency: number
    description: string
  }

  const personality = report.personality_insights as {
    conflict_style: string
    leadership_style: string
    decision_making: string
    information_processing: string
    values_in_communication: string[]
  }

  const breakdown = report.pick_breakdown as {
    total_picks: number
    male_picks: number
    female_picks: number
    pattern_analysis: string
    topic_preferences: Array<{ topic: string; preferred_style: string; insight: string }>
  }

  const chart = report.comparison_chart as {
    traits: Array<{ trait: string; your_score: number; description: string }>
  }

  const malePercent = breakdown.total_picks > 0 ? Math.round((breakdown.male_picks / breakdown.total_picks) * 100) : 50
  const femalePercent = 100 - malePercent
  const spectrum = clamp(style.spectrum_position)

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <nav className="border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text tracking-tight">GenAI</Link>
          <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Back to chat &rarr;</Link>
        </div>
      </nav>

      <main className="max-w-3xl w-full mx-auto px-8 py-16 flex flex-col gap-8">
        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-medium text-violet-500 tracking-wide uppercase mb-3">Your report</p>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Communication Style Analysis</h1>
          <p className="text-base text-gray-500 max-w-lg mx-auto leading-relaxed">{report.summary}</p>
        </div>

        {/* Spectrum */}
        <Card title="Style spectrum">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-violet-600 font-semibold whitespace-nowrap">Kyle · report</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500"
                style={{ width: `${spectrum}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-900 shadow"
                style={{ left: `calc(${spectrum}% - 8px)` }}
              />
            </div>
            <span className="text-xs text-sky-600 font-semibold whitespace-nowrap">rapport · Kylie</span>
          </div>
          <p className="text-sm font-medium text-gray-900 text-center mt-4">{style.primary_style}</p>
          <p className="text-sm text-gray-500 text-center mt-1 leading-relaxed">{style.description}</p>
        </Card>

        {/* Pick breakdown */}
        <Card title="Your picks">
          <div className="flex h-8 rounded-full overflow-hidden mb-2">
            {malePercent > 0 && (
              <div className="bg-violet-500 flex items-center justify-center" style={{ width: `${malePercent}%` }}>
                <span className="text-xs font-semibold text-white">{malePercent}%</span>
              </div>
            )}
            {femalePercent > 0 && (
              <div className="bg-sky-500 flex items-center justify-center" style={{ width: `${femalePercent}%` }}>
                <span className="text-xs font-semibold text-white">{femalePercent}%</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>{breakdown.male_picks} Kyle pick{breakdown.male_picks === 1 ? '' : 's'}</span>
            <span>{breakdown.female_picks} Kylie pick{breakdown.female_picks === 1 ? '' : 's'}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{breakdown.pattern_analysis}</p>

          {breakdown.topic_preferences?.length > 0 && (
            <div className="mt-5 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">By topic</h3>
              {breakdown.topic_preferences.map((tp, i) => {
                const kyle = tp.preferred_style === 'male'
                return (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${kyle ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                      {kyle ? 'Kyle' : 'Kylie'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tp.topic}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{tp.insight}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Communication traits */}
        <Card title="Communication traits">
          <div className="flex flex-col gap-4">
            <BarChart label="Directness" value={style.directness} color="bg-violet-500" />
            <BarChart label="Empathy focus" value={style.empathy_focus} color="bg-sky-500" />
            <BarChart label="Solution orientation" value={style.solution_orientation} color="bg-violet-500" />
            <BarChart label="Collaborative tendency" value={style.collaborative_tendency} color="bg-sky-500" />
          </div>
        </Card>

        {/* Personality insights */}
        <Card title="Personality insights">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              ['Conflict style', personality.conflict_style],
              ['Leadership style', personality.leadership_style],
              ['Decision making', personality.decision_making],
              ['Information processing', personality.information_processing],
            ].map(([label, text]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          {personality.values_in_communication?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400 mb-2">Values in communication</p>
              <div className="flex flex-wrap gap-1.5">
                {personality.values_in_communication.map(v => (
                  <span key={v} className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium border border-violet-100">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Trait comparison */}
        {chart.traits?.length > 0 && (
          <Card title="Trait breakdown">
            <div className="flex flex-col gap-4">
              {chart.traits.map((t, i) => (
                <div key={i}>
                  <BarChart label={t.trait} value={t.your_score} color="bg-gradient-to-r from-violet-500 to-sky-500" />
                  <p className="text-xs text-gray-400 mt-1">{t.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          This report describes your preference for a communication register. It does not infer anything about your gender &mdash; research finds the average difference between men and women on these features is small, and both registers are used by everyone.
        </p>

        {/* CTA */}
        <div className="text-center flex flex-col gap-3 pb-8">
          <Link
            href="/chat"
            className="self-center bg-gray-900 text-white font-semibold text-sm py-2.5 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            Start a new conversation
          </Link>
          <p className="text-xs text-gray-400">Each conversation reveals different facets of your style.</p>
        </div>
      </main>
    </div>
  )
}
