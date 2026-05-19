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

// Catálogos — Categorías
export const getCategorias    = ()       => get('getAllCategories')
export const getCategoria     = (id)     => get(`getCategory?id=${id}`)
export const createCategoria  = (data)   => post('createCategory', data)
export const modifyCategoria  = (id, data) => patch('modifyCategory', { ID_Categoria: id, ...data })
export const deleteCategoria  = (id)     => patch('deleteCategory', { ID_Categoria: id })

// Caja
export const openCaja  = (data) => post('openCashRegister', data)
export const closeCaja = (data) => patch('closeCashRegister', data)

// Catálogos — Proveedores
export const getProveedores   = ()       => get('getAllSuppliers')
export const getProveedor     = (id)     => get(`getSupplier?id=${id}`)
export const createProveedor  = (data)   => post('createSupplier', data)
export const modifyProveedor  = (id, data) => patch('modifySupplier', { ID_Proveedor: id, ...data })
export const deleteProveedor  = (id)     => patch('deleteSupplier', { ID_Proveedor: id })
