import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { comparisonPlayers, type MockComparisonPlayer } from '../../../lib/mock-data'

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['cp1', 'cp2'])
  const [tacticalContext, setTacticalContext] = useState('')

  const { data: players, isLoading } = useQuery<MockComparisonPlayer[]>({
    queryKey: ['comparison', selectedIds],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return comparisonPlayers.filter((p) => selectedIds.includes(p.id))
    },
    enabled: selectedIds.length >= 2,
  })

  function addPlayer(id: string) {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id])
    }
  }

  function removePlayer(id: string) {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
  }

  return {
    players: players ?? [],
    selectedIds,
    tacticalContext,
    setTacticalContext,
    isLoading,
    addPlayer,
    removePlayer,
  }
}
