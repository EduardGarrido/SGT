import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export default function BaseButton({ children, className, disabled, ...props }) {
  return (
    <button
      className={twMerge(
        clsx(
          'flex flex-row justify-center items-center w-full md:px-12 px-4 py-2 rounded-lg text-white bg-gray-800 hover:bg-gray-900 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      <span className="flex flex-row items-center justify-center gap-2">{children}</span>
    </button>
  )
}
