import { type FormEvent, type KeyboardEvent, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Badge } from './Badge'

interface FilterChip {
  id: string
  label: string
}

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  filters?: FilterChip[]
  onRemoveFilter?: (id: string) => void
  className?: string
}

function SearchBar({
  placeholder,
  onSearch,
  filters,
  onRemoveFilter,
  className,
}: SearchBarProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      if (query.trim()) onSearch(query.trim())
    },
    [query, onSearch]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  return (
    <div role="search" className={cn('w-full', className)}>
      <div className="relative flex items-center">
        <Search
          size={20}
          strokeWidth={1.5}
          className="absolute left-4 text-on-surface-variant pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('searchBar.placeholder')}
          aria-label={placeholder ?? t('searchBar.placeholder')}
          className={cn(
            'h-12 min-h-[44px] w-full pl-12 pr-4 bg-surface-container border border-outline-variant rounded-md',
            'text-base md:text-[0.9375rem] text-on-surface placeholder:text-on-surface-variant/70',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            'transition-colors duration-[150ms] ease-out'
          )}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onSearch('') }}
            className="absolute right-14 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-md transition-colors"
            aria-label={t('searchBar.clear')}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="absolute right-2 h-10 min-h-[44px] px-3 bg-primary text-on-primary text-[0.8125rem] font-medium rounded-md hover:bg-primary-dark transition-colors duration-[150ms]"
        >
          {t('common.search')}
        </button>
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onRemoveFilter?.(f.id)}
              aria-label={`${t('common.remove', 'Remove')}: ${f.label}`}
              className="group inline-flex items-center gap-1"
            >
              <Badge variant="primary">
                {f.label}
                <X size={12} strokeWidth={1.5} className="ml-1 opacity-60 group-hover:opacity-100" />
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { SearchBar }
export type { SearchBarProps, FilterChip }
