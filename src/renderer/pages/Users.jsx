import { useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { ActionButton } from '../components'
import {
  getUsers,
  getUserInfo,
  createUser,
  modifyInfoUser,
  modifyPasswordUser,
  modifyEstadoUser,
  deleteUser,
  checkEmail,
} from '../api/api'
import { useFetch } from '../hooks/useFetch'
import { useHeader } from '../context/HeaderContext'
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

// ─── Table ────────────────────────────────────────────────────────────────────

const capitalize = (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '—')

const user_props = [
  { label: 'ID', field: 'ID_Usuario' },
  { label: 'NOMBRE', field: 'Nombre', grow: true },
  { label: 'ESTADO', field: 'Estado', format: capitalize },
]

const header_class = 'w-full h-fit bg-gray-800 grid grid-cols-4'
const base_header_item_class = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const header_item_class = (grow) => `${base_header_item_class} ${grow ? 'col-span-2' : ''}`

const base_row_item_class = 'py-2 text-xs text-center text-gray-700 truncate px-1'
const row_item_class = (grow) => `${base_row_item_class} ${grow ? 'col-span-2' : ''}`

// ─── Info panel ───────────────────────────────────────────────────────────────

const INFO_ROWS = [
  { label: 'Puesto', field: 'Puesto', format: capitalize },
  { label: 'Estado', field: 'Estado', format: capitalize },
  { label: 'Teléfono', field: 'Telefono' },
  { label: 'Correo', field: 'Correo' },
  { label: 'Calle', field: 'Calle' },
  { label: 'Colonia', field: 'Colonia' },
  { label: 'Código Postal', field: 'Codigo_Postal' },
]

// ─── Forms ────────────────────────────────────────────────────────────────────

const EMPTY_USER = {
  nombre: '',
  puesto: '',
  estado: '',
  telefono: '',
  correo: '',
  calle: '',
  colonia: '',
  codigo_postal: '',
  password: '',
  confirmar: '',
}

const RESPONSE_STYLE = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    input: 'border-red-400',
    Icon: ExclamationCircleIcon,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    input: 'border-green-400',
    Icon: CheckCircleIcon,
  },
}

const baseInputClass =
  'rounded-lg w-full px-2 py-1.5 border-2 text-gray-700 bg-gray-100 shadow-sm text-sm focus:outline-none'

function inputClass(field, required, response) {
  const style = response ? RESPONSE_STYLE[response.type] : null
  const isHighlighted =
    response?.type === 'error' &&
    (response.field === field || (response.field === 'required' && required))
  return `${baseInputClass} ${isHighlighted ? style.input : 'border-gray-300 focus:border-gray-500'}`
}

function sanitize(val) {
  return DOMPurify.sanitize(val.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

const PUESTO_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'empleado', label: 'Empleado' },
]

