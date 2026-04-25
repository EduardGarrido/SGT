import { useState } from 'react'
import BaseButton from './BaseButton'

export default function ActionButton({ onClick, className, children, ...props }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      if (onClick) await onClick()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseButton className={className} onClick={handleClick} disabled={loading} {...props}>
      {loading ? 'Cargando...' : (children ?? 'Accion')}
    </BaseButton>
  )
}
