import { useTranslation } from 'react-i18next'
import { Brain, Search, FileText, GitCompareArrows, AlertTriangle, SlidersHorizontal } from 'lucide-react'

export function AiMethodologySettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Data Sources */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Brain size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.dataSources.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">{t('settings.aiMethodology.dataSources.description')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataSourceCard
              name="StatsBomb Open Data"
              description={t('settings.aiMethodology.dataSources.statsbombOpen')}
              tier={t('settings.aiMethodology.dataSources.free')}
              tierColor="bg-secondary/10 text-secondary"
            />
            <DataSourceCard
              name="API-Football"
              description={t('settings.aiMethodology.dataSources.apiFootball')}
              tier={t('settings.aiMethodology.dataSources.free')}
              tierColor="bg-secondary/10 text-secondary"
            />
            <DataSourceCard
              name="Wyscout"
              description={t('settings.aiMethodology.dataSources.wyscout')}
              tier={t('settings.aiMethodology.dataSources.premium')}
              tierColor="bg-warning/10 text-warning"
            />
            <DataSourceCard
              name="StatsBomb API"
              description={t('settings.aiMethodology.dataSources.statsbombApi')}
              tier={t('settings.aiMethodology.dataSources.premium')}
              tierColor="bg-warning/10 text-warning"
            />
          </div>
        </div>
      </section>

      {/* How Search Works */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Search size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.search.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">{t('settings.aiMethodology.search.description')}</p>
          <div className="space-y-3">
            <PipelineStep step="1" label={t('settings.aiMethodology.search.step1')} />
            <PipelineStep step="2" label={t('settings.aiMethodology.search.step2')} />
            <PipelineStep step="3" label={t('settings.aiMethodology.search.step3')} />
          </div>
          <div className="p-3 bg-surface-container-low rounded-md border border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface">{t('settings.aiMethodology.search.fitScoreLabel')}</span>{' '}
              {t('settings.aiMethodology.search.fitScoreDescription')}
            </p>
          </div>
          <div className="p-3 bg-surface-container-low rounded-md border border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface">{t('settings.aiMethodology.search.fallbackLabel')}</span>{' '}
              {t('settings.aiMethodology.search.fallbackDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* How Reports Work */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <FileText size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.reports.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">{t('settings.aiMethodology.reports.description')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReportFeature label={t('settings.aiMethodology.reports.strengths')} />
            <ReportFeature label={t('settings.aiMethodology.reports.style')} />
            <ReportFeature label={t('settings.aiMethodology.reports.ratings')} />
            <ReportFeature label={t('settings.aiMethodology.reports.recommendation')} />
          </div>
        </div>
      </section>

      {/* How Comparisons Work */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.comparisons.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">{t('settings.aiMethodology.comparisons.description')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReportFeature label={t('settings.aiMethodology.comparisons.perMetric')} />
            <ReportFeature label={t('settings.aiMethodology.comparisons.narrative')} />
          </div>
        </div>
      </section>

      {/* Limitations & Transparency */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.limitations.heading')}</h2>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            <LimitationItem text={t('settings.aiMethodology.limitations.errors')} />
            <LimitationItem text={t('settings.aiMethodology.limitations.relative')} />
            <LimitationItem text={t('settings.aiMethodology.limitations.model')} />
            <LimitationItem text={t('settings.aiMethodology.limitations.noWeights')} />
          </ul>
        </div>
      </section>

      {/* Scoring Preferences (Future) */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden opacity-60">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.scoring.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
            <p className="text-xs font-semibold text-on-surface">{t('settings.aiMethodology.scoring.comingSoon')}</p>
            <p className="text-xs text-on-surface-variant mt-1">{t('settings.aiMethodology.scoring.comingSoonSub')}</p>
          </div>
          <div className="space-y-4 pointer-events-none select-none">
            <SliderMockup label={t('settings.aiMethodology.scoring.attacking')} value={75} />
            <SliderMockup label={t('settings.aiMethodology.scoring.defending')} value={50} />
            <SliderMockup label={t('settings.aiMethodology.scoring.passing')} value={60} />
            <SliderMockup label={t('settings.aiMethodology.scoring.physical')} value={40} />
          </div>
        </div>
      </section>
    </div>
  )
}

function DataSourceCard({ name, description, tier, tierColor }: {
  name: string
  description: string
  tier: string
  tierColor: string
}) {
  return (
    <div className="p-4 bg-surface-container-low rounded-md border border-outline-variant">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-on-surface">{name}</span>
        <span className={`text-[0.5625rem] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shrink-0 ${tierColor}`}>
          {tier}
        </span>
      </div>
      <p className="text-xs text-on-surface-variant">{description}</p>
    </div>
  )
}

function PipelineStep({ step, label }: { step: string; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-semibold shrink-0">
        {step}
      </span>
      <p className="text-xs text-on-surface-variant pt-0.5">{label}</p>
    </div>
  )
}

function ReportFeature({ label }: { label: string }) {
  return (
    <div className="p-3 bg-surface-container-low rounded-md border border-outline-variant">
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  )
}

function LimitationItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant mt-1.5 shrink-0" />
      <p className="text-xs text-on-surface-variant">{text}</p>
    </li>
  )
}

function SliderMockup({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-on-surface">{label}</span>
        <span className="text-xs font-mono text-on-surface-variant">{value}%</span>
      </div>
      <div className="h-2 bg-surface-container-high rounded-sm overflow-hidden">
        <div className="h-full bg-primary/40 rounded-sm" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
