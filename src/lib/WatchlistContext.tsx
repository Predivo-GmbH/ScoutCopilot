import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { watchlists as initialWatchlists, type MockWatchlist, type MockWatchlistPlayer } from './mock-data'

interface WatchlistContextValue {
  watchlists: MockWatchlist[]
  addPlayerToWatchlist: (watchlistId: string, player: MockWatchlistPlayer) => void
  removePlayerFromWatchlist: (watchlistId: string, playerId: string) => void
  createWatchlist: (name: string, description: string) => string
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<MockWatchlist[]>(initialWatchlists)

  const addPlayerToWatchlist = useCallback((watchlistId: string, player: MockWatchlistPlayer) => {
    setLists((prev) =>
      prev.map((w) => {
        if (w.id !== watchlistId) return w
        if (w.players.some((p) => p.id === player.id)) return w
        return {
          ...w,
          players: [...w.players, player],
          playerCount: w.playerCount + 1,
          lastUpdated: 'Just now',
        }
      }),
    )
  }, [])

  const removePlayerFromWatchlist = useCallback((watchlistId: string, playerId: string) => {
    setLists((prev) =>
      prev.map((w) => {
        if (w.id !== watchlistId) return w
        return {
          ...w,
          players: w.players.filter((p) => p.id !== playerId),
          playerCount: Math.max(0, w.playerCount - 1),
          lastUpdated: 'Just now',
        }
      }),
    )
  }, [])

  const createWatchlist = useCallback((name: string, description: string): string => {
    const id = `w${Date.now()}`
    setLists((prev) => [
      {
        id,
        name,
        description,
        playerCount: 0,
        lastUpdated: 'Just now',
        alertCount: 0,
        players: [],
      },
      ...prev,
    ])
    return id
  }, [])

  return (
    <WatchlistContext.Provider value={{ watchlists: lists, addPlayerToWatchlist, removePlayerFromWatchlist, createWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlistActions() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlistActions must be used within WatchlistProvider')
  return ctx
}
