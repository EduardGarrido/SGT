import { useState, useRef } from 'react'
import DOMPurify from 'dompurify'
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
import { ActionButton } from '../components'
import {
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'
import { useHeader } from '../context/HeaderContext.jsx'

const product_props = [
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

const header_class = 'w-full h-fit bg-gray-800 grid grid-cols-11'
const base_header_item_class = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const header_item_class = (grow) => `${base_header_item_class} ${grow ? 'col-span-2' : ''}`

const base_row_item_class = 'py-2 text-xs text-center text-gray-700 truncate px-1'
const row_item_class = (grow) => `${base_row_item_class} ${grow ? 'col-span-2' : ''}`

const inputClass =
  'rounded-lg w-full px-2 py-1.5 border-2 border-gray-300 text-gray-700 bg-gray-100 shadow-sm text-sm focus:outline-none focus:border-gray-500'
const selectClass =
  'rounded-lg w-full px-2 py-1.5 border-2 border-gray-300 text-gray-700 bg-gray-100 shadow-sm text-sm focus:outline-none focus:border-gray-500'

function sanitize(val) {
  return DOMPurify.sanitize(val.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

function validateProductFields(fields) {
  const { nombre, precio, cantidad, unidad, cantidadMinima, idCategoria, idProveedor } = fields
  if (
    !nombre ||
    !unidad ||
    !idCategoria ||
    !idProveedor ||
    isNaN(precio) ||
    isNaN(cantidad) ||
    isNaN(cantidadMinima)
  ) {
    return 'Todos los campos son obligatorios'
  }
  if (precio <= 0) return 'El precio debe ser mayor a 0'
  if (cantidad < 0 || cantidadMinima < 0) return 'Las cantidades no pueden ser negativas'
  return null
}

function ProductForm({ data, onChange, error, categorias, proveedores }) {
  return (
    <>
      {error && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border text-sm bg-red-50 border-red-300 text-red-700">
          <ExclamationCircleIcon className="w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre del producto *
          </label>
          <input
            className={inputClass}
            type="text"
            placeholder="Nombre del producto"
            value={data.nombre}
            onChange={onChange('nombre')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Precio *</label>
          <input
            className={inputClass}
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
            className={inputClass}
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
          <select className={selectClass} value={data.unidad} onChange={onChange('unidad')}>
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
            className={inputClass}
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
            className={selectClass}
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
            className={selectClass}
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
  const { data: productsData, loading: loadingProducts, refetch: refetchProducts } = useFetch(getProducts)
  const { data: categoriasData } = useFetch(getCategorias)
  const { data: proveedoresData } = useFetch(getProveedores)

  const products = productsData?.productos ?? []
  const categorias = categoriasData?.categorias ?? []
  const proveedores = proveedoresData?.proveedores ?? []

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [editProduct, setEditProduct] = useState(EMPTY_PRODUCT)
  const [originalEditProduct, setOriginalEditProduct] = useState(EMPTY_PRODUCT)
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const newModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)

  const headerSearch = (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Buscar producto..."
      className="w-56 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
    />
  )

  const headerAction = (
    <ActionButton
      onClick={() => newModalRef.current.showModal()}
      className="w-auto font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5"
    >
      <PlusIcon className="w-4.5 h-4.5 shrink-0" />
      Nuevo producto
    </ActionButton>
  )

  useHeader(
    <>
      {headerSearch}
      {headerAction}
    </>
  )

  const selected = products.find((p) => p.ID_Producto === selectedProduct) ?? null

  const filtered = products.filter((p) =>
    (p.Nombre_Producto ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleNewProductChange(field) {
    return (e) => {
      setCreateError(null)
      setNewProduct((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function handleEditProductChange(field) {
    return (e) => {
      setEditError(null)
      setEditProduct((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function closeNewModal() {
    newModalRef.current.close()
    setNewProduct(EMPTY_PRODUCT)
    setCreateError(null)
  }

  function closeEditModal() {
    editModalRef.current.close()
    setEditProduct(EMPTY_PRODUCT)
    setOriginalEditProduct(EMPTY_PRODUCT)
    setEditError(null)
  }

  async function openEditModal() {
    setLoadingEdit(true)
    setEditError(null)
    const res = await getProduct(selectedProduct)
    setLoadingEdit(false)
    if (!res.ok) {
      setEditError(res.mensaje)
      return
    }
    const p = res.producto
    const loaded = {
      nombre: p.Nombre_Producto,
      precio: String(p.Precio),
      cantidad: String(p.Cantidad),
      unidad: p.Unidad_Medida,
      cantidad_minima: String(p.Cantidad_Minima),
      id_categoria: String(p.ID_Categoria),
      id_proveedor: String(p.ID_Proveedor),
    }
    setEditProduct(loaded)
    setOriginalEditProduct(loaded)
    editModalRef.current.showModal()
  }

  async function handleCreateProduct() {
    const nombre = sanitize(newProduct.nombre)
    const precio = parseFloat(newProduct.precio)
    const cantidad = parseInt(newProduct.cantidad, 10)
    const unidad = newProduct.unidad
    const cantidadMinima = parseInt(newProduct.cantidad_minima, 10)
    const idCategoria = parseInt(newProduct.id_categoria, 10)
    const idProveedor = parseInt(newProduct.id_proveedor, 10)

    const err = validateProductFields({
      nombre,
      precio,
      cantidad,
      unidad,
      cantidadMinima,
      idCategoria,
      idProveedor,
    })
    if (err) {
      setCreateError(err)
      return
    }

    setCreating(true)
    const res = await createProduct({
      Nombre_Producto: nombre,
      Precio: precio,
      Cantidad: cantidad,
      Unidad_Medida: unidad,
      Cantidad_Minima: cantidadMinima,
      ID_Categoria: idCategoria,
      ID_Proveedor: idProveedor,
    })
    setCreating(false)

    if (res.ok) {
      closeNewModal()
      refetchProducts()
    } else {
      setCreateError(res.mensaje ?? 'Error al crear el producto')
    }
  }

  async function handleUpdateProduct() {
    const nombre = sanitize(editProduct.nombre)
    const precio = parseFloat(editProduct.precio)
    const cantidad = parseInt(editProduct.cantidad, 10)
    const unidad = editProduct.unidad
    const cantidadMinima = parseInt(editProduct.cantidad_minima, 10)
    const idCategoria = parseInt(editProduct.id_categoria, 10)
    const idProveedor = parseInt(editProduct.id_proveedor, 10)

    const err = validateProductFields({
      nombre,
      precio,
      cantidad,
      unidad,
      cantidadMinima,
      idCategoria,
      idProveedor,
    })
    if (err) {
      setEditError(err)
      return
    }

    setEditing(true)
    const res = await modifyProduct(selectedProduct, {
      Nombre_Producto: nombre,
      Precio: precio,
      Cantidad: cantidad,
      Unidad_Medida: unidad,
      Cantidad_Minima: cantidadMinima,
      ID_Categoria: idCategoria,
      ID_Proveedor: idProveedor,
    })
    setEditing(false)

    if (res.ok) {
      closeEditModal()
      refetchProducts()
    } else {
      setEditError(res.mensaje ?? 'Error al actualizar el producto')
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
      {/* Delete modal */}
      <dialog ref={deleteModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationCircleIcon className="w-6 text-red-500 shrink-0" />
            <h3 className="font-bold text-lg text-gray-900">Eliminar producto</h3>
          </div>
          <p className="text-gray-600 text-sm">
            ¿Estás seguro de que deseas eliminar{' '}
            <span className="font-semibold">{selected?.Nombre_Producto}</span>? Esta acción no se
            puede deshacer.
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

      {/* New product modal */}
      <dialog ref={newModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white max-w-lg">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Nuevo producto</h3>
          <ProductForm
            data={newProduct}
            onChange={handleNewProductChange}
            error={createError}
            categorias={categorias}
            proveedores={proveedores}
          />
          <div className="modal-action">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
              onClick={closeNewModal}
              disabled={creating}
            >
              Cancelar
            </button>
            <ActionButton
              className="w-auto px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              onClick={handleCreateProduct}
              disabled={creating}
            >
              Guardar producto
            </ActionButton>
          </div>
        </div>
      </dialog>

      {/* Edit product modal */}
      <dialog ref={editModalRef} className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box bg-white max-w-lg">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Editar producto</h3>
          {loadingEdit ? (
            <p className="text-sm text-gray-500 py-4 text-center">Cargando...</p>
          ) : (
            <ProductForm
              data={editProduct}
              onChange={handleEditProductChange}
              error={editError}
              categorias={categorias}
              proveedores={proveedores}
            />
          )}
          <div className="modal-action">
            <button
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
              onClick={closeEditModal}
              disabled={editing}
            >
              Cancelar
            </button>
            <ActionButton
              className="w-auto px-4 bg-gray-800 hover:bg-gray-900 rounded-lg"
              onClick={handleUpdateProduct}
              disabled={
                editing ||
                loadingEdit ||
                !Object.keys(editProduct).some((k) => editProduct[k] !== originalEditProduct[k])
              }
            >
              Guardar cambios
            </ActionButton>
          </div>
        </div>
      </dialog>

      {/* Product table */}
      <div className="flex flex-col w-full h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <div className={header_class}>
          {product_props.map(({ label, grow }) => (
            <div key={label} className={header_item_class(grow)}>
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {loadingProducts ? (
            <p className="w-full text-center text-gray-600 py-4">Cargando productos...</p>
          ) : filtered.length === 0 ? (
            <p className="w-full text-center text-gray-600 py-4">Sin productos</p>
          ) : (
            <ul>
              {filtered.map((p) => (
                <li
                  key={p.ID_Producto}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProduct(p.ID_Producto)
                  }}
                  className={`grid grid-cols-11 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${p.ID_Producto === selectedProduct ? 'bg-gray-100' : ''}`}
                >
                  {product_props.map(({ field, grow }) => (
                    <span key={field} className={row_item_class(grow)}>
                      {p[field] ?? 'N/A'}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action buttons */}
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
