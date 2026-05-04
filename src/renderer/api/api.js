const ROOT = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

async function request(path, options = {}) {
  try {
    const res = await fetch(`${ROOT}/${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    })

    const data = await res.json()

    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('sesion-expirada'))
      return { ok: false, mensaje: data.mensaje ?? 'No autorizado' }
    }

    if (!res.ok) {
      return { ok: false, mensaje: data.mensaje ?? data.error ?? `Error ${res.status}` }
    }

    return data
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar con el servidor' }
  }
}

const get  = (path)        => request(path)
const post = (path, data)  => request(path, { method: 'POST',   body: JSON.stringify(data) })
const patch = (path, data) => request(path, { method: 'PATCH',  body: JSON.stringify(data) })
const del  = (path, data)  => request(path, { method: 'DELETE', body: JSON.stringify(data) })

// Auth
export const login  = (id, pw) => post('login', { ID_Usuario: id, Password: pw })
export const logout = ()       => post('logout')

// Usuarios
export const getUsers            = ()           => get('getUsers')
export const getUserInfo         = (id)         => get(id ? `getUserInfo?id=${id}` : 'getUserInfo')
export const checkEmail          = (correo)     => get(`checkEmail?correo=${encodeURIComponent(correo)}`)
export const createUser          = (data)       => post('createUser', data)
export const modifyInfoUser      = (id, data)   => patch('modifyInfoUser',   { ID_Usuario: id, ...data })
export const modifyPasswordUser  = (id, pw)     => post('modifyPasswordUser', { ID_Usuario: id, Password: pw })
export const modifyEstadoUser    = (id, estado) => patch('modifyEstadoUser',  { ID_Usuario: id, Estado: estado })
export const deleteUser          = (id)         => patch('deleteUser',         { ID_Usuario: id })

// Productos
export const getProducts   = ()       => get('getAllProducts')
export const getProduct    = (id)     => get(`getProduct?id=${id}`)
export const createProduct = (data)   => post('createProduct', data)
export const modifyProduct = (id, data) => patch('modifyProduct', { ID_Producto: id, ...data })
export const deleteProduct = (id)     => del('deleteProduct', { ID_Producto: id })

// Catálogos
export const getCategorias  = () => get('getCategorias')
export const getProveedores = () => get('getProveedores')
