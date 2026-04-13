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
      const [searchCount, reportCount, watchlistCount, comparisonCount] = await Promise.all([
        supabase.from('search_queries').select('id', { count: 'exact', head: true }),
        supabase.from('player_reports').select('id', { count: 'exact', head: true }),
        supabase.from('watchlists').select('id', { count: 'exact', head: true }),
        supabase.from('player_comparisons').select('id', { count: 'exact', head: true }),
      ])

      const totalSearches = searchCount.count ?? 0
      const totalReports = reportCount.count ?? 0
      const totalWatchlists = watchlistCount.count ?? 0
      const totalComparisons = comparisonCount.count ?? 0

      return {
        totalSearches,
        reportsGenerated: totalReports,
        playersTracked: totalWatchlists,
        apiCallsThisMonth: 0,
        items: [
          { value: totalSearches, label: 'mockData.searchesPerformed', change: 0, period: '' },
          { value: totalWatchlists, label: 'mockData.activeWatchlists', change: 0, period: '' },
          { value: totalReports, label: 'mockData.playersScouted', change: 0, period: '' },
          { value: totalComparisons, label: 'mockData.comparisonsMade', change: 0, period: '' },
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
        .limit(100)

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
      // 1. Fetch all watchlist players with their watchlist name
      const { data: wpRows, error: wpError } = await supabase
        .from('watchlist_players')
        .select('player_external_id, player_name, player_data, added_at, watchlist_id, watchlists(name)')
        .order('added_at', { ascending: false })

      if (wpError) throw new Error(wpError.message)
      if (!wpRows || wpRows.length === 0) return []

      const playerIds = [...new Set(wpRows.map((r) => r.player_external_id))]

      // 2. Fetch player reports for these players
      const { data: reportRows } = await supabase
        .from('player_reports')
        .select('player_external_id, created_at')
        .in('player_external_id', playerIds)
        .order('created_at', { ascending: false })

      // Index latest report date per player
      const latestReportByPlayer = new Map<string, string>()
      for (const r of reportRows ?? []) {
        if (!latestReportByPlayer.has(r.player_external_id)) {
          latestReportByPlayer.set(r.player_external_id, r.created_at)
        }
      }

      const now = Date.now()
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
      const alerts: WatchlistAlert[] = []
      const seen = new Set<string>() // dedupe by player+type

      for (const wp of wpRows) {
        const playerData = (wp.player_data ?? {}) as Record<string, unknown>
        const watchlistName = (wp.watchlists as { name: string } | null)?.name ?? ''
        const addedAtMs = new Date(wp.added_at).getTime()
        const image = (playerData.image as string) ?? undefined
        const club = (playerData.club as string) ?? ''

        // Alert: New report available
        const latestReport = latestReportByPlayer.get(wp.player_external_id)
        if (latestReport && new Date(latestReport).getTime() > addedAtMs) {
          const key = `${wp.player_external_id}:report`
          if (!seen.has(key)) {
            seen.add(key)
            alerts.push({
              id: key,
              playerId: wp.player_external_id,
              playerName: wp.player_name,
              club,
              changeKey: 'alerts.newReportAvailable',
              changeParams: { watchlist: watchlistName },
              changeType: 'positive',
              timeAgo: formatTimeAgo(new Date(latestReport).getTime(), now),
              imageUrl: image,
            })
          }
        }

        // Alert: Recently added (last 7 days)
        if (now - addedAtMs < sevenDaysMs) {
          const key = `${wp.player_external_id}:recent`
          if (!seen.has(key)) {
            seen.add(key)
            alerts.push({
              id: key,
              playerId: wp.player_external_id,
              playerName: wp.player_name,
              club,
              changeKey: 'alerts.recentlyAdded',
              changeParams: { watchlist: watchlistName },
              changeType: 'neutral',
              timeAgo: formatTimeAgo(addedAtMs, now),
              imageUrl: image,
            })
          }
        }

        // Alert: Transfer rumor
        const transferHistory = playerData.transferHistory as
          | { date: string }[]
          | undefined
        if (Array.isArray(transferHistory)) {
          const hasNewTransfer = transferHistory.some(
            (t) => new Date(t.date).getTime() > addedAtMs,
          )
          if (hasNewTransfer) {
            const key = `${wp.player_external_id}:transfer`
            if (!seen.has(key)) {
              seen.add(key)
              alerts.push({
                id: key,
                playerId: wp.player_external_id,
                playerName: wp.player_name,
                club,
                changeKey: 'alerts.transferActivity',
              changeParams: { watchlist: watchlistName },
                changeType: 'warning',
                timeAgo: formatTimeAgo(addedAtMs, now),
                imageUrl: image,
              })
            }
          }
        }
      }

      // Sort by most recent first (timeAgo is display text, so sort by raw time)
      return alerts
    },
  })
}

/** Format a timestamp into a human-readable relative string */
function formatTimeAgo(timestampMs: number, nowMs: number): string {
  const diffMs = nowMs - timestampMs
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}
