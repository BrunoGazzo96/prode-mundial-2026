import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, Trophy, Calendar, LogOut, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useMatches } from '../hooks/useMatches'
import { Leaderboard } from '../components/Leaderboard'
import { ShareLink } from '../components/ShareLink'
import type { Group as GroupType } from '../types/database'

type Tab = 'tabla' | 'partidos'

export function Group() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [group, setGroup] = useState<GroupType | null>(null)
  const [tab, setTab] = useState<Tab>('tabla')
  const [notFound, setNotFound] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const { entries, loading: lbLoading } = useLeaderboard(group?.id ?? null)
  const { matches } = useMatches()

  useEffect(() => {
    if (!code || !user) return
    supabase.from('groups').select('*').eq('invite_code', code.toUpperCase()).single().then(async ({ data }) => {
      if (!data) { setNotFound(true); return }
      setGroup(data)
      // auto-join if not member
      await supabase.from('group_members').upsert({ group_id: data.id, user_id: user.id }, { onConflict: 'group_id,user_id', ignoreDuplicates: true })
      // check if admin
      const { data: member } = await supabase.from('group_members').select('role').eq('group_id', data.id).eq('user_id', user.id).single()
      setIsAdmin(member?.role === 'admin')
    })
  }, [code, user])

  if (notFound) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 text-lg mb-4">Grupo no encontrado</p>
        <Link to="/" className="text-emerald-400 hover:text-emerald-300">Volver al inicio</Link>
      </div>
    </div>
  )

  if (!group) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-slate-400">Cargando...</div>
    </div>
  )

  const upcomingCount = matches.filter((m) => m.status === 'SCHEDULED').length

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/sync', { method: 'POST' })
    } finally {
      setSyncing(false)
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => navigate('/')} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={signOut} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-xl font-bold text-slate-100">{group.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {entries.length} jugadores</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {upcomingCount} partidos por jugar</span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1"><ShareLink inviteCode={group.invite_code} /></div>
            {isAdmin && (
              <button
                onClick={handleSync}
                disabled={syncing}
                title="Sincronizar partidos desde football-data.org"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 text-sm transition-colors border border-slate-600"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sync'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-2xl mx-auto flex">
          {([['tabla', 'Tabla', Trophy], ['partidos', 'Partidos', Calendar]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {tab === 'tabla' && (
          <div className="space-y-4">
            {lbLoading ? (
              <p className="text-center text-slate-500 py-8">Cargando tabla...</p>
            ) : (
              <Leaderboard entries={entries} currentUserId={user?.id} />
            )}
            <div className="mt-4">
              <Link
                to={`/grupo/${code}/predecir`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                ⚽ Cargar mis predicciones
              </Link>
            </div>
            {/* Picks de otros */}
            {entries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Ver picks de</h3>
                <div className="space-y-1.5">
                  {entries.map((e) => (
                    <Link
                      key={e.userId}
                      to={`/grupo/${code}/jugador/${e.userId}`}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg border transition-colors ${
                        e.userId === user?.id
                          ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-400'
                          : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{e.displayName}{e.userId === user?.id && ' (vos)'}</span>
                      <span className="text-sm font-bold">{e.total} pts</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'partidos' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 mb-4">Resultados del torneo en tiempo real.</p>
            {matches.length === 0 ? (
              <p className="text-center text-slate-500 py-12">Cargando fixtures...</p>
            ) : (
              matches.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm">
                  <div className="flex-1 text-right text-slate-200">{m.home_team}</div>
                  <div className="shrink-0 px-3 py-1 rounded bg-slate-700 font-bold text-slate-100 min-w-[4rem] text-center">
                    {m.status === 'FINISHED' ? `${m.home_score} - ${m.away_score}` :
                     m.status === 'IN_PLAY' ? <span className="text-green-400">En vivo</span> :
                     '— vs —'}
                  </div>
                  <div className="flex-1 text-slate-200">{m.away_team}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
