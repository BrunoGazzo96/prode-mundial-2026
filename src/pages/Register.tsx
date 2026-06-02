import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (!displayName.trim()) { setError('Ingresá un nombre'); return }
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al registrarse')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      display_name: displayName.trim(),
    })

    if (profileError) {
      setError('Error al guardar el perfil')
      setLoading(false)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold text-slate-100">Prode Mundial 2026</h1>
          <p className="text-slate-400 mt-1">Creá tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre (para el prode)</label>
            <input
              type="text" required
              value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="Ej: Bruno"
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-slate-400">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Ingresá</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
