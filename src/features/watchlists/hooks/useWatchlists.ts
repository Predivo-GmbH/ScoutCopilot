import { useState, useMemo } from 'react'
import { useWatchlistActions } from '../../../lib/useWatchlistActions'
import type { MockWatchlist } from '../../../lib/mock-data'

export function useWatchlists() {
  const { watchlists, isLoading, removePlayerFromWatchlist, deleteWatchlist } = useWatchlistActions()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'transfer' | 'youth' | 'position'>('all')

  const filteredLists = useMemo(() => {
    if (filter === 'all') return watchlists
    return watchlists.filter((w) => w.category === filter)
  }, [watchlists, filter])

  const selectedWatchlist: MockWatchlist | null = watchlists.find((w) => w.id === selectedWatchlistId) ?? null

  return {
    lists: filteredLists,
    isLoading,
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
    deleteWatchlist,
  }
}
