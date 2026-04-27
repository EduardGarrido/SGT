import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Login, Dashboard, Users, UserInfo, Sales, Inventory, Register, ModifyUser } from './pages'

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

function RutaProtegida({children}) {
  const { usuario } = useAuth()

  return (usuario ? children : <Navigate to="/" replace />)
}

function RutaAdmin({children}) {
  const { usuario, esAdmin } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (!esAdmin)  return <Navigate to="/dashboard" replace />

  return children
}

function RutaPublica({children}) {
  const { usuario } = useAuth()

  return (usuario ? <Navigate to="/dashboard" replace /> : children)
}


export default function App() {
  return (
    <HashRouter>
      <SesionGuard />
      <Routes>
        <Route path="/"           element={<RutaPublica><Login /></RutaPublica>} />
        <Route path="/dashboard"  element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/inventory"  element={<RutaAdmin><Inventory /></RutaAdmin>} />
        <Route path='/register'    element={<RutaAdmin><Register /></RutaAdmin>} />
        <Route path='/modifyUser'  element={<RutaAdmin><ModifyUser /></RutaAdmin>} />
        <Route path="/users"      element={<RutaAdmin><Users /></RutaAdmin>} />
        <Route path="/user-info"  element={<RutaProtegida><UserInfo /></RutaProtegida>} />
        <Route path="/sales"      element={<RutaProtegida><Sales /></RutaProtegida>} />
        <Route path="*"           element={<Navigate to="/" replace/>} />
      </Routes>
    </HashRouter>
  )
}
