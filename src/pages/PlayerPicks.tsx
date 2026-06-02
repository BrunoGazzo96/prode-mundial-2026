import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMatches } from '../hooks/useMatches'
import { MatchList } from '../components/MatchList'
import type { Group, Prediction, ChampionPrediction, Profile } from '../types/database'

export function PlayerPicks() {
  const { code, userId } = useParams<{ code: string; userId: string }>()
  const [group, setGroup] = useState<Group | null>(null)
  const [player, setPlayer] = useState<Profile | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [champion, setChampion] = useState<ChampionPrediction | null>(null)
  const [loading, setLoading] = useState(true)

  const { matches } = useMatches()

  useEffect(() => {
    if (!code || !userId) return
    Promise.all([
      supabase.from('groups').select('*').eq('invite_code', code.toUpperCase()).single(),
      supabase.from('profiles').select('*').eq('id', userId).single(),
    ]).then(async ([groupRes, profileRes]) => {
      setGroup(groupRes.data)
      setPlayer(profileRes.data)
      if (groupRes.data) {
        const [predsRes, champRes] = await Promise.all([
          supabase.from('predictions').select('*').eq('group_id', groupRes.data.id).eq('user_id', userId),
          supabase.from('champion_predictions').select('*').eq('group_id', groupRes.data.id).eq('user_id', userId).maybeSingle(),
        ])
        setPredictions(predsRes.data ?? [])
        setChampion(champRes.data)
      }
      setLoading(false)
    })
  }, [code, userId])

  const totalPoints = predictions.reduce((s, p) => s + (p.points ?? 0), 0) + (champion?.points ?? 0)

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to={`/grupo/${code}`} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-100">{player?.display_name ?? 'Cargando...'}</h1>
            {group && <p className="text-xs text-slate-400">{group.name} · {totalPoints} pts</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Champion */}
        {champion && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-yellow-600/30 bg-slate-800">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xs text-slate-400">Campeón</p>
              <p className="font-bold text-yellow-400">{champion.team_name}</p>
            </div>
            {champion.points !== null && (
              <span className={`ml-auto font-bold ${champion.points > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                {champion.points > 0 ? `+${champion.points}` : '0'} pts
              </span>
            )}
          </div>
        )}

        {/* Match predictions (read-only) */}
        {loading ? (
          <p className="text-center text-slate-500 py-8">Cargando...</p>
        ) : (
          <MatchList
            matches={matches}
            predictions={predictions}
            onSave={async () => {}}
            readOnly
          />
        )}
      </div>
    </div>
  )
}
