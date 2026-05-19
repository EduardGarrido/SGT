import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useHeaderContent } from '../context/HeaderContext'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Inicio',
  '/sales': 'Ventas',
  '/inventory': 'Inventario',
  '/caja': 'Caja',
  '/historial': 'Historial',
  '/report': 'Reporte',
  '/categorias': 'Categorías',
  '/proveedores': 'Proveedores',
  '/users': 'Usuarios',
  '/user-info': 'Información de Usuario',
}

export default function PageHeader() {
  const { pathname } = useLocation()
  const titulo = PAGE_TITLES[pathname] ?? ''
  const [hora, setHora] = useState(new Date().toLocaleTimeString())
  const headerContent = useHeaderContent()
  const { caja } = useAuth()
  const estadoCaja = caja ? 'Abierta' : 'Cerrada'

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-12 shrink-0 bg-gray-800 text-white px-6 flex items-center w-full justify-between shadow">
      <div className="flex w-fit flex-row items-center justify-center gap-4">
        <span className="font-semibold tracking-wide">{titulo}</span>
        {headerContent}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span>
          Estado de caja:{' '}
          <span
            className={
              caja ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
            }
          >
            {estadoCaja}
          </span>
        </span>
        <span className="font-mono">{hora}</span>
      </div>
    </header>
  )
}
