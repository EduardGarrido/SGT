import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/api'
import { ActionButton } from '../components'
import TopBar from '../components/TopBar'

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
    <div class="flex flex-col h-screen font-sans bg-gray-200">
      {error && <p>{error}</p>}
      <TopBar/>
      <div class="container h-dvh flex flex-1 justify-center items-center">
        <div class="w-full max-w-xl">
          <div class="leading-loose">
            <div class="max-w-xl p-5 m-5 bg-gray-50 rounded-lg shadow-xl">
              <p class="py-1 text-gray-800 text-center text-2xl font-bold">Inicio de sesión</p>
              <div class="justify-self-center-safe m-2">
                <label class="block text-medium font-semibold text-gray-800" htmlFor="id-usuario">ID del usuario</label>
                <input
                class="rounded-lg w-100 mt-0.5 px-2 py-1 border-2 border-gray-400 text-gray-700 bg-gray-100 shadow-sm sm:text-sm"
                id="id-usuario"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="ID de usuario"
                autoComplete="on"
                />
              </div>
            <div class="justify-self-center-safe m-2">
              <label class="block text-medium font-semibold text-gray-800" htmlFor="password">Contraseña</label>
                <input 
                class="rounded-lg w-100 mt-0.5 px-2 py-1 border-2 border-gray-400 text-gray-700 bg-gray-100 shadow-sm sm:text-sm"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Contraseña"
                autoComplete="off"
                />
              </div>
            <div class="mt-6 mb-2 place-self-center w-100 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
              <ActionButton class="w-100 rounded-lg text-white font-normal" onClick={handleLogin} label={loading ? 'Verificando...' : "Iniciar sesion"} disabled={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
