import { useNavigate } from 'react-router-dom'

export default function NavigateButton({ to, label}) {
    const navigate = useNavigate()

    const handleNavigation = () => {
        if (to) {
            navigate(to)
        } else {
            console.warn("NavigateButton: 'to' prop is missing")
        }
    }

    return (
        <button onClick={handleNavigation}>
            {label || 'Click aqui'}
        </button>
    )
}