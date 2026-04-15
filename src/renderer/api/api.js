const ROOT = import.meta.env.VITE_APP_URL ?? 'http://localhost:8000/api' // Base URL for PHP backend

async function request(path, opttions = {}) {
  const res = await fetch(`${ROOT}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies for session management
    ...opttions,
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.mensaje || 'Error en la solicitud')
  }

  return res.json()
}

// HTTP request to PHP backend for login
export async function login(id, pw) {
  return request('login', {
    method: 'POST',
    body: JSON.stringify({ ID_Usuario: id, Password: pw }),
  })
}

// HTTP request to PHP backend for logout
export async function logout() {
  return request('logout', {
    method: 'POST',
  })
}