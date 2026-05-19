import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserInfo, getCashRegister } from '../api/api'
import { capitalize } from '../utils/format'

import cat from '../assets/fuhahhcat.jpg'

function formatMoney(n) {
  return `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2)}`
}

const USER_INFO_ROWS = [
  { label: 'Telefono', field: 'Telefono' },
  { label: 'Correo', field: 'Correo' },
  { label: 'Calle ', field: 'Calle' },
  { label: 'Colonia', field: 'Colonia'},
]

const REGISTER_INFO_ROWS = [
  { label: 'Cajero', field: 'Nombre'},
  { label: 'Fecha', field: 'Fecha'},
  { label: 'Apertura', field: 'Hora'},
  { label: 'Cierre', field: 'Hora_Final'}
]

const REGISTER_STATE_ROWS = [
  { label: 'Monto inicial', field: 'Monto_Inicial'},
  { label: 'Monto final', field: 'Monto_Final'},
  { field: 'Estado_Final'}
]


export default function Dashboard() {
  const { usuario, userInfo, setUserInfo } = useAuth()
  const [loading, setLoading] = useState(!userInfo)
  const [ultimaCaja, setUltimaCaja] = useState(null)
  const [loadingCaja, setLoadingCaja] = useState(true)

  useEffect(() => {
    if (userInfo) return

    getUserInfo(usuario.id)
      .then((res) => {
        if (res.ok) setUserInfo(res.usuarioinfo)
      })
      .finally(() => setLoading(false))
  }, [usuario.id])

  useEffect(() => {
    getCashRegister()
      .then((res) => {
        if (res.ok) setUltimaCaja(res.monto)
      })
      .finally(() => setLoadingCaja(false))
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-between gap-4 border border-gray-300">
      <div className="flex flex-col rounded-lg h-full p-5 w-1/3 bg-gray-50 shadow-md justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">Mi información</h1>
          <hr className="rounded-full border-2 w-full border-gray-400 my-3" />
          {loading ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : userInfo ? (
            <>
              <p className="text-lg font-semibold text-gray-800">{userInfo.Nombre}</p>
              <span className="text-sm text-gray-500 capitalize">{userInfo.Puesto}</span>
              <span
                className={`text-xs w-fit px-2 py-0.5 rounded-full mt-1 ${userInfo.Estado === 'autorizado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
              >
                {capitalize(userInfo.Estado)}
              </span>
              <hr className="border border-gray-200 my-3" />
              {USER_INFO_ROWS.map(({id, label, field})=>(
            <p key={id} className="text-gray-800 text-md">
              {label}: {' '}
              <span className="text-inherit font-semibold ">
           {userInfo[field]}
              </span>
   </p>
              ))}
            </>
          ) : (
            <p className="text-gray-400 text-sm">Sin información</p>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-lg h-full p-5 w-1/3 bg-gray-50 shadow-md">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            {userInfo
              ? `Bienvenido, ${userInfo.Nombre}!`
              : 'Bienvenido'}
          </h1>
          <hr className="rounded-full border-2 w-full border-gray-400 my-5" />
          <img src={cat}/>
          <p className="text-sm italic text-gray-500">Cute_kitties_photo_1.png</p>
        </div>
      </div>

      <div className="rounded-lg h-full p-5 w-1/3 bg-gray-50 shadow-md">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">Último corte</h1>
        <hr className="rounded-full border-2 w-full border-gray-400 my-5" />
        {loadingCaja ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : ultimaCaja ? (
          <div className="flex flex-col gap-2 text-md">
            {REGISTER_INFO_ROWS.map(({label, field})=>(
                <p className="text-gray-500">
              {label}: <span className="text-gray-800 font-semibold">{ultimaCaja[field] ?? 'Invalido'}</span>
            </p>
            ))}

            <hr className="border border-gray-200 my-1" />

            {REGISTER_STATE_ROWS.map(({label, field}) => (
              field !== 'Estado_Final' ? (
                            <p className="text-gray-500">
             {label}: {' '}
              <span className="text-gray-800 font-semibold">
                 {formatMoney(ultimaCaja[field])}
              </span>
            </p>
              ) :
                            <span
                className={`text-xs w-fit px-2 py-0.5 rounded-full mt-1 ${
                  ultimaCaja.Estado_Final === 'cuadrada'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {capitalize(ultimaCaja.Estado_Final)}
              </span>
            ))}
</div>
        ): (
          <p className="text-gray-400 text-sm">Sin cortes registrados</p>
        )}
      </div>
    </div>
  )
}
