import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { calculateAge } from '../../../lib/ageUtils'
import type { MockComparisonPlayer } from '../../../lib/mock-data'

export interface ComparisonVerdict {
  title: string
  analysis: string
  recommendation: string
  players: Array<{
    player_external_id: string
    player_name: string
    overall_rank: number
    per_metric_ranks: Record<string, number>
    highlights: string[]
  }>
}

/**
 * Build radar chart data from computed metrics.
 * Each metric is normalised to 0-100 using sensible per-90 ceilings so the
 * polygon is meaningful even without a dedicated radarData payload from Claude.
 */
const RADAR_METRIC_CONFIG: { key: string; label: string; max: number }[] = [
  { key: 'Goals/90',          label: 'Goals',    max: 1.0  },
  { key: 'Assists/90',        label: 'Assists',  max: 0.8  },
  { key: 'Key Passes/90',     label: 'Chances',  max: 3.0  },
  { key: 'Pass %',            label: 'Passing',  max: 100  },
  { key: 'Prog. Carries/90',  label: 'Carries',  max: 8.0  },
  { key: 'Tackles/90',        label: 'Tackles',  max: 4.0  },
  { key: 'Aerial Won %',      label: 'Aerials',  max: 100  },
]

function buildRadarFromMetrics(metrics: Record<string, number>): { label: string; value: number }[] {
  return RADAR_METRIC_CONFIG.map(({ key, label, max }) => {
    const raw = metrics[key] ?? 0
    // Clamp between 0 and 100
    const value = Math.min(100, Math.max(0, Math.round((raw / max) * 100)))
    return { label, value }
  })
}

/** Extract a numeric value from an object, trying multiple key names */
function statVal(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = parseFloat(v)
      if (!isNaN(n)) return n
    }
  }
  return 0
}

/** Map a player_reports row into the comparison format */
function reportToComparison(row: {
  id: string
  player_external_id: string
  player_name: string
  report_data: Record<string, unknown>
}): MockComparisonPlayer {
  const d = row.report_data

  // Try Claude-generated seasonStats first, then fall back to rawStats (stored raw provider data)
  const seasonStats = (d.seasonStats ?? {}) as Record<string, number | string>
  const raw = (d.rawStats ?? {}) as Record<string, unknown>
  const rawNestedStats = (raw.stats ?? raw) as Record<string, unknown>

  // Extract stats from multiple possible key names (seasonStats keys vs rawStats keys)
  const minutes = statVal(seasonStats, 'Minutes') || statVal(rawNestedStats, 'minutes_played')
  const per90 = minutes > 0 ? minutes / 90 : 1

  const goals = statVal(seasonStats, 'Goals') || statVal(rawNestedStats, 'goals')
  const assists = statVal(seasonStats, 'Assists') || statVal(rawNestedStats, 'assists')
  const passAcc = statVal(seasonStats, 'Pass Accuracy', 'Pass %') || statVal(rawNestedStats, 'pass_completion')
  const tacklesWon = statVal(seasonStats, 'Tackles Won', 'Tackles') || statVal(rawNestedStats, 'tackles')
  const aerialDuels = statVal(seasonStats, 'Aerial Duels Won', 'Aerial Won %') || statVal(rawNestedStats, 'aerial_duel_win_rate')
  const keyPassesRaw = statVal(seasonStats, 'Key Passes/90') || (statVal(rawNestedStats, 'key_passes') / per90)
  const progCarriesRaw = statVal(seasonStats, 'Prog. Carries/90') || (statVal(rawNestedStats, 'progressive_carries') / per90)

  const metrics: Record<string, number> = {
    'Goals/90': Number((goals / per90).toFixed(2)),
    'Assists/90': Number((assists / per90).toFixed(2)),
    'Pass %': passAcc,
    'Tackles/90': Number((tacklesWon / per90).toFixed(1)),
    'Key Passes/90': Number(keyPassesRaw.toFixed(2)),
    'Aerial Won %': aerialDuels,
    'Prog. Carries/90': Number(progCarriesRaw.toFixed(2)),
  }

  const radarRaw = Array.isArray(d.radarData) && d.radarData.length > 0
    ? (d.radarData as { label: string; value: number }[]).map((r) => ({
        label: r.label,
        value: r.value,
      }))
    : []

  // Fallback: compute radar data from metrics when radarData is missing
  const radarFinal = radarRaw.length > 0 ? radarRaw : buildRadarFromMetrics(metrics)

  return {
    id: row.player_external_id,
    name: row.player_name,
    club: (d.club as string) ?? (raw.team as string) ?? '',
    position: (d.position as string) ?? '',
    age: calculateAge(d.birth_date as string) ?? (typeof d.age === 'number' ? d.age : 0),
    birth_date: (d.birth_date as string) ?? undefined,
    nationality: (d.nationality as string) ?? '',
    image: (d.image as string) ?? '',
    metrics,
    radarData: radarFinal,
  }
}

