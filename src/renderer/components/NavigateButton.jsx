import { useNavigate } from 'react-router-dom'
import BaseButton from './BaseButton'

export default function NavigateButton({ to, children, className, ...props }) {
  const navigate = useNavigate()

  return (
    <BaseButton
      className={className}
      onClick={() => (to ? navigate(to) : console.warn("NavigateButton: 'to' prop is missing"))}
      {...props}
    >
      {children ?? 'Click aqui'}
    </BaseButton>
  )
}
