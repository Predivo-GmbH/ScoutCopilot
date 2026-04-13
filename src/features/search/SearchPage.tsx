import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, ArrowRight, Sparkles, Clock, X, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SearchFilters } from './components/SearchFilters'
import { SearchResultsTable } from './components/SearchResultsTable'
import { usePlayerSearch } from './hooks/usePlayerSearch'
import { useRecentSearches, useDeleteSearch, useDeleteAllSearches } from '../dashboard/hooks/useDashboardData'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'

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
  const { params, results, isLoading, hasSearched, photoLoadingIds, clearResults, search, loadSaved, updateFilters } = usePlayerSearch()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const isSavedSearch = searchParams.get('saved') === '1'
  const savedSearchId = searchParams.get('sid') ?? ''
  const [queryInput, setQueryInput] = useState(initialQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const lastAutoQuery = useRef<string | null>(null)

  // Cmd+K / Ctrl+K to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // When navigated with ?q=…&saved=1&sid=…, load saved results from DB.
  // For regular ?q= navigation, only fill the input — let the user review and click Search.
  useEffect(() => {
    if (initialQuery && lastAutoQuery.current !== initialQuery) {
      lastAutoQuery.current = initialQuery
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync input with URL query param
      setQueryInput(initialQuery)
      if (isSavedSearch && savedSearchId) {
        clearResults()
        loadSaved(savedSearchId, initialQuery)
      }
      // Don't auto-search for regular queries — let user review and click Search
      setSearchParams({}, { replace: true })
    }
  }, [initialQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    if (!queryInput.trim()) return
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
        <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">{t('search.heading')}</span>
      </div>

      {/* Search Bar — full-width and prominent on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70" aria-hidden="true" />
          <input
            ref={searchInputRef}
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
      <div className="space-y-3">
        <SearchFilters
          position={params.position}
          ageRange={params.ageRange}
          league={params.league}
          minFitScore={params.minFitScore}
          minPassAccuracy={params.minPassAccuracy}
          minProgCarries={params.minProgCarries}
          onUpdate={(updates) => updateFilters(updates)}
        />
        {(params.position !== 'All Positions' || params.ageRange !== 'All Ages' || params.league !== 'All Leagues' || params.minFitScore > 0 || params.minPassAccuracy > 0 || params.minProgCarries > 0) && (
          <button
            onClick={() => updateFilters({ position: 'All Positions', ageRange: 'All Ages', league: 'All Leagues', minFitScore: 0, minPassAccuracy: 0, minProgCarries: 0 })}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-light transition-colors min-h-[44px]"
          >
            <RotateCcw size={12} strokeWidth={1.5} />
            {t('filters.resetAll', 'Reset Filters')}
          </button>
        )}
      </div>

      {/* Results */}
      {hasSearched ? (
        <>
          <SearchResultsTable results={results} isLoading={isLoading} photoLoadingIds={photoLoadingIds} />
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
        <EmptyState onSuggestionClick={handleSuggestion} onLoadSaved={(id, query) => { setQueryInput(query); loadSaved(id, query) }} />
      )}
    </div>
  )
}

function EmptyState({ onSuggestionClick, onLoadSaved }: {
  onSuggestionClick: (query: string) => void
  onLoadSaved: (searchId: string, query: string) => void
}) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { data: recentSearches } = useRecentSearches()
  const deleteSearch = useDeleteSearch()
  const deleteAllSearches = useDeleteAllSearches()

  const VISIBLE_LIMIT = 5
  const visibleSearches = recentSearches?.slice(0, VISIBLE_LIMIT) ?? []
  const hasMore = (recentSearches?.length ?? 0) > VISIBLE_LIMIT

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
        <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-2">{t('search.startSearch')}</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        {t('search.startSearchSub')}
      </p>

      {/* Recent Searches */}
      {recentSearches && recentSearches.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Clock size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
            <span className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">{t('searchHistory.heading')}</span>
            <span className="mx-1" />
            <button
              onClick={() => deleteAllSearches.mutate()}
              className="text-[0.625rem] font-data uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors min-h-[44px] flex items-center gap-1"
            >
              <Trash2 size={10} strokeWidth={1.5} />
              {t('search.clearHistory')}
            </button>
          </div>
          <div className="space-y-1.5">
            {visibleSearches.map((s) => (
              <button
                key={s.id}
                onClick={() => onLoadSaved(s.id, s.query)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-surface-container border border-outline-variant rounded-md hover:bg-surface-container-high hover:border-primary/30 transition-colors min-h-[44px] group"
              >
                <SearchIcon size={14} strokeWidth={1.5} className="text-on-surface-variant/50 shrink-0" aria-hidden="true" />
                <span className="text-sm text-on-surface truncate flex-1">{s.query}</span>
                <span className="text-[0.625rem] font-data text-on-surface-variant/70 shrink-0">{s.resultCount} {s.resultCount === 1 ? t('searchHistory.result', 'result') : t('searchHistory.results')}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={t('search.deleteQuery')}
                  className="opacity-50 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-1 rounded-sm text-on-surface-variant/70 hover:text-error hover:bg-error/10 transition-all shrink-0"
                  onClick={(e) => { e.stopPropagation(); deleteSearch.mutate(s.id) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); deleteSearch.mutate(s.id) } }}
                >
                  <X size={14} strokeWidth={1.5} />
                </span>
              </button>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => navigate('/search-history')}
              className="mt-3 w-full text-[0.625rem] font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
            >
              {t('search.showAllHistory')} ({recentSearches.length}) <ArrowRight size={12} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      {/* Suggested Queries */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Sparkles size={14} strokeWidth={1.5} className="text-tertiary" aria-hidden="true" />
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
