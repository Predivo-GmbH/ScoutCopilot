import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { MockPlayer } from '../../../lib/mock-data'

export interface SearchParams {
  query: string
  position: string
  ageRange: string
  league: string
  foot: string
  minFitScore: number
  minPassAccuracy: number
  minProgCarries: number
}

// Shape returned by the search edge function
interface EdgeSearchResponse {
  search_id: string | null
  parsed_parameters: Record<string, unknown>
  results: Array<{
    player_external_id: string
    player_name: string
    rank: number
    fit_score: number
    fit_reasoning: string
    player_data: Record<string, unknown>
  }>
  total: number
}

function mapToMockPlayer(result: EdgeSearchResponse['results'][number]): MockPlayer {
  const d = result.player_data ?? {}
  const rawStats = (d.stats ?? {}) as Record<string, number>

  // Build a clean stats display object with the most relevant metrics
  const stats: Record<string, number> = {}
  if (rawStats.goals !== undefined) stats['Goals'] = rawStats.goals
  if (rawStats.assists !== undefined) stats['Assists'] = rawStats.assists
  if (rawStats.matches_played !== undefined) stats['Apps'] = rawStats.matches_played
  if (rawStats.xG !== undefined && rawStats.xG > 0) stats['xG'] = Number(rawStats.xG.toFixed(2))
  if (rawStats.xA !== undefined && rawStats.xA > 0) stats['xA'] = Number(rawStats.xA.toFixed(2))
  if (rawStats.key_passes !== undefined && rawStats.key_passes > 0) stats['Key Passes'] = rawStats.key_passes
  if (rawStats.pass_completion !== undefined && rawStats.pass_completion > 0) stats['Pass %'] = Number(rawStats.pass_completion.toFixed(1))
  if (rawStats.progressive_passes !== undefined && rawStats.progressive_passes > 0) stats['Prog. Passes'] = rawStats.progressive_passes
  if (rawStats.progressive_carries !== undefined && rawStats.progressive_carries > 0) stats['Prog. Carries'] = rawStats.progressive_carries
  if (rawStats.tackles !== undefined && rawStats.tackles > 0) stats['Tackles'] = rawStats.tackles
  if (rawStats.interceptions !== undefined && rawStats.interceptions > 0) stats['Interceptions'] = rawStats.interceptions
  if (rawStats.dribble_success_rate !== undefined && rawStats.dribble_success_rate > 0) stats['Dribble %'] = Number(rawStats.dribble_success_rate.toFixed(1))

  // If no stats were populated, show minutes at minimum
  if (Object.keys(stats).length === 0 && rawStats.minutes_played) {
    stats['Minutes'] = rawStats.minutes_played
  }

  return {
    id: result.player_external_id,
    name: result.player_name,
    age: (d.age as number) || 0,
    nationality: (d.nationality as string) || 'Unknown',
    position: (d.position as string) || 'Unknown',
    club: (d.team as string) || 'Unknown',
    league: (d.league as string) || 'Unknown',
    fitScore: Math.round(result.fit_score),
    stats,
    image: (d.photo_url as string) || undefined,
  }
}

export function usePlayerSearch() {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    position: 'All Positions',
    ageRange: 'All Ages',
    league: 'All Leagues',
    foot: 'Either Foot',
    minFitScore: 0,
    minPassAccuracy: 0,
    minProgCarries: 0,
  })
  const [hasSearched, setHasSearched] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState(0)

  const { data, isLoading } = useQuery<MockPlayer[]>({
    queryKey: ['player-search', searchTrigger],
    queryFn: async () => {
      const { data: responseData, error: fnError } = await supabase.functions.invoke('search', {
        body: { query: params.query },
      })

      if (fnError) {
        throw new Error(fnError.message ?? 'Search failed')
      }

      const response = responseData as EdgeSearchResponse

      if (!response.results || response.results.length === 0) {
        return []
      }

      let results = response.results.map(mapToMockPlayer)

      // Apply client-side dropdown filters on top of the AI-parsed results
      if (params.position !== 'All Positions') {
        results = results.filter((p) =>
          p.position.toLowerCase().includes(params.position.split(' ')[0].toLowerCase()),
        )
      }
      if (params.minFitScore > 0) {
        results = results.filter((p) => p.fitScore >= params.minFitScore)
      }

      return results
    },
    enabled: hasSearched && searchTrigger > 0,
  })

  function search(newParams?: Partial<SearchParams>) {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }))
    }
    setHasSearched(true)
    setSearchTrigger((t) => t + 1)
  }

  function updateFilters(updates: Partial<SearchParams>) {
    setParams((prev) => ({ ...prev, ...updates }))
  }

  return {
    params,
    results: data ?? [],
    isLoading,
    hasSearched,
    search,
    updateFilters,
  }
}
