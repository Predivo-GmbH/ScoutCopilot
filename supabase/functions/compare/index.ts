// Compare Edge Function — Head-to-head player comparison
// POST /compare { player_ids: string[], context?: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { comparePlayers as claudeCompare } from "../_shared/claude.ts";
import { getMockPlayer } from "../_shared/mock-data.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

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
          // TODO: Fetch fresh from provider if not cached
          return new Response(
            JSON.stringify({
              error: `No cached data for player ${id}. Search for this player first.`,
            }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
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
