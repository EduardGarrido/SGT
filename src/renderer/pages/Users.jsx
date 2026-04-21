import { useState, useEffect } from 'react';
import { ActionButton, NavigateButton } from "../components"
import TopBar from '../components/TopBar'
import { getUsers } from '../api/api';

export default function Users() {
    const [users, setUsers] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        getUsers().then(res=>{
            if (res.ok) setUsers(res.usuarios)
        }).finally(() => setLoading(false) )
    }, [])

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <div className="flex my-5 w-full h-full">
                <div className="flex flex-col w-1/3 mx-5">
                    <div className="w-full h-full rounded-lg mb-5 p-5 bg-gray-50 shadow-md overflow-y-auto">
                        <h1 className="text-2xl font-semibold text-gray-900 text-center">Usuarios</h1>
                        <hr className="rounded-full border-2 border-gray-400 w-full my-5"/>

                        {loading ? (
                            <p className="text-center text-gray-500">Cargando usuarios...</p>
                        ) : users.length === 0 ? (
                            <p className="text-center text-gray-500">Sin usuarios</p>
                        ) : (
                            <ul className="space-y-2">
                                {users.map(u => (
                                    <li key={u.ID_Usuario} className="flex flex-row gap-2 border py-4 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200">
                                        {/* O activo ?? */}
                                        <span className="text-lg font-semibold text-gray-800">Usuario ID:
                                            <span className="font-light px-1">{u.ID_Usuario}</span>
                                             </span>
                                        <span className="text-lg font-semibold text-gray-800">
                                            Estado: 
                                            <span className="font-light px-1">{u.Estado}</span>
                                        </span >
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                    
                    </div>
                    <div className="flex justify-between bottom-5 w-full">
                        <div className="shadow-md w-1/2 mr-5 min-w-fit h-12 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg place-content-center-safe">
                            <NavigateButton className="font-normal rounded-lg" to="/register">Registrar Usuario</NavigateButton>
                        </div>
                        <div className="shadow-md w-1/2 ml-5 min-w-fit h-12 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg place-content-center-safe">
                            <ActionButton className="font-normal rounded-lg">Eliminar Usuario</ActionButton>
                        </div>
                    </div>
                </div>
                <div className="flex w-2/3 mr-5">
                    <div className="rounded-lg w-full p-5 bg-gray-50 shadow-md">
                        <h1 className="text-2xl font-semibold text-gray-900 text-center">Información del usuario</h1>
                        <hr className="rounded-full border-2 border-gray-400 w-full my-5"/>
                        <div className="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                            <NavigateButton className="font-normal w-80 rounded-lg" to="/dashboard">Ir al menú principal</NavigateButton>
                        </div>
                    </div>                    
                </div>
            </div>
        </div>
    )
}