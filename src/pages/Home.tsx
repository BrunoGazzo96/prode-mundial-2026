import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function Home() {
  const navigate = useNavigate()
  const { profile, user, signOut } = useAuth()
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!groupName.trim() || !user) return
    setCreating(true)
    setError('')

    const code = generateCode()
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupName.trim(), invite_code: code })
      .select()
      .single()

    if (groupError || !group) {
      setError('Error al crear el grupo')
      setCreating(false)
      return
    }

    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'admin' })
    navigate(`/grupo/${code}`)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteCode.trim() || !user) return
    setJoining(true)
    setError('')

    const code = inviteCode.trim().toUpperCase()
    const { data: group } = await supabase.from('groups').select('*').eq('invite_code', code).single()
    if (!group) {
      setError('Código de invitación inválido')
      setJoining(false)
      return
    }

    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })
    }

    navigate(`/grupo/${code}`)
  }

  return (
    <div className="min-h-screen p-4" style={{ background: '#04091a' }}>
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold gradient-text">Prode Mundial 2026</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Hola, <span className="text-blue-400 font-medium">{profile?.display_name}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-xl px-3 py-2.5">{error}</div>
        )}

        <div className="space-y-4">
          {/* Create group */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-semibold text-slate-200">Crear grupo</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nombre del grupo (ej: Bebote empleado del Mes)"
                maxLength={40}
                className="input-field"
              />
              <button
                type="submit" disabled={creating || !groupName.trim()}
                className="w-full btn-primary"
              >
                {creating ? 'Creando...' : 'Crear grupo'}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600 font-medium">O</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Join group */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="font-semibold text-slate-200">Unirse a un grupo</h2>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código de invitación"
                maxLength={6}
                className="input-field uppercase tracking-widest"
              />
              <button
                type="submit" disabled={joining || !inviteCode.trim()}
                className="w-full btn-primary"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
              >
                {joining ? 'Uniéndose...' : 'Unirse al grupo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
