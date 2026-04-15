import { useAuth } from '../context/AuthContext'
import { LogoutButton, NavigateButton }from '../components'

export default function Dashboard() {
    const { usuario, esAdmin } = useAuth()

    return (
        <div>
            <h1>Bienvenido, {usuario?.id} - Puesto: {usuario?.puesto}</h1>
            <LogoutButton label="Cerrar sesion" />

            {esAdmin && <NavigateButton to="/users" label="Go to Users" />}
            {!esAdmin && <NavigateButton to="/user-info" label="Ver mi informacion" />}
        </div>
    )
}