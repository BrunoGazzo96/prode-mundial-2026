import type { Match, Prediction } from '../types/database'
import { MatchPredictionCard } from './MatchPredictionCard'

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_32: 'Ronda de 32',
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
        const byGroup = stage === 'GROUP_STAGE'
          ? stageMatches.reduce<Record<string, Match[]>>((acc, m) => {
              const g = m.group_name ?? 'Sin grupo'
              if (!acc[g]) acc[g] = []
              acc[g].push(m)
              return acc
            }, {})
          : null

        return (
          <section key={stage}>
            <h2 className="text-lg font-bold text-slate-200 mb-4 pb-2 border-b border-slate-700">
              {STAGE_LABELS[stage] ?? stage}
            </h2>

            {byGroup ? (
              <div className="space-y-6">
                {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([group, groupMatches]) => (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Grupo {group}</h3>
                    <div className="space-y-2">
                      {groupMatches.map((m) => (
                        <MatchPredictionCard
                          key={m.id}
                          match={m}
                          prediction={predMap.get(m.id)}
                          onSave={onSave}
                          readOnly={readOnly}
                        />
                      ))}
                    </div>
                  </div>
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
        <p className="text-center text-slate-500 py-12">Cargando fixtures del Mundial 2026...</p>
      )}
    </div>
  )
}
