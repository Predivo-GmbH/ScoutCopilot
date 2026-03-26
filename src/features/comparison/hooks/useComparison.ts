import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { comparisonPlayers, type MockComparisonPlayer } from '../../../lib/mock-data'

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tacticalContext, setTacticalContext] = useState('')
  const [generated, setGenerated] = useState(false)

  const { data: players, isLoading, refetch } = useQuery<MockComparisonPlayer[]>({
    queryKey: ['comparison', selectedIds],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 2000))
      return comparisonPlayers.filter((p) => selectedIds.includes(p.id))
    },
    enabled: generated && selectedIds.length >= 2,
  })

  function addPlayer(id: string) {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id])
      setGenerated(false)
    }
  }

  function removePlayer(id: string) {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
    setGenerated(false)
  }

  function generate() {
    if (selectedIds.length >= 2) {
      setGenerated(true)
      refetch()
    }
  }

  // Available players that haven't been selected yet
  const availablePlayers = comparisonPlayers.filter((p) => !selectedIds.includes(p.id))

  // Get selected player data without the query (for cards display)
  const selectedPlayers = comparisonPlayers.filter((p) => selectedIds.includes(p.id))

  return {
    players: players ?? [],
    selectedPlayers,
    selectedIds,
    availablePlayers,
    tacticalContext,
    setTacticalContext,
    isLoading,
    generated,
    addPlayer,
    removePlayer,
    generate,
  }
}