const ESTADO_OPTIONS = [
  { value: 'autorizado', label: 'Autorizado' },
  { value: 'no autorizado', label: 'No autorizado' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Users() {
  const { data: usersData, loading, refetch: refetchUsers } = useFetch(getUsers)
  const users = usersData?.usuarios ?? []

  const [selectedId, setSelectedId] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [search, setSearch] = useState('')

  // Create form
  const [newUser, setNewUser] = useState(EMPTY_USER)
  const [creating, setCreating] = useState(false)
  const [createResponse, setCreateResponse] = useState(null)

  // Edit form
  const [editUser, setEditUser] = useState(EMPTY_USER)
  const [originalEdit, setOriginalEdit] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [editResponse, setEditResponse] = useState(null)

  // Delete
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [deletedName, setDeletedName] = useState(null)

  const createModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)
  const deleteSuccessModalRef = useRef(null)

  // ─── Header ───────────────────────────────────────────────────────────────

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
    <ActionButton
      onClick={() => {
        setNewUser(EMPTY_USER)
        setCreateResponse(null)
        createModalRef.current.showModal()
      }}
      className="w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
    >
      <PlusIcon className="w-4 h-4 shrink-0" />
      Registrar usuario
    </ActionButton>
  )

  useHeader(
    <>
      <span className="text-lg text-gray-400 font-normal">({users.length})</span>
      {headerSearch}
      {headerAction}
    </>
  )

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

  function openEditModal() {
    if (!userInfo) return
    const mapped = {
      nombre: userInfo.Nombre ?? '',
      puesto: userInfo.Puesto ?? '',
      estado: userInfo.Estado ?? '',
      telefono: userInfo.Telefono ?? '',
      correo: userInfo.Correo ?? '',
      calle: userInfo.Calle ?? '',
      colonia: userInfo.Colonia ?? '',
      codigo_postal: userInfo.Codigo_Postal ?? '',
      password: '',
      confirmar: '',
    }
    setEditUser(mapped)
    setOriginalEdit(mapped)
    setEditResponse(null)
    editModalRef.current.showModal()
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async function handleCreate() {
    const nombre = sanitize(newUser.nombre)
    const password = newUser.password.trim()
    const confirmar = newUser.confirmar.trim()
    const telefono = sanitize(newUser.telefono)
    const correo = sanitize(newUser.correo)

    if (!nombre || !password || !confirmar || !newUser.puesto) {
      setCreateResponse({
        type: 'error',
        message: 'Nombre, contraseña y puesto son obligatorios',
        field: 'required',
      })
      return
    }
    if (password !== confirmar) {
      setCreateResponse({
        type: 'error',
        message: 'Las contraseñas no coinciden',
        field: 'confirmar',
      })
      return
    }
    if (
      telefono &&
      (!/^\d+$/.test(telefono) || (telefono.length !== 10 && telefono.length !== 12))
    ) {
      setCreateResponse({
        type: 'error',
        message: 'El teléfono debe tener 10 o 12 dígitos numéricos',
        field: 'telefono',
      })
      return
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setCreateResponse({
        type: 'error',
        message: 'El formato del correo no es válido',
        field: 'correo',
      })
      return
    }
    if (correo) {
      const emailCheck = await checkEmail(correo)
      if (!emailCheck.ok) {
        setCreateResponse({ type: 'error', message: emailCheck.mensaje, field: 'correo' })
        return
      }
    }

    setCreating(true)
    const res = await createUser({
      Nombre: nombre,
      Password: password,
      Puesto: newUser.puesto,
      Telefono: telefono,
      Correo: correo,
      Calle: sanitize(newUser.calle),
      Colonia: sanitize(newUser.colonia),
      Codigo_Postal: sanitize(newUser.codigo_postal),
    })
    setCreating(false)

    if (res.ok) {
      setCreateResponse({ type: 'success', message: res.mensaje || 'Usuario creado correctamente' })
      setNewUser(EMPTY_USER)
      refetchUsers()
    } else {
      setCreateResponse({ type: 'error', message: res.mensaje || 'Error al crear usuario' })
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  const editChanged = originalEdit
    ? Object.keys(editUser).some((k) => editUser[k] !== originalEdit[k])
    : false

  async function handleUpdate() {
    const nombre = sanitize(editUser.nombre)
    const telefono = sanitize(editUser.telefono)
    const correo = sanitize(editUser.correo)
    const password = editUser.password.trim()
    const confirmar = editUser.confirmar.trim()

    if (!nombre || !editUser.puesto || !editUser.estado) {
      setEditResponse({
        type: 'error',
        message: 'Nombre, puesto y estado son obligatorios',
        field: 'required',
      })
      return
    }
    if (password && password !== confirmar) {
      setEditResponse({
        type: 'error',
        message: 'Las contraseñas no coinciden',
        field: 'confirmar',
      })
      return
    }
    if (
      telefono &&
      (!/^\d+$/.test(telefono) || (telefono.length !== 10 && telefono.length !== 12))
    ) {
      setEditResponse({
        type: 'error',
        message: 'El teléfono debe tener 10 o 12 dígitos numéricos',
        field: 'telefono',
      })
      return
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setEditResponse({
        type: 'error',
        message: 'El formato del correo no es válido',
        field: 'correo',
      })
      return
    }

    const infoChanged = [
      'nombre',
      'puesto',
      'telefono',
      'correo',
      'calle',
      'colonia',
      'codigo_postal',
    ].some((k) => editUser[k] !== originalEdit[k])
    const estadoChanged = editUser.estado !== originalEdit.estado
    const passChanged = password !== ''

    setUpdating(true)
    const errors = []

    if (infoChanged) {
      const res = await modifyInfoUser(selectedId, {
        Nombre: nombre,
        Puesto: editUser.puesto,
        Telefono: telefono,
        Correo: correo,
        Calle: sanitize(editUser.calle),
        Colonia: sanitize(editUser.colonia),
        Codigo_Postal: sanitize(editUser.codigo_postal),
      })
      if (!res.ok) errors.push(res.mensaje || 'Error al actualizar información')
    }
    if (estadoChanged) {
      const res = await modifyEstadoUser(selectedId, editUser.estado)
      if (!res.ok) errors.push(res.mensaje || 'Error al actualizar estado')
    }
    if (passChanged) {
      const res = await modifyPasswordUser(selectedId, password)
      if (!res.ok) errors.push(res.mensaje || 'Error al actualizar contraseña')
    }

    setUpdating(false)

    if (errors.length) {
      setEditResponse({ type: 'error', message: errors.join('. ') })
    } else {
      editModalRef.current.close()
      refetchUsers()
      handleSelectUser(selectedId)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteUser(selectedId)
    setDeleting(false)

    if (res.ok) {
      setDeletedName(userInfo?.Nombre ?? null)
      deleteModalRef.current.close()
      handleDeselect()
      refetchUsers()
      deleteSuccessModalRef.current.showModal()
    } else {
      setDeleteError(res.mensaje || 'Error al eliminar el usuario')
    }
  }

  const filtered = users.filter((u) =>
    (u.Nombre ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-row gap-4 w-full h-full" onClick={handleDeselect}>
      {/* ── Create modal ─────────────────────────────────────────────────── */}
      <dialog ref={createModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white max-w-lg">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Registrar usuario</h3>
          <UserForm
            data={newUser}
            onChange={(field) => (e) => {
              setCreateResponse(null)
              setNewUser((p) => ({ ...p, [field]: e.target.value }))
            }}
            response={createResponse}
            showEstado={false}
          />
          <div className="modal-action">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
              onClick={() => {
                createModalRef.current.close()
                setCreateResponse(null)
              }}
              disabled={creating}
            >
              Cancelar
            </button>
            <ActionButton
              className="w-auto px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              onClick={handleCreate}
              disabled={creating}
            >
              Registrar
            </ActionButton>
          </div>
        </div>
      </dialog>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <dialog ref={editModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white max-w-lg">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Editar usuario</h3>
          <UserForm
            data={editUser}
            onChange={(field) => (e) => {
              setEditResponse(null)
              setEditUser((p) => ({ ...p, [field]: e.target.value }))
            }}
            response={editResponse}
            showEstado={true}
          />
          <div className="modal-action">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
              onClick={() => {
                editModalRef.current.close()
                setEditResponse(null)
              }}
              disabled={updating}
            >
              Cancelar
            </button>
            <ActionButton
              className="w-auto px-4 bg-gray-800 hover:bg-gray-900 rounded-lg"
              onClick={handleUpdate}
              disabled={updating || !editChanged}
            >
              Guardar cambios
            </ActionButton>
          </div>
        </div>
      </dialog>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      <dialog ref={deleteModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
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
                deleteModalRef.current.close()
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

      {/* ── Delete success modal ─────────────────────────────────────────── */}
      <dialog ref={deleteSuccessModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-6 text-green-600 shrink-0" />
            <h3 className="font-bold text-lg text-gray-900">Usuario eliminado</h3>
          </div>
          <p className="text-gray-600 text-sm">
            {deletedName ? (
              <>
                <span className="font-semibold">{deletedName}</span> fue desactivado correctamente.
              </>
            ) : (
              'El usuario fue desactivado correctamente.'
            )}
          </p>
          <div className="modal-action">
            <button
              className="btn bg-gray-800 hover:bg-gray-900 text-white border-none"
              onClick={() => deleteSuccessModalRef.current.close()}
            >
              Aceptar
            </button>
          </div>
        </div>
      </dialog>

      {/* ── User table ───────────────────────────────────────────────────── */}
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
                  {user_props.map(({ field, grow, format }) => (
                    <span key={field} className={row_item_class(grow)}>
                      {format ? format(u[field]) : u[field] || '—'}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Right info panel ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-2 min-w-0 h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 bg-gray-800 shrink-0">
          <p className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Información</p>
          {selectedId ? (
            <p className="text-xs text-gray-400 truncate">{userInfo?.Nombre ?? '...'}</p>
          ) : (
            <p className="text-xs text-gray-500 italic">Selecciona un usuario</p>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-4">
          {!selectedId ? (
            <p className="text-xs text-gray-400 italic text-center mt-8">
              Ningún usuario seleccionado
            </p>
          ) : loadingInfo ? (
            <p className="text-xs text-gray-400 text-center mt-8">Cargando...</p>
          ) : userInfo ? (
            <dl className="flex flex-col gap-4">
              {INFO_ROWS.map(({ label, field, format }) => (
                <div key={field}>
                  <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                  <dd className="text-sm font-medium text-gray-800 break-words">
                    {format ? format(userInfo[field]) : userInfo[field] || '—'}
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

        <div className="flex flex-col gap-3 p-4 border-t border-gray-200 shrink-0">
          <ActionButton
            className="font-normal rounded-lg"
            onClick={openEditModal}
            disabled={!selectedId || loadingInfo}
          >
            <span className="flex items-center gap-2 justify-center">
              <PencilSquareIcon className="w-4 h-4" />
              Editar seleccionado
            </span>
          </ActionButton>
          <ActionButton
            className="font-normal rounded-lg"
            onClick={() => {
              setDeleteError(null)
              deleteModalRef.current.showModal()
            }}
            disabled={!selectedId || loadingInfo}
          >
            <span className="flex items-center gap-2 justify-center">
              <TrashIcon className="w-4 h-4" />
              Eliminar seleccionado
            </span>
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

// ─── Shared form ──────────────────────────────────────────────────────────────

function UserForm({ data, onChange, response, showEstado }) {
  const style = response ? RESPONSE_STYLE[response.type] : null

  const ic = (field, required) => inputClass(field, required, response)

  return (
    <div className="flex flex-col gap-3">
      {response && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${style.bg} ${style.border} ${style.text}`}
        >
          <style.Icon className="w-4 shrink-0" />
          {response.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            className={ic('nombre', true)}
            type="text"
            placeholder="Nombre completo"
            value={data.nombre}
            onChange={onChange('nombre')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Puesto *</label>
          <select className={ic('puesto', true)} value={data.puesto} onChange={onChange('puesto')}>
            <option value="">Seleccionar...</option>
            {PUESTO_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {showEstado && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Estado *</label>
            <select
              className={ic('estado', true)}
              value={data.estado}
              onChange={onChange('estado')}
            >
              <option value="">Seleccionar...</option>
              {ESTADO_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
          <input
            className={ic('telefono', false)}
            type="tel"
            placeholder="1234567890"
            value={data.telefono}
            onChange={onChange('telefono')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Correo</label>
          <input
            className={ic('correo', false)}
            type="email"
            placeholder="correo@ejemplo.mx"
            value={data.correo}
            onChange={onChange('correo')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Calle</label>
          <input
            className={ic('calle', false)}
            type="text"
            placeholder="Calle"
            value={data.calle}
            onChange={onChange('calle')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Colonia</label>
          <input
            className={ic('colonia', false)}
            type="text"
            placeholder="Colonia"
            value={data.colonia}
            onChange={onChange('colonia')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Código Postal</label>
          <input
            className={ic('codigo_postal', false)}
            type="text"
            placeholder="Código Postal"
            value={data.codigo_postal}
            onChange={onChange('codigo_postal')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {showEstado ? 'Nueva contraseña' : 'Contraseña *'}
          </label>
          <input
            className={ic('password', !showEstado)}
            type="password"
            placeholder={showEstado ? 'Dejar vacío para no cambiar' : 'Contraseña'}
            value={data.password}
            onChange={onChange('password')}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Confirmar contraseña
          </label>
          <input
            className={ic('confirmar', !showEstado)}
            type="password"
            placeholder="Repite la contraseña"
            value={data.confirmar}
            onChange={onChange('confirmar')}
            autoComplete="new-password"
          />
        </div>
      </div>
    </div>
  )
}
