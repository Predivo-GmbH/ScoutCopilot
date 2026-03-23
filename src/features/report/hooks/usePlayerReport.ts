import { useQuery } from '@tanstack/react-query'
import { alphonsoDaviesReport, type MockPlayerReport } from '../../../lib/mock-data'

export function usePlayerReport(playerId?: string) {
  return useQuery<MockPlayerReport>({
    queryKey: ['player-report', playerId],
    queryFn: async () => {
      // TODO: Replace with real API call
      await new Promise((r) => setTimeout(r, 500))
      // For demo, always return Davies report
      return alphonsoDaviesReport
    },
    enabled: !!playerId,
  })
}
