import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Login, Dashboard, Users, UserInfo, Sales, Inventory, Register, ModifyUser } from './pages'
import AppLayout from './components/AppLayout'

function SesionGuard() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpirada() {
      if (!usuario) return
      cerrarSesion()
      navigate('/', { replace: true })
    }
    window.addEventListener('sesion-expirada', handleExpirada)
    return () => window.removeEventListener('sesion-expirada', handleExpirada)
  }, [usuario, cerrarSesion, navigate])

  return null
}

function RutaAdmin({ children }) {
  const { usuario, esAdmin } = useAuth()

  if (!usuario) return <Navigate to="/" replace />
  if (!esAdmin) return <Navigate to="/dashboard" replace />

  return children
}

function RutaPublica({ children }) {
  const { usuario } = useAuth()

  return usuario ? <Navigate to="/dashboard" replace /> : children
}

function PaginaEnConstruccion({ titulo }) {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">{titulo}</h1>
        <p className="text-gray-400 mt-2">Próximamente</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <SesionGuard />
      <Routes>
        <Route path="/" element={<RutaPublica><Login /></RutaPublica>} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/sales"      element={<Sales />} />
          <Route path="/user-info"  element={<UserInfo />} />
          <Route path="/caja"       element={<PaginaEnConstruccion titulo="Caja" />} />
          <Route path="/historial"  element={<PaginaEnConstruccion titulo="Historial" />} />
          <Route path="/report"     element={<PaginaEnConstruccion titulo="Report" />} />
          <Route path="/categorias" element={<PaginaEnConstruccion titulo="Categorías" />} />
          <Route path="/proveedores" element={<PaginaEnConstruccion titulo="Proveedores" />} />
          <Route path="/inventory"  element={<RutaAdmin><Inventory /></RutaAdmin>} />
          <Route path="/register"   element={<RutaAdmin><Register /></RutaAdmin>} />
          <Route path="/modifyUser" element={<RutaAdmin><ModifyUser /></RutaAdmin>} />
          <Route path="/users"      element={<RutaAdmin><Users /></RutaAdmin>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
