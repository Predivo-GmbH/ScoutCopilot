// Compare Edge Function — Head-to-head player comparison
// POST /compare { player_ids: string[], context?: string }

import { logError } from '../_shared/error-log.ts'
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { comparePlayers as claudeCompare } from "../_shared/claude.ts";
import { getMockPlayer } from "../_shared/mock-data.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import {
  getPlayer as apiFootballGetPlayer,
  mapToGenericPlayer,
  type ApiFootballSearchResult,
} from "../_shared/providers/api-football.ts";

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await getAuthContext(req);

    // Rate limit: 20 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 20 / 60, 20);
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

    const { player_ids, context } = await req.json();
    if (!Array.isArray(player_ids) || player_ids.length < 2) {
      return new Response(
        JSON.stringify({ error: "Provide at least 2 player_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tier limits for comparison player count
    const maxPlayers = auth.subscriptionTier === "scout" ? 3 : 10;
    if (player_ids.length > maxPlayers) {
      return new Response(
        JSON.stringify({
          error: `Your plan allows comparing up to ${maxPlayers} players. You sent ${player_ids.length}.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch stats for all players
    const useMock = Deno.env.get("MOCK_DATA") === "true";
    const playersData: Array<{ id: string; name: string; stats: Record<string, unknown> }> = [];

    if (useMock) {
      for (const id of player_ids) {
        const mock = getMockPlayer(id);
        if (!mock) {
          return new Response(
            JSON.stringify({ error: `Player not found: ${id}` }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        playersData.push({
          id: mock.player_external_id,
          name: mock.player_name,
          stats: {
            age: mock.age,
            nationality: mock.nationality,
            position: mock.position,
            foot: mock.foot,
            height: mock.height,
            weight: mock.weight,
            team: mock.team,
            league: mock.league,
            market_value: mock.market_value,
            ...mock.stats,
          },
        });
      }
    } else {
      // Fetch from DB search_results or directly from providers
      const supabase = getServiceClient();

      for (const id of player_ids) {
        // First check if we have cached data from a recent search
        const { data: cached } = await supabase
          .from("search_results")
          .select("player_name, player_data")
          .eq("player_external_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          playersData.push({
            id,
            name: cached.player_name,
            stats: cached.player_data as Record<string, unknown>,
          });
        } else {
          // Fallback: fetch fresh from provider based on player ID prefix
          const fetched = await fetchPlayerFromProvider(supabase, id, auth.organizationId);
          if (!fetched) {
            return new Response(
              JSON.stringify({
                error: `Player not found: ${id}. Could not retrieve data from any provider.`,
              }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          playersData.push(fetched);
        }
      }
    }

    // Generate comparison via Claude
    const comparison = await claudeCompare(playersData, context);

    // Save to DB
    const supabase = getServiceClient();
    const { data: saved, error: saveError } = await supabase
      .from("player_comparisons")
      .insert({
        user_id: auth.userId,
        organization_id: auth.organizationId,
        title: comparison.title,
        player_ids,
        comparison_data: comparison as unknown as Record<string, unknown>,
      })
      .select("id, created_at")
      .single();

    if (saveError) {
      console.error("Failed to save comparison:", saveError.message);
    }

    return new Response(
      JSON.stringify({
        comparison_id: saved?.id ?? null,
        comparison,
        created_at: saved?.created_at ?? new Date().toISOString(),
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
    console.error("Compare error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Fetch a player directly from their provider when not found in the search_results cache.
 * Caches the result in search_results for future lookups.
 */
async function fetchPlayerFromProvider(
  supabase: SupabaseClient,
  playerExternalId: string,
  organizationId: string
): Promise<{ id: string; name: string; stats: Record<string, unknown> } | null> {
  let playerData: Record<string, unknown> | null = null;

  if (playerExternalId.startsWith("apifb-")) {
    // API-Football player — fetch by numeric ID
    playerData = await fetchApiFootballPlayer(playerExternalId, organizationId);
  } else if (playerExternalId.startsWith("sb-open-")) {
    // StatsBomb open data player — fetch from sb_players + sb_player_season_stats
    playerData = await fetchStatsBombOpenPlayer(supabase, playerExternalId);
  }
  // Wyscout (wy-) and paid StatsBomb (sb-) require org credentials;
  // those players should always be cached from a prior search, so no fallback here.

  if (!playerData) return null;

  // Cache in search_results for future comparisons
  const { error: cacheError } = await supabase.from("search_results").insert({
    player_external_id: playerExternalId,
    player_name: playerData.player_name as string,
    player_data: playerData,
    rank: 0,
    fit_score: 0,
  });
  if (cacheError) {
    console.error("Failed to cache player data:", cacheError.message);
  }

  return {
    id: playerExternalId,
    name: playerData.player_name as string,
    stats: playerData,
  };
}

/** Fetch an API-Football player by their external ID (apifb-{numericId}) */
async function fetchApiFootballPlayer(
  playerExternalId: string,
  organizationId: string
): Promise<Record<string, unknown> | null> {
  // First check squad_players for stored data (avoids burning API calls)
  const supabase = getServiceClient();
  const { data: squadRow } = await supabase
    .from("squad_players")
    .select("player_name, position_key, player_data")
    .eq("player_external_id", playerExternalId)
    .limit(1)
    .maybeSingle();

  if (squadRow) {
    const pd = (squadRow.player_data ?? {}) as Record<string, unknown>;
    return {
      player_external_id: playerExternalId,
      player_name: squadRow.player_name,
      age: pd.age ?? null,
      birth_date: pd.birth_date ?? null,
      nationality: (pd.nationality as string) ?? "Unknown",
      position: squadRow.position_key ?? (pd.position as string) ?? "Unknown",
      team: (pd.importedFrom as string) ?? "Unknown",
      league: "Unknown",
      photo_url: pd.image ?? undefined,
      stats: pd.stats ?? {},
      provider: "api-football",
    };
  }

  // Fallback: fetch from live API
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    console.error("API_FOOTBALL_KEY not configured — cannot fetch player");
    return null;
  }

  const numericId = parseInt(playerExternalId.replace("apifb-", ""), 10);
  if (isNaN(numericId)) return null;

  // European football seasons span two years; API-Football uses the start year
  const now = new Date();
  const season = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();

  try {
    let result = await apiFootballGetPlayer(numericId, season, organizationId);
    if (!result) {
      // Try previous season as fallback
      result = await apiFootballGetPlayer(numericId, season - 1, organizationId);
      if (!result) return null;
    }
    return mapToGenericPlayer(result as unknown as ApiFootballSearchResult);
  } catch (err) {
    await logError('compare', 'request', err)
    console.error("API-Football player fetch error:", (err as Error).message);
    return null;
  }
}

/** Fetch a StatsBomb open data player from the DB by their external ID (sb-open-{numericId}) */
async function fetchStatsBombOpenPlayer(
  supabase: SupabaseClient,
  playerExternalId: string
): Promise<Record<string, unknown> | null> {
  const numericId = parseInt(playerExternalId.replace("sb-open-", ""), 10);
  if (isNaN(numericId)) return null;

  const { data: player } = await supabase
    .from("sb_players")
    .select("player_id, player_name, player_nickname, nationality, primary_position, photo_url, birth_date")
    .eq("player_id", numericId)
    .single();

  if (!player) return null;

  // Fetch most recent stats
  const { data: stats } = await supabase
    .from("sb_player_season_stats")
    .select("*")
    .eq("player_id", numericId)
    .order("season_name", { ascending: false })
    .limit(1)
    .single();

  const teamName = stats?.team_name ?? "Unknown";
  const league = stats ? `${stats.competition_name} (${stats.season_name})` : "Unknown";

  return {
    player_external_id: playerExternalId,
    player_name: player.player_nickname ?? player.player_name,
    age: player.birth_date ? calculateAge(player.birth_date) : null,
    birth_date: player.birth_date ?? null,
    nationality: player.nationality ?? "Unknown",
    position: player.primary_position ?? "Unknown",
    team: teamName,
    league,
    photo_url: player.photo_url ?? undefined,
    stats: stats
      ? {
          matches_played: stats.matches_played,
          minutes_played: stats.minutes_played,
          goals: stats.goals,
          assists: stats.assists,
          xG: Number(stats.xg),
          xA: Number(stats.xa),
        }
      : {},
    provider: "statsbomb-open",
  };
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
