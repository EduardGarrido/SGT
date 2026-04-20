import { NavigateButton } from "../components"
import TopBar from "../components/TopBar"

export default function Register() {

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <div className="flex w-full h-full my-5">
                <div className="w-full h-full bg-gray-50 mx-5 rounded-lg p-5 shadow-md">
                    <h1 className="text-2xl font-semibold text-gray-900 text-center">Registro de usuario</h1>
                    <hr className="rounded-full border-2 border-gray-400 w-full my-5"/>
                    <div className="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal w-80 rounded-lg" to="/dashboard">Volver al menú principal</NavigateButton>
                    </div>
                    <div className="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                        <NavigateButton className="font-normal w-80 rounded-lg" to="/users">Volver a Usuarios</NavigateButton>
                    </div>                       
                </div>
             
            </div>

        </div>
    )
}