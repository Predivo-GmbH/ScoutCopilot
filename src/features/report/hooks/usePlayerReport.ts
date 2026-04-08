import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { calculateAge } from '../../../lib/ageUtils'
import type { MockPlayerReport } from '../../../lib/mock-data'

function mapRecommendation(raw: unknown): 'sign' | 'monitor' | 'pass' {
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase()
    if (lower.includes('sign')) return 'sign'
    if (lower.includes('pass') || lower.includes('avoid')) return 'pass'
  }
  return 'monitor'
}

function mapDbToReport(row: {
  player_external_id: string
  player_name: string
  report_data: Record<string, unknown>
}): MockPlayerReport {
  const rd = row.report_data ?? {}
  const statsAnalysis = (rd.stats_analysis ?? {}) as Record<string, Record<string, unknown>>

  // Build season stats from stats_analysis categories
  const seasonStats: Record<string, number | string> = {}
  for (const [category, info] of Object.entries(statsAnalysis)) {
    if (info && typeof info === 'object' && 'key_metrics' in info) {
      const metrics = info.key_metrics as Record<string, number | string>
      for (const [key, value] of Object.entries(metrics)) {
        seasonStats[key] = value
      }
    }
    if (info && typeof info === 'object' && 'rating' in info) {
      seasonStats[`${category}_rating`] = info.rating as string
    }
  }

  // Build radar data from stats_analysis ratings
  const ratingToValue: Record<string, number> = { A: 90, B: 75, C: 55, D: 35 }
  const radarData = Object.entries(statsAnalysis).map(([category, info]) => {
    const rating = typeof info?.rating === 'string' ? info.rating : 'C'
    return {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: ratingToValue[rating] ?? 55,
      average: 55,
    }
  })
  // Ensure we have at least some radar data
  if (radarData.length === 0) {
    radarData.push(
      { label: 'Attacking', value: 55, average: 55 },
      { label: 'Defending', value: 55, average: 55 },
      { label: 'Passing', value: 55, average: 55 },
      { label: 'Physical', value: 55, average: 55 },
    )
  }

  return {
    playerId: row.player_external_id,
    playerName: row.player_name,
    age: calculateAge(rd.birth_date as string) ?? (typeof rd.age === 'number' ? rd.age : 0),
    birth_date: (rd.birth_date as string) ?? undefined,
    nationality: (rd.nationality as string) ?? '',
    position: (rd.position as string) ?? '',
    club: (rd.team as string) ?? (rd.club as string) ?? '',
    league: (rd.league as string) ?? '',
    image: rd.image as string | undefined,
    summary: (rd.summary as string) ?? '',
    strengths: (rd.strengths as string[]) ?? [],
    weaknesses: (rd.weaknesses as string[]) ?? [],
    styleOfPlay: (rd.style_of_play as string) ?? '',
    recommendation: mapRecommendation(rd.recommendation),
    fitScore: typeof rd.fit_score === 'number' ? rd.fit_score : 0,
    seasonStats,
    radarData,
    similarPlayers: Array.isArray(rd.similar_players)
      ? (rd.similar_players as Array<Record<string, unknown>>).map((sp) => {
          // DB-driven similar players have a numeric player_id from sb_players
          const rawId = sp.player_id ?? sp.playerId
          const numericId = typeof rawId === 'number' ? rawId : (typeof rawId === 'string' && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : undefined)
          // Format as sb-open-{id} for routing, or leave undefined for AI-generated entries
          const playerId = numericId ? `sb-open-${numericId}` : (typeof rawId === 'string' && rawId ? rawId : undefined)
          return {
            playerId,
            name: (sp.name as string) ?? '',
            club: (sp.club as string) ?? '',
            age: calculateAge(sp.birth_date as string) ?? (typeof sp.age === 'number' ? sp.age : 0),
            birth_date: (sp.birth_date as string) ?? undefined,
            similarity: typeof sp.similarity_pct === 'number' ? sp.similarity_pct : 0,
            image: (sp.photo_url as string) ?? (sp.image as string) ?? undefined,
            photo_url: (sp.photo_url as string) ?? undefined,
          }
        })
      : [],
    transferHistory: Array.isArray(rd.transfer_history)
      ? (rd.transfer_history as Array<Record<string, unknown>>).map((t) => ({
          club: (t.club as string) ?? '',
          date: (t.date as string) ?? '',
          fee: (t.fee as string) ?? 'Unknown',
        }))
      : [],
    contractInfo: {
      value: ((rd.contract_info as Record<string, unknown>)?.estimated_value as string) ?? '-',
      until: ((rd.contract_info as Record<string, unknown>)?.contract_status as string) ?? '-',
      wage: '-',
      agent: ((rd.contract_info as Record<string, unknown>)?.agent as string) ?? '-',
    },
  }
}

export function usePlayerReport(playerId?: string) {
  const queryClient = useQueryClient()
  const fetchedRef = useRef<string | null>(null)

  const query = useQuery<MockPlayerReport>({
    queryKey: ['player-report', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_reports')
        .select('*')
        .eq('player_external_id', playerId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error) throw error

      const report = mapDbToReport(data)

      // Fetch photo_url from sb_players if this is a StatsBomb player
      if (playerId?.startsWith('sb-open-')) {
        const rawId = parseInt(playerId.replace('sb-open-', ''), 10)
        if (!isNaN(rawId)) {
          const { data: player } = await supabase
            .from('sb_players')
            .select('photo_url')
            .eq('player_id', rawId)
            .single() as { data: { photo_url: string | null } | null }
          if (player?.photo_url) {
            report.image = player.photo_url
          } else {
            // No photo yet — trigger fetch in background
            supabase.functions.invoke('generate-photo', {
              body: { player_ids: [rawId] },
            }).catch(() => {})
          }
        }
      }

      return report
    },
    enabled: !!playerId,
  })

  // Background fetch photos for similar players that have sb-open- IDs but no image
  useEffect(() => {
    const report = query.data
    if (!report || !playerId) return
    // Only fetch once per report
    if (fetchedRef.current === playerId) return

    const needsPhoto = report.similarPlayers.filter(
      (sp) => !sp.image && sp.playerId?.startsWith('sb-open-')
    )
    if (needsPhoto.length === 0) return

    fetchedRef.current = playerId
    const playerIds = needsPhoto
      .map((sp) => parseInt(sp.playerId!.replace('sb-open-', ''), 10))
      .filter((id) => !isNaN(id))

    if (playerIds.length === 0) return

    supabase.functions
      .invoke('generate-photo', { body: { player_ids: playerIds } })
      .then(({ data: photoData }) => {
        if (!photoData?.results) return
        // Update the cached report with the fetched photos
        queryClient.setQueryData<MockPlayerReport>(
          ['player-report', playerId],
          (old) => {
            if (!old) return old
            return {
              ...old,
              similarPlayers: old.similarPlayers.map((sp) => {
                if (sp.image || !sp.playerId?.startsWith('sb-open-')) return sp
                const rawId = parseInt(sp.playerId.replace('sb-open-', ''), 10)
                const result = photoData.results.find(
                  (r: { player_id: number; photo_url?: string }) => r.player_id === rawId
                )
                if (result?.photo_url) {
                  return { ...sp, image: result.photo_url, photo_url: result.photo_url }
                }
                return sp
              }),
            }
          }
        )
      })
      .catch(() => {})
  }, [query.data, playerId, queryClient])

  return query
}
