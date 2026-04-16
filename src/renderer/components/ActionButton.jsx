import { useState } from 'react'

export default function ActionButton({ onClick, label, ...props }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e) => {
    if (e) e.preventDefault()
    
    setLoading(true)

    try {
      if (onClick) await onClick()

    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleClick} // 4. Fix: Use the internal wrapper
      disabled={loading}    // 5. Best Practice: Disable while loading
      {...props}
    >
      {loading ? 'Cargando...' : label}
    </button>
  )
}