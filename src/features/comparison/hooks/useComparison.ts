import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { playerReports, getSquadPlayerReport, type MockComparisonPlayer } from '../../../lib/mock-data'
import { useGeneratedReports } from '../../../lib/useGeneratedReportsHook'

/** Convert a player report into the comparison format */
function reportToComparison(id: string): MockComparisonPlayer | null {
  const r = playerReports[id] ?? getSquadPlayerReport(id)
  if (!r) return null
  return {
    id: r.playerId,
    name: r.playerName,
    club: r.club,
    position: r.position,
    age: r.age,
    nationality: r.nationality,
    image: r.image ?? '',
    metrics: {
      'Goals/90': r.seasonStats['Goals'] != null && r.seasonStats['Minutes'] != null
        ? Number(((r.seasonStats['Goals'] as number) / ((r.seasonStats['Minutes'] as number) / 90)).toFixed(2))
        : 0,
      'Assists/90': r.seasonStats['Assists'] != null && r.seasonStats['Minutes'] != null
        ? Number(((r.seasonStats['Assists'] as number) / ((r.seasonStats['Minutes'] as number) / 90)).toFixed(2))
        : 0,
      'Pass %': typeof r.seasonStats['Pass Accuracy'] === 'string'
        ? parseFloat(r.seasonStats['Pass Accuracy'] as string)
        : 0,
      'Tackles/90': r.seasonStats['Tackles Won'] != null && r.seasonStats['Minutes'] != null
        ? Number(((r.seasonStats['Tackles Won'] as number) / ((r.seasonStats['Minutes'] as number) / 90)).toFixed(1))
        : 0,
      'Key Passes/90': (r.seasonStats['Key Passes/90'] as number) ?? 0,
      'Aerial Won %': typeof r.seasonStats['Aerial Duels Won'] === 'string'
        ? parseFloat(r.seasonStats['Aerial Duels Won'] as string)
        : 0,
      'Prog. Carries/90': (r.seasonStats['Prog. Carries/90'] as number) ?? 0,
    },
    radarData: r.radarData.map((d) => ({ label: d.label, value: d.value })),
  }
}

export function useComparison() {
  const { generatedReportIds } = useGeneratedReports()
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

  // All scouted players available for comparison — include selected players even if not yet generated
  const allPlayers = useMemo(() => {
    const ids = new Set([...generatedReportIds, ...selectedIds])
    return Array.from(ids)
      .map((id) => reportToComparison(id))
      .filter((p): p is MockComparisonPlayer => p !== null)
  }, [generatedReportIds, selectedIds])

  const { data: players, isLoading, refetch } = useQuery<MockComparisonPlayer[]>({
    queryKey: ['comparison', selectedIds],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 2000))
      return allPlayers.filter((p) => selectedIds.includes(p.id))
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
    isLoading,
    generated,
    addPlayer,
    removePlayer,
    generate,
  }
}
