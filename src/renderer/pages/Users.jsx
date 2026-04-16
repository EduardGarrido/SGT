import { useState } from 'react';
import { NavigateButton } from "../components"
import TopBar from '../components/TopBar'

export default function Users() {

    return (
        <div class="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <h1 class="text-2xl font-semibold text-gray-900 text-center">Usuarios (Admin only)</h1>
            <div class="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                <NavigateButton class="w-80 rounded-lg" to="/dashboard" label="Ir al menú principal" />
            </div>
        </div>
    )
}