import { useTranslation } from 'react-i18next'
import { Brain, Search, FileText, GitCompareArrows, AlertTriangle, SlidersHorizontal } from 'lucide-react'
import type { ScoringWeights } from '../hooks/useSettings'

interface AiMethodologySettingsProps {
  scoringWeights: ScoringWeights
  onUpdateWeight: (key: keyof ScoringWeights, value: number) => void
  onSaveWeights: () => void
  weightsSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export function AiMethodologySettings({ scoringWeights, onUpdateWeight, onSaveWeights, weightsSaveStatus }: AiMethodologySettingsProps) {
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

      {/* Scoring Preferences */}
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} strokeWidth={1.5} className="text-on-surface-variant" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.aiMethodology.scoring.heading')}</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">{t('settings.aiMethodology.scoring.description')}</p>
          <div className="space-y-4">
            <WeightSlider label={t('settings.aiMethodology.scoring.attacking')} value={scoringWeights.attacking_weight} onChange={(v) => onUpdateWeight('attacking_weight', v)} />
            <WeightSlider label={t('settings.aiMethodology.scoring.defending')} value={scoringWeights.defending_weight} onChange={(v) => onUpdateWeight('defending_weight', v)} />
            <WeightSlider label={t('settings.aiMethodology.scoring.passing')} value={scoringWeights.passing_weight} onChange={(v) => onUpdateWeight('passing_weight', v)} />
            <WeightSlider label={t('settings.aiMethodology.scoring.physical')} value={scoringWeights.physical_weight} onChange={(v) => onUpdateWeight('physical_weight', v)} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onSaveWeights}
              disabled={weightsSaveStatus === 'saving'}
              className="px-4 py-2 rounded-sm text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {weightsSaveStatus === 'saving' ? t('common.saving') : weightsSaveStatus === 'saved' ? t('common.saved') : t('settings.aiMethodology.scoring.saveWeights')}
            </button>
            {weightsSaveStatus === 'error' && (
              <span className="text-xs text-error">{t('common.failedToSave')}</span>
            )}
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

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-on-surface">{label}</span>
        <span className="text-xs font-mono text-on-surface-variant">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-surface-container-high rounded-sm appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--md-sys-color-primary, #6750A4) ${value}%, var(--md-sys-color-surface-container-high, #e6e0ec) ${value}%)` }}
      />
    </div>
  )
}
