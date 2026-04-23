const ROOT = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

async function request(path, options = {}) {
  try {
    const res = await fetch(`${ROOT}/${path}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    })

    const data = await res.json()

    if (!res.ok) {
      return { ok: false, mensaje: data.mensaje ?? data.error ?? `Error ${res.status}` }
    }

    return data
  } catch {
    return { ok: false, mensaje: 'No se pudo conectar con el servidor' }
  }
}

export async function login(id, pw) {
  return request('login', {
    method: 'POST',
    body: JSON.stringify({ ID_Usuario: id, Password: pw }),
  })
}

export async function logout() {
  return request('logout', {
    method: 'POST',
  })
}

export async function getUsers() {
  return request('getUsers')
}

export async function getUserInfo(id) {
  const path = id ? `getUserInfo?id=${id}` : 'getUserInfo'
  return request(path)
}
