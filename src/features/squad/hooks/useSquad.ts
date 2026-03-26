import { useQuery } from '@tanstack/react-query'
import { squadPlayers, type SquadPlayer } from '../../../lib/mock-data'

export function useSquad() {
  const { data: players, isLoading } = useQuery<SquadPlayer[]>({
    queryKey: ['squad'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return squadPlayers
    },
  })

  return {
    players: players ?? [],
    isLoading,
  }
}
