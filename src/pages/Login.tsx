import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fakeEmail = `${username.trim().toLowerCase().replace(/\s+/g, '_')}@prode.internal`
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password })
    if (error) {
      setError('Usuario o contraseña incorrectos')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold text-slate-100">Prode Mundial 2026</h1>
          <p className="text-slate-400 mt-1">Ingresá a tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre de usuario</label>
            <input
              type="text" required
              value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="Ej: Gonza"
              autoCapitalize="none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <p className="text-center text-sm text-slate-400">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300">Registrate</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
