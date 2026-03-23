import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { watchlists, type MockWatchlist } from '../../../lib/mock-data'

export function useWatchlists() {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'transfer' | 'youth' | 'position'>('all')

  const { data: lists, isLoading } = useQuery<MockWatchlist[]>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return watchlists
    },
  })

  const selectedWatchlist = lists?.find((w) => w.id === selectedWatchlistId) ?? null

  return {
    lists: lists ?? [],
    isLoading,
    filter,
    setFilter,
    selectedWatchlist,
    selectWatchlist: setSelectedWatchlistId,
    clearSelection: () => setSelectedWatchlistId(null),
  }
}
