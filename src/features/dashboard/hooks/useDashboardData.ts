import { useQuery } from '@tanstack/react-query'
import {
  dashboardStats,
  recentSearches,
  watchlistAlerts,
  type DashboardStats,
  type RecentSearch,
  type WatchlistAlert,
} from '../../../lib/mock-data'

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // TODO: Replace with real API call
      await new Promise((r) => setTimeout(r, 300))
      return dashboardStats
    },
  })
}

export function useRecentSearches() {
  return useQuery<RecentSearch[]>({
    queryKey: ['dashboard', 'recent-searches'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return recentSearches
    },
  })
}

export function useWatchlistAlerts() {
  return useQuery<WatchlistAlert[]>({
    queryKey: ['dashboard', 'watchlist-alerts'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 250))
      return watchlistAlerts
    },
  })
}
