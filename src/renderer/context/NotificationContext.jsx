import { createContext, useContext, useEffect, useRef, useState } from 'react'

const NotificationContext = createContext(null)

const TONE = {
  info: 'text-gray-900',
  success: 'text-emerald-700',
  error: 'text-red-700',
  warning: 'text-amber-700',
}

const BUTTON = {
  info: 'bg-gray-800 hover:bg-gray-900',
  success: 'bg-emerald-600 hover:bg-emerald-700',
  error: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
}

export function NotificationProvider({ children }) {
  const dialogRef = useRef(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (notification && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    }
  }, [notification])

  function notify({ title, message, type = 'info' }) {
    setNotification({
      title: title ?? defaultTitle(type),
      message,
      type,
    })
  }

  function close() {
    dialogRef.current?.close()
    setNotification(null)
  }

  const tone = TONE[notification?.type ?? 'info']
  const btn = BUTTON[notification?.type ?? 'info']

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <dialog
        ref={dialogRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onClose={close}
      >
        <div className="modal-box bg-white max-w-lg">
          <h3 className={`font-bold text-lg mb-3 ${tone}`}>{notification?.title}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{notification?.message}</p>
          <div className="modal-action">
            <button
              className={`btn text-white border-none ${btn}`}
              onClick={close}
              autoFocus
            >
              Aceptar
            </button>
          </div>
        </div>
      </dialog>
    </NotificationContext.Provider>
  )
}

function defaultTitle(type) {
  switch (type) {
    case 'error':
      return 'Error'
    case 'warning':
      return 'Atención'
    case 'success':
      return 'Listo'
    default:
      return 'Aviso'
  }
}

export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotify debe usarse dentro de NotificationProvider')
  return ctx.notify
}
