import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export default function BaseButton({ children, className, disabled, ...props }) {
  return (
    <button
      className={twMerge(
        clsx(
          'w-full md:px-5 px-2 py-2 rounded-lg text-white bg-gray-800 hover:bg-gray-900 font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
