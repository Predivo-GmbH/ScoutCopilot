import { useQuery } from '@tanstack/react-query'
import { playerReports, type MockPlayerReport } from '../../../lib/mock-data'

export function usePlayerReport(playerId?: string) {
  return useQuery<MockPlayerReport>({
    queryKey: ['player-report', playerId],
    queryFn: async () => {
      // TODO: Replace with real API call
      await new Promise((r) => setTimeout(r, 500))
      return playerReports[playerId ?? 'p1'] ?? playerReports.p1
    },
    enabled: !!playerId,
  })
}
