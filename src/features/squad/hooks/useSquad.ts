import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
// TODO [CQ-003]: Replace mock-data imports with real API calls via src/lib/api.ts
import { mockSquads, type MockSquad } from '../../../lib/mock-data'

export function useSquad() {
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null)

  const { data: squads, isLoading } = useQuery<MockSquad[]>({
    queryKey: ['squads'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return mockSquads
    },
  })

  const selectedSquad = squads?.find((s) => s.id === selectedSquadId) ?? null

  return {
    squads: squads ?? [],
    isLoading,
    selectedSquad,
    selectSquad: setSelectedSquadId,
    clearSelection: () => setSelectedSquadId(null),
  }
}
