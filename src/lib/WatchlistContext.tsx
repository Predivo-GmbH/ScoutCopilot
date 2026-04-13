import { useCallback, type ReactNode } from 'react'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from './supabase'
import { calculateAge } from './ageUtils'
import type { MockWatchlist, MockWatchlistPlayer } from './mock-data'
import { WatchlistContext } from './WatchlistContextDef'

const WATCHLISTS_KEY = ['watchlists'] as const

// ── Supabase fetch helpers ──────────────────────────────────────────────

async function fetchWatchlists(): Promise<MockWatchlist[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows, error } = await supabase
    .from('watchlists')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!rows || rows.length === 0) return []

  // Fetch players for all watchlists in a single query
  const watchlistIds = rows.map((r) => r.id)
  const { data: playerRows, error: playersError } = await supabase
    .from('watchlist_players')
    .select('*')
    .in('watchlist_id', watchlistIds)
    .order('added_at', { ascending: false })

  if (playersError) throw playersError

  // Group players by watchlist id
  const playersByWatchlist = new Map<string, MockWatchlistPlayer[]>()
  for (const p of playerRows ?? []) {
    const playerData = (p.player_data ?? {}) as Record<string, unknown>
    const mapped: MockWatchlistPlayer = {
      id: p.player_external_id,
      name: p.player_name,
      club: (playerData.club as string) ?? '',
      position: (playerData.position as string) ?? '',
      age: (playerData.age as number) ?? 0,
      birth_date: (playerData.birth_date as string) ?? undefined,
      nationality: (playerData.nationality as string) ?? '',
      image: (playerData.image as string) ?? undefined,
      keyMetric: (playerData.keyMetric as { value: string; label: string }) ?? { value: '—', label: '' },
      alertStatus: (playerData.alertStatus as MockWatchlistPlayer['alertStatus']) ?? 'stable',
      addedDate: p.added_at ?? '',
      scoutScore: (playerData.scoutScore as number) ?? 0,
    }
    const list = playersByWatchlist.get(p.watchlist_id)
    if (list) {
      list.push(mapped)
    } else {
      playersByWatchlist.set(p.watchlist_id, [mapped])
    }
  }

  return rows.map((row) => {
    const players = playersByWatchlist.get(row.id) ?? []

    // Count players added in the last 7 days as alerts
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentCount = players.filter((p) => {
      const added = new Date(p.addedDate).getTime()
      return !Number.isNaN(added) && added >= sevenDaysAgo
    }).length

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      playerCount: players.length,
      lastUpdated: row.updated_at ?? row.created_at,
      alertCount: recentCount,
      category: ((row as Record<string, unknown>).category as MockWatchlist['category']) ?? undefined,
      players,
    } satisfies MockWatchlist
  })
}

// ── Provider ────────────────────────────────────────────────────────────

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data: watchlists = [], isLoading } = useQuery({
    queryKey: WATCHLISTS_KEY,
    queryFn: fetchWatchlists,
    staleTime: 30_000,
  })

  // ── Create watchlist ────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async ({ name, description, category }: { name: string; description: string; category?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      if (!profile?.organization_id) throw new Error('No organization')

      const insertPayload: Record<string, unknown> = { name, description, user_id: user.id, organization_id: profile.organization_id }
      if (category && category !== 'all') insertPayload.category = category

      const { data, error } = await supabase
        .from('watchlists')
        .insert(insertPayload as { name: string; description: string; user_id: string; organization_id: string })
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLISTS_KEY })
    },
  })

  const createWatchlist = useCallback(
    async (name: string, description: string, category?: string): Promise<string> => {
      return createMutation.mutateAsync({ name, description, category })
    },
    [createMutation],
  )

  // ── Delete watchlist ────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (watchlistId: string) => {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', watchlistId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLISTS_KEY })
    },
  })

  const deleteWatchlist = useCallback(
    (watchlistId: string) => {
      deleteMutation.mutate(watchlistId)
    },
    [deleteMutation],
  )

  // ── Add player to watchlist ─────────────────────────────────────────

  const addPlayerMutation = useMutation({
    mutationFn: async ({ watchlistId, player, notes }: { watchlistId: string; player: MockWatchlistPlayer; notes?: string }) => {
      const { error } = await supabase
        .from('watchlist_players')
        .insert({
          watchlist_id: watchlistId,
          player_external_id: player.id,
          player_name: player.name,
          notes: notes?.trim() || null,
          player_data: {
            club: player.club,
            position: player.position,
            age: calculateAge(player.birth_date) ?? player.age,
            birth_date: player.birth_date,
            nationality: player.nationality,
            image: player.image,
            keyMetric: player.keyMetric,
            alertStatus: player.alertStatus,
            scoutScore: player.scoutScore,
          },
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLISTS_KEY })
    },
  })

  const addPlayerToWatchlist = useCallback(
    (watchlistId: string, player: MockWatchlistPlayer, notes?: string) => {
      addPlayerMutation.mutate({ watchlistId, player, notes })
    },
    [addPlayerMutation],
  )

  // ── Remove player from watchlist ────────────────────────────────────

  const removePlayerMutation = useMutation({
    mutationFn: async ({ watchlistId, playerId }: { watchlistId: string; playerId: string }) => {
      const { error } = await supabase
        .from('watchlist_players')
        .delete()
        .eq('watchlist_id', watchlistId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLISTS_KEY })
    },
  })

  const removePlayerFromWatchlist = useCallback(
    (watchlistId: string, playerId: string) => {
      removePlayerMutation.mutate({ watchlistId, playerId })
    },
    [removePlayerMutation],
  )

  // ── Update watchlist (rename / description) ────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
      const { error } = await supabase
        .from('watchlists')
        .update({ name, description })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLISTS_KEY })
    },
  })

  const updateWatchlist = useCallback(
    (id: string, name: string, description: string) => {
      updateMutation.mutate({ id, name, description })
    },
    [updateMutation],
  )

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        isLoading,
        addPlayerToWatchlist,
        removePlayerFromWatchlist,
        createWatchlist,
        deleteWatchlist,
        updateWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}
