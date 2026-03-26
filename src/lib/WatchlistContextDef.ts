import { createContext } from 'react'
import type { MockWatchlist, MockWatchlistPlayer } from './mock-data'

export interface WatchlistContextValue {
  watchlists: MockWatchlist[]
  addPlayerToWatchlist: (watchlistId: string, player: MockWatchlistPlayer) => void
  removePlayerFromWatchlist: (watchlistId: string, playerId: string) => void
  createWatchlist: (name: string, description: string) => string
  deleteWatchlist: (watchlistId: string) => void
}

export const WatchlistContext = createContext<WatchlistContextValue | null>(null)
