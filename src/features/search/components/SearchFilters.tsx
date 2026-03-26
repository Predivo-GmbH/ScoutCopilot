import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
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
  maxAge: number
  minAge: number
  onUpdate: (updates: Record<string, string | number>) => void
}

export function SearchFilters({ position, ageRange, league, foot, minFitScore, maxAge, minAge, onUpdate }: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasAdvancedFilters = minFitScore > 0 || maxAge < 99 || minAge > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <FilterSelect
          label="Position"
          value={position}
          options={positionOptions}
          onChange={(v) => onUpdate({ position: v })}
        />
        <FilterSelect
          label="Age Range"
          value={ageRange}
          options={ageRangeOptions}
          onChange={(v) => onUpdate({ ageRange: v })}
        />
        <FilterSelect
          label="League"
          value={league}
          options={leagueOptions}
          onChange={(v) => onUpdate({ league: v })}
        />
        <FilterSelect
          label="Foot"
          value={foot}
          options={footOptions}
          onChange={(v) => onUpdate({ foot: v })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
            &nbsp;
          </label>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-2 bg-transparent border rounded-md text-xs font-bold uppercase tracking-widest transition-colors h-[42px] ${
              showAdvanced || hasAdvancedFilters
                ? 'border-primary text-primary hover:bg-primary/5'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Advanced
            {hasAdvancedFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-surface-container border border-outline-variant rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">Advanced Filters</h4>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Min Fit Score */}
            <div className="space-y-2">
              <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                Min Match Score
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minFitScore}
                  onChange={(e) => onUpdate({ minFitScore: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="font-data text-sm text-on-surface min-w-[3rem] text-right">
                  {minFitScore > 0 ? `${minFitScore}%` : 'Any'}
                </span>
              </div>
            </div>

            {/* Min Age */}
            <div className="space-y-2">
              <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                Min Age
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={minAge || ''}
                  placeholder="Any"
                  onChange={(e) => onUpdate({ minAge: Number(e.target.value) || 0 })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-md text-sm py-2 px-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Max Age */}
            <div className="space-y-2">
              <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                Max Age
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={maxAge < 99 ? maxAge : ''}
                  placeholder="Any"
                  onChange={(e) => onUpdate({ maxAge: Number(e.target.value) || 99 })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-md text-sm py-2 px-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Reset */}
          {hasAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => onUpdate({ minFitScore: 0, maxAge: 99, minAge: 0 })}
                className="text-xs font-medium text-primary hover:text-primary-light transition-colors"
              >
                Reset advanced filters
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
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-container border border-outline-variant rounded-md text-sm py-2.5 px-3 text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
