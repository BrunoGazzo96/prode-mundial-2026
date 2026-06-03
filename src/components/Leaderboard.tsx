import { Trophy, Target, Star, Hash } from 'lucide-react'
import type { LeaderboardEntry } from '../hooks/useLeaderboard'

interface Props {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const medals = ['🥇', '🥈', '🥉']

export function Leaderboard({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Todavía no hay puntos. ¡Carguen sus predicciones!</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-600 uppercase tracking-wider" style={{ background: '#0d1b33' }}>
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Jugador</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="flex items-center justify-center gap-1"><Hash className="w-3 h-3" /> Pred.</span>
            </th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Part.</span>
            </th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="flex items-center justify-center gap-1"><Star className="w-3 h-3" /> Camp.</span>
            </th>
            <th className="px-4 py-3 text-center text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {entries.map((entry, i) => {
            const isMe = entry.userId === currentUserId
            const isFirst = i === 0
            return (
              <tr
                key={entry.userId}
                className={`transition-colors ${
                  isMe ? 'bg-blue-950/30' :
                  isFirst ? 'bg-amber-950/10' :
                  'hover:bg-slate-800/30'
                }`}
              >
                <td className="px-4 py-3 text-center">
                  {i < 3 ? (
                    <span className="text-base">{medals[i]}</span>
                  ) : (
                    <span className="text-slate-600 text-xs font-medium">{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${isMe ? 'text-blue-400' : isFirst ? 'text-amber-300' : 'text-slate-200'}`}>
                    {entry.displayName}
                    {isMe && <span className="ml-1.5 text-xs text-slate-600 font-normal">(vos)</span>}
                  </span>
                  <span className="ml-2 text-xs text-slate-600 sm:hidden">{entry.predictionsCount} pred.</span>
                </td>
                <td className="px-4 py-3 text-center text-slate-400 hidden sm:table-cell text-xs">{entry.predictionsCount}</td>
                <td className="px-4 py-3 text-center text-slate-400 hidden sm:table-cell text-xs">{entry.matchPoints}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-xs">
                  <span className={entry.championPoints > 0 ? 'text-amber-400 font-bold' : 'text-slate-700'}>
                    {entry.championPoints > 0 ? `+${entry.championPoints}` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-base font-bold ${
                    isFirst ? 'text-amber-400' :
                    isMe ? 'text-blue-400' :
                    'text-slate-200'
                  }`}>
                    {entry.total}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
