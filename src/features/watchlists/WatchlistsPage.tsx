import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useWatchlists } from './hooks/useWatchlists'
import { WatchlistCard } from './components/WatchlistCard'
import { WatchlistDetail } from './components/WatchlistDetail'

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'transfer', label: 'Transfer Targets' },
  { key: 'youth', label: 'Youth Prospects' },
  { key: 'position', label: 'Position-Specific' },
] as const

export function WatchlistsPage() {
  const { lists, isLoading, filter, setFilter, selectedWatchlist, selectWatchlist, clearSelection } = useWatchlists()

  if (selectedWatchlist) {
    return (
      <div className="p-6">
        <WatchlistDetail watchlist={selectedWatchlist} onBack={clearSelection} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Watchlists</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Track and monitor your target players.</p>
        </div>
        <Button variant="primary" leftIcon={Plus}>New Watchlist</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
              filter === tab.key
                ? 'bg-surface-container-highest text-on-surface border border-primary/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lists.map((watchlist) => (
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              isSelected={false}
              onClick={() => selectWatchlist(watchlist.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
