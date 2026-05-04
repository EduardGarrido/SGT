import { useState, useRef } from 'react'
import { NavigateButton, ActionButton } from '../components'
import { getUsers, getUserInfo, deleteUser } from '../api/api'
import { useFetch } from '../hooks/useFetch'
import { useHeader } from '../context/HeaderContext'
import {
  ExclamationCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

const user_props = [
  { label: 'CODIGO', field: 'ID_Usuario' },
  { label: 'NOMBRE', field: 'Nombre', grow: true },
  { label: 'ESTADO', field: 'Estado' },
]

const header_class = 'w-full h-fit bg-gray-800 grid grid-cols-4'
const base_header_item_class = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const header_item_class = (grow) => `${base_header_item_class} ${grow ? 'col-span-2' : ''}`

const base_row_item_class = 'py-2 text-xs text-center text-gray-700 truncate px-1'
const row_item_class = (grow) => `${base_row_item_class} ${grow ? 'col-span-2' : ''}`

const INFO_ROWS = [
  { label: 'Puesto', field: 'Puesto' },
  { label: 'Estado', field: 'Estado' },
  { label: 'Teléfono', field: 'Telefono' },
  { label: 'Correo', field: 'Correo' },
  { label: 'Calle', field: 'Calle' },
  { label: 'Colonia', field: 'Colonia' },
  { label: 'Código Postal', field: 'Codigo_Postal' },
]

export default function Users() {
  const { data: usersData, loading, refetch: refetchUsers } = useFetch(getUsers)
  const users = usersData?.usuarios ?? []

  const [selectedId, setSelectedId] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const modalRef = useRef(null)

  const headerSearch = (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar usuario..."
      className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
    />
  )

  const headerAction = (
    <NavigateButton
      to="/register"
      className="w-auto px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
    >
      <PlusIcon className="w-3.5 h-3.5 shrink-0" />
      Registrar usuario
    </NavigateButton>
  )

  useHeader(
    <>
      {headerSearch}
      {headerAction}
    </>
  )

  function handleSelectUser(id) {
    setSelectedId(id)
    setDeleteError(null)
    setUserInfo(null)
    setLoadingInfo(true)
    getUserInfo(id)
      .then((res) => {
        if (res.ok) setUserInfo(res.usuarioinfo)
      })
      .finally(() => setLoadingInfo(false))
  }

  function handleDeselect() {
    setSelectedId(null)
    setUserInfo(null)
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteUser(selectedId)
    setDeleting(false)

    if (res.ok) {
      modalRef.current.close()
      handleDeselect()
      refetchUsers()
    } else {
      setDeleteError(res.mensaje || 'Error al eliminar el usuario')
    }
  }

  const filtered = users.filter((u) =>
    (u.Nombre ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-row gap-4 w-full h-full" onClick={handleDeselect}>
      {/* Delete modal */}
      <dialog ref={modalRef} className="modal" onClick={(e) => e.stopPropagation()}>
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

      {/* User table */}
      <div className="flex flex-col flex-1 min-w-0 h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <div className={header_class}>
          {user_props.map(({ label, grow }) => (
            <div key={label} className={header_item_class(grow)}>
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loading ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando usuarios...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin usuarios</p>
          ) : (
            <ul>
              {filtered.map((u) => (
                <li
                  key={u.ID_Usuario}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectUser(u.ID_Usuario)
                  }}
                  className={`grid grid-cols-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${u.ID_Usuario === selectedId ? 'bg-gray-100' : ''}`}
                >
                  {user_props.map(({ field, grow }) => (
                    <span key={field} className={row_item_class(grow)}>
                      {u[field] || '—'}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right info panel */}
      <div
        className="flex flex-col flex-2 min-w-0 h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="px-4 py-2 bg-gray-800 shrink-0">
          <p className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Información</p>
          {selectedId ? (
            <p className="text-xs text-gray-400 truncate">{userInfo?.Nombre ?? '...'}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">Selecciona un usuario</p>
          )}
        </div>

        {/* Panel body */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4">
          {!selectedId ? (
            <p className="text-xs text-gray-400 italic text-center mt-8">
              Ningún usuario seleccionado
            </p>
          ) : loadingInfo ? (
            <p className="text-xs text-gray-400 text-center mt-8">Cargando...</p>
          ) : userInfo ? (
            <dl className="flex flex-col gap-4">
              {INFO_ROWS.map(({ label, field }) => (
                <div key={field}>
                  <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                  <dd className="text-sm font-medium text-gray-800 break-words">
                    {userInfo[field] || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-gray-400 italic text-center mt-8">
              No se pudo cargar la información
            </p>
          )}
        </div>

        {/* Panel actions */}
        <div className="flex flex-col gap-3 p-4 border-t border-gray-200 shrink-0">
          <NavigateButton
            className="font-normal rounded-lg"
            to={`/modifyUser?id=${selectedId}`}
            disabled={!selectedId || loadingInfo}
          >
            <span className="flex items-center gap-2 justify-center">
              <PencilSquareIcon className="w-4 h-4" />
              Editar
            </span>
          </NavigateButton>
          <ActionButton
            className="font-normal rounded-lg"
            onClick={() => {
              setDeleteError(null)
              modalRef.current.showModal()
            }}
            disabled={!selectedId || loadingInfo}
          >
            <span className="flex items-center gap-2 justify-center">
              <TrashIcon className="w-4 h-4" />
              Eliminar
            </span>
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
