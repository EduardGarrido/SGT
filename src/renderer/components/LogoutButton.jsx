import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/api'

export default function LogoutButton({ label = 'Cerrar sesion' , ...props}) {
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
        <button {...props} onClick={handleLogout} disabled={loading}>
            {loading ? '...' : label}
        </button>
    )
}