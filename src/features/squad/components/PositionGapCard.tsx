import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Users } from 'lucide-react'
import type { PositionGap } from '../../../lib/mock-data'

const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/30' },
  high: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  medium: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  low: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' },
}

export function PositionGapCard({ gap }: { gap: PositionGap }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const style = priorityStyles[gap.priority]

  return (
    <div className={`bg-surface-container rounded-md border ${style.border} overflow-hidden`}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-on-surface">{t(gap.positionLabel)}</h4>
          <span className={`text-[0.5625rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${style.bg} ${style.text}`}>
            {t(`squad.priority.${gap.priority}`)}
          </span>
        </div>
        <span className="text-[0.625rem] font-data text-on-surface-variant uppercase">{gap.position}</span>
      </div>

      <div className="px-4 py-3 space-y-2">
        {/* Stats row */}
        <div className="flex gap-4 text-[0.625rem] font-data text-on-surface-variant">
          <div className="flex items-center gap-1">
            <Users size={12} strokeWidth={1.5} />
            <span>{gap.depth} {t('common.players', { count: gap.depth })}</span>
          </div>
          {gap.avgAge > 0 && <span>{t('squad.avgAge')}: {gap.avgAge}</span>}
          {gap.avgRating > 0 && <span>{t('squad.rating')}: {gap.avgRating}</span>}
        </div>

        {/* Reasons */}
        {gap.reasons.length > 0 && (
          <ul className="space-y-1">
            {gap.reasons.map((reason, i) => (
              <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${style.text === 'text-error' ? 'bg-error' : style.text === 'text-warning' ? 'bg-warning' : 'bg-primary'}`} />
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action */}
      {gap.priority !== 'low' && (
        <div className="px-4 py-3 border-t border-outline-variant/30">
          <button
            onClick={() => navigate(`/search?q=${encodeURIComponent(gap.searchQuery)}`)}
            className="min-h-[44px] flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors"
          >
            <Search size={14} strokeWidth={1.5} />
            {t('squad.findPlayers')}
          </button>
        </div>
      )}
    </div>
  )
}
