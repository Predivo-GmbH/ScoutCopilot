import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import {
  Search,
  FileText,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  GitCompareArrows,
} from 'lucide-react'
import { useDashboardStats, useRecentSearches, useWatchlistAlerts } from './hooks/useDashboardData'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: searches, isLoading: searchesLoading } = useRecentSearches()
  const { data: alerts, isLoading: alertsLoading } = useWatchlistAlerts()

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            {t('dashboard.heading')}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">{t('dashboard.subheading')}</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md border border-outline-variant shrink-0">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[0.625rem] font-data font-medium uppercase tracking-widest text-on-surface-variant">{t('dashboard.systemLive')}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4" role={statsLoading ? 'status' : undefined} aria-live={statsLoading ? 'polite' : undefined}>
        {stats?.items.map((item) => {
          const locale = t('common.locale', 'en-GB')
          const displayValue = typeof item.value === 'string'
            ? item.value
            : item.value.toLocaleString(locale)
          return (
            <div
              key={item.label}
              className="bg-surface-container border border-outline-variant p-3 sm:p-5 rounded-md flex flex-col justify-between min-h-[90px] sm:min-h-[110px]"
            >
              <p className="text-[0.625rem] font-data uppercase tracking-widest text-on-surface-variant truncate">{t(item.label)}</p>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl sm:text-3xl font-data font-bold text-on-surface">
                  {displayValue}
                </span>
                <div className="flex items-center gap-2">
                  {item.change > 0 && (
                    <span className="text-xs font-data font-medium text-secondary inline-flex items-center gap-0.5">
                      <TrendingUp size={12} strokeWidth={1.5} />
                      +{item.change}%
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[0.625rem] font-data font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                      {t(item.badge)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {statsLoading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container border border-outline-variant p-5 rounded-md">
                <div className="h-3 w-24 bg-surface-container-high rounded-sm animate-pulse mb-8" />
                <div className="h-8 w-20 bg-surface-container-high rounded-sm animate-pulse" />
              </div>
            ))}
            <span className="sr-only">{t('common.loading', 'Loading...')}</span>
          </>
        )}
      </div>

      {/* Two-Column: Recent Searches + Watchlist Alerts */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Recent Searches */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Clock size={14} strokeWidth={1.5} className="text-primary" />
                {t('dashboard.recentSearches')}
              </h3>
              <button
                onClick={() => navigate('/search-history')}
                className="text-[0.625rem] font-data uppercase text-primary hover:underline min-h-[44px] flex items-center gap-1"
              >
                {t('dashboard.viewAll')} <ArrowRight size={10} strokeWidth={1.5} />
              </button>
            </div>
            {searchesLoading ? (
              <div className="p-6 space-y-3" role="status" aria-live="polite">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-container-high rounded-sm animate-pulse" />
                ))}
                <span className="sr-only">{t('common.loading', 'Loading...')}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="px-3 sm:px-6 py-3 text-[0.625rem] font-data font-bold text-on-surface-variant uppercase tracking-wider">{t('dashboard.query')}</th>
                    <th className="px-3 sm:px-4 py-3 text-[0.625rem] font-data font-bold text-on-surface-variant uppercase tracking-wider text-right">{t('dashboard.results')}</th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-[0.625rem] font-data font-bold text-on-surface-variant uppercase tracking-wider">{t('dashboard.date')}</th>
                    <th className="px-3 sm:px-4 py-3 text-[0.625rem] font-data font-bold text-on-surface-variant uppercase tracking-wider">{t('dashboard.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {searches?.slice(0, 5).map((search) => (
                    <tr
                      key={search.id}
                      tabIndex={0}
                      role="link"
                      className="min-h-[44px] hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(search.query)}&saved=1`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(search.query)}&saved=1`) } }}
                    >
                      <td className="px-3 sm:px-6 py-3 text-xs font-medium text-on-surface max-w-[200px] sm:max-w-[320px] truncate">
                        {search.query}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs font-data text-on-surface-variant text-right">
                        {search.resultCount}
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-[0.625rem] font-data text-on-surface-variant">
                        {formatDate(search.timestamp)}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <StatusBadge status={search.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Alerts */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
            <button
              onClick={() => navigate('/alerts')}
              className="w-full px-3 sm:px-4 py-4 border-b border-outline-variant flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Zap size={14} strokeWidth={1.5} className="text-tertiary" />
                {t('dashboard.watchlistAlerts')}
              </h3>
              <span className="text-[0.625rem] font-data font-medium text-on-error-container bg-error-container px-2 py-0.5 rounded-sm">
                {String(alerts?.length ?? 0).padStart(2, '0')} {t('dashboard.new')}
              </span>
            </button>
            {alertsLoading ? (
              <div className="p-3 space-y-3" role="status" aria-live="polite">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-surface-container-high rounded-sm animate-pulse" />
                ))}
                <span className="sr-only">{t('common.loading', 'Loading...')}</span>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {alerts?.slice(0, 4).map((alert) => {
                  const borderColor = alert.changeType === 'warning' ? 'border-l-warning' : 'border-l-tertiary'
                  return (
                    <div
                      key={alert.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/players/${alert.playerId}`, { state: { alert } }) }}
                      onClick={() => navigate(`/players/${alert.playerId}`, { state: { alert } })}
                      className="p-3 rounded-sm border border-outline-variant/50 cursor-pointer hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <PlayerAvatar name={alert.playerName} size={36} imageUrl={alert.imageUrl} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-on-surface leading-tight">{alert.playerName}</h4>
                          <p className="text-[0.625rem] font-data text-on-surface-variant">{alert.club}</p>
                        </div>
                        <span className="text-[0.625rem] font-data text-on-surface-variant/70 shrink-0">{alert.timeAgo}</span>
                      </div>
                      <div className={`bg-surface-container-lowest p-2 rounded-sm border-l-2 ${borderColor}`}>
                        <p className={`text-xs leading-relaxed ${
                          alert.changeType === 'positive' ? 'text-secondary font-data' :
                          alert.changeType === 'warning' ? 'text-warning font-data' :
                          'text-on-surface-variant'
                        }`}>
                          {alert.change}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {(alerts?.length ?? 0) > 4 && (
                  <button
                    onClick={() => navigate('/alerts')}
                    className="w-full py-2.5 text-[0.625rem] font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    {t('dashboard.viewAllAlerts', { count: alerts?.length })}
                    <ArrowRight size={12} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions — at the bottom, matching Stitch */}
      <div>
        <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant mb-4">{t('dashboard.quickActions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/search') }}
            onClick={() => navigate('/search')}
            className="relative bg-surface-container border border-outline-variant p-4 sm:p-6 rounded-md text-left cursor-pointer hover:bg-surface-container-high transition-colors overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
            <Search size={24} strokeWidth={1.5} className="text-primary mb-3" />
            <h4 className="text-on-surface font-bold mb-1">{t('dashboard.newPlayerSearch')}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{t('dashboard.newPlayerSearchSub')}</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/players') }}
            onClick={() => navigate('/players')}
            className="relative bg-surface-container border border-outline-variant p-4 sm:p-6 rounded-md text-left cursor-pointer hover:bg-surface-container-high transition-colors overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
            <FileText size={24} strokeWidth={1.5} className="text-primary mb-3" />
            <h4 className="text-on-surface font-bold mb-1">{t('dashboard.viewPlayers')}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{t('dashboard.viewPlayersSub')}</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/compare') }}
            onClick={() => navigate('/compare')}
            className="relative bg-surface-container border border-outline-variant p-4 sm:p-6 rounded-md text-left cursor-pointer hover:bg-surface-container-high transition-colors overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
            <GitCompareArrows size={24} strokeWidth={1.5} className="text-primary mb-3" />
            <h4 className="text-on-surface font-bold mb-1">{t('dashboard.comparePlayers')}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{t('dashboard.comparePlayersSub')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const styles: Record<string, string> = {
    complete: 'bg-secondary/10 text-secondary border-secondary/20',
    processing: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    failed: 'bg-error/10 text-error border-error/20',
  }
  const labels: Record<string, string> = {
    complete: t('dashboard.complete'),
    processing: t('dashboard.processing'),
    failed: t('dashboard.failed'),
  }
  const style = styles[status] ?? styles.complete
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[0.625rem] font-data font-medium ${style} border`}>
      {labels[status] ?? status.toUpperCase()}
    </span>
  )
}
