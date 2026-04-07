import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
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

/** Map a player_reports row into the comparison format */
function reportToComparison(row: {
  id: string
  player_external_id: string
  player_name: string
  report_data: Record<string, unknown>
}): MockComparisonPlayer {
  const d = row.report_data

  const seasonStats = (d.seasonStats ?? {}) as Record<string, number | string>
  const minutes = typeof seasonStats['Minutes'] === 'number' ? seasonStats['Minutes'] : 0
  const per90 = minutes > 0 ? minutes / 90 : 1

  const goals = typeof seasonStats['Goals'] === 'number' ? seasonStats['Goals'] : 0
  const assists = typeof seasonStats['Assists'] === 'number' ? seasonStats['Assists'] : 0
  const passAcc = typeof seasonStats['Pass Accuracy'] === 'string'
    ? parseFloat(seasonStats['Pass Accuracy'])
    : typeof seasonStats['Pass Accuracy'] === 'number' ? seasonStats['Pass Accuracy'] : 0
  const tacklesWon = typeof seasonStats['Tackles Won'] === 'number' ? seasonStats['Tackles Won'] : 0
  const aerialDuels = typeof seasonStats['Aerial Duels Won'] === 'string'
    ? parseFloat(seasonStats['Aerial Duels Won'])
    : typeof seasonStats['Aerial Duels Won'] === 'number' ? seasonStats['Aerial Duels Won'] : 0
  const keyPasses90 = typeof seasonStats['Key Passes/90'] === 'number' ? seasonStats['Key Passes/90'] : 0
  const progCarries90 = typeof seasonStats['Prog. Carries/90'] === 'number' ? seasonStats['Prog. Carries/90'] : 0

  const radarRaw = Array.isArray(d.radarData)
    ? (d.radarData as { label: string; value: number }[]).map((r) => ({
        label: r.label,
        value: r.value,
      }))
    : []

  return {
    id: row.player_external_id,
    name: row.player_name,
    club: (d.club as string) ?? '',
    position: (d.position as string) ?? '',
    age: typeof d.age === 'number' ? d.age : 0,
    nationality: (d.nationality as string) ?? '',
    image: (d.image as string) ?? '',
    metrics: {
      'Goals/90': Number((goals / per90).toFixed(2)),
      'Assists/90': Number((assists / per90).toFixed(2)),
      'Pass %': passAcc,
      'Tackles/90': Number((tacklesWon / per90).toFixed(1)),
      'Key Passes/90': keyPasses90,
      'Aerial Won %': aerialDuels,
      'Prog. Carries/90': progCarries90,
    },
    radarData: radarRaw,
  }
}

export function useComparison() {
  const [searchParams, setSearchParams] = useSearchParams()

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
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
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
  }
}
