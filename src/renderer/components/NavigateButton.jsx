import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export default function NavigateButton({ to, children, className, ...props }) {
  const navigate = useNavigate()

  const handleNavigation = () => {
    if (to) {
      navigate(to)
    } else {
      console.warn("NavigateButton: 'to' prop is missing")
    }
  }
  return (
    <button
      className={twMerge(
        clsx(
          'px-5 w-auto h-auto py-2 rounded-lg text-white bg-gray-800 hover:bg-gray-900 font-normal cursor-pointer',
          className
        )
      )}
      onClick={handleNavigation}
      {...props}
    >
      {children ?? 'Click aqui'}
    </button>
  )
}
