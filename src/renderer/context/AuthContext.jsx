import { createContext, useContext, useState } from 'react'

const SESSION_KEY = 'usuario'

function leerSesion() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion())
  const [userInfo, setUserInfo] = useState(null)

  function guardarSesion(data) {
    const u = { id: data.id, puesto: data.puesto }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))

    setUsuario(u)
  }

  function cerrarSesion() {
    sessionStorage.removeItem(SESSION_KEY)

    setUsuario(null)
    setUserInfo(null)
  }

  const esAdmin = usuario?.puesto === 'admin'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin,
        guardarSesion,
        cerrarSesion,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// custom hook — any component calls this to read auth state
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within an AuthProvider')

  return context
}
