import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SearchFilters } from './components/SearchFilters'
import { SearchResultsTable } from './components/SearchResultsTable'
import { usePlayerSearch } from './hooks/usePlayerSearch'

const SUGGESTED_QUERIES = [
  'Left-backs under 23, >75% crossing accuracy',
  'Top progressive passers under 23 in the Eredivisie',
  'Serie A wingers with >60% dribble success rate',
  'Centre-backs under 26 with aerial duel win >65%',
  'Strikers with xG/90 > 0.45 in top 5 leagues',
  'Defensive midfielders with >8 progressive passes/90',
]

export function SearchPage() {
  const { params, results, isLoading, hasSearched, search, updateFilters } = usePlayerSearch()
  const [queryInput, setQueryInput] = useState('')
  const [searchParams] = useSearchParams()

  // Handle search from top bar
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQueryInput(q)
      search({ query: q })
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    search({ query: queryInput })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function handleSuggestion(query: string) {
    setQueryInput(query)
    search({ query })
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
        <EmptyState onSuggestionClick={handleSuggestion} />
      )}
    </div>
  )
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (query: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
        <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">Start a search</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        Type a natural language query above or use the filters to find players. Results will appear here.
      </p>

      {/* Suggested Queries */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Sparkles size={14} strokeWidth={1.5} className="text-tertiary" />
          <span className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">Suggested Queries</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_QUERIES.map((query) => (
            <button
              key={query}
              onClick={() => onSuggestionClick(query)}
              className="px-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant rounded-md text-on-surface-variant hover:text-on-surface hover:border-primary/30 hover:bg-surface-container transition-colors"
            >
              "{query}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
