import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LogoutButton from './LogoutButton'

const PRINCIPAL = [
  { label: 'Inicio', to: '/dashboard' },
  { label: 'Inventario', to: '/inventory', adminOnly: true },
  { label: 'Ventas', to: '/sales' },
  { label: 'Caja', to: '/caja' },
  { label: 'Historial', to: '/historial' },
  { label: 'Reporte', to: '/report' },
]

const CATALOGO = [
  { label: 'Categorías', to: '/categorias' },
  { label: 'Proveedores', to: '/proveedores' },
  { label: 'Usuarios', to: '/users', adminOnly: true },
]

function NavItem({ to, label }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        {label}
      </NavLink>
    </li>
  )
}

function NavSection({ title, items, esAdmin }) {
  const visible = items.filter((item) => !item.adminOnly || esAdmin)
  if (visible.length === 0) return null

  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">{title}</p>
      <ul className="space-y-0.5">
        {visible.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} />
        ))}
      </ul>
    </div>
  )
}

export default function SideNav() {
  const { esAdmin } = useAuth()

  return (
    <nav className="flex flex-col w-52 shrink-0 bg-gray-800 text-white h-full">
      <div className="flex-1 overflow-y-auto p-3 pt-5">
        <NavSection title="Principal" items={PRINCIPAL} esAdmin={esAdmin} />
        <NavSection title="Catálogo" items={CATALOGO} esAdmin={esAdmin} />
      </div>
      <div className="p-3 border-t border-gray-700">
        <LogoutButton className="w-full bg-gray-700 hover:bg-gray-600 border-none font-normal text-sm py-2">
          Cerrar sesión
        </LogoutButton>
      </div>
    </nav>
  )
}
