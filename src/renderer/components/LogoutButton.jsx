import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/api'
import BaseButton from './BaseButton'

export default function LogoutButton({ children, className, ...props }) {
  const { cerrarSesion } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await logout()
    } finally {
      cerrarSesion()
      setLoading(false)
    }
  }

  return (
    <BaseButton className={className} onClick={handleLogout} disabled={loading} {...props}>
      {children ?? 'Cerrar sesion'}
    </BaseButton>
  )
}
