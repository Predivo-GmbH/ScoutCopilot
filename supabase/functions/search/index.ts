// Search Edge Function — Natural language player search
// POST /search { query: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { parseSearchQuery, rankPlayers, type ParsedSearchParams } from "../_shared/claude.ts";
import { searchMockPlayers, type MockPlayer } from "../_shared/mock-data.ts";
import { searchPlayers as wyscoutSearch } from "../_shared/providers/wyscout.ts";
import { searchPlayers as statsbombSearch } from "../_shared/providers/statsbomb.ts";
import {
  searchPlayersByName as apiFootballSearch,
  mapToGenericPlayer,
} from "../_shared/providers/api-football.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

serve(async (req: Request) => {
  // CORS preflight
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth
    const auth = await getAuthContext(req);

    // Rate limit: 30 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 30 / 60, 30);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      );
    }

    // Parse body
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Parse NL query into structured parameters via Claude
    const parsedParams = await parseSearchQuery(query.trim());

    // Step 2: Fetch players from data provider (or mock)
    const useMock = Deno.env.get("MOCK_DATA") === "true";
    let rawPlayers: Record<string, unknown>[];

    if (useMock) {
      const mockResults = searchMockPlayers(parsedParams);
      rawPlayers = mockResults.map(mockToGeneric);
    } else {
      rawPlayers = await fetchFromProviders(auth.organizationId, parsedParams, query.trim());
    }

    if (rawPlayers.length === 0) {
      // Save empty search to DB
      const supabase = getServiceClient();
      await supabase.from("search_queries").insert({
        user_id: auth.userId,
        organization_id: auth.organizationId,
        query_text: query.trim(),
        parsed_parameters: parsedParams as Record<string, unknown>,
        result_count: 0,
      });

      return new Response(
        JSON.stringify({ results: [], parsed_parameters: parsedParams, total: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Rank players via Claude
    const ranked = await rankPlayers(query.trim(), parsedParams, rawPlayers);

    // Step 4: Save search query + results to DB
    const supabase = getServiceClient();
    const { data: searchQuery, error: sqError } = await supabase
      .from("search_queries")
      .insert({
        user_id: auth.userId,
        organization_id: auth.organizationId,
        query_text: query.trim(),
        parsed_parameters: parsedParams as Record<string, unknown>,
        result_count: ranked.length,
      })
      .select("id")
      .single();

    if (sqError) {
      console.error("Failed to save search query:", sqError.message);
    }

    if (searchQuery) {
      const resultRows = ranked.map((r) => ({
        search_query_id: searchQuery.id,
        player_external_id: r.player_external_id,
        player_name: r.player_name,
        player_data: {
          ...r.player_data,
          fit_reasoning: r.fit_reasoning,
        },
        rank: r.rank,
        fit_score: r.fit_score,
      }));

      const { error: srError } = await supabase
        .from("search_results")
        .insert(resultRows);

      if (srError) {
        console.error("Failed to save search results:", srError.message);
      }
    }

    // Step 5: Return results
    return new Response(
      JSON.stringify({
        search_id: searchQuery?.id ?? null,
        parsed_parameters: parsedParams,
        results: ranked,
        total: ranked.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Search error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────

function mockToGeneric(player: MockPlayer): Record<string, unknown> {
  return {
    player_external_id: player.player_external_id,
    player_name: player.player_name,
    age: player.age,
    nationality: player.nationality,
    position: player.position,
    positions: player.positions,
    foot: player.foot,
    height: player.height,
    weight: player.weight,
    team: player.team,
    league: player.league,
    market_value: player.market_value,
    contract_expiry: player.contract_expiry,
    stats: player.stats,
  };
}

async function fetchFromProviders(
  organizationId: string,
  params: ParsedSearchParams,
  rawQuery: string
): Promise<Record<string, unknown>[]> {
  const supabase = getServiceClient();
  const results: Record<string, unknown>[] = [];

  // Always include StatsBomb Open Data (free, no credentials needed)
  try {
    const sbOpenResults = await searchStatsBombOpenData(supabase, params);
    results.push(...sbOpenResults);
  } catch (err) {
    console.error("Error fetching StatsBomb open data:", (err as Error).message);
  }

  // Always include API-Football if API key is configured (global key, not per-org)
  if (Deno.env.get("API_FOOTBALL_KEY")) {
    try {
      // Use raw query as name search — works best for player name queries
      // For filter-based queries, StatsBomb open data handles it via DB
      const apiFootballResults = await apiFootballSearch(
        rawQuery,
        organizationId,
        undefined, // leagueId
        undefined  // season
      );
      results.push(...apiFootballResults.map(mapToGenericPlayer));
    } catch (err) {
      console.error("Error fetching API-Football data:", (err as Error).message);
    }
  }

  // Also check org's paid API credentials
  const { data: credentials } = await supabase
    .from("api_credentials")
    .select("provider, encrypted_credentials")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  // If no paid credentials and no open/free data results, give a helpful message
  if (!credentials?.length && results.length === 0) {
    throw new Error(
      "No players found. Add your Wyscout or StatsBomb credentials in Settings for broader search coverage."
    );
  }

  for (const cred of credentials ?? []) {
    try {
      if (cred.provider === "wyscout") {
        const wyCreds = cred.encrypted_credentials as { username: string; password: string };
        const players = await wyscoutSearch(
          wyCreds,
          {
            positions: params.positions ?? (params.position ? [params.position] : undefined),
            foot: params.foot,
            ageMin: params.age_min,
            ageMax: params.age_max,
            marketValueMin: params.market_value_min,
            marketValueMax: params.market_value_max,
            heightMin: params.height_min,
            heightMax: params.height_max,
            limit: params.limit ?? 50,
          },
          organizationId
        );
        results.push(
          ...players.map((p) => ({
            player_external_id: `wy-${p.playerId}`,
            player_name: p.shortName,
            age: calculateAge(p.birthDate),
            nationality: p.birthArea?.name ?? "Unknown",
            position: p.role?.code3 ?? "Unknown",
            foot: p.foot,
            height: p.height,
            weight: p.weight,
            team: p.currentTeam?.name ?? "Unknown",
            league: "Unknown",
            market_value: p.marketValue ?? 0,
            provider: "wyscout",
          }))
        );
      } else if (cred.provider === "statsbomb") {
        const sbCreds = cred.encrypted_credentials as { username: string; password: string };
        const players = await statsbombSearch(
          sbCreds,
          {
            positions: params.positions ?? (params.position ? [params.position] : undefined),
            limit: params.limit ?? 50,
          },
          organizationId
        );
        results.push(
          ...players.map((p) => ({
            player_external_id: `sb-${p.player_id}`,
            player_name: p.player_name,
            team: p.team_name,
            league: p.competition_name,
            stats: p.statistics,
            provider: "statsbomb",
          }))
        );
      }
    } catch (err) {
      console.error(`Error fetching from ${cred.provider}:`, (err as Error).message);
    }
  }

  return results;
}

// Search StatsBomb open data stored in Supabase (free, always available)
async function searchStatsBombOpenData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: ParsedSearchParams
): Promise<Record<string, unknown>[]> {
  // Build query against sb_player_season_stats joined with sb_players
  let query = supabase
    .from("sb_player_season_stats")
    .select(`
      *,
      sb_players!inner (
        player_id, player_name, player_nickname,
        nationality, primary_position, positions
      )
    `)
    .limit(params.limit ?? 50);

  // Filter by position
  const targetPositions =
    params.positions ?? (params.position ? [params.position] : null);
  if (targetPositions) {
    query = query.in(
      "sb_players.primary_position",
      targetPositions.map((p: string) => p.toUpperCase())
    );
  }

  // Filter by nationality
  if (params.nationality) {
    query = query.ilike("sb_players.nationality", `%${params.nationality}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("StatsBomb open data query error:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    player_external_id: `sb-open-${row.sb_players.player_id}`,
    player_name:
      row.sb_players.player_nickname ?? row.sb_players.player_name,
    age: 0, // not available in open data
    nationality: row.sb_players.nationality ?? "Unknown",
    position: row.sb_players.primary_position ?? "Unknown",
    positions: row.sb_players.positions ?? [],
    foot: "unknown",
    height: 0,
    weight: 0,
    team: row.team_name,
    league: `${row.competition_name} (${row.season_name})`,
    market_value: 0,
    contract_expiry: "",
    stats: {
      matches_played: row.matches_played,
      minutes_played: row.minutes_played,
      goals: row.goals,
      assists: row.assists,
      xG: Number(row.xg),
      xA: Number(row.xa),
      npxG: Number(row.npxg),
      key_passes: row.key_passes,
      passes_completed: row.passes_completed,
      pass_completion: Number(row.pass_completion),
      progressive_passes: row.progressive_passes,
      progressive_carries: row.progressive_carries,
      through_balls: row.through_balls,
      long_balls: row.long_balls,
      crosses: row.crosses,
      tackles: row.tackles,
      interceptions: row.interceptions,
      clearances: row.clearances,
      blocks: row.blocks,
      aerial_duels: row.aerial_duels,
      aerial_duel_win_rate: Number(row.aerial_duel_win_rate),
      ground_duels: row.ground_duels,
      ground_duel_win_rate: Number(row.ground_duel_win_rate),
      dribbles: row.dribbles,
      dribble_success_rate: Number(row.dribble_success_rate),
      pressures: row.pressures,
      shot_creating_actions: row.shot_creating_actions,
      goal_creating_actions: row.goal_creating_actions,
      yellow_cards: row.yellow_cards,
      red_cards: row.red_cards,
    },
    provider: "statsbomb-open",
  }));
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}
