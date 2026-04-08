import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Badge } from './Badge'
import { formatAge } from '../../lib/ageUtils'

interface PlayerStat {
  label: string
  value: string | number
}

interface PlayerCardProps {
  name: string
  position: string
  age: number
  birth_date?: string
  league: string
  stats?: PlayerStat[]
  fitScore?: number
  className?: string
  onClick?: () => void
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'bg-secondary'
  if (score >= 50) return 'bg-secondary-light'
  if (score >= 25) return 'bg-tertiary'
  return 'bg-error'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function PlayerCard({
  name,
  position,
  age,
  birth_date,
  league,
  stats,
  fitScore,
  className,
  onClick,
}: PlayerCardProps) {
  const { t } = useTranslation()
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-container-low border border-outline-variant rounded-md p-5',
        'transition-colors duration-[150ms]',
        onClick && 'cursor-pointer hover:bg-surface-container',
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-surface-container-high text-[0.8125rem] font-semibold text-on-surface-variant">
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.9375rem] font-semibold text-on-surface truncate">
            {name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="primary">{position}</Badge>
            <span className="text-[0.75rem] text-on-surface-variant">
              {formatAge(birth_date)} {t('common.yrs')}
            </span>
            <span className="text-[0.75rem] text-on-surface-variant">
              {league}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-outline-variant">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                {s.label}
              </span>
              <span className="font-data text-[0.875rem] font-medium text-on-surface">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fit score */}
      {fitScore != null && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              {t('common.fitScore')}
            </span>
            <span className="font-data text-[0.8125rem] font-medium text-on-surface">
              {fitScore}%
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-sm overflow-hidden">
            <div
              className={cn('h-full rounded-sm transition-all duration-300', getScoreColor(fitScore))}
              style={{ width: `${fitScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export { PlayerCard }
export type { PlayerCardProps, PlayerStat }
