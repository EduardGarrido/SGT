import { useState, useRef } from 'react'
import {
  ActionButton,
  ConfirmModal,
  FormModal,
  FormAlert,
  fieldInputClass,
} from '../components'
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
import { sanitize } from '../utils/sanitize'
import { validateUserForm } from '../utils/validators'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'

// ─── Display config ───────────────────────────────────────────────────────────

const capitalize = (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '—')

const TABLE_COLUMNS = [
  { label: 'ID', field: 'ID_Usuario' },
  { label: 'NOMBRE', field: 'Nombre', grow: true },
  { label: 'ESTADO', field: 'Estado', format: capitalize },
]

const INFO_ROWS = [
  { label: 'Puesto', field: 'Puesto', format: capitalize },
  { label: 'Estado', field: 'Estado', format: capitalize },
  { label: 'Teléfono', field: 'Telefono' },
  { label: 'Correo', field: 'Correo' },
  { label: 'Calle', field: 'Calle' },
  { label: 'Colonia', field: 'Colonia' },
  { label: 'Código Postal', field: 'Codigo_Postal' },
]

const PUESTO_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'empleado', label: 'Empleado' },
]

const ESTADO_OPTIONS = [
  { value: 'autorizado', label: 'Autorizado' },
  { value: 'no autorizado', label: 'No autorizado' },
]

// ─── Form config ──────────────────────────────────────────────────────────────

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

// API field name for each form key (keys not listed are not sent in info payloads).
const API_FIELD = {
  nombre: 'Nombre',
  puesto: 'Puesto',
  telefono: 'Telefono',
  correo: 'Correo',
  calle: 'Calle',
  colonia: 'Colonia',
  codigo_postal: 'Codigo_Postal',
}

function userInfoToForm(info) {
  const form = { ...EMPTY_USER, estado: info.Estado ?? '' }
  for (const [key, apiKey] of Object.entries(API_FIELD)) form[key] = info[apiKey] ?? ''
  return form
}

function buildInfoPayload(form) {
  const payload = {}
  for (const [key, apiKey] of Object.entries(API_FIELD))
    payload[apiKey] = key === 'puesto' ? form[key] : sanitize(form[key])
  return payload
}

const FORM_FIELDS = (mode) => [
  { name: 'nombre', label: 'Nombre completo *', type: 'text', required: true, span: 2 },
  { name: 'puesto', label: 'Puesto *', type: 'select', options: PUESTO_OPTIONS, required: true },
  ...(mode === 'edit'
    ? [
        {
          name: 'estado',
          label: 'Estado *',
          type: 'select',
          options: ESTADO_OPTIONS,
          required: true,
        },
      ]
    : []),
  { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '1234567890' },
  { name: 'correo', label: 'Correo', type: 'email', placeholder: 'correo@ejemplo.mx' },
  { name: 'calle', label: 'Calle', type: 'text', placeholder: 'Calle' },
  { name: 'colonia', label: 'Colonia', type: 'text', placeholder: 'Colonia' },
  { name: 'codigo_postal', label: 'Código Postal', type: 'text', placeholder: 'Código Postal' },
  {
    name: 'password',
    label: mode === 'edit' ? 'Nueva contraseña' : 'Contraseña *',
    type: 'password',
    placeholder: mode === 'edit' ? 'Dejar vacío para no cambiar' : 'Contraseña',
    required: mode === 'create',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmar',
    label: 'Confirmar contraseña',
    type: 'password',
    placeholder: 'Repite la contraseña',
    required: mode === 'create',
    autoComplete: 'new-password',
  },
]

