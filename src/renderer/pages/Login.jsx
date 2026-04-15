import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/api'
import { ActionButton } from '../components'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { guardarSesion } = useAuth()

  // Handle login (on button click)
  async function handleLogin() {
    if (!id.trim() || !password) {
      setError('Completa ambos campos')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await login(id.trim(), password)

      console.log('Login response:', data) // Debug: log API response

      if (data.ok) {
        guardarSesion(data) // Set user role in App state
        navigate('/dashboard', { replace: true}) // Go to dashboard on success
      } else {
        setError(data.mensaje || 'Error al iniciar sesion')
      }
    } catch {
      setError('No se pudo conectar con el servidor') // Handle network or server errors
    } finally {
      setLoading(false) // Reset loading state after response or error
    }
  }

  function handleEnter(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div>
      <h1>Iniciar sesion</h1>

      {error && <p>{error}</p>}

      <div>
        <label htmlFor="id-usuario">ID del usuario</label>
        <input
          id="id-usuario"
          type = "text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="ID de usuario"
          autoComplete="on"
        />
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Contraseña"
          autoComplete="off"
          />
        </div>

        <ActionButton onClick={handleLogin} label={loading ? 'Verificando...' : "Iniciar sesion"} disabled={loading} />
    </div>
  )
}
