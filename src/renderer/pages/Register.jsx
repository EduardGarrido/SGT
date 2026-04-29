import { useState } from 'react'
import DOMPurify from 'dompurify'
import { NavigateButton, ActionButton } from '../components'
import { createUser, checkEmail } from '../api/api'
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

const EMPTY_USER = {
  nombre: '',
  password: '',
  confirmar: '',
  puesto: '',
  telefono: '',
  correo: '',
  calle: '',
  colonia: '',
  codigo_postal: '',
}

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
    const cleanPassword = newUser.password.trim()
    const cleanConfirmar = newUser.confirmar.trim()
    const cleanTelefono = sanitize(newUser.telefono)
    const cleanCorreo = sanitize(newUser.correo)

    if (!cleanNombre || !cleanPassword || !cleanConfirmar || !newUser.puesto) {
      setResponse({
        type: 'error',
        message: 'Nombre, contraseña y puesto son obligatorios',
        field: 'required',
      })
      return
    }

    if (cleanPassword !== cleanConfirmar) {
      setResponse({ type: 'error', message: 'Las contraseñas no coinciden', field: 'confirmar' })
      return
    }

    if (cleanTelefono) {
      if (!/^\d+$/.test(cleanTelefono)) {
        setResponse({
          type: 'error',
          message: 'El teléfono solo debe contener números',
          field: 'telefono',
        })
        return
      }
      if (cleanTelefono.length !== 10 && cleanTelefono.length !== 12) {
        setResponse({
          type: 'error',
          message: 'El teléfono debe tener 10 o 12 dígitos',
          field: 'telefono',
        })
        return
      }
    }

    if (cleanCorreo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(cleanCorreo)) {
        setResponse({
          type: 'error',
          message: 'El formato del correo no es válido',
          field: 'correo',
        })
        return
      }

      setLoading(true)
      const emailCheck = await checkEmail(cleanCorreo)
      if (!emailCheck.ok) {
        setResponse({ type: 'error', message: emailCheck.mensaje, field: 'correo' })
        setLoading(false)
        return
      }
    }

    setResponse(null)
    setLoading(true)

    try {
      const data = await createUser({
        Nombre: cleanNombre,
        Password: cleanPassword,
        Puesto: newUser.puesto,
        Telefono: cleanTelefono,
        Correo: cleanCorreo,
        Calle: sanitize(newUser.calle),
        Colonia: sanitize(newUser.colonia),
        Codigo_Postal: sanitize(newUser.codigo_postal),
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

  const baseInputClass =
    'rounded-lg w-full px-2 py-1 border-2 text-gray-700 bg-gray-100 shadow-sm sm:text-sm'

  const inputClass = (field, required) => {
    const hasError = response?.type === 'error' && style?.input
    const isHighlighted =
      hasError && (response.field === field || (response.field === 'required' && required))
    return `${baseInputClass} ${isHighlighted ? style.input : 'border-gray-400'}`
  }

  const fields = [
    {
      label: 'Nombre completo *',
      field: 'nombre',
      type: 'text',
      placeholder: 'Nombre completo',
      required: true,
    },
    {
      label: 'Puesto *',
      field: 'puesto',
      type: 'select',
      options: [
        { value: 'admin', label: 'Administrador' },
        { value: 'empleado', label: 'Empleado' },
      ],
      required: true,
    },
    {
      label: 'Teléfono (sin espacios)',
      field: 'telefono',
      type: 'tel',
      placeholder: '1234567890',
      required: false,
    },
    {
      label: 'Correo',
      field: 'correo',
      type: 'email',
      placeholder: 'correo@ejemplo.mx',
      required: false,
    },
    { label: 'Calle', field: 'calle', type: 'text', placeholder: 'Calle', required: false },
    { label: 'Colonia', field: 'colonia', type: 'text', placeholder: 'Colonia', required: false },
    {
      label: 'Código Postal',
      field: 'codigo_postal',
      type: 'text',
      placeholder: 'Código Postal',
      required: false,
    },
    {
      label: 'Contraseña *',
      field: 'password',
      type: 'password',
      placeholder: 'Contraseña',
      required: true,
    },
    {
      label: 'Confirmar contraseña *',
      field: 'confirmar',
      type: 'password',
      placeholder: 'Repite la contraseña',
      required: true,
    },
  ]

  return (
    <div className="flex flex-col h-full">
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
            <div className="flex flex-col w-full h-full justify-begin items-center gap-4">
              <div className="flex items-center w-full">
                <hr className="grow border-gray-300" />
                <span className="mx-3 text-gray-600 text-sm">Información del nuevo usuario</span>
                <hr className="grow border-gray-300" />
              </div>
              <div className="flex flex-col w-full h-full justify-begin items-center">
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
                  {fields.map(({ label, field, type, placeholder, options, required }) => (
                    <div key={field}>
                      <label
                        className="block text-sm font-semibold text-gray-800 mb-1"
                        htmlFor={field}
                      >
                        {label}
                      </label>
                      {type === 'select' ? (
                        <select
                          className={inputClass(field, required)}
                          id={field}
                          value={newUser[field]}
                          onChange={handleChange(field)}
                        >
                          <option value="">Seleccionar puesto...</option>
                          {options.map(({ value, label: optLabel }) => (
                            <option key={value} value={value}>
                              {optLabel}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={inputClass(field, required)}
                          id={field}
                          type={type}
                          value={newUser[field]}
                          onChange={handleChange(field)}
                          onKeyDown={handleEnter}
                          placeholder={placeholder}
                          autoComplete={type === 'password' ? 'new-password' : 'off'}
                        />
                      )}
                    </div>
                  ))}
                  <div className="w-full flex flex-col pt-4 pb-8 gap-4">
                    <div className="lg:w-160 w-80 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                      <ActionButton
                        className="font-normal w-full rounded-lg"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        Registrar usuario
                      </ActionButton>
                    </div>
                    <div className="lg:w-160 w-80 lace-self-center text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                      <NavigateButton className="font-normal w-full rounded-lg" to="/users">
                        Volver a Usuarios
                      </NavigateButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
