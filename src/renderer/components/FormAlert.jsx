import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/20/solid'

const STYLES = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    input: 'border-red-400',
    Icon: ExclamationCircleIcon,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    input: 'border-green-400',
    Icon: CheckCircleIcon,
  },
}

export default function FormAlert({ response }) {
  if (!response) return null
  const s = STYLES[response.type]
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${s.bg} ${s.border} ${s.text}`}
    >
      <s.Icon className="w-4 shrink-0" />
      {response.message}
    </div>
  )
}

export const baseInputClass =
  'rounded-lg w-full px-2 py-1.5 border-2 text-gray-700 bg-gray-100 shadow-sm text-sm focus:outline-none'

export function fieldInputClass(response, field, required = false) {
  const isHighlighted =
    response?.type === 'error' &&
    (response.field === field || (response.field === 'required' && required))
  const border = isHighlighted ? STYLES.error.input : 'border-gray-300 focus:border-gray-500'
  return `${baseInputClass} ${border}`
}
