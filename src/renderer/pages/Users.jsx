import { useState, useEffect, useRef } from 'react'
import { ActionButton, NavigateButton } from '../components'
import { getUsers, getUserInfo, deleteUser } from '../api/api'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const modalRef = useRef(null)

  const handleSelectUser = (id) => {
    setSelectedId(id)
    setDeleteError(null)
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

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteUser(selectedId)
    setDeleting(false)

    if (res.ok) {
      modalRef.current.close()
      setUsers((prev) => prev.filter((u) => u.ID_Usuario !== selectedId))
      setSelectedId(null)
      setUserInfo(null)
    } else {
      setDeleteError(res.mensaje || 'Error al eliminar el usuario')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-white">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationCircleIcon className="w-6 text-red-500 shrink-0" />
            <h3 className="font-bold text-lg text-gray-900">Eliminar usuario</h3>
          </div>
          <p className="text-gray-600 text-sm">
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-semibold">{userInfo?.Nombre}</span>? Esta acción desactivará su
            cuenta.
          </p>
          {deleteError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg px-3 py-2">
              {deleteError}
            </p>
          )}
          <div className="modal-action">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
              onClick={() => {
                modalRef.current.close()
                setDeleteError(null)
              }}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              className="btn bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </dialog>

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
          <div className="grid grid-cols-1 gap-4">
            <NavigateButton className="font-normal rounded-lg" to="/register">
              Registrar Usuario
            </NavigateButton>
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
                    className={`text-xs w-fit px-2 py-0.5 rounded-full mt-1 ${userInfo.Estado === 'autorizado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {userInfo.Estado === 'autorizado' ? 'Autorizado' : 'No autorizado'}
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
            <div className="mt-6 mb-2 grid grid-cols-2 gap-4">
              {!loadingInfo && userInfo && (
                <>
                  <NavigateButton
                    className="font-normal rounded-lg"
                    to={`/modifyUser?id=${selectedId}`}
                  >
                    Editar
                  </NavigateButton>
                  <ActionButton
                    className="font-normal rounded-lg"
                    onClick={() => {
                      setDeleteError(null)
                      modalRef.current.showModal()
                    }}
                  >
                    Eliminar
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
