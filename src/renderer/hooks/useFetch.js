import { useState, useEffect } from 'react'

export function useFetch(apiFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true)
    setError(null)
    const res = await apiFn()
    setLoading(false)
    if (res.ok) {
      setData(res)
      console.log(res)
    } else setError(res.mensaje ?? 'Error al cargar los datos')
  }

  useEffect(() => {
    run()
  }, [])

  return { data, loading, error, refetch: run }
}
