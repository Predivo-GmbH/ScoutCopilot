import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { params, results, isLoading, hasSearched, search, updateFilters } = usePlayerSearch()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const isSavedSearch = searchParams.get('saved') === '1'
  const [queryInput, setQueryInput] = useState(initialQuery)
  const autoSearched = useRef(false)

  // Auto-execute saved searches from dashboard (but not "Find Players" or suggested queries)
  useEffect(() => {
    if (isSavedSearch && initialQuery && !autoSearched.current) {
      autoSearched.current = true
      search({ query: initialQuery })
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    search({ query: queryInput })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function handleSuggestion(query: string) {
    setQueryInput(query)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
        <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">{t('search.heading')}</span>
      </div>

      {/* Search Bar — full-width and prominent on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className="w-full bg-surface-container border border-outline-variant rounded-md py-3.5 pl-12 pr-4 sm:pr-24 text-base md:text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary transition-colors min-h-[48px] sm:min-h-[44px]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface-container-high px-2 py-0.5 rounded-sm border border-outline-variant/30 hidden sm:block">
            <span className="text-[0.625rem] font-data text-on-surface-variant/70">{t('search.cmdK')}</span>
          </div>
        </div>
        <Button
          variant="primary"
          size="lg"
          rightIcon={ArrowRight}
          onClick={handleSearch}
          loading={isLoading}
          className="w-full sm:w-auto px-8 min-h-[48px] sm:min-h-[44px]"
        >
          {t('search.searchBtn')}
        </Button>
      </div>

      {/* Filters */}
      <SearchFilters
        position={params.position}
        ageRange={params.ageRange}
        league={params.league}
        foot={params.foot}
        minFitScore={params.minFitScore}
        minPassAccuracy={params.minPassAccuracy}
        minProgCarries={params.minProgCarries}
        onUpdate={(updates) => updateFilters(updates)}
      />

      {/* Results */}
      {hasSearched ? (
        <>
          <SearchResultsTable results={results} isLoading={isLoading} />
          {/* Footer status */}
          {results.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[0.625rem] uppercase tracking-[0.2em] text-on-surface-variant/70 mt-4">
              <span className="font-data">{t('search.dbLastUpdated')}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-data">{t('search.liveConnection')}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState onSuggestionClick={handleSuggestion} />
      )}
    </div>
  )
}

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (query: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
        <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">{t('search.startSearch')}</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        {t('search.startSearchSub')}
      </p>

      {/* Suggested Queries */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Sparkles size={14} strokeWidth={1.5} className="text-tertiary" />
          <span className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">{t('search.suggestedQueries')}</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_QUERIES.map((query) => (
            <button
              key={query}
              onClick={() => onSuggestionClick(query)}
              className="px-3 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-md text-on-surface-variant hover:text-on-surface hover:border-primary/30 hover:bg-surface-container transition-colors min-h-[44px]"
            >
              "{query}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
