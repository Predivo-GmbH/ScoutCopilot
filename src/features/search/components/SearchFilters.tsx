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
  onUpdate: (updates: Record<string, string>) => void
}

export function SearchFilters({ position, ageRange, league, foot, onUpdate }: SearchFiltersProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <label className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">
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
