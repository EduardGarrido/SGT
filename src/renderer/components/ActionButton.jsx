import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

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
    <button
      className={twMerge(clsx('w-full h-full rounded-lg text-white cursor-pointer', className))}
      onClick={handleClick} // 4. Fix: Use the internal wrapper
      disabled={loading} // 5. Best Practice: Disable while loading
      {...props}
    >
      {loading ? 'Cargando...' : (children ?? 'Accion')}
    </button>
  )
}

