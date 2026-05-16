import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/api'
import { TopBar, ActionButton, FormAlert, fieldInputClass } from '../components'
import { sanitize } from '../utils/sanitize'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const { guardarSesion } = useAuth()

  async function handleLogin() {
    const cleanId = sanitize(id)
    const cleanPassword = sanitize(password)

    if (!cleanId || !cleanPassword) {
      setResponse({ type: 'error', message: 'Completa ambos campos' })
      return
    }

    setResponse(null)
    setLoading(true)

    try {
      const data = await login(cleanId, cleanPassword)
      if (data.ok) {
        setResponse({ type: 'success', message: data.mensaje })
        setTimeout(() => guardarSesion(data), 200)
      } else {
        setResponse({ type: 'error', message: data.mensaje || 'Error al iniciar sesión' })
      }
    } catch {
      setResponse({ type: 'error', message: 'No se pudo conectar con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  function handleEnter(e) {
    if (e.key === 'Enter') handleLogin()
  }

  function handleChange(setter) {
    return (e) => {
      setResponse(null)
      setter(e.target.value)
    }
  }

  const inputClass = fieldInputClass(response, 'any')

  return (
    <div className="flex flex-col w-screen h-screen font-sans bg-gray-200">
      <TopBar />
      <div className="h-dvh w-full flex flex-1 justify-center items-center">
        <div className="w-full max-w-xl">
          <div className="leading-loose">
            <div className="w-full p-16 bg-gray-50 rounded-lg shadow-2xl flex flex-col gap-8 items-center justify-center">
              <div className="w-full h-auto">
                <p className="text-gray-800 text-center text-2xl font-bold w-inherit">
                  Inicio de sesión
                </p>
              </div>
              <div className="w-full">
                <FormAlert response={response} />

                <div className="w-full justify-self-center-safe">
                  <label
                    className="block text-medium font-semibold text-gray-800"
                    htmlFor="id-usuario"
                  >
                    ID del usuario
                  </label>
                  <input
                    className={inputClass}
                    id="id-usuario"
                    type="text"
                    value={id}
                    onChange={handleChange(setId)}
                    onKeyDown={handleEnter}
                    placeholder="ID de usuario"
                    autoComplete="on"
                  />
                </div>
                <div className="w-full justify-self-center-safe">
                  <label
                    className="block text-medium font-semibold text-gray-800"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    value={password}
                    onChange={handleChange(setPassword)}
                    onKeyDown={handleEnter}
                    placeholder="Contraseña"
                    autoComplete="off"
                  />
                </div>
              </div>
              <ActionButton className="font-normal" onClick={handleLogin} disabled={loading}>
                Iniciar Sesión
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
