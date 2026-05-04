import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
export default function SearchBar({ value, onChange, placeholder = 'Buscar...', className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={twMerge(
        clsx(
          'w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400',
          className
        )
      )}
    />
  )
}
