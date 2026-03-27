import { useTranslation } from 'react-i18next'
import { Users, Calendar } from 'lucide-react'
import type { MockSquad } from '../../../lib/mock-data'

interface SquadCardProps {
  squad: MockSquad
  isSelected: boolean
  onClick: () => void
}

export function SquadCard({ squad, isSelected, onClick }: SquadCardProps) {
  const { t } = useTranslation()

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container p-6 rounded-md border transition-all cursor-pointer group ${
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
        {t('squad.updated')}: {squad.lastUpdated}
      </p>
    </div>
  )
}
