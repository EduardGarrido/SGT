import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/api'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle login (on button click)
  async function handleLogin() {
    if (!id || !password) {
      setError('Completa ambos campos')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await login(id, password)

      if (data.ok) {
        navigate('/dashboard') // Go to dashboard on success
      } else {
        setError(data.mensaje || 'Error al iniciar sesion')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
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

        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Verificando...' : "Iniciar sesion"}
        </button>
    </div>
  )
}
