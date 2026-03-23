import { supabase } from './supabase'

// ── Types ─────────────────────────────────────────────────────────

export interface SearchResult {
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

export interface ScoutingReport {
  report_id: string | null
  player_external_id: string
  player_name: string
  report: {
    summary: string
    strengths: string[]
    weaknesses: string[]
    style_of_play: string
    stats_analysis: Record<string, unknown>
    recommendation: string
    fit_contexts: string[]
  }
  created_at: string
}

export interface PlayerComparison {
  comparison_id: string | null
  comparison: {
    title: string
    players: Array<{
      player_external_id: string
      player_name: string
      overall_rank: number
      per_metric_ranks: Record<string, number>
      highlights: string[]
    }>
    analysis: string
    recommendation: string
  }
  created_at: string
}

// ── API Functions ─────────────────────────────────────────────────

/**
 * Natural language player search.
 * Sends query to the search edge function which parses it via Claude,
 * fetches from Wyscout/StatsBomb, ranks results, and returns a shortlist.
 */
export async function searchPlayers(query: string): Promise<SearchResult> {
  const { data, error } = await supabase.functions.invoke('search', {
    body: { query },
  })
  if (error) throw new Error(error.message ?? 'Search failed')
  return data as SearchResult
}

/**
 * Generate an AI scouting report for a specific player.
 */
export async function generateReport(
  playerId: string,
  playerName: string
): Promise<ScoutingReport> {
  const { data, error } = await supabase.functions.invoke('report', {
    body: { player_external_id: playerId, player_name: playerName },
  })
  if (error) throw new Error(error.message ?? 'Report generation failed')
  return data as ScoutingReport
}

/**
 * Head-to-head comparison of 2-10 players.
 * Optional tactical context for comparison (e.g., "4-3-3 high press").
 */
export async function comparePlayers(
  playerIds: string[],
  context?: string
): Promise<PlayerComparison> {
  const { data, error } = await supabase.functions.invoke('compare', {
    body: { player_ids: playerIds, context },
  })
  if (error) throw new Error(error.message ?? 'Comparison failed')
  return data as PlayerComparison
}
