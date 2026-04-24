import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/api'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export default function LogoutButton({ children, className, ...props }) {
  const { cerrarSesion } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    try {
      await logout()
    } finally {
      cerrarSesion() // Clear user session in App state
      setLoading(false)
    }
  }

  return (
    <button
      className={twMerge(
        clsx('px-5 w-auto h-auto py-2 rounded-lg text-white font-normal cursor-pointer', className)
      )}
      onClick={handleLogout}
      disabled={loading}
      {...props}
    >
      {children ?? 'Cerrar sesion'}
    </button>
  )
}

