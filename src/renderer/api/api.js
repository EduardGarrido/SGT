const ROOT = 'http://localhost:8000/api' // Base URL for PHP backend

// HTTP request to PHP backend for login
export async function login(id, pw) {
  const res = await fetch(`${ROOT}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ID_Usuario: id, Password: pw }),
  })

  return res.json()
}

// HTTP request to PHP backend for logout
export async function logout() {
  const res = await fetch(`${ROOT}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return res.json()
}