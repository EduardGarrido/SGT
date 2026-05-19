import { useMemo, useState } from 'react'
import { getProducts } from '../api/api'
import { useFetch } from '../hooks/useFetch'
import { ActionButton } from '../components'
import { useHeader } from '../context/HeaderContext.jsx'
import { TrashIcon, PlusIcon, BanknotesIcon, XMarkIcon } from '@heroicons/react/20/solid'

const CART_COLUMNS = [
  { label: 'PRODUCTO' },
  { label: 'PRECIO' },
  { label: 'EXISTENCIA' },
  { label: 'CANTIDAD' },
  { label: 'IMPORTE' },
]

function formatMoney(n) {
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`
}

export default function Sales() {
  const { data: productsData, loading: loadingProducts } = useFetch(getProducts)

  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [cart, setCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [pago, setPago] = useState('')

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.Precio) * (Number(item.cantidad) || 0), 0),
    [cart]
  )
  const pagoNum = parseFloat(pago)
  const cambio = Number.isFinite(pagoNum) ? pagoNum - total : 0
  const pagoSuficiente = Number.isFinite(pagoNum) && pagoNum >= total && total > 0

  const resultados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const products = productsData?.productos ?? []
    return products
      .filter(
        (p) =>
          p.Estado !== 'Sin stock' &&
          (p.Nombre_Producto ?? '').toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [productsData, searchQuery])

  useHeader(
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Buscar producto..."
        className="w-72 px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      {showResults && searchQuery && (
        <ul className="absolute z-20 mt-1 w-72 max-h-72 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          {loadingProducts ? (
            <li className="px-3 py-2 text-sm text-gray-500">Cargando...</li>
          ) : resultados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Sin resultados</li>
          ) : (
            resultados.map((p) => (
              <li
                key={p.ID_Producto}
                onClick={() => {
                  addToCart(p)
                  setSearchQuery('')
                  setShowResults(false)
                }}
                className="flex justify-between items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <span className="truncate flex-1">{p.Nombre_Producto}</span>
                <span className="text-gray-500 ml-2">{formatMoney(Number(p.Precio))}</span>
                <PlusIcon className="w-4 h-4 ml-2 text-emerald-600 shrink-0" />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )

  function addToCart(producto) {
    setCart((prev) => {
      const existing = prev.find((it) => it.ID_Producto === producto.ID_Producto)
      if (existing) {
        if (existing.cantidad >= Number(producto.Cantidad)) return prev
        return prev.map((it) =>
          it.ID_Producto === producto.ID_Producto ? { ...it, cantidad: it.cantidad + 1 } : it
        )
      }
      if (Number(producto.Cantidad) <= 0) return prev
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  function updateCantidad(id, value) {
    setCart((prev) =>
      prev.map((it) => {
        if (it.ID_Producto !== id) return it
        if (value === '') return { ...it, cantidad: '' }
        const raw = parseInt(value, 10)
        if (isNaN(raw)) return it
        const max = Number(it.Cantidad)
        return { ...it, cantidad: Math.min(Math.max(raw, 0), max) }
      })
    )
  }

  function normalizeCantidad(id) {
    setCart((prev) =>
      prev.map((it) => {
        if (it.ID_Producto !== id) return it
        const n = Number(it.cantidad)
        if (!Number.isFinite(n) || n < 1) return { ...it, cantidad: 1 }
        return it
      })
    )
  }

  function removeSelected() {
    if (selectedItem == null) return
    setCart((prev) => prev.filter((it) => it.ID_Producto !== selectedItem))
    setSelectedItem(null)
  }

  function clearCart() {
    setCart([])
    setSelectedItem(null)
  }

  function handleCobrar() {
    if (!pagoSuficiente) return
    alert(`Venta completada.\nTotal: ${formatMoney(total)}\nCambio: ${formatMoney(cambio)}`)
    setCart([])
    setSelectedItem(null)
    setPago('')
  }

  return (
    <div
      className="flex flex-col gap-4 w-full h-full"
      onClick={() => {
        setShowResults(false)
        setSelectedItem(null)
      }}
    >
      <div className="flex flex-col w-full h-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <CartTableHeader />
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {cart.length === 0 ? (
            <p className="w-full text-center text-gray-500 py-6 text-sm">
              Busca un producto y selecciónalo para agregarlo a la venta
            </p>
          ) : (
            <ul>
              {cart.map((item) => (
                <CartRow
                  key={item.ID_Producto}
                  item={item}
                  selected={item.ID_Producto === selectedItem}
                  onSelect={setSelectedItem}
                  onCantidadChange={updateCantidad}
                  onCantidadBlur={normalizeCantidad}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="grid grid-cols-5 gap-4 items-end bg-white border border-gray-300 shadow rounded-lg p-4"
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 uppercase">Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatMoney(total)}</span>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Pago</label>
          <input
            type="text"
            inputMode="decimal"
            value={pago}
            onChange={(e) => setPago(e.target.value)}
            placeholder="0.00"
            className="px-3 py-2 rounded-lg border border-gray-300 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 uppercase">Cambio</span>
          <span
            className={`text-2xl font-bold ${
              cambio < 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatMoney(Math.max(cambio, 0))}
          </span>
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <ActionButton
            onClick={handleCobrar}
            disabled={!pagoSuficiente}
            className="w-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
          >
            <span className="flex items-center gap-2 justify-center">
              <BanknotesIcon className="w-5 h-5" />
              Cobrar
            </span>
          </ActionButton>

          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              onClick={removeSelected}
              disabled={selectedItem == null}
              className="w-auto rounded-lg font-normal text-xs"
            >
              <span className="flex items-center gap-1.5 justify-center">
                <TrashIcon className="w-3.5 h-3.5" />
                Eliminar seleccionado
              </span>
            </ActionButton>
            <ActionButton
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-auto rounded-lg font-normal text-xs"
            >
              <span className="flex items-center gap-1.5 justify-center">
                <XMarkIcon className="w-3.5 h-3.5" />
                Limpiar carrito
              </span>
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}

