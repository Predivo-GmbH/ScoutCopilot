import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'
import { calculateAge } from '../../../lib/ageUtils'
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

// Human-readable labels for raw stat keys
const STAT_LABELS: Record<string, string> = {
  matches_played: 'Apps',
  minutes_played: 'Mins',
  goals: 'Goals',
  assists: 'Assists',
  xg: 'xG',
  xa: 'xA',
  npxg: 'npxG',
  key_passes: 'Key Pass',
  passes_completed: 'Pass Cmp',
  pass_completion: 'Pass %',
  progressive_passes: 'Prog Pass',
  progressive_carries: 'Prog Carry',
  tackles: 'Tackles',
  interceptions: 'Int.',
  clearances: 'Clr',
  blocks: 'Blocks',
  aerial_duels: 'Aerial',
  aerial_duel_win_rate: 'Aerial %',
  ground_duels: 'Ground',
  ground_duel_win_rate: 'Ground %',
  dribbles: 'Dribbles',
  dribble_success_rate: 'Drib %',
  pressures: 'Press',
  shot_creating_actions: 'SCA',
  goal_creating_actions: 'GCA',
  yellow_cards: 'YC',
  red_cards: 'RC',
}

// Percentage-type stats that should be formatted with 1 decimal
const PCT_STATS = new Set([
  'pass_completion', 'aerial_duel_win_rate', 'ground_duel_win_rate', 'dribble_success_rate',
])

// xG-type stats formatted with 2 decimals
const XG_STATS = new Set(['xg', 'xa', 'npxg'])

function mapToMockPlayer(result: EdgeSearchResponse['results'][number]): MockPlayer {
  const d = result.player_data ?? {}
  const rawStats = (d.stats ?? {}) as Record<string, number>

  // Include all stats with readable labels, skip zero-only noise
  const stats: Record<string, number> = {}
  for (const [key, value] of Object.entries(rawStats)) {
    if (value === undefined || value === null) continue
    // Skip stats that are always 0 and not meaningful
    if (value === 0 && !['goals', 'assists', 'yellow_cards', 'red_cards'].includes(key)) continue
    const label = STAT_LABELS[key] ?? key
    if (PCT_STATS.has(key)) {
      stats[label] = Number(value.toFixed(1))
    } else if (XG_STATS.has(key)) {
      stats[label] = Number(value.toFixed(2))
    } else {
      stats[label] = value
    }
  }

  const photoUrl = (d.photo_url as string) || undefined
  const photoSource = (d.photo_source as MockPlayer['photoSource']) ?? derivePhotoSource(photoUrl)

  return {
    id: result.player_external_id,
    name: result.player_name,
    age: calculateAge(d.birth_date as string) ?? (d.age as number) ?? 0,
    birth_date: (d.birth_date as string) || undefined,
    nationality: (d.nationality as string) || 'Unknown',
    position: (d.position as string) || 'Unknown',
    club: (d.team as string) || 'Unknown',
    league: (d.league as string) || 'Unknown',
    fitScore: Math.round(result.fit_score),
    stats,
    image: photoUrl,
    photoSource,
  }
}

export function usePlayerSearch() {
  const queryClient = useQueryClient()
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
  // When set, load results from DB instead of calling the edge function
  const [savedSearchId, setSavedSearchId] = useState<string | null>(null)
  // Track which player IDs are currently having photos generated
  const [photoLoadingIds, setPhotoLoadingIds] = useState<Set<string>>(new Set())

  // Trigger background photo generation for players missing photos in saved searches
  const fetchMissingPhotos = useCallback(async (players: MockPlayer[]) => {
    const needsPhoto = players.filter(
      (p) => !p.image && p.id.startsWith('sb-open-')
    )
    if (needsPhoto.length === 0) return

    const playerIds = needsPhoto
      .map((p) => parseInt(p.id.replace('sb-open-', ''), 10))
      .filter((id) => !isNaN(id))

    if (playerIds.length === 0) return

    // Mark these players as loading
    setPhotoLoadingIds(new Set(needsPhoto.map((p) => p.id)))

    try {
      const { data: photoData } = await supabase.functions.invoke('generate-photo', {
        body: { player_ids: playerIds },
      })

      if (photoData?.results) {
        // Update query cache with fetched photos
        queryClient.setQueryData<MockPlayer[]>(
          ['player-search', searchTrigger],
          (old) => {
            if (!old) return old
            return old.map((player) => {
              const rawId = parseInt(player.id.replace('sb-open-', ''), 10)
              const photoResult = photoData.results.find(
                (r: { player_id: number; photo_url?: string }) => r.player_id === rawId
              )
              if (photoResult?.photo_url) {
                return {
                  ...player,
                  image: photoResult.photo_url,
                  photoSource: derivePhotoSource(photoResult.photo_url),
                }
              }
              return player
            })
          }
        )
      }
    } catch {
      // Non-blocking: photos will appear next time
    } finally {
      setPhotoLoadingIds(new Set())
    }
  }, [queryClient, searchTrigger])

  const { data, isLoading } = useQuery<MockPlayer[]>({
    queryKey: ['player-search', searchTrigger],
    queryFn: async () => {
      // Load cached results from DB (no AI credits)
      if (savedSearchId) {
        const { data: rows, error } = await supabase
          .from('search_results')
          .select('player_external_id, player_name, player_data, rank, fit_score')
          .eq('search_query_id', savedSearchId)
          .order('rank', { ascending: true })

        if (error) throw new Error(error.message)
        if (!rows || rows.length === 0) return []

        const mapped = rows.map((row) => mapToMockPlayer({
          player_external_id: row.player_external_id,
          player_name: row.player_name,
          rank: row.rank,
          fit_score: row.fit_score ?? 0,
          fit_reasoning: (row.player_data as Record<string, unknown>)?.fit_reasoning as string ?? '',
          player_data: row.player_data as Record<string, unknown>,
        }))

        // Trigger background photo fetch for players without images
        fetchMissingPhotos(mapped)

        return mapped
      }

      // Fresh search via edge function (uses AI credits)
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

  function clearResults() {
    queryClient.setQueryData(['player-search', searchTrigger], [])
  }

  function search(newParams?: Partial<SearchParams>) {
    setSavedSearchId(null)
    setPhotoLoadingIds(new Set())
    // Clear stale results from the previous query immediately
    clearResults()
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }))
    }
    setHasSearched(true)
    setSearchTrigger((t) => t + 1)
  }

  function loadSaved(searchId: string, query: string) {
    // Clear stale results from the previous query immediately
    clearResults()
    setSavedSearchId(searchId)
    setParams((prev) => ({ ...prev, query }))
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
    photoLoadingIds,
    clearResults,
    search,
    loadSaved,
    updateFilters,
  }
}
