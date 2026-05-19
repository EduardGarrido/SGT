import { createContext, useContext, useState } from 'react'

const SESSION_KEY = 'usuario'
const CAJA_KEY = 'caja'

function leerSesion() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function leerCaja() {
  try {
    const raw = sessionStorage.getItem(CAJA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion())
  const [userInfo, setUserInfo] = useState(null)
  const [caja, setCajaState] = useState(leerCaja())

  function guardarSesion(data) {
    const u = { id: data.id, puesto: data.puesto }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))

    setUsuario(u)
    setCaja(data.caja ?? null)
  }

  function setCaja(c) {
    if (c) sessionStorage.setItem(CAJA_KEY, JSON.stringify(c))
    else sessionStorage.removeItem(CAJA_KEY)
    setCajaState(c)
  }

  function cerrarSesion() {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(CAJA_KEY)
    sessionStorage.removeItem('venta-pendiente')

    setUsuario(null)
    setUserInfo(null)
    setCajaState(null)
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
        caja,
        setCaja,
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
