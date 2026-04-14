import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/api'

export default function Dashboard() {
    const { usuario, esAdmin, cerrarSesion} = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        cerrarSesion() // Clear user session in App state   
        navigate('/') // Go back to login page
    } 

    return (
        <div>
            <h1>Bienvenido, {usuario?.id} - Puesto: {usuario?.puesto}</h1>
            <button onClick={handleLogout}>Logout</button>

            {esAdmin && <button onClick={() => navigate('/users')}>Go to Users</button>}
        </div>
    )
}