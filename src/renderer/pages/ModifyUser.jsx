import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { NavigateButton, ActionButton } from '../components'
import { getUserInfo, modifyInfoUser, modifyPasswordUser, modifyEstadoUser } from '../api/api'
import { useAuth } from '../context/AuthContext'
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
  puesto: '',
  estado: '',
  telefono: '',
  correo: '',
  calle: '',
  colonia: '',
  codigo_postal: '',
  password: '',
  confirmar: '',
}

// Campos agrupados por sección / endpoint
const INFO_FIELDS = [
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
]

const ESTADO_FIELDS = [
  {
    label: 'Estado *',
    field: 'estado',
    type: 'select',
    options: [
      { value: 'autorizado', label: 'Autorizado' },
      { value: 'no autorizado', label: 'No autorizado' },
    ],
    required: true,
  },
]

const PASSWORD_FIELDS = [
  {
    label: 'Nueva contraseña (dejar vacío para no cambiar)',
    field: 'password',
    type: 'password',
    placeholder: 'Nueva contraseña',
    required: false,
  },
  {
    label: 'Confirmar contraseña',
    field: 'confirmar',
    type: 'password',
    placeholder: 'Repite la nueva contraseña',
    required: false,
  },
]

function mapUsuarioInfo(u) {
  return {
    nombre: u.Nombre ?? '',
    puesto: u.Puesto ?? '',
    estado: u.Estado ?? '',
    telefono: u.Telefono ?? '',
    correo: u.Correo ?? '',
    calle: u.Calle ?? '',
    colonia: u.Colonia ?? '',
    codigo_postal: u.Codigo_Postal ?? '',
    password: '',
    confirmar: '',
  }
}

function infoChanged(current, original) {
  return INFO_FIELDS.some(({ field }) => current[field] !== original[field])
}

function estadoChanged(current, original) {
  return current.estado !== original.estado
}

function passwordChanged(current) {
  return current.password.trim() !== ''
}

