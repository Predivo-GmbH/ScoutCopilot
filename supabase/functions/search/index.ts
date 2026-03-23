// Search Edge Function — Natural language player search
// POST /search { query: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { parseSearchQuery, rankPlayers, type ParsedSearchParams } from "../_shared/claude.ts";
import { searchMockPlayers, type MockPlayer } from "../_shared/mock-data.ts";
import { searchPlayers as wyscoutSearch } from "../_shared/providers/wyscout.ts";
import { searchPlayers as statsbombSearch } from "../_shared/providers/statsbomb.ts";

serve(async (req: Request) => {
  // CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth
    const auth = await getAuthContext(req);

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
      rawPlayers = await fetchFromProviders(auth.organizationId, parsedParams);
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
  params: ParsedSearchParams
): Promise<Record<string, unknown>[]> {
  const supabase = getServiceClient();

  // Get org's active credentials
  const { data: credentials } = await supabase
    .from("api_credentials")
    .select("provider, encrypted_credentials")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (!credentials?.length) {
    throw new Error(
      "No active API credentials found. Please add your Wyscout or StatsBomb credentials in Settings."
    );
  }

  const results: Record<string, unknown>[] = [];

  for (const cred of credentials) {
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
