import { useState, useRef } from 'react'
import {
  getProducts,
  getProduct,
  createProduct,
  modifyProduct,
  deleteProduct,
  getCategorias,
  getProveedores,
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

const PRODUCT_COLUMNS = [
  { label: 'CODIGO', field: 'ID_Producto' },
  { label: 'PRODUCTO', field: 'Nombre_Producto', grow: true },
  { label: 'ESTADO', field: 'Estado' },
  { label: 'CATEGORIA', field: 'Nombre_Categoria', grow: true },
  { label: 'PRECIO', field: 'Precio' },
  { label: 'UNIDAD', field: 'Unidad_Medida' },
  { label: 'STOCK', field: 'Cantidad' },
  { label: 'PROVEEDOR', field: 'Nombre_Proveedor', grow: true },
]

const UNIDADES = ['pieza', 'kg', 'litro']

const EMPTY_PRODUCT = {
  nombre: '',
  precio: '',
  cantidad: '',
  unidad: '',
  cantidad_minima: '',
  id_categoria: '',
  id_proveedor: '',
}

function parseProduct(form) {
  return {
    nombre: sanitize(form.nombre),
    precio: parseFloat(form.precio),
    cantidad: parseInt(form.cantidad, 10),
    unidad: form.unidad,
    cantidadMinima: parseInt(form.cantidad_minima, 10),
    idCategoria: parseInt(form.id_categoria, 10),
    idProveedor: parseInt(form.id_proveedor, 10),
  }
}

function buildProductPayload(parsed) {
  return {
    Nombre_Producto: parsed.nombre,
    Precio: parsed.precio,
    Cantidad: parsed.cantidad,
    Unidad_Medida: parsed.unidad,
    Cantidad_Minima: parsed.cantidadMinima,
    ID_Categoria: parsed.idCategoria,
    ID_Proveedor: parsed.idProveedor,
  }
}

function validateProduct(parsed) {
  const { nombre, precio, cantidad, unidad, cantidadMinima, idCategoria, idProveedor } = parsed
  if (
    !nombre ||
    !unidad ||
    !idCategoria ||
    !idProveedor ||
    isNaN(precio) ||
    isNaN(cantidad) ||
    isNaN(cantidadMinima)
  )
    return 'Todos los campos son obligatorios'
  if (precio <= 0) return 'El precio debe ser mayor a 0'
  if (cantidad < 0 || cantidadMinima < 0) return 'Las cantidades no pueden ser negativas'
  return null
}

function productToForm(p) {
  return {
    nombre: p.Nombre_Producto,
    precio: String(p.Precio),
    cantidad: String(p.Cantidad),
    unidad: p.Unidad_Medida,
    cantidad_minima: String(p.Cantidad_Minima),
    id_categoria: String(p.ID_Categoria),
    id_proveedor: String(p.ID_Proveedor),
  }
}

function ProductForm({ data, setData, response, setResponse, categorias, proveedores }) {
  function onChange(field) {
    return (e) => {
      setResponse(null)
      setData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  const cls = (field) => fieldInputClass(response, field)

  return (
    <>
      <div className="mb-3">
        <FormAlert response={response} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre del producto *
          </label>
          <input
            className={cls('nombre')}
            type="text"
            placeholder="Nombre del producto"
            value={data.nombre}
            onChange={onChange('nombre')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Precio *</label>
          <input
            className={cls('precio')}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={data.precio}
            onChange={onChange('precio')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Cantidad *</label>
          <input
            className={cls('cantidad')}
            type="number"
            min="0"
            placeholder="0"
            value={data.cantidad}
            onChange={onChange('cantidad')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Unidad de medida *
          </label>
          <select className={cls('unidad')} value={data.unidad} onChange={onChange('unidad')}>
            <option value="">Seleccionar...</option>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Cantidad mínima *
          </label>
          <input
            className={cls('cantidad_minima')}
            type="number"
            min="0"
            placeholder="0"
            value={data.cantidad_minima}
            onChange={onChange('cantidad_minima')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría *</label>
          <select
            className={cls('id_categoria')}
            value={data.id_categoria}
            onChange={onChange('id_categoria')}
          >
            <option value="">Seleccionar...</option>
            {categorias.map((c) => (
              <option key={c.ID_Categoria} value={c.ID_Categoria}>
                {c.Nombre_Categoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Proveedor *</label>
          <select
            className={cls('id_proveedor')}
            value={data.id_proveedor}
            onChange={onChange('id_proveedor')}
          >
            <option value="">Seleccionar...</option>
            {proveedores.map((p) => (
              <option key={p.ID_Proveedor} value={p.ID_Proveedor}>
                {p.Nombre_Proveedor}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  )
}

export default function Inventory() {
  const {
    data: productsData,
    loading: loadingProducts,
    refetch: refetchProducts,
  } = useFetch(getProducts)
  const { data: categoriasData } = useFetch(getCategorias)
  const { data: proveedoresData } = useFetch(getProveedores)

  const products = productsData?.productos ?? []
  const categorias = categoriasData?.categorias ?? []
  const proveedores = proveedoresData?.proveedores ?? []

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT)
  const [creating, setCreating] = useState(false)
  const [createResponse, setCreateResponse] = useState(null)

  const [editProduct, setEditProduct] = useState(EMPTY_PRODUCT)
  const [originalEdit, setOriginalEdit] = useState(EMPTY_PRODUCT)
  const [editing, setEditing] = useState(false)
  const [editResponse, setEditResponse] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const newModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)

  useHeader(
    <>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar producto..."
        className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <ActionButton
        onClick={() => {
          setNewProduct(EMPTY_PRODUCT)
          setCreateResponse(null)
          newModalRef.current.showModal()
        }}
        className="w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
      >
        <PlusIcon className="w-4 h-4 shrink-0" />
        Nuevo producto
      </ActionButton>
    </>
  )

  const selected = products.find((p) => p.ID_Producto === selectedProduct) ?? null
  const filtered = products.filter((p) =>
    (p.Nombre_Producto ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  const editChanged = Object.keys(editProduct).some((k) => editProduct[k] !== originalEdit[k])

  async function openEditModal() {
    setLoadingEdit(true)
    setEditResponse(null)
    const res = await getProduct(selectedProduct)
    setLoadingEdit(false)
    if (!res.ok) {
      setEditResponse({ type: 'error', message: res.mensaje })
      return
    }
    const loaded = productToForm(res.producto)
    setEditProduct(loaded)
    setOriginalEdit(loaded)
    editModalRef.current.showModal()
  }

  async function handleCreateProduct() {
    const parsed = parseProduct(newProduct)
    const err = validateProduct(parsed)
    if (err) return setCreateResponse({ type: 'error', message: err })

    setCreating(true)
    const res = await createProduct(buildProductPayload(parsed))
    setCreating(false)
    if (res.ok) {
      newModalRef.current.close()
      setNewProduct(EMPTY_PRODUCT)
      setCreateResponse(null)
      refetchProducts()
    } else {
      setCreateResponse({ type: 'error', message: res.mensaje ?? 'Error al crear el producto' })
    }
  }

  async function handleUpdateProduct() {
    const parsed = parseProduct(editProduct)
    const err = validateProduct(parsed)
    if (err) return setEditResponse({ type: 'error', message: err })

    setEditing(true)
    const res = await modifyProduct(selectedProduct, buildProductPayload(parsed))
    setEditing(false)
    if (res.ok) {
      editModalRef.current.close()
      setEditResponse(null)
      refetchProducts()
    } else {
      setEditResponse({
        type: 'error',
        message: res.mensaje ?? 'Error al actualizar el producto',
      })
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError(null)
    const res = await deleteProduct(selectedProduct)
    setDeleting(false)
    if (res.ok) {
      deleteModalRef.current.close()
      setSelectedProduct(null)
      refetchProducts()
    } else {
      setDeleteError(res.mensaje ?? 'Error al eliminar el producto')
    }
  }

  return (
    <div
      className="flex flex-col gap-4 w-full h-full border-none"
      onClick={() => setSelectedProduct(null)}
    >
      <ConfirmModal
        ref={deleteModalRef}
        title="Eliminar producto"
        busy={deleting}
        busyLabel="Eliminando..."
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteError(null)}
      >
        ¿Estás seguro de que deseas eliminar{' '}
        <span className="font-semibold">{selected?.Nombre_Producto}</span>? Esta acción no se puede
        deshacer.
      </ConfirmModal>

      <FormModal
        ref={newModalRef}
        title="Nuevo producto"
        busy={creating}
        submitLabel="Guardar producto"
        submitClass="bg-emerald-600 hover:bg-emerald-700"
        onSubmit={handleCreateProduct}
        onClose={() => {
          setNewProduct(EMPTY_PRODUCT)
          setCreateResponse(null)
        }}
      >
        <ProductForm
          data={newProduct}
          setData={setNewProduct}
          response={createResponse}
          setResponse={setCreateResponse}
          categorias={categorias}
          proveedores={proveedores}
        />
      </FormModal>

      <FormModal
        ref={editModalRef}
        title="Editar producto"
        busy={editing}
        canSubmit={editChanged && !loadingEdit}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdateProduct}
        onClose={() => {
          setEditProduct(EMPTY_PRODUCT)
          setOriginalEdit(EMPTY_PRODUCT)
          setEditResponse(null)
        }}
      >
        {loadingEdit ? (
          <p className="text-sm text-gray-500 py-4 text-center">Cargando...</p>
        ) : (
          <ProductForm
            data={editProduct}
            setData={setEditProduct}
            response={editResponse}
            setResponse={setEditResponse}
            categorias={categorias}
            proveedores={proveedores}
          />
        )}
      </FormModal>

      {/* Product table */}
      <div className="flex flex-col w-full h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <ProductTableHeader />
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loadingProducts ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando productos...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin productos</p>
          ) : (
            <ul>
              {filtered.map((p) => (
                <ProductTableRow
                  key={p.ID_Producto}
                  product={p}
                  selected={p.ID_Producto === selectedProduct}
                  onSelect={setSelectedProduct}
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
          disabled={!selectedProduct}
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
          disabled={!selectedProduct}
        >
          <span className="flex items-center gap-2 justify-center">
            <TrashIcon className="w-4 h-4" />
            Eliminar seleccionado
          </span>
        </ActionButton>
      </div>
    </div>
  )
}

const headerCell = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-1'

function ProductTableHeader() {
  return (
    <div className="w-full h-fit bg-gray-800 grid grid-cols-11">
      {PRODUCT_COLUMNS.map(({ label, grow }) => (
        <div key={label} className={`${headerCell} ${grow ? 'col-span-2' : ''}`}>
          {label}
        </div>
      ))}
    </div>
  )
}

function ProductTableRow({ product, selected, onSelect }) {
  return (
    <li
      onClick={(e) => {
        e.stopPropagation()
        onSelect(product.ID_Producto)
      }}
      className={`grid grid-cols-11 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selected ? 'bg-gray-100' : ''}`}
    >
      {PRODUCT_COLUMNS.map(({ field, grow }) => (
        <span key={field} className={`${rowCell} ${grow ? 'col-span-2' : ''}`}>
          {product[field] ?? 'N/A'}
        </span>
      ))}
    </li>
  )
}
