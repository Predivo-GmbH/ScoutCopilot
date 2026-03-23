import { useState } from 'react'
import { Search as SearchIcon, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SearchFilters } from './components/SearchFilters'
import { SearchResultsTable } from './components/SearchResultsTable'
import { usePlayerSearch } from './hooks/usePlayerSearch'

export function SearchPage() {
  const { params, results, isLoading, hasSearched, search, updateFilters } = usePlayerSearch()
  const [queryInput, setQueryInput] = useState('')

  function handleSearch() {
    search({ query: queryInput })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Player Search</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Ask anything about players using natural language.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find me a left-back under 23 with >75% crossing accuracy"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-4 pl-12 pr-6 text-on-surface focus:outline-none focus:border-primary transition-colors text-base"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          rightIcon={ArrowRight}
          onClick={handleSearch}
          loading={isLoading}
        >
          Search
        </Button>
      </div>

      {/* Filters */}
      <SearchFilters
        position={params.position}
        ageRange={params.ageRange}
        league={params.league}
        foot={params.foot}
        onUpdate={(updates) => updateFilters(updates)}
      />

      {/* Results */}
      {hasSearched ? (
        <SearchResultsTable results={results} isLoading={isLoading} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
        <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">Start a search</h3>
      <p className="text-sm text-on-surface-variant max-w-md">
        Type a natural language query above or use the filters to find players. Results will appear here.
      </p>
    </div>
  )
}
