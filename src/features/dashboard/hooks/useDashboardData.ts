import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type {
  DashboardStats,
  RecentSearch,
  WatchlistAlert,
} from '../../../lib/mock-data'

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [searchCount, reportCount, watchlistCount] = await Promise.all([
        supabase.from('search_queries').select('id', { count: 'exact', head: true }),
        supabase.from('player_reports').select('id', { count: 'exact', head: true }),
        supabase.from('watchlists').select('id', { count: 'exact', head: true }),
      ])

      const totalSearches = searchCount.count ?? 0
      const totalReports = reportCount.count ?? 0
      const totalWatchlists = watchlistCount.count ?? 0

      return {
        totalSearches,
        reportsGenerated: totalReports,
        playersTracked: totalWatchlists,
        apiCallsThisMonth: 0,
        items: [
          { value: totalSearches, label: 'mockData.playersAnalyzed', change: 0, period: '' },
          { value: totalWatchlists, label: 'mockData.activeWatchlists', change: 0, period: '' },
          { value: totalReports, label: 'mockData.playersScouted', change: 0, period: '' },
          { value: '—', label: 'mockData.avgQueryTime', change: 0, period: '' },
        ],
      }
    },
  })
}

export function useRecentSearches() {
  return useQuery<RecentSearch[]>({
    queryKey: ['dashboard', 'recent-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_queries')
        .select('id, query_text, result_count, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw new Error(error.message)

      return (data ?? []).map((row) => ({
        id: row.id,
        query: row.query_text,
        resultCount: row.result_count ?? 0,
        timestamp: row.created_at,
        status: 'complete' as const,
      }))
    },
  })
}

export function useWatchlistAlerts() {
  return useQuery<WatchlistAlert[]>({
    queryKey: ['dashboard', 'watchlist-alerts'],
    queryFn: async () => {
      // No real alert system yet — return empty for new users
      return []
    },
  })
}
