import { useState, useRef } from 'react'
import {
  getProveedores,
  getProveedor,
  createProveedor,
  modifyProveedor,
  deleteProveedor,
} from '../api/api'
import { useFetch } from '../hooks/useFetch'
import {
  ActionButton,
  ConfirmModal,
  FormModal,
  FormAlert,
  fieldInputClass,
} from '../components'
import { sanitize } from '../utils/sanitize'
import { useHeader } from '../context/HeaderContext.jsx'
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/20/solid'

const capitalize = (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '—')

const TABLE_COLUMNS = [
  { label: 'ID', field: 'ID_Proveedor' },
  { label: 'NOMBRE', field: 'Nombre_Proveedor', grow: true },
  { label: 'TELÉFONO', field: 'Telefono' },
  { label: 'ESTADO', field: 'Estado', format: capitalize },
]

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

const EMPTY_PROVEEDOR = { nombre: '', telefono: '', estado: 'activo' }

function parseProveedor(form) {
  return {
    nombre: sanitize(form.nombre),
    telefono: sanitize(form.telefono),
    estado: form.estado,
  }
}

function buildProveedorPayload(parsed) {
  return {
    Nombre_Proveedor: parsed.nombre,
    Telefono: parsed.telefono,
    Estado: parsed.estado,
  }
}

function validateProveedor(parsed) {
  if (!parsed.nombre) return { message: 'El nombre es obligatorio', field: 'nombre' }
  if (parsed.nombre.length > 255)
    return { message: 'El nombre no puede exceder 255 caracteres', field: 'nombre' }
  if (parsed.telefono && parsed.telefono.length > 20)
    return { message: 'El teléfono no puede exceder 20 caracteres', field: 'telefono' }
  if (!['activo', 'inactivo'].includes(parsed.estado))
    return { message: 'Estado inválido', field: 'estado' }
  return null
}

function proveedorToForm(p) {
  return {
    nombre: p.Nombre_Proveedor ?? '',
    telefono: p.Telefono ?? '',
    estado: p.Estado ?? 'activo',
  }
}

