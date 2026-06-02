import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { Group } from './pages/Group'
import { Predict } from './pages/Predict'
import { PlayerPicks } from './pages/PlayerPicks'
import { JoinRedirect } from './pages/JoinRedirect'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Cargando...</div>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Cargando...</div>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/grupo/:code" element={<ProtectedRoute><Group /></ProtectedRoute>} />
      <Route path="/grupo/:code/predecir" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
      <Route path="/grupo/:code/jugador/:userId" element={<ProtectedRoute><PlayerPicks /></ProtectedRoute>} />
      <Route path="/unirse/:code" element={<JoinRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
