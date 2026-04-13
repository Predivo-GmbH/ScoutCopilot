import { createContext } from 'react'
import type { MockWatchlist, MockWatchlistPlayer } from './mock-data'

export interface WatchlistContextValue {
  watchlists: MockWatchlist[]
  isLoading: boolean
  addPlayerToWatchlist: (watchlistId: string, player: MockWatchlistPlayer, notes?: string) => void
  removePlayerFromWatchlist: (watchlistId: string, playerId: string) => void
  createWatchlist: (name: string, description: string, category?: string) => Promise<string>
  deleteWatchlist: (watchlistId: string) => void
  updateWatchlist: (id: string, name: string, description: string) => void
}

export const WatchlistContext = createContext<WatchlistContextValue | null>(null)