export default function ModifyUser() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUserInfo } = useAuth()
  const modalRef = useRef(null)

  const id = searchParams.get('id') ? Number(searchParams.get('id')) : null

  const [userData, setUserData] = useState(EMPTY_USER)
  const [originalData, setOriginalData] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/users', { replace: true })
      return
    }

    getUserInfo(id)
      .then((res) => {
        if (res.ok) {
          const mapped = mapUsuarioInfo(res.usuarioinfo)
          setUserData(mapped)
          setOriginalData(mapped)
        } else {
          setResponse({ type: 'error', message: res.mensaje || 'No se encontró el usuario' })
        }
      })
      .finally(() => setLoadingInfo(false))
  }, [id, navigate])

  function handleChange(field) {
    return (e) => {
      setResponse(null)
      setUserData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function handleRestore() {
    setUserData(originalData)
    setResponse(null)
  }

  function sanitize(val) {
    return DOMPurify.sanitize(val.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  }

  async function handleSubmit() {
    const cleanNombre = sanitize(userData.nombre)
    const cleanTelefono = sanitize(userData.telefono)
    const cleanCorreo = sanitize(userData.correo)
    const cleanPassword = userData.password.trim()
    const cleanConfirmar = userData.confirmar.trim()

    if (!cleanNombre || !userData.puesto || !userData.estado) {
      setResponse({
        type: 'error',
        message: 'Nombre, puesto y estado son obligatorios',
        field: 'required',
      })
      return
    }

    if (cleanPassword && cleanPassword !== cleanConfirmar) {
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCorreo)) {
        setResponse({
          type: 'error',
          message: 'El formato del correo no es válido',
          field: 'correo',
        })
        return
      }
    }

    const hasInfoChange = infoChanged(userData, originalData)
    const hasEstadoChange = estadoChanged(userData, originalData)
    const hasPasswordChange = passwordChanged(userData)

    if (!hasInfoChange && !hasEstadoChange && !hasPasswordChange) {
      setResponse({ type: 'error', message: 'No hay cambios para guardar' })
      return
    }

    setLoading(true)
    const errors = []

    try {
      if (hasInfoChange) {
        const res = await modifyInfoUser(id, {
          Nombre: cleanNombre,
          Puesto: userData.puesto,
          Telefono: cleanTelefono,
          Correo: cleanCorreo,
          Calle: sanitize(userData.calle),
          Colonia: sanitize(userData.colonia),
          Codigo_Postal: sanitize(userData.codigo_postal),
        })
        if (!res.ok) errors.push(res.mensaje || 'Error al actualizar información')
      }

      if (hasEstadoChange) {
        const res = await modifyEstadoUser(id, userData.estado)
        if (!res.ok) errors.push(res.mensaje || 'Error al actualizar estado')
      }

      if (hasPasswordChange) {
        const res = await modifyPasswordUser(id, cleanPassword)
        if (!res.ok) errors.push(res.mensaje || 'Error al actualizar contraseña')
      }

      if (errors.length) {
        setResponse({ type: 'error', message: errors.join('. ') })
      } else {
        setUserInfo(null)
        modalRef.current.showModal()
      }
    } catch {
      setResponse({ type: 'error', message: 'No se pudo conectar con el servidor' })
    } finally {
      setLoading(false)
    }
  }

  // function handleEnter(e) {
  //   if (e.key === 'Enter') handleSubmit()
  // }

  const style = response ? RESPONSE_STYLE[response.type] : null

  const baseInputClass =
    'rounded-lg w-full px-2 py-1 border-2 text-gray-700 bg-gray-100 shadow-sm sm:text-sm'

  function inputClass(field, required) {
    const hasError = response?.type === 'error' && style?.input
    const isHighlighted =
      hasError && (response.field === field || (response.field === 'required' && required))
    return `${baseInputClass} ${isHighlighted ? style.input : 'border-gray-400'}`
  }

  function renderField({ label, field, type, placeholder, options, required }) {
    return (
      <div key={field}>
        <label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor={field}>
          {label}
        </label>
        {type === 'select' ? (
          <select
            className={inputClass(field, required)}
            id={field}
            value={userData[field]}
            onChange={handleChange(field)}
          >
            <option value="">Seleccionar...</option>
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
            value={userData[field]}
            onChange={handleChange(field)}
            // onKeyDown={handleEnter}
            placeholder={placeholder}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
          />
        )}
      </div>
    )
  }

  function SectionDivider({ label }) {
    return (
      <div className="flex items-center w-full">
        <hr className="grow border-gray-300" />
        <span className="mx-3 text-gray-600 text-sm">{label}</span>
        <hr className="grow border-gray-300" />
      </div>
    )
  }

  return (
    <div className="flex flex-col ">
      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-6 text-green-600 shrink-0" />
            <h3 className="font-bold text-lg text-gray-900">Usuario actualizado</h3>
          </div>
          <p className="text-gray-600 text-sm">Los cambios se guardaron correctamente.</p>
          <div className="modal-action">
            <button
              className="btn bg-gray-800 hover:bg-gray-900 text-white border-none"
              onClick={() => {
                modalRef.current.close()
                navigate('/users')
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex w-full h-full my-5">
        <div className="w-full h-full bg-gray-50 mx-5 rounded-lg p-5 shadow-md">
          <div className="flex flex-col items-center w-full h-full">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 text-center">Editar usuario</h1>
              <hr className="rounded-full border-2 border-gray-400 w-full my-5" />
            </div>
            <div className="flex flex-col w-full h-full justify-begin items-center gap-4">
              {response && (
                <div
                  className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border text-sm ${style.bg} ${style.border} ${style.text}`}
                >
                  <style.Icon className="w-5 shrink-0" />
                  {response.message}
                </div>
              )}
              {loadingInfo ? (
                <p className="text-gray-400 text-sm">Cargando información...</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:w-160 w-80">
                  <SectionDivider label="Información del usuario" />
                  {INFO_FIELDS.map(renderField)}

                  <SectionDivider label="Estado" />
                  {ESTADO_FIELDS.map(renderField)}

                  <SectionDivider label="Contraseña" />
                  {PASSWORD_FIELDS.map(renderField)}

                  <div className="w-full flex flex-col pt-4 pb-8 gap-4">
                    <div className="lg:w-160 w-80 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                      <ActionButton
                        className="font-normal w-full rounded-lg"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        Guardar cambios
                      </ActionButton>
                    </div>
                    <div className="lg:w-160 w-80 tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                      <ActionButton
                        className="font-normal w-full rounded-lg"
                        onClick={handleRestore}
                        disabled={!originalData}
                      >
                        Restaurar
                      </ActionButton>
                    </div>
                    <div className="lg:w-160 w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
                      <NavigateButton className="font-normal w-full rounded-lg" to="/users">
                        Cancelar
                      </NavigateButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
