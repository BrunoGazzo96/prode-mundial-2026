import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Redirects /unirse/:code → /grupo/:code (handles WhatsApp share links)
export function JoinRedirect() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/grupo/${code}`, { replace: true })
  }, [code])

  return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Redirigiendo...</div>
}
