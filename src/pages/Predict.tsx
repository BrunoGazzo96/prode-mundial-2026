import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { MatchList } from '../components/MatchList'
import { ChampionPicker } from '../components/ChampionPicker'
import type { Group } from '../types/database'

const TOURNAMENT_START = new Date('2026-06-11T15:00:00Z')

export function Predict() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [showChampion, setShowChampion] = useState(false)

  const { matches, loading: matchesLoading } = useMatches()
  const { predictions, champion, savePrediction, saveChampion } = usePredictions(group?.id ?? null, user?.id ?? null)

  const championLocked = new Date() >= TOURNAMENT_START

  useEffect(() => {
    if (!code) return
    supabase.from('groups').select('*').eq('invite_code', code.toUpperCase()).single().then(({ data }) => {
      if (data) setGroup(data)
      else navigate('/')
    })
  }, [code])

  return (
    <div className="min-h-screen" style={{ background: '#04091a' }}>
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4 sticky top-0 z-10" style={{ background: '#04091a' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to={`/grupo/${code}`} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-100">Mis predicciones</h1>
            {group && <p className="text-xs text-slate-500">{group.name}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Champion section */}
        <div className="rounded-xl border border-amber-600/30 bg-amber-950/10 overflow-hidden">
          <button
            onClick={() => setShowChampion(!showChampion)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-amber-950/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-200">Campeón del Mundial</p>
                <p className="text-xs text-slate-500">10 puntos si acertás · <span className={championLocked ? 'text-red-400' : 'text-emerald-400'}>{championLocked ? 'Cerrado' : 'Abierto'}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {champion && (
                <span className="text-xs text-amber-400 font-medium">{champion.team_name}</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showChampion ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {showChampion && (
            <div className="px-4 pb-4 pt-2 border-t border-amber-600/20">
              <ChampionPicker
                current={champion}
                onSave={saveChampion}
                locked={championLocked}
              />
            </div>
          )}
        </div>

        {/* Match predictions */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-slate-200">Predicciones</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4 pl-3.5">
            Exacto: 3 pts · Resultado: 1 pt · Se bloquean al inicio de cada partido
          </p>
          {matchesLoading ? (
            <p className="text-center text-slate-500 py-8">Cargando partidos...</p>
          ) : (
            <MatchList
              matches={matches}
              predictions={predictions}
              onSave={savePrediction}
            />
          )}
        </div>
      </div>
    </div>
  )
}
