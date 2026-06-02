import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { MatchList } from '../components/MatchList'
import { ChampionPicker } from '../components/ChampionPicker'
import type { Group } from '../types/database'

// Tournament start date for champion prediction lock
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
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to={`/grupo/${code}`} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-100">Mis predicciones</h1>
            {group && <p className="text-xs text-slate-400">{group.name}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Champion section */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-yellow-600/30">
          <button
            onClick={() => setShowChampion(!showChampion)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <p className="font-semibold text-slate-200">Campeón del Mundial</p>
                <p className="text-xs text-slate-400">10 puntos si acertás · {championLocked ? 'Cerrado' : 'Abierto'}</p>
              </div>
            </div>
            <span className="text-slate-400 text-xl">{showChampion ? '▲' : '▼'}</span>
          </button>
          {showChampion && (
            <div className="mt-4 pt-4 border-t border-slate-700">
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
          <h2 className="text-lg font-bold text-slate-200 mb-1">Predicciones de partidos</h2>
          <p className="text-sm text-slate-400 mb-4">
            Marcador exacto: 3 pts · Resultado correcto: 1 pt · Se bloquean al inicio de cada partido
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
