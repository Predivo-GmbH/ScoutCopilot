import type { MockWatchlist } from '../../../lib/mock-data'

interface WatchlistCardProps {
  watchlist: MockWatchlist
  isSelected: boolean
  onClick: () => void
}

export function WatchlistCard({ watchlist, isSelected, onClick }: WatchlistCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container p-6 rounded-md border transition-all cursor-pointer group ${
        isSelected ? 'border-primary' : 'border-outline-variant hover:border-outline-variant/60'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold group-hover:text-primary transition-colors text-on-surface">
            {watchlist.name}
          </h3>
          <p className="text-xs text-on-surface-variant font-data mt-1 uppercase">
            Updated: {watchlist.lastUpdated}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-2 py-0.5 bg-surface-container-highest text-[0.625rem] font-semibold text-on-surface-variant rounded-sm uppercase tracking-tight">
            {watchlist.playerCount} Players
          </span>
          {watchlist.alertCount > 0 ? (
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[0.625rem] font-semibold rounded-sm border border-tertiary/20">
              {watchlist.alertCount} ALERTS
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[0.625rem] font-semibold rounded-sm uppercase">
              No Alerts
            </span>
          )}
        </div>
      </div>
      {watchlist.description && (
        <p className="text-xs text-on-surface-variant leading-relaxed">{watchlist.description}</p>
      )}
    </div>
  )
}
