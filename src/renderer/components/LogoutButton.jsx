import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/api'

export default function LogoutButton({ label = 'Cerrar sesion'}) {
    const { cerrarSesion } = useAuth()
    const [ loading, setLoading ] = useState(false)

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
        <button onClick={handleLogout} disabled={loading}>
            {loading ? '...' : label}
        </button>
    )
}