import { cn } from '../../lib/utils'
import { clamp } from '../../lib/utils'

interface PercentileBarProps {
  value: number
  label?: string
  className?: string
}

function getBarColor(value: number): string {
  if (value >= 75) return 'bg-secondary'
  if (value >= 50) return 'bg-secondary-light'
  if (value >= 25) return 'bg-tertiary'
  return 'bg-error'
}

function PercentileBar({ value, label, className }: PercentileBarProps) {
  const clamped = clamp(value, 0, 100)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className="text-[0.75rem] text-on-surface-variant w-24 shrink-0 truncate">
          {label}
        </span>
      )}
      <div className="flex-1 h-2 bg-surface-container-high rounded-sm overflow-hidden">
        <div
          className={cn('h-full rounded-sm transition-all duration-300', getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-data text-[0.75rem] font-medium text-on-surface w-8 text-right tabular-nums">
        {clamped}
      </span>
    </div>
  )
}

export { PercentileBar }
export type { PercentileBarProps }
