import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
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
    age: typeof rd.age === 'number' ? rd.age : 0,
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
    similarPlayers: [],
    transferHistory: [],
    contractInfo: { value: '-', until: '-', wage: '-', agent: '-' },
  }
}

export function usePlayerReport(playerId?: string) {
  return useQuery<MockPlayerReport>({
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
            .single()
          if (player?.photo_url) {
            report.image = player.photo_url
          }
        }
      }

      return report
    },
    enabled: !!playerId,
  })
}
