import { NavigateButton } from "../components"
import TopBar from "../components/TopBar"

export default function Sales() {

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-200">
            <TopBar/>
            <h1 className="text-2xl font-semibold text-gray-900 text-center">Ventas</h1>
            <div className="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                <NavigateButton className="w-80 rounded-lg" to="/dashboard">Volver al menú principal</NavigateButton>
            </div>
        </div>
    )
}