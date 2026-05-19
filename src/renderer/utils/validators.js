import { sanitize } from './sanitize'

const TEL_REGEX = /^\d+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateTelefono(value) {
  if (!value) return null
  if (!TEL_REGEX.test(value) || (value.length !== 10 && value.length !== 12))
    return 'El teléfono debe tener 10 o 12 dígitos numéricos'
  return null
}

export function validateCorreo(value) {
  if (!value) return null
  if (!EMAIL_REGEX.test(value)) return 'El formato del correo no es válido'
  return null
}

export function validateUserForm(form, mode) {
  const requiredMissing =
    mode === 'create'
      ? !sanitize(form.nombre) || !form.puesto || !form.password || !form.confirmar
      : !sanitize(form.nombre) || !form.puesto || !form.estado

  if (requiredMissing) {
    return {
      message:
        mode === 'create'
          ? 'Nombre, contraseña y puesto son obligatorios'
          : 'Nombre, puesto y estado son obligatorios',
      field: 'required',
    }
  }

  const password = form.password.trim()
  const confirmar = form.confirmar.trim()
  if ((mode === 'create' || password) && password !== confirmar)
    return { message: 'Las contraseñas no coinciden', field: 'confirmar' }

  const telError = validateTelefono(sanitize(form.telefono))
  if (telError) return { message: telError, field: 'telefono' }

  const correoError = validateCorreo(sanitize(form.correo))
  if (correoError) return { message: correoError, field: 'correo' }

  return null
}
