import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, Trophy, Calendar, LogOut, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useMatches } from '../hooks/useMatches'
import { Leaderboard } from '../components/Leaderboard'
import { ShareLink } from '../components/ShareLink'
import { MatchList } from '../components/MatchList'
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
      await supabase.from('group_members').upsert({ group_id: data.id, user_id: user.id }, { onConflict: 'group_id,user_id', ignoreDuplicates: true })
      const { data: member } = await supabase.from('group_members').select('role').eq('group_id', data.id).eq('user_id', user.id).single()
      setIsAdmin(member?.role === 'admin')
    })
  }, [code, user])

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#04091a' }}>
      <div className="text-center">
        <p className="text-slate-400 text-lg mb-4">Grupo no encontrado</p>
        <Link to="/" className="text-blue-400 hover:text-blue-300">Volver al inicio</Link>
      </div>
    </div>
  )

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#04091a' }}>
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
    <div className="min-h-screen" style={{ background: '#04091a' }}>
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4 sticky top-0 z-10" style={{ background: '#04091a' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate('/')} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={signOut} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-xl font-bold text-slate-100">{group.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {entries.length} jugadores</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {upcomingCount} partidos por jugar</span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1"><ShareLink inviteCode={group.invite_code} /></div>
            {isAdmin && (
              <button
                onClick={handleSync}
                disabled={syncing}
                title="Sincronizar partidos"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Sync...' : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto flex">
          {([['tabla', 'Tabla', Trophy], ['partidos', 'Partidos', Calendar]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'tab-active' : 'tab-inactive'
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

            <Link
              to={`/grupo/${code}/predecir`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all btn-primary"
            >
              ⚽ Cargar mis predicciones
            </Link>

            {entries.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Ver picks de</p>
                <div className="space-y-1.5">
                  {entries.map((e) => (
                    <Link
                      key={e.userId}
                      to={`/grupo/${code}/jugador/${e.userId}`}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors ${
                        e.userId === user?.id
                          ? 'border-blue-700/50 bg-blue-950/30 text-blue-400'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-sm font-medium">{e.displayName}{e.userId === user?.id && <span className="text-xs font-normal text-slate-500 ml-1">(vos)</span>}</span>
                      <span className="text-sm font-bold text-slate-200">{e.total} pts</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'partidos' && (
          <div>
            <p className="text-xs text-slate-500 mb-4">Resultados del torneo en tiempo real.</p>
            <MatchList
              matches={matches}
              predictions={[]}
              onSave={async () => {}}
              readOnly={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
