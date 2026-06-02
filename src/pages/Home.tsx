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

    // Check if already a member
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
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-100">⚽ Prode Mundial 2026</h1>
            <p className="text-sm text-slate-400">Hola, <span className="text-emerald-400">{profile?.display_name}</span></p>
          </div>
          <button onClick={signOut} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="space-y-4">
          {/* Create group */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-slate-200">Crear grupo</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nombre del grupo (ej: Los pibes)"
                maxLength={40}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
              <button
                type="submit" disabled={creating || !groupName.trim()}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                {creating ? 'Creando...' : 'Crear grupo'}
              </button>
            </form>
          </div>

          {/* Join group */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-slate-200">Unirse a un grupo</h2>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código de invitación (ej: ABC123)"
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm uppercase tracking-widest"
              />
              <button
                type="submit" disabled={joining || !inviteCode.trim()}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                {joining ? 'Uniéndose...' : 'Unirse'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
