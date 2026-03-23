import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

type AccentColor = 'primary' | 'secondary' | 'tertiary'

interface StatCardProps {
  title: string
  value: string | number
  trend?: { value: number; label?: string }
  accent?: AccentColor
  className?: string
}

const accentBorder: Record<AccentColor, string> = {
  primary: 'border-l-primary',
  secondary: 'border-l-secondary',
  tertiary: 'border-l-tertiary',
}

function StatCard({ title, value, trend, accent = 'primary', className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <div
      className={cn(
        'bg-surface-container-low border border-outline-variant rounded-md p-5 border-l-[3px]',
        accentBorder[accent],
        className
      )}
    >
      <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
        {title}
      </p>
      <p className="text-[1.75rem] font-semibold tracking-[-0.01em] font-data text-on-surface">
        {value}
      </p>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-2 text-[0.75rem] font-medium', isPositive ? 'text-secondary' : 'text-error')}>
          {isPositive ? (
            <TrendingUp size={14} strokeWidth={1.5} />
          ) : (
            <TrendingDown size={14} strokeWidth={1.5} />
          )}
          <span className="font-data">
            {isPositive ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-on-surface-variant ml-1">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}

export { StatCard }
export type { StatCardProps, AccentColor }