function ProveedorForm({ data, setData, response, setResponse, mode }) {
  function onChange(field) {
    return (e) => {
      setResponse(null)
      setData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }
  const cls = (field) => fieldInputClass(response, field)
  return (
    <div className="flex flex-col gap-3">
      <FormAlert response={response} />
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Nombre del proveedor *
        </label>
        <input
          className={cls('nombre')}
          type="text"
          placeholder="Nombre del proveedor"
          value={data.nombre}
          onChange={onChange('nombre')}
          maxLength={255}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
        <input
          className={cls('telefono')}
          type="tel"
          placeholder="1234567890"
          value={data.telefono}
          onChange={onChange('telefono')}
          maxLength={20}
        />
      </div>
      {mode === 'edit' && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Estado *</label>
          <select className={cls('estado')} value={data.estado} onChange={onChange('estado')}>
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default function Proveedores() {
  const {
    data: proveedoresData,
    loading: loadingProveedores,
    refetch: refetchProveedores,
  } = useFetch(getProveedores)

  const proveedores = proveedoresData?.proveedores ?? []

  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [newProveedor, setNewProveedor] = useState(EMPTY_PROVEEDOR)
  const [creating, setCreating] = useState(false)
  const [createResponse, setCreateResponse] = useState(null)

  const [editProveedor, setEditProveedor] = useState(EMPTY_PROVEEDOR)
  const [originalEdit, setOriginalEdit] = useState(EMPTY_PROVEEDOR)
  const [editing, setEditing] = useState(false)
  const [editResponse, setEditResponse] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const newModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)

  const selected = proveedores.find((p) => p.ID_Proveedor === selectedId) ?? null

  useHeader(
    <>
      <span className="text-lg text-gray-400 font-normal">({proveedores.length})</span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar proveedor..."
        className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <ActionButton
        onClick={() => {
          setNewProveedor(EMPTY_PROVEEDOR)
          setCreateResponse(null)
          newModalRef.current.showModal()
        }}
        className="w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
      >
        <PlusIcon className="w-4 h-4 shrink-0" />
        Nuevo proveedor
      </ActionButton>
    </>
  )

  const filtered = proveedores.filter((p) =>
    (p.Nombre_Proveedor ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const editChanged = Object.keys(editProveedor).some(
    (k) => editProveedor[k] !== originalEdit[k]
  )

  async function openEditModal() {
    setLoadingEdit(true)
    setEditResponse(null)
    const res = await getProveedor(selectedId)
    setLoadingEdit(false)
    if (!res.ok) {
      setEditResponse({ type: 'error', message: res.mensaje })
      return
    }
    const loaded = proveedorToForm(res.proveedor)
    setEditProveedor(loaded)
    setOriginalEdit(loaded)
    editModalRef.current.showModal()
  }

  async function handleCreate() {
    const parsed = parseProveedor(newProveedor)
    const err = validateProveedor(parsed)
    if (err) return setCreateResponse({ type: 'error', ...err })

    setCreating(true)
    const res = await createProveedor(buildProveedorPayload(parsed))
    setCreating(false)
    if (res.ok) {
      newModalRef.current.close()
      setNewProveedor(EMPTY_PROVEEDOR)
      setCreateResponse(null)
      refetchProveedores()
    } else {
      setCreateResponse({ type: 'error', message: res.mensaje ?? 'Error al crear el proveedor' })
    }
  }

  async function handleUpdate() {
    const parsed = parseProveedor(editProveedor)
    const err = validateProveedor(parsed)
    if (err) return setEditResponse({ type: 'error', ...err })

    setEditing(true)
    const res = await modifyProveedor(selectedId, buildProveedorPayload(parsed))
    setEditing(false)
    if (res.ok) {
      editModalRef.current.close()
      setEditResponse(null)
      refetchProveedores()
    } else {
      setEditResponse({
        type: 'error',
        message: res.mensaje ?? 'Error al actualizar el proveedor',
      })
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteProveedor(selectedId)
    setDeleting(false)
    if (res.ok) {
      deleteModalRef.current.close()
      setSelectedId(null)
      refetchProveedores()
    } else {
      setDeleteError(res.mensaje ?? 'Error al desactivar el proveedor')
    }
  }

  const canDelete = !!selected && selected.Estado !== 'inactivo'

  return (
    <div
      className="flex flex-col gap-4 w-full h-full border-none"
      onClick={() => setSelectedId(null)}
    >
      <ConfirmModal
        ref={deleteModalRef}
        title="Desactivar proveedor"
        busy={deleting}
        busyLabel="Desactivando..."
        confirmLabel="Desactivar"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteError(null)}
      >
        ¿Estás seguro de que deseas desactivar{' '}
        <span className="font-semibold">{selected?.Nombre_Proveedor}</span>? El proveedor no podrá
        usarse para productos nuevos hasta que vuelvas a activarlo.
      </ConfirmModal>

      <FormModal
        ref={newModalRef}
        title="Nuevo proveedor"
        busy={creating}
        submitLabel="Guardar proveedor"
        submitClass="bg-emerald-600 hover:bg-emerald-700"
        onSubmit={handleCreate}
        onClose={() => {
          setNewProveedor(EMPTY_PROVEEDOR)
          setCreateResponse(null)
        }}
      >
        <ProveedorForm
          data={newProveedor}
          setData={setNewProveedor}
          response={createResponse}
          setResponse={setCreateResponse}
          mode="create"
        />
      </FormModal>

      <FormModal
        ref={editModalRef}
        title="Editar proveedor"
        busy={editing}
        canSubmit={editChanged && !loadingEdit}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        onClose={() => {
          setEditProveedor(EMPTY_PROVEEDOR)
          setOriginalEdit(EMPTY_PROVEEDOR)
          setEditResponse(null)
        }}
      >
        {loadingEdit ? (
          <p className="text-sm text-gray-500 py-4 text-center">Cargando...</p>
        ) : (
          <ProveedorForm
            data={editProveedor}
            setData={setEditProveedor}
            response={editResponse}
            setResponse={setEditResponse}
            mode="edit"
          />
        )}
      </FormModal>

      <div className="flex flex-col w-full h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <ProveedorTableHeader />
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loadingProveedores ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando proveedores...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin proveedores</p>
          ) : (
            <ul>
              {filtered.map((p) => (
                <ProveedorTableRow
                  key={p.ID_Proveedor}
                  proveedor={p}
                  selected={p.ID_Proveedor === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" onClick={(e) => e.stopPropagation()}>
        <ActionButton
          className="font-normal rounded-lg"
          onClick={openEditModal}
          disabled={!selectedId}
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
          disabled={!canDelete}
        >
          <span className="flex items-center gap-2 justify-center">
            <TrashIcon className="w-4 h-4" />
            Desactivar seleccionado
          </span>
        </ActionButton>
      </div>
    </div>
  )
}

const headerCell = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-1'

function ProveedorTableHeader() {
  return (
    <div className="w-full h-fit bg-gray-800 grid grid-cols-5">
      {TABLE_COLUMNS.map(({ label, grow }) => (
        <div key={label} className={`${headerCell} ${grow ? 'col-span-2' : ''}`}>
          {label}
        </div>
      ))}
    </div>
  )
}

function ProveedorTableRow({ proveedor, selected, onSelect }) {
  const isInactive = proveedor.Estado === 'inactivo'
  return (
    <li
      onClick={(e) => {
        e.stopPropagation()
        onSelect(proveedor.ID_Proveedor)
      }}
      className={`grid grid-cols-5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
        selected ? 'bg-gray-100' : ''
      } ${isInactive ? 'opacity-60' : ''}`}
    >
      {TABLE_COLUMNS.map(({ field, grow, format }) => (
        <span key={field} className={`${rowCell} ${grow ? 'col-span-2' : ''}`}>
          {format ? format(proveedor[field]) : proveedor[field] ?? '—'}
        </span>
      ))}
    </li>
  )
}
