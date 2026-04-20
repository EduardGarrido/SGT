import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export default function NavigateButton({ to, children, className, ...props}) {
    const navigate = useNavigate()

    const handleNavigation = () => {
        if (to) {
            navigate(to)
        } else {
            console.warn("NavigateButton: 'to' prop is missing")
        }
    }

    return (
        <button className={twMerge(clsx("w-full h-full rounded-lg text-white", className))} onClick={handleNavigation} {...props}>
            {children ?? 'Click aqui'}
        </button>
    )
}