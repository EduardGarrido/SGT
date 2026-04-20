import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/api'
import { ActionButton } from '../components'
import TopBar from '../components/TopBar'

//Icons
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/20/solid'

// Styles
const ALERT_STYLE = {
  error:   { bg: 'bg-red-50',   border: 'border-red-300',   text: 'text-red-700',   input: 'border-red-400',   Icon: ExclamationCircleIcon },
  success: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', input: 'border-green-400', Icon: CheckCircleIcon },
}

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null) // { type: 'error' | 'success', message: string }
  const [loading, setLoading] = useState(false)
  const { guardarSesion } = useAuth()


  async function handleLogin() {
    if (!id.trim() || !password) {
      setStatus({ type: 'error', message: 'Completa ambos campos' })
      return
    }

    setStatus(null)
    setLoading(true)

    try {
      const data = await login(id.trim(), password)

      if (data.ok) {
        setStatus({ type: 'success', message: data.mensaje })
        setTimeout(() => guardarSesion(data), 200)
      } else {
        setStatus({ type: 'error', message: data.mensaje || 'Error al iniciar sesión' })
      }
    } catch {
      setStatus({ type: 'error', message: 'No se pudo conectar con el servidor'})
    } finally {
      setLoading(false)
    }
  }

  function handleEnter(e) {
    if (e.key === 'Enter') handleLogin()
  }

  const style = status ? ALERT_STYLE[status.type] : null

  const inputClass = `rounded-lg w-full px-2 py-1 border-2 text-gray-700 bg-gray-100 shadow-sm sm:text-sm ${
    style ? style.input : 'border-gray-400'
  }`

  return (
    <div className="flex flex-col w-screen h-screen font-sans bg-gray-200">
      <TopBar/>
      <div className="h-dvh w-full flex flex-1 justify-center items-center">
        <div className="w-full max-w-xl">
          <div className="leading-loose">
            <div className="w-full p-16 bg-gray-50 rounded-lg shadow-2xl">
              <p className="py-1 text-gray-800 text-center text-2xl font-bold">Inicio de sesión</p>

              {status && (
                <div className={`flex items-center gap-2 mt-2 mb-1 px-3 py-2 rounded-lg border text-sm ${style.bg} ${style.border} ${style.text}`}>
                  <style.Icon className="w-5 shrink-0" />
                  {status.message}
                </div>
              )}

              <div className="w-full justify-self-center-safe">
                <label className="block text-medium font-semibold text-gray-800" htmlFor="id-usuario">ID del usuario</label>
                <input
                className={inputClass}
                id="id-usuario"
                type="text"
                value={id}
                onChange={(e) => { setStatus(null); setId(e.target.value) }}
                onKeyDown={handleEnter}
                placeholder="ID de usuario"
                autoComplete="on"
                />
              </div>
            <div className="w-full justify-self-center-safe">
              <label className="block text-medium font-semibold text-gray-800" htmlFor="password">Contraseña</label>
                <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => { setStatus(null); setPassword(e.target.value) }}
                onKeyDown={handleEnter}
                placeholder="Contraseña"
                autoComplete="off"
                />
              </div>
            <div className="mt-6 w-full place-self-center tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
              <ActionButton className="font-normal" onClick={handleLogin} disabled={loading}>
                Iniciar Sesión
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