// ── Comparison History Hooks ──────────────────────────────────────

export interface RecentComparison {
  id: string
  title: string
  player_ids: string[]
  created_at: string
}

export function useRecentComparisons() {
  return useQuery<RecentComparison[]>({
    queryKey: ['comparison', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_comparisons')
        .select('id, title, player_ids, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw new Error(error.message)
      return (data ?? []) as RecentComparison[]
    },
  })
}

export function useDeleteComparison() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (comparisonId: string) => {
      const { error } = await supabase
        .from('player_comparisons')
        .delete()
        .eq('id', comparisonId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison', 'history'] })
    },
  })
}

export function useDeleteAllComparisons() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('player_comparisons')
        .delete()
        .eq('user_id', user.id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison', 'history'] })
    },
  })
}

// ── Main Comparison Hook ─────────────────────────────────────────

export function useComparison(maxPlayers = 4) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Read initial player from URL param (e.g. /compare?add=p1)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const addId = searchParams.get('add')
    return addId ? [addId] : []
  })
  const [tacticalContext, setTacticalContext] = useState('')
  const [generated, setGenerated] = useState(false)

  // Clear the URL param after reading it (via state setter to avoid lint issues)
  if (searchParams.has('add')) {
    setSearchParams({}, { replace: true })
  }

  // Fetch all scouted player reports from Supabase (RLS-scoped to the logged-in user)
  const { data: scoutedPlayers = [], isLoading: isLoadingPlayers } = useQuery<MockComparisonPlayer[]>({
    queryKey: ['comparison', 'scouted-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_reports')
        .select('id, player_external_id, player_name, report_data')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data ?? []).map(reportToComparison)
    },
    staleTime: 60_000,
  })

  // All scouted players available for comparison — include selected players even if added via URL
  const allPlayers = useMemo(() => {
    // Ensure any URL-added player that exists in scouted list is included
    return scoutedPlayers
  }, [scoutedPlayers])

  const [verdict, setVerdict] = useState<ComparisonVerdict | null>(null)

  const { data: players, isLoading: isLoadingComparison, refetch } = useQuery<MockComparisonPlayer[]>({
    queryKey: ['comparison', selectedIds],
    queryFn: async () => {
      const matched = allPlayers.filter((p) => selectedIds.includes(p.id))

      // Call the compare edge function for AI verdict
      try {
        const { data, error } = await supabase.functions.invoke('compare', {
          body: { player_ids: selectedIds, context: tacticalContext || undefined },
        })
        if (!error && data?.comparison) {
          setVerdict(data.comparison as ComparisonVerdict)
        } else {
          setVerdict(null)
        }
      } catch {
        setVerdict(null)
      }

      return matched
    },
    enabled: generated && selectedIds.length >= 2,
  })

  function addPlayer(id: string) {
    if (selectedIds.length < maxPlayers && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id])
      setGenerated(false)
    }
  }

  function removePlayer(id: string) {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id))
    setGenerated(false)
  }

  function generate() {
    if (selectedIds.length >= 2) {
      setGenerated(true)
      refetch()
    }
  }

  const resetComparison = useCallback(() => {
    setSelectedIds([])
    setVerdict(null)
    setGenerated(false)
    setTacticalContext('')
  }, [])

  const loadSavedComparison = useCallback(async (comparisonId: string) => {
    const { data, error } = await supabase
      .from('player_comparisons')
      .select('*')
      .eq('id', comparisonId)
      .single()

    if (error || !data) return

    const ids = data.player_ids as string[]
    const comparisonData = data.comparison_data as Record<string, unknown> | null
    setSelectedIds(ids)
    if (comparisonData) {
      setVerdict(comparisonData as unknown as ComparisonVerdict)
    }
    setGenerated(true)
    // Invalidate so the query re-runs with the new selectedIds
    queryClient.invalidateQueries({ queryKey: ['comparison', ids] })
  }, [queryClient])

  const availablePlayers = allPlayers.filter((p) => !selectedIds.includes(p.id))
  const selectedPlayers = allPlayers.filter((p) => selectedIds.includes(p.id))

  return {
    players: players ?? [],
    selectedPlayers,
    selectedIds,
    availablePlayers,
    tacticalContext,
    setTacticalContext,
    isLoading: isLoadingComparison,
    isLoadingPlayers,
    generated,
    verdict,
    addPlayer,
    removePlayer,
    generate,
    resetComparison,
    loadSavedComparison,
  }
}
