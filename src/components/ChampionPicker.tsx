import { useState } from 'react'
import { Search, Trophy, Check } from 'lucide-react'
import { useTeamsFromMatches } from '../hooks/useTeamsFromMatches'
import type { ChampionPrediction } from '../types/database'

interface Props {
  current: ChampionPrediction | null
  onSave: (teamName: string, teamCrest?: string) => Promise<void>
  locked?: boolean
}

export function ChampionPicker({ current, onSave, locked = false }: Props) {
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const teams = useTeamsFromMatches()

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelect(name: string, flagUrl: string) {
    if (locked || saving) return
    setSaving(true)
    await onSave(name, flagUrl)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {current && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-900/20">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            {current.team_crest && (
              <img src={current.team_crest} alt="" className="w-7 h-5 object-contain" />
            )}
            <span className="font-bold text-amber-300">{current.team_name}</span>
          </div>
          {current.points !== null && current.points !== undefined && (
            <span className={`font-bold text-lg ${current.points > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
              {current.points > 0 ? `+${current.points} pts` : '0 pts'}
            </span>
          )}
        </div>
      )}

      {locked && !current && (
        <p className="text-slate-500 text-sm text-center py-4">
          El torneo ya comenzó, no se puede cambiar la predicción de campeón.
        </p>
      )}

      {!locked && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar selección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {teams.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">
              Sincronizá los fixtures primero para ver los equipos.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {filtered.map((team) => {
                const isSelected = current?.team_name === team.name
                return (
                  <button
                    key={team.name}
                    onClick={() => handleSelect(team.name, team.flagUrl)}
                    disabled={saving}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-900/30 text-amber-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-blue-600 hover:bg-blue-900/20'
                    }`}
                  >
                    {team.flagUrl ? (
                      <img src={team.flagUrl} alt="" className="w-6 h-4 object-cover rounded-sm shrink-0" />
                    ) : (
                      <span className="w-6 h-4 bg-slate-700 rounded-sm shrink-0 flex items-center justify-center text-xs">?</span>
                    )}
                    <span className="truncate text-xs font-medium">{team.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-auto shrink-0 text-amber-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
