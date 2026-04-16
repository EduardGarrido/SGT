// const ROOT = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '') // Base URL for PHP backend
const ROOT = import.meta.env.VITE_API_URL ?? 'http://148.210.173.78:8000/api'

async function request(path, opttions = {}) {
  const res = await fetch(`${ROOT}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies for session management
    ...opttions,
  })

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