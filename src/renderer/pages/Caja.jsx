import { useMemo, useState } from 'react'
import { ActionButton, FormAlert } from '../components'
import { useHeader } from '../context/HeaderContext.jsx'
import { useAuth } from '../context/AuthContext'
import { openCaja, closeCaja } from '../api/api'
import {
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'

const MOV_COLUMNS = [
  { label: 'HORA' },
  { label: 'CONCEPTO' },
  { label: 'TIPO' },
  { label: 'MONTO' },
]

const GRID_COLS = 'grid grid-cols-[1fr_3fr_1fr_1fr]'

function formatMoney(n) {
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`
}

function formatHora(d) {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function Caja() {
  const { usuario, caja, setCaja } = useAuth()
  const [estado, setEstado] = useState(caja ? 'abierta' : 'cerrada')
  const [saldoInicial, setSaldoInicial] = useState(caja ? Number(caja.Monto_Inicial) : 0)
  const [movimientos, setMovimientos] = useState([])

  const [montoApertura, setMontoApertura] = useState('')
  const [tipoMov, setTipoMov] = useState('ingreso')
  const [conceptoMov, setConceptoMov] = useState('')
  const [montoMov, setMontoMov] = useState('')

  const [response, setResponse] = useState(null)

  const totalIngresos = useMemo(
    () => movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
    [movimientos]
  )
  const totalEgresos = useMemo(
    () => movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0),
    [movimientos]
  )
  const saldoActual = saldoInicial + totalIngresos - totalEgresos

  useHeader(
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${
        estado === 'abierta' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
      }`}
    >
      Caja {estado === 'abierta' ? 'abierta' : 'cerrada'}
    </span>
  )

  async function abrirCaja() {
    const monto = parseFloat(montoApertura)
    if (!Number.isFinite(monto) || monto < 0) return
    setResponse(null)
    const res = await openCaja({ Monto_Inicial: monto, ID_Usuario: usuario.id })
    if (!res.ok) {
      setResponse({ type: 'error', message: res.mensaje ?? 'No se pudo abrir la caja' })
      return
    }
    setCaja(res.caja ?? { Monto_Inicial: monto })
    setSaldoInicial(monto)
    setMovimientos([])
    setEstado('abierta')
    setMontoApertura('')
  }

  async function cerrarCaja() {
    setResponse(null)
    const res = await closeCaja({ Monto_Final: saldoActual })
    if (!res.ok) {
      setResponse({ type: 'error', message: res.mensaje ?? 'No se pudo cerrar la caja' })
      return
    }
    setCaja(null)
    alert(
      `Resumen del corte\n\n` +
        `Saldo inicial: ${formatMoney(saldoInicial)}\n` +
        `Ingresos: ${formatMoney(totalIngresos)}\n` +
        `Egresos: ${formatMoney(totalEgresos)}\n` +
        `Saldo final: ${formatMoney(saldoActual)}`
    )
    setEstado('cerrada')
    setSaldoInicial(0)
    setMovimientos([])
  }

  function agregarMovimiento() {
    const monto = parseFloat(montoMov)
    if (!conceptoMov.trim() || !Number.isFinite(monto) || monto <= 0) return
    setMovimientos((prev) => [
      ...prev,
      {
        id: Date.now(),
        hora: new Date(),
        concepto: conceptoMov.trim(),
        tipo: tipoMov,
        monto,
      },
    ])
    setConceptoMov('')
    setMontoMov('')
  }

  if (estado === 'cerrada') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white rounded-lg shadow border border-gray-300 p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <LockClosedIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Caja cerrada</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Ingresa el saldo inicial para abrir la caja del turno.
          </p>

          <div className="mb-3">
            <FormAlert response={response} />
          </div>

          <label className="block text-xs font-semibold text-gray-700 mb-1">Saldo inicial</label>
          <input
            type="text"
            inputMode="decimal"
            value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
            placeholder="0.00"
            className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-300 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <ActionButton
            onClick={abrirCaja}
            disabled={!montoApertura}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
          >
            <span className="flex items-center gap-2 justify-center">
              <LockOpenIcon className="w-5 h-5" />
              Abrir caja
            </span>
          </ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {response && <FormAlert response={response} />}

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Saldo inicial" value={saldoInicial} />
        <StatCard label="Ingresos" value={totalIngresos} tone="emerald" />
        <StatCard label="Egresos" value={totalEgresos} tone="red" />
        <StatCard label="Saldo actual" value={saldoActual} bold />
      </div>

      <div className="bg-white border border-gray-300 shadow rounded-lg p-4 grid grid-cols-[1fr_2fr_1fr_auto] gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Tipo</label>
          <select
            value={tipoMov}
            onChange={(e) => setTipoMov(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Concepto</label>
          <input
            type="text"
            value={conceptoMov}
            onChange={(e) => setConceptoMov(e.target.value)}
            placeholder="Ej. Venta mostrador, retiro..."
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Monto</label>
          <input
            type="text"
            inputMode="decimal"
            value={montoMov}
            onChange={(e) => setMontoMov(e.target.value)}
            placeholder="0.00"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <ActionButton
          onClick={agregarMovimiento}
          disabled={!conceptoMov.trim() || !montoMov}
          className="w-auto rounded-lg bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          <span className="flex items-center gap-2 justify-center">
            <PlusIcon className="w-4 h-4" />
            Registrar
          </span>
        </ActionButton>
      </div>

      <div className="flex flex-col w-full flex-1 border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <div className={`w-full bg-gray-800 ${GRID_COLS}`}>
          {MOV_COLUMNS.map(({ label }, i) => (
            <div
              key={label}
              className={`py-2 text-xs text-center border-b-2 border-gray-300 text-white ${i === 0 ? 'pl-4' : ''} ${i === MOV_COLUMNS.length - 1 ? 'pr-4' : ''}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full overflow-y-auto flex-1">
          {movimientos.length === 0 ? (
            <p className="w-full text-center text-gray-500 py-6 text-sm">
              Aún no hay movimientos registrados
            </p>
          ) : (
            <ul>
              {movimientos.map((m) => (
                <MovimientoRow key={m.id} mov={m} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <ActionButton
          onClick={cerrarCaja}
          className="w-auto rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
        >
          <span className="flex items-center gap-2 justify-center">
            <LockClosedIcon className="w-5 h-5" />
            Cerrar caja
          </span>
        </ActionButton>
      </div>
    </div>
  )
}

function StatCard({ label, value, tone, bold }) {
  const toneCls =
    tone === 'emerald' ? 'text-emerald-600' : tone === 'red' ? 'text-red-600' : 'text-gray-900'
  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-4">
      <span className="text-xs font-semibold text-gray-600 uppercase">{label}</span>
      <p className={`text-2xl ${bold ? 'font-bold' : 'font-semibold'} ${toneCls} mt-1`}>
        {formatMoney(value)}
      </p>
    </div>
  )
}

const rowCell = 'py-2 text-xs text-center text-gray-700 truncate px-2 flex items-center justify-center'

function MovimientoRow({ mov }) {
  const Icon = mov.tipo === 'ingreso' ? ArrowDownCircleIcon : ArrowUpCircleIcon
  const tipoCls = mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
  return (
    <li className={`${GRID_COLS} border-b border-gray-100 hover:bg-gray-50`}>
      <span className={`${rowCell} pl-4`}>{formatHora(mov.hora)}</span>
      <span className={`${rowCell} justify-start`}>{mov.concepto}</span>
      <span className={`${rowCell} ${tipoCls} font-semibold gap-1`}>
        <Icon className="w-4 h-4" />
        {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
      </span>
      <span className={`${rowCell} font-semibold ${tipoCls} pr-4`}>{formatMoney(mov.monto)}</span>
    </li>
  )
}
