import { getTypeColor, getTypeIcon, getTypeLabel } from '../../utils/typeColors'

export default function TypeBadge({ type, size = 'md', showIcon = true }) {
  const colors = getTypeColor(type)
  const icon = getTypeIcon(type)
  const label = getTypeLabel(type)

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold shadow-sm ${sizes[size]}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {showIcon && <span className="text-xs">{icon}</span>}
      {label}
    </span>
  )
}
