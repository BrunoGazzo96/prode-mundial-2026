import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Lock } from 'lucide-react'
import { getFlagUrl } from '../data/isoFlags'
import type { Match, Prediction } from '../types/database'

interface Props {
  match: Match
  prediction?: Prediction
  onSave: (matchId: string, home: number, away: number) => Promise<void>
  readOnly?: boolean
}

function FlagImg({ team }: { team: string }) {
  const url = getFlagUrl(team)
  if (!url) return <span className="w-7 h-5 bg-slate-700 rounded-sm inline-block" />
  return <img src={url} alt={team} className="w-7 h-5 object-cover rounded-sm inline-block" />
}

function getPointsBadge(pts: number) {
  if (pts === 3) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  if (pts === 1) return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  return 'bg-red-500/20 text-red-400 border-red-500/40'
}

export function MatchPredictionCard({ match, prediction, onSave, readOnly = false }: Props) {
  const isLocked = match.status !== 'SCHEDULED' || new Date(match.match_date) <= new Date()
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY'

  const [home, setHome] = useState(prediction?.predicted_home?.toString() ?? '')
  const [away, setAway] = useState(prediction?.predicted_away?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const canEdit = !isLocked && !readOnly

  async function handleSave() {
    const h = parseInt(home), a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    setSaving(true)
    await onSave(match.id, h, a)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      isFinished ? 'border-slate-700/60 bg-slate-900/40' :
      isLive ? 'border-green-500/40 bg-green-900/10' :
      'border-slate-700 bg-slate-900/60'
    }`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs text-slate-500">
          {format(new Date(match.match_date), "d MMM · HH'h'mm", { locale: es })}
        </span>
        <div className="flex items-center gap-2">
          {match.group_name && (
            <span className="text-xs bg-blue-900/40 border border-blue-700/50 px-1.5 py-0.5 rounded text-blue-400">
              Gr. {match.group_name}
            </span>
          )}
          {isLive && (
            <span className="text-xs bg-green-500/20 border border-green-500/40 px-1.5 py-0.5 rounded text-green-400 animate-pulse font-medium">
              EN VIVO
            </span>
          )}
          {isFinished && prediction?.points !== null && prediction?.points !== undefined && (
            <span className={`text-xs border px-1.5 py-0.5 rounded font-bold ${getPointsBadge(prediction.points)}`}>
              +{prediction.points} pts
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="font-semibold text-slate-200 text-sm text-right leading-tight">{match.home_team}</span>
          <FlagImg team={match.home_team} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isFinished ? (
            <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg font-bold text-white text-base">
              <span>{match.home_score}</span>
              <span className="text-slate-500 mx-0.5">-</span>
              <span>{match.away_score}</span>
            </div>
          ) : canEdit ? (
            <>
              <input type="number" min="0" max="99" value={home} onChange={(e) => setHome(e.target.value)}
                className="w-10 h-10 text-center rounded-lg bg-slate-800 border border-slate-600 text-white text-base font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40" />
              <span className="text-slate-600 font-bold">-</span>
              <input type="number" min="0" max="99" value={away} onChange={(e) => setAway(e.target.value)}
                className="w-10 h-10 text-center rounded-lg bg-slate-800 border border-slate-600 text-white text-base font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40" />
            </>
          ) : (
            <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 px-3 py-1.5 rounded-lg">
              {isLocked && !isFinished && <Lock className="w-3 h-3 text-slate-600 mr-1" />}
              {prediction ? (
                <span className="text-slate-300 font-bold text-sm">{prediction.predicted_home} - {prediction.predicted_away}</span>
              ) : (
                <span className="text-slate-600 text-sm">—</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2">
          <FlagImg team={match.away_team} />
          <span className="font-semibold text-slate-200 text-sm leading-tight">{match.away_team}</span>
        </div>
      </div>

      {canEdit && (
        <div className="mt-2.5 flex justify-center">
          <button onClick={handleSave} disabled={saving || home === '' || away === ''}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs">
            {saved ? <><Check className="w-3.5 h-3.5" /> Guardado</> : saving ? 'Guardando...' : 'Guardar predicción'}
          </button>
        </div>
      )}
    </div>
  )
}
