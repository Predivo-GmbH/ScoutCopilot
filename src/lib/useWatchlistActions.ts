import { useContext } from 'react'
import { WatchlistContext, type WatchlistContextValue } from './WatchlistContextDef'

export function useWatchlistActions(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlistActions must be used within WatchlistProvider')
  return ctx
}