const headerCell = 'py-2 text-xs text-center border-b-2 border-gray-300 text-white'
const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-2 flex items-center justify-center'

const GRID_COLS = 'grid grid-cols-[2fr_1fr_1fr_1fr_1fr]'

function CartTableHeader() {
  return (
    <div className={`w-full bg-gray-800 ${GRID_COLS}`}>
      {CART_COLUMNS.map(({ label }, i) => (
        <div
          key={label}
          className={`${headerCell} ${i === 0 ? 'pl-4' : ''} ${i === CART_COLUMNS.length - 1 ? 'pr-4' : ''}`}
        >
          {label}
        </div>
      ))}
    </div>
  )
}

function CartRow({ item, selected, onSelect, onCantidadChange, onCantidadBlur }) {
  const importe = Number(item.Precio) * (Number(item.cantidad) || 0)
  return (
    <li
      onClick={(e) => {
        e.stopPropagation()
        onSelect(item.ID_Producto)
      }}
      className={`${GRID_COLS} cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selected ? 'bg-gray-100' : ''}`}
    >
      <span className={`${rowCell} justify-start pl-4`}>{item.Nombre_Producto}</span>
      <span className={rowCell}>{formatMoney(Number(item.Precio))}</span>
      <span className={rowCell}>{item.Cantidad}</span>
      <span className={rowCell}>
        <input
          type="number"
          min="1"
          max={item.Cantidad}
          value={item.cantidad}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onCantidadChange(item.ID_Producto, e.target.value)}
          onBlur={() => onCantidadBlur(item.ID_Producto)}
          className="w-16 px-2 py-1 rounded border border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </span>
      <span className={`${rowCell} font-semibold pr-4`}>{formatMoney(importe)}</span>
    </li>
  )
}
