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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#04091a' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed, #db2777)' }}>
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Prode Mundial 2026</h1>
          <p className="text-slate-400 mt-1 text-sm">Ingresá a tu cuenta</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-xl px-3 py-2.5">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Nombre de usuario</label>
              <input
                type="text" required
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Ej: Gonza"
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Contraseña</label>
              <input
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
