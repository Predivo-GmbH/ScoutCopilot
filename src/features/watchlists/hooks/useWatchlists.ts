import { useState } from 'react'
import { useWatchlistActions } from '../../../lib/WatchlistContext'
import type { MockWatchlist } from '../../../lib/mock-data'

export function useWatchlists() {
  const { watchlists, removePlayerFromWatchlist } = useWatchlistActions()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'transfer' | 'youth' | 'position'>('all')

  const selectedWatchlist: MockWatchlist | null = watchlists.find((w) => w.id === selectedWatchlistId) ?? null

  return {
    lists: watchlists,
    isLoading: false,
    filter,
    setFilter,
    selectedWatchlist,
    selectWatchlist: setSelectedWatchlistId,
    clearSelection: () => setSelectedWatchlistId(null),
    removePlayerFromWatchlist: (playerId: string) => {
      if (selectedWatchlistId) {
        removePlayerFromWatchlist(selectedWatchlistId, playerId)
      }
    },
  }
}
