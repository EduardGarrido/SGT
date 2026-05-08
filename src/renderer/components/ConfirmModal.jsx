import { forwardRef } from 'react'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/20/solid'

const VARIANTS = {
  danger: { Icon: ExclamationCircleIcon, iconClass: 'text-red-500' },
  success: { Icon: CheckCircleIcon, iconClass: 'text-green-600' },
}

const ConfirmModal = forwardRef(function ConfirmModal(
  {
    title,
    children,
    error,
    busy = false,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    busyLabel = 'Procesando...',
    confirmClass = 'bg-red-600 hover:bg-red-700',
    variant = 'danger',
    onConfirm,
    onClose,
  },
  ref
) {
  const { Icon, iconClass } = VARIANTS[variant]

  function close() {
    ref.current?.close()
    onClose?.()
  }

  return (
    <dialog ref={ref} className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-box bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-6 shrink-0 ${iconClass}`} />
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        </div>
        <div className="text-gray-600 text-sm">{children}</div>
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="modal-action">
          <button
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
            onClick={close}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              className={`btn ${confirmClass} text-white border-none`}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
})

export default ConfirmModal
