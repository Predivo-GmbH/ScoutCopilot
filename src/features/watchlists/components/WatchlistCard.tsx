import { useTranslation } from 'react-i18next'
import { Trash2, Pencil } from 'lucide-react'
import type { MockWatchlist } from '../../../lib/mock-data'

function useFormatDate() {
  const { t } = useTranslation()
  return function formatDate(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
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

interface WatchlistCardProps {
  watchlist: MockWatchlist
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  onEdit: () => void
}

export function WatchlistCard({ watchlist, isSelected, onClick, onDelete, onEdit }: WatchlistCardProps) {
  const { t } = useTranslation()
  const formatDate = useFormatDate()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${t('watchlists.heading')}: ${watchlist.name}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className={`bg-surface-container p-3 sm:p-5 rounded-md border transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 ${
        isSelected ? 'border-primary' : 'border-outline-variant hover:border-outline-variant/60'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold group-hover:text-primary transition-colors text-on-surface truncate">
            {watchlist.name}
          </h3>
          <p className="text-xs text-on-surface-variant font-data mt-1 uppercase">
            {t('watchlists.updated')} {formatDate(watchlist.lastUpdated)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 bg-surface-container-highest text-[0.625rem] font-semibold text-on-surface-variant rounded-sm uppercase tracking-tight whitespace-nowrap">
              {watchlist.playerCount} {t('common.players')}
            </span>
            {watchlist.alertCount > 0 ? (
              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[0.625rem] font-semibold rounded-sm border border-tertiary/20 whitespace-nowrap">
                {watchlist.alertCount} {t('watchlists.alerts')}
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[0.625rem] font-semibold rounded-sm uppercase whitespace-nowrap">
                {t('watchlists.noAlerts')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-2 text-on-surface-variant md:text-on-surface-variant/0 md:group-hover:text-on-surface-variant hover:bg-surface-container-high rounded-sm transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('watchlists.editWatchlist', 'Edit watchlist')}
            title={t('watchlists.editWatchlist', 'Edit watchlist')}
          >
            <Pencil size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 text-error md:text-error/0 md:group-hover:text-error hover:bg-error/10 rounded-sm transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('watchlists.deleteWatchlist')}
            title={t('watchlists.deleteWatchlist')}
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {watchlist.description && (
        <p className="text-xs text-on-surface-variant leading-relaxed">{watchlist.description}</p>
      )}
    </div>
  )
}
