import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogoutButton, NavigateButton } from '../components'
import TopBar from '../components/TopBar'
import { getUserInfo } from '../api/api'

export default function Dashboard() {
  const { usuario, esAdmin } = useAuth()
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserInfo(usuario.id)
      .then((res) => {
        if (res.ok) setUserInfo(res.usuarioinfo)
        console.log('getUserInfo response:', res)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-200">
      <TopBar />
      <div className="flex my-5 h-full w-full">
        <div className="flex flex-col rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50 shadow-md justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">Mi Perfil</h1>
            <hr className="rounded-full border-2 w-full border-gray-400 my-3" />
            {loading ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : userInfo ? (
              <>
                <p className="text-lg font-semibold text-gray-800">{userInfo.Nombre}</p>
                <span className="text-sm text-gray-500 capitalize">{userInfo.Puesto}</span>
                <span
                  className={`text-xs w-fit px-2 py-0.5 rounded-full mt-1 ${userInfo.Estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                >
                  {userInfo.Estado}
                </span>
                <hr className="border border-gray-200 my-3" />
                <p className="text-gray-500 text-sm">Teléfono: {userInfo.Telefono}</p>
                <p className="text-gray-500 text-sm">Correo: {userInfo.Correo}</p>
                <p className="text-gray-500 text-sm">Calle: {userInfo.Calle}</p>
                <p className="text-gray-500 text-sm">Colonia: {userInfo.Colonia}</p>
                <p className="text-gray-500 text-sm">C.P.: {userInfo.Codigo_Postal}</p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Sin información</p>
            )}
          </div>
          <LogoutButton className="bg-gray-800 hover:bg-gray-900 font-normal mt-4">
            Cerrar sesión
          </LogoutButton>
        </div>
        <div className="rounded-lg h-full p-5 w-1/2 bg-gray-50 self-center-safe shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Bienvenido, {usuario?.id} - Puesto: {usuario?.puesto}
          </h1>
          <hr className="rounded-full border-2 w-full border-gray-400 my-5" />
          <div className="mt-6 mb-2 w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
            <NavigateButton className="font-normal" to="/sales">
              Ir a venta
            </NavigateButton>
          </div>
          {esAdmin && (
            <div className="mt-6 mb-2 right-10 place-self-center w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
              <NavigateButton className="font-normal" to="/users">
                Ver usuarios
              </NavigateButton>
            </div>
          )}
          {esAdmin && (
            <div className="mt-6 mb-2 right-10 place-self-center w-50 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
              <NavigateButton className="font-normal" to="/inventory">
                Gestión de inventario
              </NavigateButton>
            </div>
          )}
        </div>
        <div className="rounded-lg h-full mx-5 p-5 w-1/4 bg-gray-50 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">Último corte</h1>
          <hr className="rounded-full border-2 w-full border-gray-400 my-5" />
        </div>
      </div>
    </div>
  )
}
