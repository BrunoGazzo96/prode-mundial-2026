import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Match, Prediction } from '../types/database'
import { MatchPredictionCard } from './MatchPredictionCard'

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_32: '16avos de Final',
  ROUND_OF_16: 'Octavos de Final',
  QUARTER_FINALS: 'Cuartos de Final',
  SEMI_FINALS: 'Semifinales',
  FINAL: 'Final',
}

const STAGE_ORDER = ['GROUP_STAGE', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']

interface Props {
  matches: Match[]
  predictions: Prediction[]
  onSave: (matchId: string, home: number, away: number) => Promise<void>
  readOnly?: boolean
}

function GroupSection({ group, matches, predictions, onSave, readOnly }: {
  group: string
  matches: Match[]
  predictions: Prediction[]
  onSave: Props['onSave']
  readOnly: boolean
}) {
  const [open, setOpen] = useState(false)
  const predMap = new Map(predictions.map((p) => [p.match_id, p]))
  const finishedCount = matches.filter(m => m.status === 'FINISHED').length
  const myPredCount = matches.filter(m => predMap.has(m.id)).length

  return (
    <div className="rounded-xl border border-slate-700/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm flex items-center justify-center">
            {group}
          </span>
          <span className="font-semibold text-slate-200 text-sm">Grupo {group}</span>
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <span className="text-xs text-slate-500">
              {myPredCount}/{matches.length} pred.
            </span>
          )}
          {finishedCount > 0 && (
            <span className="text-xs bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 px-2 py-0.5 rounded-full">
              {finishedCount} jugados
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-slate-900/30">
          {matches.map((m) => (
            <MatchPredictionCard
              key={m.id}
              match={m}
              prediction={predMap.get(m.id)}
              onSave={onSave}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MatchList({ matches, predictions, onSave, readOnly = false }: Props) {
  const predMap = new Map(predictions.map((p) => [p.match_id, p]))

  const byStage = STAGE_ORDER.reduce<Record<string, Match[]>>((acc, stage) => {
    const stageMatches = matches.filter((m) => m.stage === stage)
    if (stageMatches.length > 0) acc[stage] = stageMatches
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(byStage).map(([stage, stageMatches]) => {
        const isGroupStage = stage === 'GROUP_STAGE'

        const byGroup = isGroupStage
          ? stageMatches.reduce<Record<string, Match[]>>((acc, m) => {
              const g = m.group_name ?? 'X'
              if (!acc[g]) acc[g] = []
              acc[g].push(m)
              return acc
            }, {})
          : null

        return (
          <section key={stage}>
            <h2 className="text-base font-bold text-slate-200 mb-3 pb-2 border-b border-slate-700/60 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block" />
              {STAGE_LABELS[stage] ?? stage}
            </h2>

            {byGroup ? (
              <div className="space-y-2">
                {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([group, groupMatches]) => (
                  <GroupSection
                    key={group}
                    group={group}
                    matches={groupMatches}
                    predictions={predictions}
                    onSave={onSave}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stageMatches.map((m) => (
                  <MatchPredictionCard
                    key={m.id}
                    match={m}
                    prediction={predMap.get(m.id)}
                    onSave={onSave}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {matches.length === 0 && (
        <p className="text-center text-slate-500 py-12">Cargando fixtures...</p>
      )}
    </div>
  )
}
