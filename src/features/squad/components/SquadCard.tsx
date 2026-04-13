import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Calendar } from 'lucide-react'
import type { MockSquad } from '../../../lib/mock-data'

function useFormatDate() {
  const { t } = useTranslation()
  return useMemo(() => function formatDate(iso: string) {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    if (diffH < 1) return t('searchHistory.justNow')
    if (diffH < 24) return t('searchHistory.hoursAgo', { count: diffH })
    const diffD = Math.floor(diffH / 24)
    if (diffD === 1) return t('searchHistory.yesterday')
    if (diffD < 7) return t('searchHistory.daysAgo', { count: diffD })
    const locale = t('common.locale', 'en-GB')
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  }, [t])
}

interface SquadCardProps {
  squad: MockSquad
  isSelected: boolean
  onClick: () => void
}

export function SquadCard({ squad, isSelected, onClick }: SquadCardProps) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${t('squad.heading')}: ${squad.name}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className={`bg-surface-container p-4 sm:p-6 rounded-md border transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 ${
        isSelected ? 'border-primary' : 'border-outline-variant hover:border-outline-variant/60'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold group-hover:text-primary transition-colors text-on-surface">
            {squad.name}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">{squad.club}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-2 py-0.5 bg-surface-container-highest text-[0.625rem] font-semibold text-on-surface-variant rounded-sm uppercase tracking-tight flex items-center gap-1">
            <Users size={10} strokeWidth={1.5} />
            {squad.playerCount} {t('common.players')}
          </span>
          <span className="px-2 py-0.5 bg-surface-container-highest text-[0.625rem] font-semibold text-on-surface-variant rounded-sm uppercase tracking-tight flex items-center gap-1">
            <Calendar size={10} strokeWidth={1.5} />
            {squad.season}
          </span>
        </div>
      </div>
      {squad.description && (
        <p className="text-xs text-on-surface-variant leading-relaxed">{squad.description}</p>
      )}
      <p className="text-[0.625rem] text-on-surface-variant font-data mt-3 uppercase">
        {t('squad.updated')}: {formatDate(squad.lastUpdated)}
      </p>
    </div>
  )
}
