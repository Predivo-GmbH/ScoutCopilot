import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
      const [searchCount, reportCount, watchlistCount, recentSearches] = await Promise.all([
        supabase.from('search_queries').select('id', { count: 'exact', head: true }),
        supabase.from('player_reports').select('id', { count: 'exact', head: true }),
        supabase.from('watchlists').select('id', { count: 'exact', head: true }),
        supabase.from('search_queries').select('created_at').order('created_at', { ascending: false }).limit(50),
      ])

      const totalSearches = searchCount.count ?? 0
      const totalReports = reportCount.count ?? 0
      const totalWatchlists = watchlistCount.count ?? 0

      // Calculate average time between searches as a proxy for query cadence
      let avgQueryDisplay: string | number = '—'
      const timestamps = (recentSearches.data ?? []).map((r) => new Date(r.created_at).getTime())
      if (timestamps.length >= 2) {
        const diffs: number[] = []
        for (let i = 0; i < timestamps.length - 1; i++) {
          diffs.push(timestamps[i] - timestamps[i + 1])
        }
        const avgMs = diffs.reduce((a, b) => a + b, 0) / diffs.length
        const avgSec = avgMs / 1000
        if (avgSec < 60) {
          avgQueryDisplay = `${Math.round(avgSec)}s`
        } else if (avgSec < 3600) {
          avgQueryDisplay = `${Math.round(avgSec / 60)}m`
        } else {
          avgQueryDisplay = `${Math.round(avgSec / 3600)}h`
        }
      }

      return {
        totalSearches,
        reportsGenerated: totalReports,
        playersTracked: totalWatchlists,
        apiCallsThisMonth: 0,
        items: [
          { value: totalSearches, label: 'mockData.playersAnalyzed', change: 0, period: '' },
          { value: totalWatchlists, label: 'mockData.activeWatchlists', change: 0, period: '' },
          { value: totalReports, label: 'mockData.playersScouted', change: 0, period: '' },
          { value: avgQueryDisplay, label: 'mockData.avgQueryTime', change: 0, period: '' },
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
        .limit(20)

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

export function useDeleteSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (searchId: string) => {
      // search_results cascade-delete via FK constraint
      const { error } = await supabase
        .from('search_queries')
        .delete()
        .eq('id', searchId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAllSearches() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('search_queries')
        .delete()
        .eq('user_id', user.id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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
