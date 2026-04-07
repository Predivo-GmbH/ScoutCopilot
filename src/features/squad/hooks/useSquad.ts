import { useState } from 'react'
import type { MockSquad } from '../../../lib/mock-data'

// TODO [CQ-003]: Fetch squads from Supabase once `squads` table exists
export function useSquad() {
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null)

  // No DB table yet — return empty array so new users see the empty state
  const squads: MockSquad[] = []
  const isLoading = false

  const selectedSquad = squads?.find((s) => s.id === selectedSquadId) ?? null

  return {
    squads: squads ?? [],
    isLoading,
    selectedSquad,
    selectSquad: setSelectedSquadId,
    clearSelection: () => setSelectedSquadId(null),
  }
}
