import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Lock } from 'lucide-react'
import type { Match, Prediction } from '../types/database'

interface Props {
  match: Match
  prediction?: Prediction
  onSave: (matchId: string, home: number, away: number) => Promise<void>
  readOnly?: boolean
}

export function MatchPredictionCard({ match, prediction, onSave, readOnly = false }: Props) {
  const isLocked = match.status !== 'SCHEDULED' || new Date(match.match_date) <= new Date()
  const isFinished = match.status === 'FINISHED'
  const [home, setHome] = useState(prediction?.predicted_home?.toString() ?? '')
  const [away, setAway] = useState(prediction?.predicted_away?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasPrediction = prediction !== undefined
  const canEdit = !isLocked && !readOnly

  async function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    setSaving(true)
    await onSave(match.id, h, a)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function getPointsColor(pts: number) {
    if (pts === 3) return 'text-emerald-400'
    if (pts === 1) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className={`rounded-lg border p-4 transition-all ${isFinished ? 'border-slate-600 bg-slate-800/30' : 'border-slate-700 bg-slate-800/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">
          {format(new Date(match.match_date), "d MMM · HH'h'mm", { locale: es })}
        </span>
        {match.group_name && (
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">Grupo {match.group_name}</span>
        )}
        {isFinished && prediction?.points !== null && prediction?.points !== undefined && (
          <span className={`text-sm font-bold ${getPointsColor(prediction.points)}`}>
            +{prediction.points} pts
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            {match.home_team_crest && <img src={match.home_team_crest} alt="" className="w-6 h-6 object-contain" />}
            <span className="font-medium text-slate-200 text-sm">{match.home_team}</span>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-2 shrink-0">
          {isFinished ? (
            <div className="flex items-center gap-1.5 text-lg font-bold">
              <span className="text-slate-100">{match.home_score}</span>
              <span className="text-slate-500">-</span>
              <span className="text-slate-100">{match.away_score}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {canEdit ? (
                <>
                  <input
                    type="number" min="0" max="99"
                    value={home}
                    onChange={(e) => setHome(e.target.value)}
                    className="w-10 h-10 text-center rounded-lg bg-slate-700 border border-slate-600 text-slate-100 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <span className="text-slate-500 font-bold">-</span>
                  <input
                    type="number" min="0" max="99"
                    value={away}
                    onChange={(e) => setAway(e.target.value)}
                    className="w-10 h-10 text-center rounded-lg bg-slate-700 border border-slate-600 text-slate-100 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                  />
                </>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-lg">
                  {isLocked && !isFinished && <Lock className="w-3 h-3 text-slate-500 mr-1" />}
                  {hasPrediction ? (
                    <span className="text-slate-300 font-bold">{prediction!.predicted_home} - {prediction!.predicted_away}</span>
                  ) : (
                    <span className="text-slate-500 text-sm">—</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {match.away_team_crest && <img src={match.away_team_crest} alt="" className="w-6 h-6 object-contain" />}
            <span className="font-medium text-slate-200 text-sm">{match.away_team}</span>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving || home === '' || away === ''}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {saved ? <><Check className="w-4 h-4" /> Guardado</> : saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}
