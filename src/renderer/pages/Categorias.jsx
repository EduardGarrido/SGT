import { useState, useRef } from 'react'
import {
  getCategorias,
  getCategoria,
  createCategoria,
  modifyCategoria,
  deleteCategoria,
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
  { label: 'ID', field: 'ID_Categoria' },
  { label: 'NOMBRE', field: 'Nombre_Categoria', grow: true },
  { label: 'PRODUCTOS', field: 'Productos' },
  { label: 'ESTADO', field: 'Estado', format: capitalize },
]

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

const EMPTY_CATEGORIA = { nombre: '', estado: 'activo' }

function parseCategoria(form) {
  return {
    nombre: sanitize(form.nombre),
    estado: form.estado,
  }
}

function buildCategoriaPayload(parsed) {
  return {
    Nombre_Categoria: parsed.nombre,
    Estado: parsed.estado,
  }
}

function validateCategoria(parsed) {
  if (!parsed.nombre) return { message: 'El nombre es obligatorio', field: 'nombre' }
  if (parsed.nombre.length > 50)
    return { message: 'El nombre no puede exceder 50 caracteres', field: 'nombre' }
  if (!['activo', 'inactivo'].includes(parsed.estado))
    return { message: 'Estado inválido', field: 'estado' }
  return null
}

function categoriaToForm(c) {
  return {
    nombre: c.Nombre_Categoria ?? '',
    estado: c.Estado ?? 'activo',
  }
}

