import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login, Dashboard, Users, UserInfo} from './pages' 

function RutaAdmin({children}) {
  const { esAdmin } = useAuth()

  return (esAdmin ? children : <Navigate to="/dashboard" replace />)
}

function RutaProtegida({children}) {
  const { usuario } = useAuth()

  return (usuario ? children : <Navigate to="/" replace />)
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"           element={<Login/>} />
        <Route path="/dashboard"  element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/users"      element={<RutaAdmin><Users /></RutaAdmin>} />
        <Route path="/user-info"  element={<RutaProtegida><UserInfo /></RutaProtegida>} />
        <Route path="*"           element={<Navigate to="/" replace/>} />
      </Routes>
    </HashRouter>
  )
}
