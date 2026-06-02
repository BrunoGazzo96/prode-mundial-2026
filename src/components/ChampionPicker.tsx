import { useState } from 'react'
import { Search, Trophy, Check } from 'lucide-react'
import { WC2026_TEAMS } from '../data/teams'
import type { ChampionPrediction } from '../types/database'

interface Props {
  current: ChampionPrediction | null
  onSave: (teamName: string, teamCrest?: string) => Promise<void>
  locked?: boolean
}

export function ChampionPicker({ current, onSave, locked = false }: Props) {
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const filtered = WC2026_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelect(name: string, crest: string) {
    if (locked) return
    setSaving(true)
    await onSave(name, crest)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {current && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-600/50 bg-emerald-950/30">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Tu campeón</p>
            <div className="flex items-center gap-2">
              {current.team_crest && <img src={current.team_crest} alt="" className="w-6 h-6 object-contain" />}
              <span className="font-bold text-emerald-400">{current.team_name}</span>
            </div>
          </div>
          {saved && <Check className="w-5 h-5 text-emerald-400 ml-auto" />}
          {current.points !== null && (
            <span className={`ml-auto text-lg font-bold ${current.points > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
              {current.points > 0 ? `+${current.points} pts` : '0 pts'}
            </span>
          )}
        </div>
      )}

      {!locked && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar selección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {filtered.map((team) => {
              const isSelected = current?.team_name === team.name
              return (
                <button
                  key={team.name}
                  onClick={() => handleSelect(team.name, team.crest)}
                  disabled={saving}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/50 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                  }`}
                >
                  <img src={team.crest} alt={team.name} className="w-5 h-5 object-contain shrink-0" />
                  <span className="truncate">{team.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      )}

      {locked && !current && (
        <p className="text-slate-500 text-sm text-center py-4">El torneo ya empezó, no se puede cambiar la predicción de campeón.</p>
      )}
    </div>
  )
}
