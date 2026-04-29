import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideNav from './SideNav'
import PageHeader from './PageHeader'

export default function AppLayout() {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/" replace />

  return (
    <div className="flex h-screen font-sans bg-gray-200">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader />
        <main className="flex-1 overflow-auto flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
