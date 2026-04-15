import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function ActionButton({ onClick, label, ...props }) {
const { loading, setLoading} = useState(false)

  const navigate = useNavigate()

  const handleClick = async () => {
    setLoading(true)

    try {
    if (onClick) await onClick()
    } finally {
        setLoading(false)
    }

  }

  return (
    <button onClick={onClick} {...props}>
      {loading ? 'Cargando...' : label}
    </button>
  )
}
