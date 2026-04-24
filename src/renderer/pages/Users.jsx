import { useState, useEffect } from 'react'
import { ActionButton, NavigateButton } from '../components'
import TopBar from '../components/TopBar'
import { getUsers, getUserInfo } from '../api/api'

export default function Users() {
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const handleSelectUser = (id) => {
    setSelectedId(id)
    setLoadingInfo(true)
    getUserInfo(id)
      .then((res) => {
        if (res.ok) setUserInfo(res.usuarioinfo)
      })
      .finally(() => setLoadingInfo(false))
  }

  useEffect(() => {
    getUsers()
      .then((res) => {
        if (res.ok) setUsers(res.usuarios)
        console.log(res)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-200">
      <TopBar />
      <div className="flex my-5 w-full h-full">
        <div className="flex flex-col w-1/3 mx-5">
          <div className="w-full h-full rounded-lg mb-5 p-5 bg-gray-50 shadow-md overflow-y-auto">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">Usuarios</h1>
            <hr className="rounded-full border-2 border-gray-400 w-full my-5" />

            {loading ? (
              <p className="text-center text-gray-500">Cargando usuarios...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-gray-500">Sin usuarios</p>
            ) : (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li
                    key={u.ID_Usuario}
                    onClick={() => handleSelectUser(u.ID_Usuario)}
                    className={`flex flex-row gap-2 border py-4 px-4 rounded-2xl cursor-pointer ${u.ID_Usuario === selectedId ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  >
                    {/* O activo ?? */}
                    <span className="text-lg font-semibold text-inherit">
                      Usuario ID:
                      <span className="font-light px-1">{u.ID_Usuario}</span>
                    </span>
                    <span className="text-lg font-semibold text-inherit">
                      Nombre:
                      <span className="font-light px-1">{u.Nombre}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NavigateButton className="font-normal rounded-lg" to="/register">
              Registrar Usuario
            </NavigateButton>
            <ActionButton className="font-normal rounded-lg">Eliminar Usuario</ActionButton>
          </div>
        </div>
        <div className="flex w-2/3 mr-5">
          <div className="rounded-lg w-full p-5 bg-gray-50 shadow-md">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">
              Información del usuario
            </h1>
            <hr className="rounded-full border-2 border-gray-400 w-full my-5" />
            <div className="flex flex-col gap-1 flex-1">
              {loadingInfo ? (
                <p className="text-gray-400 text-sm">Cargando...</p>
              ) : !userInfo ? (
                <p className="text-gray-400 text-sm text-center">
                  Selecciona un usuario para ver su información
                </p>
              ) : (
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
              )}
            </div>
            <div className="mt-6 mb-2 place-self-center w-80 text-white font-light tracking-wider bg-gray-800 hover:bg-gray-900 rounded-lg text-center">
              <NavigateButton className="font-normal w-80 rounded-lg" to="/dashboard">
                Ir al menú principal
              </NavigateButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
