import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const user = username.trim().toLowerCase().replace(/\s+/g, '_')
    if (!user) { setError('Ingresá un nombre de usuario'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)

    const fakeEmail = `${user}@prode.internal`
    const { data, error: signUpError } = await supabase.auth.signUp({ email: fakeEmail, password })

    if (signUpError) {
      setError(signUpError.message.includes('already registered') ? 'Ese nombre ya está en uso' : 'Error al crear la cuenta')
      setLoading(false)
      return
    }
    if (!data.user) { setError('Error al crear la cuenta'); setLoading(false); return }

    await supabase.from('profiles').insert({ id: data.user.id, display_name: username.trim() })
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#04091a' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed, #db2777)' }}>
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Prode Mundial 2026</h1>
          <p className="text-slate-400 mt-1 text-sm">Creá tu cuenta</p>
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
                maxLength={30}
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Contraseña</label>
              <input
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" state={{ from }} className="text-blue-400 hover:text-blue-300 font-medium">Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