async function validateCreate(form) {
  const err = validateUserForm(form, 'create')
  if (err) return err
  const correo = sanitize(form.correo)
  if (correo) {
    const check = await checkEmail(correo)
    if (!check.ok) return { message: check.mensaje, field: 'correo' }
  }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Users() {
  const { data: usersData, loading, refetch: refetchUsers } = useFetch(getUsers)
  const users = usersData?.usuarios ?? []

  const [selectedId, setSelectedId] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [search, setSearch] = useState('')

  const [newUser, setNewUser] = useState(EMPTY_USER)
  const [creating, setCreating] = useState(false)
  const [createResponse, setCreateResponse] = useState(null)

  const [editUser, setEditUser] = useState(EMPTY_USER)
  const [originalEdit, setOriginalEdit] = useState(EMPTY_USER)
  const [updating, setUpdating] = useState(false)
  const [editResponse, setEditResponse] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [deletedName, setDeletedName] = useState(null)

  const createModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)
  const deleteSuccessModalRef = useRef(null)

  // ─── Header ───────────────────────────────────────────────────────────────

  useHeader(
    <>
      <span className="text-lg text-gray-400 font-normal">({users.length})</span>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar usuario..."
        className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
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
    const mapped = userInfoToForm(userInfo)
    setEditUser(mapped)
    setOriginalEdit(mapped)
    setEditResponse(null)
    editModalRef.current.showModal()
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async function handleCreate() {
    const err = await validateCreate(newUser)
    if (err) return setCreateResponse({ type: 'error', ...err })

    setCreating(true)
    const res = await createUser({
      ...buildInfoPayload(newUser),
      Password: newUser.password.trim(),
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

  const editChanged = Object.keys(editUser).some((k) => editUser[k] !== originalEdit[k])

  async function handleUpdate() {
    const err = validateUserForm(editUser, 'edit')
    if (err) return setEditResponse({ type: 'error', ...err })

    const infoChanged = Object.keys(API_FIELD).some((k) => editUser[k] !== originalEdit[k])
    const estadoChanged = editUser.estado !== originalEdit.estado
    const password = editUser.password.trim()

    setUpdating(true)
    const errors = []

    if (infoChanged) {
      const res = await modifyInfoUser(selectedId, buildInfoPayload(editUser))
      if (!res.ok) errors.push(res.mensaje || 'Error al actualizar información')
    }
    if (estadoChanged) {
      const res = await modifyEstadoUser(selectedId, editUser.estado)
      if (!res.ok) errors.push(res.mensaje || 'Error al actualizar estado')
    }
    if (password) {
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
      <FormModal
        ref={createModalRef}
        title="Registrar usuario"
        busy={creating}
        submitLabel="Registrar"
        submitClass="bg-emerald-600 hover:bg-emerald-700"
        onSubmit={handleCreate}
        onClose={() => setCreateResponse(null)}
      >
        <UserForm
          data={newUser}
          setData={setNewUser}
          response={createResponse}
          setResponse={setCreateResponse}
          mode="create"
        />
      </FormModal>

      <FormModal
        ref={editModalRef}
        title="Editar usuario"
        busy={updating}
        canSubmit={editChanged}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        onClose={() => setEditResponse(null)}
      >
        <UserForm
          data={editUser}
          setData={setEditUser}
          response={editResponse}
          setResponse={setEditResponse}
          mode="edit"
        />
      </FormModal>

      <ConfirmModal
        ref={deleteModalRef}
        title="Eliminar usuario"
        busy={deleting}
        busyLabel="Eliminando..."
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteError(null)}
      >
        ¿Estás seguro de que deseas eliminar a{' '}
        <span className="font-semibold">{userInfo?.Nombre}</span>? Esta acción desactivará su
        cuenta.
      </ConfirmModal>

      <ConfirmModal
        ref={deleteSuccessModalRef}
        title="Usuario eliminado"
        variant="success"
        cancelLabel="Aceptar"
      >
        {deletedName ? (
          <>
            <span className="font-semibold">{deletedName}</span> fue desactivado correctamente.
          </>
        ) : (
          'El usuario fue desactivado correctamente.'
        )}
      </ConfirmModal>

      {/* ── User table ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <UserTableHeader />
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loading ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando usuarios...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin usuarios</p>
          ) : (
            <ul>
              {filtered.map((u) => (
                <UserTableRow
                  key={u.ID_Usuario}
                  user={u}
                  selected={u.ID_Usuario === selectedId}
                  onSelect={handleSelectUser}
                />
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
          <InfoPanelBody loading={loadingInfo} selectedId={selectedId} userInfo={userInfo} />
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

// ─── Subcomponents ────────────────────────────────────────────────────────────

const headerCell = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-1'

function UserTableHeader() {
  return (
    <div className="w-full h-fit bg-gray-800 grid grid-cols-4">
      {TABLE_COLUMNS.map(({ label, grow }) => (
        <div key={label} className={`${headerCell} ${grow ? 'col-span-2' : ''}`}>
          {label}
        </div>
      ))}
    </div>
  )
}

function UserTableRow({ user, selected, onSelect }) {
  return (
    <li
      onClick={(e) => {
        e.stopPropagation()
        onSelect(user.ID_Usuario)
      }}
      className={`grid grid-cols-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selected ? 'bg-gray-100' : ''}`}
    >
      {TABLE_COLUMNS.map(({ field, grow, format }) => (
        <span key={field} className={`${rowCell} ${grow ? 'col-span-2' : ''}`}>
          {format ? format(user[field]) : user[field] || '—'}
        </span>
      ))}
    </li>
  )
}

function InfoPanelBody({ loading, selectedId, userInfo }) {
  if (!selectedId)
    return (
      <p className="text-xs text-gray-400 italic text-center mt-8">Ningún usuario seleccionado</p>
    )
  if (loading) return <p className="text-xs text-gray-400 text-center mt-8">Cargando...</p>
  if (!userInfo)
    return (
      <p className="text-xs text-gray-400 italic text-center mt-8">
        No se pudo cargar la información
      </p>
    )
  return (
    <dl className="flex flex-col gap-4">
      {INFO_ROWS.map(({ label, field, format }) => (
        <div key={field}>
          <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
          <dd className="text-sm font-medium text-gray-800 wrap-break-word">
            {format ? format(userInfo[field]) : userInfo[field] || '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function UserForm({ data, setData, response, setResponse, mode }) {
  function onChange(field) {
    return (e) => {
      setResponse(null)
      setData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <FormAlert response={response} />
      <div className="grid grid-cols-2 gap-3">
        {FORM_FIELDS(mode).map((f) => (
          <FormField
            key={f.name}
            field={f}
            value={data[f.name]}
            onChange={onChange}
            response={response}
          />
        ))}
      </div>
    </div>
  )
}

function FormField({ field, value, onChange, response }) {
  const { name, label, type, placeholder, required, options, span, autoComplete } = field
  const className = fieldInputClass(response, name, required)
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {type === 'select' ? (
        <select className={className} value={value} onChange={onChange(name)}>
          <option value="">Seleccionar...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={className}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange(name)}
          autoComplete={autoComplete}
        />
      )}
    </div>
  )
}
