import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotificationContext.jsx'
import { logout } from '../api/api'
import BaseButton from './BaseButton'

export default function LogoutButton({ children, className, ...props }) {
  const { cerrarSesion, caja } = useAuth()
  const notify = useNotify()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (caja) {
      notify({
        type: 'warning',
        message: 'No puedes cerrar sesión con una caja abierta. Cierra la caja primero.',
      })
      return
    }
    setLoading(true)
    try {
      await logout()
    } finally {
      cerrarSesion()
      setLoading(false)
    }
  }

  return (
    <BaseButton
      className={className}
      onClick={handleLogout}
      disabled={loading || !!caja}
      title={caja ? 'Cierra la caja antes de salir' : undefined}
      {...props}
    >
      {children ?? 'Cerrar sesion'}
    </BaseButton>
  )
}