function CategoriaForm({ data, setData, response, setResponse, mode }) {
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
          Nombre de la categoría *
        </label>
        <input
          className={cls('nombre')}
          type="text"
          placeholder="Nombre de la categoría"
          value={data.nombre}
          onChange={onChange('nombre')}
          maxLength={50}
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

export default function Categorias() {
  const {
    data: categoriasData,
    loading: loadingCategorias,
    refetch: refetchCategorias,
  } = useFetch(getCategorias)

  const categorias = categoriasData?.categorias ?? []

  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [newCategoria, setNewCategoria] = useState(EMPTY_CATEGORIA)
  const [creating, setCreating] = useState(false)
  const [createResponse, setCreateResponse] = useState(null)

  const [editCategoria, setEditCategoria] = useState(EMPTY_CATEGORIA)
  const [originalEdit, setOriginalEdit] = useState(EMPTY_CATEGORIA)
  const [editing, setEditing] = useState(false)
  const [editResponse, setEditResponse] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const newModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)

  const selected = categorias.find((c) => c.ID_Categoria === selectedId) ?? null

  useHeader(
    <>
      <span className="text-lg text-gray-400 font-normal">({categorias.length})</span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar categoría..."
        className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <ActionButton
        onClick={() => {
          setNewCategoria(EMPTY_CATEGORIA)
          setCreateResponse(null)
          newModalRef.current.showModal()
        }}
        className="w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
      >
        <PlusIcon className="w-4 h-4 shrink-0" />
        Nueva categoría
      </ActionButton>
    </>
  )

  const filtered = categorias.filter((c) =>
    (c.Nombre_Categoria ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const editChanged = Object.keys(editCategoria).some(
    (k) => editCategoria[k] !== originalEdit[k]
  )

  async function openEditModal() {
    setLoadingEdit(true)
    setEditResponse(null)
    const res = await getCategoria(selectedId)
    setLoadingEdit(false)
    if (!res.ok) {
      setEditResponse({ type: 'error', message: res.mensaje })
      return
    }
    const loaded = categoriaToForm(res.categoria)
    setEditCategoria(loaded)
    setOriginalEdit(loaded)
    editModalRef.current.showModal()
  }

  async function handleCreate() {
    const parsed = parseCategoria(newCategoria)
    const err = validateCategoria(parsed)
    if (err) return setCreateResponse({ type: 'error', ...err })

    setCreating(true)
    const res = await createCategoria(buildCategoriaPayload(parsed))
    setCreating(false)
    if (res.ok) {
      newModalRef.current.close()
      setNewCategoria(EMPTY_CATEGORIA)
      setCreateResponse(null)
      refetchCategorias()
    } else {
      setCreateResponse({ type: 'error', message: res.mensaje ?? 'Error al crear la categoría' })
    }
  }

  async function handleUpdate() {
    const parsed = parseCategoria(editCategoria)
    const err = validateCategoria(parsed)
    if (err) return setEditResponse({ type: 'error', ...err })

    setEditing(true)
    const res = await modifyCategoria(selectedId, buildCategoriaPayload(parsed))
    setEditing(false)
    if (res.ok) {
      editModalRef.current.close()
      setEditResponse(null)
      refetchCategorias()
    } else {
      setEditResponse({
        type: 'error',
        message: res.mensaje ?? 'Error al actualizar la categoría',
      })
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteCategoria(selectedId)
    setDeleting(false)
    if (res.ok) {
      deleteModalRef.current.close()
      setSelectedId(null)
      refetchCategorias()
    } else {
      setDeleteError(res.mensaje ?? 'Error al desactivar la categoría')
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
        title="Desactivar categoría"
        busy={deleting}
        busyLabel="Desactivando..."
        confirmLabel="Desactivar"
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteError(null)}
      >
        ¿Estás seguro de que deseas desactivar{' '}
        <span className="font-semibold">{selected?.Nombre_Categoria}</span>? La categoría no podrá
        usarse para productos nuevos hasta que vuelvas a activarla.
      </ConfirmModal>

      <FormModal
        ref={newModalRef}
        title="Nueva categoría"
        busy={creating}
        submitLabel="Guardar categoría"
        submitClass="bg-emerald-600 hover:bg-emerald-700"
        onSubmit={handleCreate}
        onClose={() => {
          setNewCategoria(EMPTY_CATEGORIA)
          setCreateResponse(null)
        }}
      >
        <CategoriaForm
          data={newCategoria}
          setData={setNewCategoria}
          response={createResponse}
          setResponse={setCreateResponse}
          mode="create"
        />
      </FormModal>

      <FormModal
        ref={editModalRef}
        title="Editar categoría"
        busy={editing}
        canSubmit={editChanged && !loadingEdit}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        onClose={() => {
          setEditCategoria(EMPTY_CATEGORIA)
          setOriginalEdit(EMPTY_CATEGORIA)
          setEditResponse(null)
        }}
      >
        {loadingEdit ? (
          <p className="text-sm text-gray-500 py-4 text-center">Cargando...</p>
        ) : (
          <CategoriaForm
            data={editCategoria}
            setData={setEditCategoria}
            response={editResponse}
            setResponse={setEditResponse}
            mode="edit"
          />
        )}
      </FormModal>

      <div className="flex flex-col w-full h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <CategoriaTableHeader />
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loadingCategorias ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando categorías...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin categorías</p>
          ) : (
            <ul>
              {filtered.map((c) => (
                <CategoriaTableRow
                  key={c.ID_Categoria}
                  categoria={c}
                  selected={c.ID_Categoria === selectedId}
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
            Editar seleccionada
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
            Desactivar seleccionada
          </span>
        </ActionButton>
      </div>
    </div>
  )
}

const headerCell = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-1'

function CategoriaTableHeader() {
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

function CategoriaTableRow({ categoria, selected, onSelect }) {
  const isInactive = categoria.Estado === 'inactivo'
  return (
    <li
      onClick={(e) => {
        e.stopPropagation()
        onSelect(categoria.ID_Categoria)
      }}
      className={`grid grid-cols-5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
        selected ? 'bg-gray-100' : ''
      } ${isInactive ? 'opacity-60' : ''}`}
    >
      {TABLE_COLUMNS.map(({ field, grow, format }) => (
        <span key={field} className={`${rowCell} ${grow ? 'col-span-2' : ''}`}>
          {format ? format(categoria[field]) : categoria[field] ?? '—'}
        </span>
      ))}
    </li>
  )
}
