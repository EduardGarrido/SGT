import { NavigateButton } from "../components"

export default function UserInfo() {
    return (
        <div>
            <h1>Informacion del usuario</h1>
            <NavigateButton to="/dashboard" label="Volver al inicio" />
        </div>
    )
}