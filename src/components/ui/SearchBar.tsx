import { type FormEvent, type KeyboardEvent, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
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
  placeholder = 'Ask anything about players...',
  onSearch,
  filters,
  onRemoveFilter,
  className,
}: SearchBarProps) {
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
    <div className={cn('w-full', className)}>
      <div className="relative flex items-center">
        <Search
          size={20}
          strokeWidth={1.5}
          className="absolute left-4 text-on-surface-variant pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-12 w-full pl-12 pr-4 bg-surface-container border border-outline-variant rounded-md',
            'text-[0.9375rem] text-on-surface placeholder:text-on-surface-variant/50',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            'transition-colors duration-[150ms] ease-out'
          )}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onSearch('') }}
            className="absolute right-14 p-1 text-on-surface-variant hover:text-on-surface rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="absolute right-2 h-8 px-3 bg-primary text-white text-[0.8125rem] font-medium rounded-md hover:bg-primary-dark transition-colors duration-[150ms]"
        >
          Search
        </button>
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onRemoveFilter?.(f.id)}
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
