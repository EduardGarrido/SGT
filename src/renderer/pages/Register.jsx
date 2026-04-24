import { useState } from 'react'
import DOMPurify from 'dompurify'
import { NavigateButton, ActionButton } from '../components'
import TopBar from '../components/TopBar'
import { createUser } from '../api/api'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/20/solid'

const RESPONSE_STYLE = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    input: 'border-red-400',
    Icon: ExclamationCircleIcon,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    input: 'border-green-400',
    Icon: CheckCircleIcon,
  },
}

const EMPTY_USER = { nombre: '', telefono: '', correo: '', password: '', confirmar: '' }

export default function Register() {
  const [newUser, setNewUser] = useState(EMPTY_USER)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(field) {
    return (e) => {
      setResponse(null)
      setNewUser((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function sanitize(val) {
    return DOMPurify.sanitize(val.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  }

  async function handleSubmit() {
    const cleanNombre = sanitize(newUser.nombre)
    const cleanTelefono = sanitize(newUser.telefono)
    const cleanCorreo = sanitize(newUser.correo)
    const cleanPassword = newUser.password.trim()
    const cleanConfirmar = newUser.confirmar.trim()

    if (!cleanNombre || !cleanTelefono || !cleanCorreo || !cleanPassword || !cleanConfirmar) {
      setResponse({ type: 'error', message: 'Completa todos los campos' })
      return
    }

    if (cleanPassword !== cleanConfirmar) {
      setResponse({ type: 'error', message: 'Las contraseñas no coinciden' })
      return
    }

    setResponse(null)
    setLoading(true)

    try {
      const data = await createUser({
        nombre: cleanNombre,
        telefono: cleanTelefono,
        correo: cleanCorreo,
        password: cleanPassword,
      })

      if (data.ok) {
        setResponse({ type: 'success', message: data.mensaje || 'Usuario creado correctamente' })
        setNewUser(EMPTY_USER)
      } else {
        setResponse({ type: 'error', message: data.mensaje || 'Error al crear usuario' })
      }
    } catch {
      setResponse({ type: 'error', message: 'No se pudo conectar con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  function handleEnter(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  const style = response ? RESPONSE_STYLE[response.type] : null

  const inputClass = `rounded-lg w-full px-2 py-1 border-2 text-gray-700 bg-gray-100 shadow-sm sm:text-sm ${
    style ? style.input : 'border-gray-400'
  }`

  const fields = [
    { label: 'Nombre completo', field: 'nombre', type: 'text', placeholder: 'Nombre completo' },
    { label: 'Teléfono', field: 'telefono', type: 'tel', placeholder: 'Teléfono' },
    { label: 'Correo', field: 'correo', type: 'email', placeholder: 'Correo electrónico' },
    { label: 'Contraseña', field: 'password', type: 'password', placeholder: 'Contraseña' },
    {
      label: 'Confirmar contraseña',
      field: 'confirmar',
      type: 'password',
      placeholder: 'Repite la contraseña',
    },
  ]

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-200">
      <TopBar />
      <div className="flex w-full h-full my-5">
        <div className="w-full h-full bg-gray-50 mx-5 rounded-lg p-5 shadow-md">
          <div className="flex flex-col items-center w-full h-full">
            {/* Header*/}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 text-center">
                Registro de usuario
              </h1>
              <hr className="rounded-full border-2 border-gray-400 w-full my-5" />
            </div>
            {/* Body */}
            <div className="flex flex-col w-full h-full justify-begin items-center">
              <div className="flex items-center mb-4">
                <hr className="grow border-gray-300" />
                <span className="mx-3 text-gray-600 text-sm">Información del nuevo usuario</span>
                <hr className="grow border-gray-300" />
              </div>

              {response && (
                <div
                  className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border text-sm ${style.bg} ${style.border} ${style.text}`}
                >
                  <style.Icon className="w-5 shrink-0" />
                  {response.message}
                </div>
              )}
              {/* Inputs */}
              <div className="grid grid-cols-1 gap-4 lg:w-160 w-80">
                {fields.map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label
                      className="block text-sm font-semibold text-gray-800 mb-1"
                      htmlFor={field}
                    >
                      {label}
                    </label>
                    <input
                      className={inputClass}
                      id={field}
                      type={type}
                      value={newUser[field]}
                      onChange={handleChange(field)}
                      onKeyDown={handleEnter}
                      placeholder={placeholder}
                      autoComplete={type === 'password' ? 'new-password' : 'on'}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 lg:w-160 w-80 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                <ActionButton
                  className="font-normal w-full rounded-lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Registrar usuario
                </ActionButton>
              </div>
              <div className="mt-6 mb-2 lg:w-160 w-80 lace-self-center text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                <NavigateButton className="font-normal w-full rounded-lg" to="/users">
                  Volver a Usuarios
                </NavigateButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
