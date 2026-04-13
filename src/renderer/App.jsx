import { useState } from 'react'
import { login } from './api/api'

export default function App() {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [respuesta, setRes] = useState(null)

  // Handle login (on button click)
  async function handleLogin() {
    const data = await login(id, pw)
    setRes(JSON.stringify(data, null, 2))
  }

  // Handle IPC ping from renderer to main
  async function tryPing() {
    const response = await window.electronAPI.ping()
    console.log('Respuesta del main:', response)
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="ID usuario" value={id} onChange={(e) => setId(e.target.value)} />
      <input
        placeholder="Contraseña"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        type="password"
      />
      <button onClick={handleLogin}>Enviar</button>
      {respuesta && <pre>{respuesta}</pre>} 
      {/* Show only if value exists */}
      <button onClick={tryPing}>Ping al main</button>
    </div>
  )
}
