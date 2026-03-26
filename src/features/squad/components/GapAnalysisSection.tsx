import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import type { PositionGap } from '../../../lib/mock-data'
import { PositionGapCard } from './PositionGapCard'

interface GapAnalysisSectionProps {
  gaps: PositionGap[]
}

export function GapAnalysisSection({ gaps }: GapAnalysisSectionProps) {
  const { t } = useTranslation()
  const actionable = gaps.filter((g) => g.priority !== 'low')

  if (actionable.length === 0) {
    return (
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
            {t('squad.positionAnalysis')}
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-on-surface-variant">{t('squad.noGaps')}</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('squad.positionAnalysis')}</h3>
        <span className="text-[0.625rem] font-data font-bold text-on-surface-variant uppercase tracking-widest">
          {t('squad.positionsFlagged', { count: actionable.length })}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {actionable.map((gap) => (
          <PositionGapCard key={gap.position} gap={gap} />
        ))}
      </div>
    </section>
  )
}
