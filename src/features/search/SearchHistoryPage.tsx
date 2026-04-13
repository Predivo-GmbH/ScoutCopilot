import { useState } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, Search, CheckCircle2, Loader2, XCircle, Trash2, ChevronDown } from 'lucide-react'
import { useRecentSearches, useDeleteSearch, useDeleteAllSearches } from '../dashboard/hooks/useDashboardData'

function useFormatDate() {
  const { t } = useTranslation()
  return function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    if (diffH < 1) return t('searchHistory.justNow')
    if (diffH < 24) return t('searchHistory.hoursAgo', { count: diffH })
    const diffD = Math.floor(diffH / 24)
    if (diffD === 1) return t('searchHistory.yesterday')
    if (diffD < 7) return t('searchHistory.daysAgo', { count: diffD })
    const locale = t('common.locale', 'en-GB')
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  }
}

function StatusBadge({ status }: { status: 'complete' | 'processing' | 'failed' }) {
  const { t } = useTranslation()
  if (status === 'complete') return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-secondary">
      <CheckCircle2 size={10} strokeWidth={2} /> {t('searchHistory.complete')}
    </span>
  )
  if (status === 'processing') return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-tertiary">
      <Loader2 size={10} strokeWidth={2} className="animate-spin" /> {t('searchHistory.processing')}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-error">
      <XCircle size={10} strokeWidth={2} /> {t('searchHistory.failed')}
    </span>
  )
}

const PAGE_SIZE = 20

export function SearchHistoryPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { data: searches, isLoading } = useRecentSearches()
  const deleteSearch = useDeleteSearch()
  const deleteAllSearches = useDeleteAllSearches()
  const formatDate = useFormatDate()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleSearches = searches?.slice(0, visibleCount) ?? []
  const hasMore = (searches?.length ?? 0) > visibleCount

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-4 min-h-[44px]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t('searchHistory.backToDashboard')}
        </button>
        <div className="flex items-center gap-3">
          <Clock size={20} strokeWidth={1.5} className="text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('searchHistory.heading')}</h1>
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">{t('searchHistory.subtitle')}</p>
        {searches && searches.length > 0 && (
          <button
            onClick={() => deleteAllSearches.mutate()}
            className="mt-3 text-xs font-data uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors min-h-[44px] flex items-center gap-1.5"
          >
            <Trash2 size={12} strokeWidth={1.5} />
            {t('search.clearHistory')}
          </button>
        )}
      </div>

      {/* Search List */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-low rounded-md animate-pulse" />
          ))}
          <span className="sr-only">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : !searches || searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <Clock size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('searchHistory.emptyTitle', 'No search history yet')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {t('searchHistory.emptyMessage', 'Run a search to see it here.')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleSearches.map((s) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`${t('searchHistory.heading')}: ${s.query}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (s.status === 'complete') navigate(`/search?q=${encodeURIComponent(s.query)}&saved=1&sid=${s.id}`) } }}
                onClick={() => { if (s.status === 'complete') navigate(`/search?q=${encodeURIComponent(s.query)}&saved=1&sid=${s.id}`) }}
                className={`bg-surface-container border border-outline-variant rounded-md p-4 transition-colors min-h-[44px] group ${
                  s.status === 'complete' ? 'cursor-pointer hover:bg-surface-container-high' : 'opacity-60'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-10 h-10 rounded-md bg-surface-container-highest flex items-center justify-center shrink-0">
                    <Search size={16} strokeWidth={1.5} className="text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{s.query}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[0.625rem] font-data text-on-surface-variant">{formatDate(s.timestamp)}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-data font-bold text-on-surface">{s.resultCount}</p>
                    <p className="text-[0.625rem] font-data text-on-surface-variant">{s.resultCount === 1 ? t('searchHistory.result', 'result') : t('searchHistory.results')}</p>
                  </div>
                  <button
                    aria-label={t('search.deleteQuery')}
                    className="opacity-50 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-sm text-on-surface-variant/70 hover:text-error hover:bg-error/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteSearch.mutate(s.id) }}
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="mt-4 w-full text-[0.625rem] font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors min-h-[44px] flex items-center justify-center gap-1.5 bg-surface-container border border-outline-variant rounded-md"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
              {t('searchHistory.showMore', { remaining: (searches?.length ?? 0) - visibleCount })}
            </button>
          )}
        </>
      )}
    </div>
  )
}
