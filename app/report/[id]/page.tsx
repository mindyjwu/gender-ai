import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverClient } from '@/lib/supabase-server'

type Params = Promise<{ id: string }>

function BarChart({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <span className="text-xs text-white/40">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold gradient-text">GenAI</Link>
          <Link href="/chat" className="text-sm text-white/50 hover:text-white/80 transition-colors">New conversation →</Link>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-2">Your Report</p>
          <h1 className="text-4xl font-bold gradient-text mb-4">Communication Style Analysis</h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">{report.summary}</p>
        </div>

        {/* Spectrum */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Style Spectrum</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-indigo-400 font-bold">♂ Masculine</span>
            <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                style={{ width: `${style.spectrum_position}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 shadow-lg"
                style={{ left: `calc(${style.spectrum_position}% - 8px)` }}
              />
            </div>
            <span className="text-xs text-pink-400 font-bold">Feminine ♀</span>
          </div>
          <p className="text-sm text-white/60 text-center mt-3">{style.primary_style}</p>
          <p className="text-xs text-white/40 text-center mt-1">{style.description}</p>
        </div>

        {/* Pick breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Your Picks</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex h-8 rounded-full overflow-hidden">
                  <div className="bg-indigo-500/70 flex items-center justify-center" style={{ width: `${malePercent}%` }}>
                    <span className="text-xs font-bold text-white">{malePercent}%</span>
                  </div>
                  <div className="bg-pink-500/70 flex items-center justify-center" style={{ width: `${femalePercent}%` }}>
                    <span className="text-xs font-bold text-white">{femalePercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/40 mb-4">
            <span>{breakdown.male_picks} masculine picks</span>
            <span>{breakdown.female_picks} feminine picks</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{breakdown.pattern_analysis}</p>

          {/* Topic preferences */}
          {breakdown.topic_preferences.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider">By Topic</h3>
              {breakdown.topic_preferences.map((tp, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg px-3 py-2">
                  <span className={`text-xs font-bold mt-0.5 ${tp.preferred_style === 'male' ? 'text-indigo-400' : 'text-pink-400'}`}>
                    {tp.preferred_style === 'male' ? '♂' : '♀'}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white/70">{tp.topic}</span>
                    <p className="text-xs text-white/40">{tp.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communication traits */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Communication Traits</h2>
          <div className="flex flex-col gap-4">
            <BarChart label="Directness" value={style.directness} color="bg-indigo-500" />
            <BarChart label="Empathy Focus" value={style.empathy_focus} color="bg-pink-500" />
            <BarChart label="Solution Orientation" value={style.solution_orientation} color="bg-indigo-500" />
            <BarChart label="Collaborative Tendency" value={style.collaborative_tendency} color="bg-pink-500" />
          </div>
        </div>

        {/* Personality insights */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Personality Insights</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/30 font-semibold mb-1">Conflict Style</p>
              <p className="text-sm text-white/70">{personality.conflict_style}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 font-semibold mb-1">Leadership Style</p>
              <p className="text-sm text-white/70">{personality.leadership_style}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 font-semibold mb-1">Decision Making</p>
              <p className="text-sm text-white/70">{personality.decision_making}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 font-semibold mb-1">Info Processing</p>
              <p className="text-sm text-white/70">{personality.information_processing}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-white/30 font-semibold mb-2">Values in Communication</p>
            <div className="flex flex-wrap gap-1.5">
              {personality.values_in_communication.map(v => (
                <span key={v} className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-medium border border-purple-500/20">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trait comparison */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Trait Breakdown</h2>
          <div className="flex flex-col gap-3">
            {chart.traits.map((t, i) => (
              <div key={i}>
                <BarChart label={t.trait} value={t.your_score} color="bg-gradient-to-r from-indigo-500 to-pink-500" />
                <p className="text-xs text-white/30 mt-0.5">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col gap-4 pb-8">
          <Link
            href="/chat"
            className="btn-primary text-white font-bold py-3 px-8 rounded-xl inline-block"
          >
            Start a new conversation →
          </Link>
          <p className="text-xs text-white/30">Each conversation reveals different facets of your communication style.</p>
        </div>
      </main>
    </div>
  )
}
