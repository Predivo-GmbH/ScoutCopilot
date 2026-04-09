// Search Edge Function — Natural language player search
// POST /search { query: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { type SupabaseClient } from "npm:@supabase/supabase-js@2";
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

/** Escape PostgREST special characters to prevent filter injection */
function escapePostgREST(s: string): string {
  return s.replace(/[,.*()%]/g, "");
}

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

    // Step 1: Parse NL query into structured parameters via Claude (with fallback)
    let parsedParams: ParsedSearchParams;
    try {
      parsedParams = await parseSearchQuery(query.trim());
    } catch (parseErr) {
      console.error("Claude parse failed, using text fallback:", (parseErr as Error).message);
      parsedParams = fallbackParseQuery(query.trim());
    }

    // Step 2: Fetch players from data provider (or mock)
    const useMock = Deno.env.get("MOCK_DATA") === "true";
    let rawPlayers: Record<string, unknown>[];

    // Detect if query looks like a player name:
    // Either Claude explicitly set player_name, or no structured filters were extracted
    const isNameSearch = !!parsedParams.player_name || (
      !parsedParams.position && !parsedParams.positions?.length
      && !parsedParams.league && !parsedParams.leagues?.length
      && !parsedParams.nationality && !parsedParams.foot
      && !parsedParams.age_min && !parsedParams.age_max
    );

    if (useMock) {
      const mockResults = searchMockPlayers(parsedParams);
      rawPlayers = mockResults.map(mockToGeneric);
    } else if (isNameSearch) {
      // Name-based search: use parsed player_name if available, otherwise raw query
      const nameToSearch = parsedParams.player_name ?? query.trim();
      rawPlayers = await searchStatsBombByName(getServiceClient(), escapePostgREST(nameToSearch));

      // Also search API-Football by name
      if (Deno.env.get("API_FOOTBALL_KEY")) {
        try {
          const apiFootballResults = await apiFootballSearch(
            nameToSearch, auth.organizationId
          );
          rawPlayers.push(...apiFootballResults.map(mapToGenericPlayer));
        } catch (err) {
          console.error("API-Football name search error:", (err as Error).message);
        }
      }
    } else {
      rawPlayers = await fetchFromProviders(auth.organizationId, parsedParams, query.trim());
    }

    if (rawPlayers.length === 0) {
      // Last resort: text search on player names in StatsBomb data
      rawPlayers = await searchStatsBombByName(getServiceClient(), escapePostgREST(query.trim()));
    }

    // Deduplicate players from different providers (e.g. StatsBomb + API-Football)
    rawPlayers = deduplicatePlayers(rawPlayers);

    // Enrich StatsBomb players with current club + birth_date from API-Football (cached)
    if (rawPlayers.length > 0) {
      rawPlayers = await enrichWithCurrentData(rawPlayers, auth.organizationId);
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

    // Build a lookup of all raw player data before ranking (Claude strips it)
    const playerDataLookup = new Map<string, Record<string, unknown>>();
    for (const p of rawPlayers) {
      playerDataLookup.set(p.player_external_id as string, p);
    }

    // Step 3: Rank players via Claude (with fallback to basic scoring)
    let ranked;
    try {
      ranked = await rankPlayers(query.trim(), parsedParams, rawPlayers);
    } catch (rankErr) {
      console.error("Claude ranking failed, using basic scoring:", (rankErr as Error).message);
      ranked = rawPlayers.map((p, i) => ({
        player_external_id: p.player_external_id as string,
        player_name: p.player_name as string,
        rank: i + 1,
        fit_score: 70,
        fit_reasoning: "Ranked by data match (AI ranking unavailable)",
        player_data: p,
      }));
    }

    // Merge original player data back into ranked results
    // Claude ranking only returns id/name/score — all other fields get lost
    for (const r of ranked) {
      const original = playerDataLookup.get(r.player_external_id);
      if (original) {
        r.player_data = {
          ...original,
          ...(r.player_data ?? {}),
          fit_reasoning: r.fit_reasoning,
        };
      }
    }

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

    // Step 5: Trigger photo/metadata enrichment for StatsBomb players missing photos or age
    const playersNeedingEnrichment = ranked
      .filter((r) => {
        if (!r.player_external_id.startsWith("sb-open-")) return false;
        const data = r.player_data as Record<string, unknown> | undefined;
        return !data?.photo_url || !data?.age || data.age === 0;
      })
      .map((r) => parseInt(r.player_external_id.replace("sb-open-", ""), 10))
      .filter((id) => !isNaN(id));

    if (playersNeedingEnrichment.length > 0) {
      // Fetch photos + metadata from TheSportsDB (instant) and update results before returning
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
      try {
        const photoResp = await fetch(`${supabaseUrl}/functions/v1/generate-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player_ids: playersNeedingEnrichment, include_metadata: true }),
        });
        if (photoResp.ok) {
          const photoData = await photoResp.json();
          // Merge fetched photos and metadata back into ranked results
          for (const pr of photoData.results ?? []) {
            const extId = `sb-open-${pr.player_id}`;
            const match = ranked.find((r) => r.player_external_id === extId);
            if (!match) continue;
            const pd = match.player_data as Record<string, unknown>;
            if (pr.photo_url) {
              pd.photo_url = pr.photo_url;
              pd.photo_source = pr.source ?? (pr.photo_url.includes('thesportsdb.com') ? 'sportsdb' : 'stitch');
            }
            // Enrich age from TheSportsDB birth_date
            if (pr.birth_date && (!pd.age || pd.age === 0)) {
              pd.age = calculateAge(pr.birth_date);
              pd.birth_date = pr.birth_date;
            }
            // Enrich height/weight if missing
            if (pr.height && (!pd.height || pd.height === 0)) {
              pd.height = pr.height;
            }
            if (pr.weight && (!pd.weight || pd.weight === 0)) {
              pd.weight = pr.weight;
            }
          }
        }
      } catch (err) {
        console.error("Photo fetch failed (non-blocking):", (err as Error).message);
      }
    }

    // Step 6: Return results
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

// ── Enrichment: current club + birth_date from API-Football (cached) ──

const ENRICHMENT_TTL_DAYS = 30;

/**
 * Enrich StatsBomb players with current club, league, and birth_date from
 * API-Football. Uses a Supabase cache table to avoid burning through the
 * free-tier 100 req/day limit.
 *
 * Flow per player:
 * 1. Check player_enrichment_cache — if fresh (< TTL), use cached data
 * 2. If stale/missing AND API_FOOTBALL_KEY set, search API-Football by name
 * 3. Upsert result into cache
 * 4. Override team/league/birth_date on the player record
 */
async function enrichWithCurrentData(
  players: Record<string, unknown>[],
  organizationId: string
): Promise<Record<string, unknown>[]> {
  const supabase = getServiceClient();
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");

  // Only enrich StatsBomb players (they have historical team data)
  const sbPlayers = players.filter(
    (p) => (p.provider === "statsbomb-open") && (p.player_external_id as string).startsWith("sb-open-")
  );

  if (sbPlayers.length === 0) return players;

  // 1. Batch-fetch existing cache entries
  const extIds = sbPlayers.map((p) => p.player_external_id as string);
  const { data: cacheRows } = await supabase
    .from("player_enrichment_cache")
    .select("*")
    .in("player_external_id", extIds);

  const cacheMap = new Map<string, {
    current_club: string | null;
    current_league: string | null;
    birth_date: string | null;
    photo_url: string | null;
    enriched_at: string;
  }>();
  for (const row of cacheRows ?? []) {
    cacheMap.set(row.player_external_id, row);
  }

  const now = Date.now();
  const ttlMs = ENRICHMENT_TTL_DAYS * 24 * 60 * 60 * 1000;

  // 2. Identify which players need fresh enrichment
  const needsEnrichment: Record<string, unknown>[] = [];
  for (const p of sbPlayers) {
    const extId = p.player_external_id as string;
    const cached = cacheMap.get(extId);
    if (cached && (now - new Date(cached.enriched_at).getTime()) < ttlMs) {
      // Cache is fresh — apply it
      if (cached.current_club) p.team = cached.current_club;
      if (cached.current_league) p.league = cached.current_league;
      if (cached.birth_date) {
        p.birth_date = cached.birth_date;
        p.age = calculateAge(cached.birth_date);
      }
      if (cached.photo_url && !p.photo_url) p.photo_url = cached.photo_url;
    } else {
      needsEnrichment.push(p);
    }
  }

  // 3. Fetch from API-Football for uncached/stale players (max 5 per search to conserve quota)
  if (apiKey && needsEnrichment.length > 0) {
    const toEnrich = needsEnrichment.slice(0, 5); // conserve API quota

    for (const p of toEnrich) {
      const playerName = p.player_name as string;
      try {
        const results = await apiFootballSearch(playerName, organizationId);
        if (results.length > 0) {
          // Find best match by normalized name
          const normTarget = playerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const match = results.find((r) => {
            const normResult = r.player.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return normResult.includes(normTarget) || normTarget.includes(normResult);
          }) ?? results[0];

          const mainStats = match.statistics?.[0];
          const currentClub = mainStats?.team?.name ?? null;
          const currentLeague = mainStats?.league?.name ?? null;
          const birthDate = match.player.birth?.date ?? null;
          const photoUrl = match.player.photo ?? null;

          // Apply to player
          if (currentClub) p.team = currentClub;
          if (currentLeague) p.league = currentLeague;
          if (birthDate) {
            p.birth_date = birthDate;
            p.age = calculateAge(birthDate);
          }
          if (photoUrl && !p.photo_url) {
            p.photo_url = photoUrl;
            p.photo_source = "api-football";
          }

          // Upsert cache
          await supabase.from("player_enrichment_cache").upsert({
            player_external_id: p.player_external_id as string,
            current_club: currentClub,
            current_league: currentLeague,
            birth_date: birthDate,
            photo_url: photoUrl,
            api_football_id: match.player.id,
            raw_data: { statistics: mainStats },
            enriched_at: new Date().toISOString(),
          }, { onConflict: "player_external_id" });
        } else {
          // No match found — cache empty result to avoid re-querying
          await supabase.from("player_enrichment_cache").upsert({
            player_external_id: p.player_external_id as string,
            current_club: null,
            current_league: null,
            birth_date: null,
            photo_url: null,
            api_football_id: null,
            raw_data: {},
            enriched_at: new Date().toISOString(),
          }, { onConflict: "player_external_id" });
        }
      } catch (err) {
        console.error(`Enrichment failed for ${playerName}:`, (err as Error).message);
        // Non-blocking — player keeps StatsBomb data
      }
    }
  }

  return players;
}

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

/** Search StatsBomb open data by player name (text search) */
async function searchStatsBombByName(
  supabase: SupabaseClient,
  sanitizedQuery: string
): Promise<Record<string, unknown>[]> {
  const { data: textResults } = await supabase
    .from("sb_players")
    .select("player_id, player_name, player_nickname, nationality, primary_position, photo_url, birth_date")
    .or(`player_name.ilike.%${sanitizedQuery}%,player_nickname.ilike.%${sanitizedQuery}%`)
    .limit(20);

  if (!textResults || textResults.length === 0) return [];

  const playerIds = textResults.map((p: { player_id: number }) => p.player_id);
  const INTL_COMP_IDS = [43, 55, 53, 72]; // FIFA WC, Euro, Women's Euro, Women's Olympics (11 = La Liga, NOT international)

  // Fetch club stats (excluding international competitions)
  const { data: clubStatsRows } = await supabase
    .from("sb_player_season_stats")
    .select("*")
    .in("player_id", playerIds)
    .not("competition_id", "in", `(${INTL_COMP_IDS.join(",")})`)
    .order("season_name", { ascending: false });

  // Also fetch all stats as fallback for players with only international data
  const { data: allStatsRows } = await supabase
    .from("sb_player_season_stats")
    .select("*")
    .in("player_id", playerIds)
    .order("season_name", { ascending: false });

  const results: Record<string, unknown>[] = [];
  for (const p of textResults) {
    // Prefer club stats; fall back to international with context label
    let stats = (clubStatsRows ?? []).find((s: { player_id: number }) => s.player_id === p.player_id);
    let teamName: string;
    if (stats) {
      teamName = stats.team_name ?? "Unknown";
    } else {
      stats = (allStatsRows ?? []).find((s: { player_id: number }) => s.player_id === p.player_id);
      teamName = stats
        ? `${stats.team_name} (${stats.competition_name} ${stats.season_name})`
        : "Unknown";
    }
    results.push({
      player_external_id: `sb-open-${p.player_id}`,
      player_name: p.player_nickname ?? p.player_name,
      age: p.birth_date ? calculateAge(p.birth_date) : null,
      birth_date: p.birth_date ?? null,
      nationality: p.nationality ?? "Unknown",
      position: p.primary_position ?? "Unknown",
      team: teamName,
      league: stats ? `${stats.competition_name} (${stats.season_name})` : "Unknown",
      photo_url: p.photo_url ?? undefined,
      photo_source: p.photo_url?.includes('thesportsdb.com') ? 'sportsdb' : (p.photo_url ? 'stitch' : undefined),
      stats: stats ? {
        matches_played: stats.matches_played, minutes_played: stats.minutes_played,
        goals: stats.goals, assists: stats.assists,
        xG: Number(stats.xg), xA: Number(stats.xa),
      } : {},
      provider: "statsbomb-open",
    });
  }
  return results;
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

  // If no paid credentials and no open/free data results, return empty (caller handles it gracefully)
  if (!credentials?.length && results.length === 0) {
    return results;
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
  supabase: SupabaseClient,
  params: ParsedSearchParams
): Promise<Record<string, unknown>[]> {
  // Build query against sb_player_season_stats joined with sb_players
  // Exclude international competitions so club teams appear instead of national teams
  const INTL_COMP_IDS = [43, 55, 53, 72]; // FIFA WC, Euro, Women's Euro, Women's Olympics (11 = La Liga, NOT international)
  let query = supabase
    .from("sb_player_season_stats")
    .select(`
      *,
      sb_players!inner (
        player_id, player_name, player_nickname,
        nationality, primary_position, positions, photo_url, birth_date
      )
    `)
    .not("competition_id", "in", `(${INTL_COMP_IDS.join(",")})`)
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

  interface SbStatsRow {
    sb_players: {
      player_id: number;
      player_name: string;
      player_nickname: string | null;
      nationality: string | null;
      primary_position: string | null;
      positions: string[] | null;
      photo_url: string | null;
      birth_date: string | null;
    };
    team_name: string;
    competition_name: string;
    season_name: string;
    matches_played: number;
    minutes_played: number;
    goals: number;
    assists: number;
    xg: number;
    xa: number;
    npxg: number;
    key_passes: number;
    passes_completed: number;
    pass_completion: number;
    progressive_passes: number;
    progressive_carries: number;
    through_balls: number;
    long_balls: number;
    crosses: number;
    tackles: number;
    interceptions: number;
    clearances: number;
    blocks: number;
    aerial_duels: number;
    aerial_duel_win_rate: number;
    ground_duels: number;
    ground_duel_win_rate: number;
    dribbles: number;
    dribble_success_rate: number;
    pressures: number;
    shot_creating_actions: number;
    goal_creating_actions: number;
    yellow_cards: number;
    red_cards: number;
  }

  return (data ?? []).map((row: SbStatsRow) => ({
    player_external_id: `sb-open-${row.sb_players.player_id}`,
    player_name:
      row.sb_players.player_nickname ?? row.sb_players.player_name,
    age: row.sb_players.birth_date ? calculateAge(row.sb_players.birth_date) : null,
    birth_date: row.sb_players.birth_date ?? null,
    nationality: row.sb_players.nationality ?? "Unknown",
    position: row.sb_players.primary_position ?? "Unknown",
    positions: row.sb_players.positions ?? [],
    foot: "unknown",
    height: 0,
    weight: 0,
    team: row.team_name,
    league: `${row.competition_name} (${row.season_name})`,
    photo_url: row.sb_players.photo_url ?? undefined,
    photo_source: row.sb_players.photo_url?.includes('thesportsdb.com') ? 'sportsdb' : (row.sb_players.photo_url ? 'stitch' : undefined),
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

/** Fallback NL parser when Claude API is unavailable (e.g. 429 rate limit) */
function fallbackParseQuery(query: string): ParsedSearchParams {
  const q = query.toLowerCase();
  const params: ParsedSearchParams = {};

  // Position detection
  const positionMap: Record<string, string[]> = {
    "striker": ["ST", "CF"],
    "forward": ["ST", "CF", "LW", "RW"],
    "winger": ["LW", "RW"],
    "left wing": ["LW"],
    "right wing": ["RW"],
    "midfielder": ["CM", "CAM", "CDM"],
    "central midfielder": ["CM"],
    "attacking midfielder": ["CAM"],
    "defensive midfielder": ["CDM"],
    "number 10": ["CAM"],
    "center-back": ["CB"],
    "centre-back": ["CB"],
    "center back": ["CB"],
    "centre back": ["CB"],
    "defender": ["CB", "LB", "RB"],
    "left-back": ["LB"],
    "left back": ["LB"],
    "right-back": ["RB"],
    "right back": ["RB"],
    "full-back": ["LB", "RB"],
    "full back": ["LB", "RB"],
    "goalkeeper": ["GK"],
    "keeper": ["GK"],
  };

  for (const [keyword, positions] of Object.entries(positionMap)) {
    if (q.includes(keyword)) {
      params.positions = positions;
      params.position = positions[0];
      break;
    }
  }
  // Also check abbreviations
  const abbrevs = ["ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "CB", "LB", "RB", "GK", "LWB", "RWB", "LM", "RM"];
  for (const abbr of abbrevs) {
    if (new RegExp(`\\b${abbr}\\b`, "i").test(query)) {
      params.positions = [abbr.toUpperCase()];
      params.position = abbr.toUpperCase();
      break;
    }
  }

  // League detection
  const leagueMap: Record<string, string> = {
    "la liga": "La Liga",
    "premier league": "Premier League",
    "bundesliga": "Bundesliga",
    "serie a": "Serie A",
    "ligue 1": "Ligue 1",
    "eredivisie": "Eredivisie",
    "liga mx": "Liga MX",
    "mls": "MLS",
    "world cup": "FIFA World Cup",
  };
  for (const [keyword, league] of Object.entries(leagueMap)) {
    if (q.includes(keyword)) {
      params.league = league;
      params.leagues = [league];
      break;
    }
  }

  // Nationality detection
  const nationalityMap: Record<string, string> = {
    "spanish": "Spain", "spain": "Spain",
    "german": "Germany", "germany": "Germany",
    "french": "France", "france": "France",
    "italian": "Italy", "italy": "Italy",
    "brazilian": "Brazil", "brazil": "Brazil",
    "argentinian": "Argentina", "argentine": "Argentina", "argentina": "Argentina",
    "english": "England", "england": "England",
    "portuguese": "Portugal", "portugal": "Portugal",
    "dutch": "Netherlands", "netherlands": "Netherlands",
    "mexican": "Mexico", "mexico": "Mexico",
    "colombian": "Colombia", "colombia": "Colombia",
    "uruguayan": "Uruguay", "uruguay": "Uruguay",
  };
  for (const [keyword, nat] of Object.entries(nationalityMap)) {
    if (q.includes(keyword)) {
      params.nationality = nat;
      break;
    }
  }

  // Age detection
  const ageUnder = q.match(/under[- ]?(\d{2})/);
  if (ageUnder) params.age_max = parseInt(ageUnder[1]);
  const ageOver = q.match(/over[- ]?(\d{2})/);
  if (ageOver) params.age_min = parseInt(ageOver[1]);
  const youngMatch = q.match(/\byoung\b/);
  if (youngMatch && !params.age_max) params.age_max = 23;

  // Foot detection
  if (q.includes("left-footed") || q.includes("left foot")) params.foot = "left";
  if (q.includes("right-footed") || q.includes("right foot")) params.foot = "right";

  params.limit = 50;
  return params;
}

/**
 * Deduplicate players from multiple providers by normalized name + nationality.
 * When duplicates are found, keeps the entry with the most data (prefers one with photo, then most stats).
 */
function deduplicatePlayers(players: Record<string, unknown>[]): Record<string, unknown>[] {
  if (players.length === 0) return players;

  // Normalize: lowercase, remove diacritics, collapse whitespace
  function normalizeKey(name: string, nationality: string): string {
    const normName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const normNat = nationality
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    return `${normName}|${normNat}`;
  }

  // Score how "complete" a player record is (higher = more data)
  function completenessScore(p: Record<string, unknown>): number {
    let score = 0;
    if (p.photo_url) score += 10; // photo is highly valuable
    if (p.age && p.age !== 0) score += 2;
    if (p.birth_date) score += 2;
    if (p.height && p.height !== 0) score += 1;
    if (p.weight && p.weight !== 0) score += 1;
    if (p.team && p.team !== "Unknown") score += 1;
    if (p.league && p.league !== "Unknown") score += 1;
    const stats = p.stats as Record<string, number> | undefined;
    if (stats) {
      const nonZero = Object.values(stats).filter((v) => typeof v === "number" && v !== 0).length;
      score += nonZero;
    }
    return score;
  }

  const seen = new Map<string, { index: number; score: number }>();
  const result: Record<string, unknown>[] = [];

  for (const player of players) {
    const name = (player.player_name as string) ?? "";
    const nationality = (player.nationality as string) ?? "Unknown";
    if (!name) {
      result.push(player);
      continue;
    }

    const key = normalizeKey(name, nationality);
    const score = completenessScore(player);
    const existing = seen.get(key);

    if (!existing) {
      const idx = result.length;
      result.push(player);
      seen.set(key, { index: idx, score });
    } else if (score > existing.score) {
      // Merge: keep the better record but carry over photo_url from the other if missing
      const prev = result[existing.index];
      if (!player.photo_url && prev.photo_url) {
        player.photo_url = prev.photo_url;
        player.photo_source = prev.photo_source;
      }
      result[existing.index] = player;
      seen.set(key, { index: existing.index, score });
    } else {
      // Existing is better, but merge photo from this one if existing lacks it
      const prev = result[existing.index];
      if (!prev.photo_url && player.photo_url) {
        prev.photo_url = player.photo_url;
        prev.photo_source = player.photo_source;
      }
    }
  }

  // Filter out any undefined slots (shouldn't happen, but safety)
  return result.filter(Boolean);
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
