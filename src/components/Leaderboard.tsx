import { Trophy, Star, Target } from 'lucide-react'
import type { LeaderboardEntry } from '../hooks/useLeaderboard'

interface Props {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const medals = ['🥇', '🥈', '🥉']

export function Leaderboard({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Todavía no hay puntos. ¡Carguen sus predicciones!</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Jugador</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="flex items-center justify-center gap-1"><Target className="w-3.5 h-3.5" /> Partidos</span>
            </th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">
              <span className="flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5" /> Campeón</span>
            </th>
            <th className="px-4 py-3 text-center font-bold text-slate-200">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {entries.map((entry, i) => {
            const isMe = entry.userId === currentUserId
            return (
              <tr key={entry.userId} className={`transition-colors ${isMe ? 'bg-emerald-950/40' : 'hover:bg-slate-800/40'}`}>
                <td className="px-4 py-3 text-center text-lg">
                  {i < 3 ? medals[i] : <span className="text-slate-500 text-sm">{i + 1}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${isMe ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {entry.displayName}
                    {isMe && <span className="ml-2 text-xs text-emerald-500 font-normal">(vos)</span>}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 sm:hidden">{entry.predictionsCount} pred.</span>
                </td>
                <td className="px-4 py-3 text-center text-slate-300 hidden sm:table-cell">{entry.matchPoints}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className={entry.championPoints > 0 ? 'text-yellow-400 font-bold' : 'text-slate-500'}>
                    {entry.championPoints > 0 ? `+${entry.championPoints}` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : isMe ? 'text-emerald-400' : 'text-slate-200'}`}>
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
