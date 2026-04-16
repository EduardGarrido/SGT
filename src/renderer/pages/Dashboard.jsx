import { useAuth } from '../context/AuthContext'
import { LogoutButton, NavigateButton } from '../components'
import TopBar from '../components/TopBar'

export default function Dashboard() {
    const { usuario, esAdmin } = useAuth()

    return (
        <div class="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <div class="flex my-5 h-full w-full">
            <div class="rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50">
                <h1 class="text-2xl font-semibold text-gray-900 text-center">Información de Usuario</h1>
                <div class="absolute bottom-5 m-5 place-self-center w-50 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                    <LogoutButton class="w-50 rounded-lg text-white font-normal" label="Cerrar sesion" />
                </div>
            </div>
            <div class="rounded-lg h-full p-5 w-1/2 bg-gray-50 self-center-safe">
                <h1 class="text-2xl font-semibold text-gray-900 text-center">Bienvenido, {usuario?.id} - Puesto: {usuario?.puesto}</h1>
                {esAdmin && 
                    <div class="mt-6 mb-2 place-self-center w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton class="w-50 rounded-lg text-white font-normal" to="/users" label="Ir a Usuarios" />
                    </div>
                }
                {!esAdmin && 
                    <div class="mt-6 mb-2 place-self-center w-100 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton class="w-100 rounded-lg" to="/user-info" label="Ver mi informacion" />
                    </div>
                }
            </div>
            <div class="rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50">

            </div>
            </div>
        </div>
    )
}