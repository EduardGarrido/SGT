import { useAuth } from '../context/AuthContext'
import { LogoutButton, NavigateButton } from '../components'
import TopBar from '../components/TopBar'

export default function Dashboard() {
    const { usuario, esAdmin } = useAuth()

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <div className="flex my-5 h-full w-full">
            <div className="rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50 shadow-md">
                <h1 className="text-2xl font-semibold text-gray-900 text-center">Información de Usuario</h1>
                <hr className="rounded-full border-2 w-full border-gray-400 my-5"/>
                <div className="absolute bottom-5 m-5 place-self-center w-80 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                    <LogoutButton className="font-normal">Cerrar sesion</LogoutButton>
                </div>
            </div>
            <div className="rounded-lg h-full p-5 w-1/2 bg-gray-50 self-center-safe shadow-md">
                <h1 className="text-2xl font-semibold text-gray-900 text-center">Bienvenido, {usuario?.id} - Puesto: {usuario?.puesto}</h1>
                <hr className="rounded-full border-2 w-full border-gray-400 my-5"/>
                    <div className="mt-6 mb-2 w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal" to="/sales">Ir a venta</NavigateButton>
                    </div>
                    <div className="mt-6 mb-2 place-self-center w-100 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal" to="/user-info">Ver mi informacion</NavigateButton>
                    </div>
                {esAdmin && 
                    <div className="mt-12 mb-2 right-10 place-self-center w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal" to="/users">Ver usuarios</NavigateButton>
                    </div>
                }
                {esAdmin && 
                    <div className="mt-12 mb-2 right-10 place-self-center w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal" to="/inventory">Gestión de inventario</NavigateButton>
                    </div>
                }
            </div>
            <div className="rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50 shadow-md">
                <h1 className="text-2xl font-semibold text-gray-900 text-center">Último corte</h1>
                <hr className="rounded-full border-2 w-full border-gray-400 my-5"/>
            </div>
            </div>
        </div>
    )
}