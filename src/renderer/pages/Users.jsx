import { useState } from 'react';
import { ActionButton, NavigateButton } from "../components"
import TopBar from '../components/TopBar'

export default function Users() {

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <div className="flex my-5 w-full h-full">
                <div className="flex flex-col w-1/3 mx-5">
                    <div className="w-full h-full rounded-lg mb-5 p-5 bg-gray-50 shadow-md">
                        <h1 className="text-2xl font-semibold text-gray-900 text-center">Usuarios</h1>
                        <hr className="rounded-full border-2 border-gray-400 w-full my-5"/>
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