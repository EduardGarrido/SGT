import { useState } from 'react';
import { NavigateButton } from "../components"

export default function Users() {

    return (
    <div>
        <h1>Usuarios (Admin only)</h1>

        <NavigateButton to="/dashboard" label="Go to dashboard" />
    </div>)
}