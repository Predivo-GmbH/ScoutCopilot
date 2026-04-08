import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import {
  positionOptions,
  leagueOptions,
  ageRangeOptions,
  footOptions,
} from '../../../lib/mock-data'

interface SearchFiltersProps {
  position: string
  ageRange: string
  league: string
  foot: string
  minFitScore: number
  minPassAccuracy: number
  minProgCarries: number
  onUpdate: (updates: Record<string, string | number>) => void
}

export function SearchFilters({ position, ageRange, league, foot, minFitScore, minPassAccuracy, minProgCarries, onUpdate }: SearchFiltersProps) {
  const { t } = useTranslation()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasAdvancedFilters = minFitScore > 0 || minPassAccuracy > 0 || minProgCarries > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <FilterSelect
          label={t('filters.position')}
          value={position}
          options={positionOptions}
          onChange={(v) => onUpdate({ position: v })}
        />
        <FilterSelect
          label={t('filters.ageRange')}
          value={ageRange}
          options={ageRangeOptions}
          onChange={(v) => onUpdate({ ageRange: v })}
        />
        <FilterSelect
          label={t('filters.league')}
          value={league}
          options={leagueOptions}
          onChange={(v) => onUpdate({ league: v })}
        />
        <FilterSelect
          label={t('filters.foot')}
          value={foot}
          options={footOptions}
          onChange={(v) => onUpdate({ foot: v })}
        />
        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2 md:col-span-1">
          <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant hidden md:block">
            &nbsp;
          </label>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            className={`flex items-center justify-center gap-2 bg-transparent border rounded-md text-xs font-bold uppercase tracking-widest transition-colors min-h-[44px] w-full ${
              showAdvanced || hasAdvancedFilters
                ? 'border-primary text-primary hover:bg-primary/5'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            {t('filters.advanced')}
            {hasAdvancedFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-surface-container border border-outline-variant rounded-md p-3 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">{t('filters.advancedFilters')}</h4>
            <button
              onClick={() => setShowAdvanced(false)}
              aria-label={t('filters.closeAdvancedFilters', 'Close advanced filters')}
              className="text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Min Fit Score */}
            <div className="space-y-2">
              <label htmlFor="filter-min-match-score" className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                {t('filters.minMatchScore')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="filter-min-match-score"
                  type="range"
                  min={0}
                  max={100}
                  value={minFitScore}
                  onChange={(e) => onUpdate({ minFitScore: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="font-data text-sm text-on-surface min-w-[3rem] text-right">
                  {minFitScore > 0 ? `${minFitScore}%` : t('filters.any')}
                </span>
              </div>
            </div>

            {/* Min Pass Accuracy */}
            <div className="space-y-2">
              <label htmlFor="filter-min-pass-accuracy" className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                {t('filters.minPassAccuracy')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="filter-min-pass-accuracy"
                  type="range"
                  min={0}
                  max={100}
                  value={minPassAccuracy}
                  onChange={(e) => onUpdate({ minPassAccuracy: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="font-data text-sm text-on-surface min-w-[3rem] text-right">
                  {minPassAccuracy > 0 ? `${minPassAccuracy}%` : t('filters.any')}
                </span>
              </div>
            </div>

            {/* Min Progressive Carries */}
            <div className="space-y-2">
              <label htmlFor="filter-min-prog-carries" className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                {t('filters.minProgCarries')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="filter-min-prog-carries"
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={minProgCarries}
                  onChange={(e) => onUpdate({ minProgCarries: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="font-data text-sm text-on-surface min-w-[3rem] text-right">
                  {minProgCarries > 0 ? minProgCarries.toString() : t('filters.any')}
                </span>
              </div>
            </div>
          </div>

          {/* Reset */}
          {hasAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => onUpdate({ minFitScore: 0, minPassAccuracy: 0, minProgCarries: 0 })}
                className="text-xs font-medium text-primary hover:text-primary-light transition-colors min-h-[44px] flex items-center"
              >
                {t('filters.resetAdvanced')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  const selectId = `filter-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant rounded-md text-base md:text-sm py-2.5 px-3 pr-9 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none min-h-[44px]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt.startsWith('filterOptions.') ? t(opt) : opt}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
      </div>
    </div>
  )
}
