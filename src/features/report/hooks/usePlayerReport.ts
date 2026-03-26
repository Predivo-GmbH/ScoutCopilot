import { useQuery } from '@tanstack/react-query'
import { playerReports, getSquadPlayerReport, type MockPlayerReport } from '../../../lib/mock-data'

export function usePlayerReport(playerId?: string) {
  return useQuery<MockPlayerReport>({
    queryKey: ['player-report', playerId],
    queryFn: async () => {
      // TODO: Replace with real API call
      await new Promise((r) => setTimeout(r, 500))
      const id = playerId ?? 'p1'
      return playerReports[id] ?? getSquadPlayerReport(id) ?? playerReports.p1
    },
    enabled: !!playerId,
  })
}
