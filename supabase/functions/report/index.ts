// Report Edge Function — AI scouting report generation
// POST /report { player_external_id: string, player_name: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { generateScoutingReport } from "../_shared/claude.ts";
import { getMockPlayer } from "../_shared/mock-data.ts";
import { getPlayerStats as wyscoutStats, getPlayerDetails as wyscoutDetails } from "../_shared/providers/wyscout.ts";
import { getPlayerSeasonStats as statsbombStats } from "../_shared/providers/statsbomb.ts";
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

    // Rate limit: 10 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 10 / 60, 10);
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

    const { player_external_id, player_name } = await req.json();
    if (!player_external_id || !player_name) {
      return new Response(
        JSON.stringify({ error: "Missing 'player_external_id' or 'player_name'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check tier limits for report generation
    const supabase = getServiceClient();
    if (auth.subscriptionTier === "scout") {
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: usage } = await supabase
        .from("usage_tracking")
        .select("reports_generated")
        .eq("organization_id", auth.organizationId)
        .eq("month", currentMonth)
        .single();

      if (usage && usage.reports_generated >= 10) {
        return new Response(
          JSON.stringify({
            error: "Monthly report limit reached (10/10). Upgrade to Pro for unlimited reports.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch full player stats
    const useMock = Deno.env.get("MOCK_DATA") === "true";
    let playerStats: Record<string, unknown>;
    let sourceProvider: "wyscout" | "statsbomb" = "statsbomb";

    if (useMock) {
      const mock = getMockPlayer(player_external_id);
      if (!mock) {
        return new Response(
          JSON.stringify({ error: "Player not found in mock data" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      playerStats = {
        player_name: mock.player_name,
        age: mock.age,
        nationality: mock.nationality,
        position: mock.position,
        positions: mock.positions,
        foot: mock.foot,
        height: mock.height,
        weight: mock.weight,
        team: mock.team,
        league: mock.league,
        market_value: mock.market_value,
        ...mock.stats,
      };
    } else if (player_external_id.startsWith("sb-open-")) {
      // StatsBomb open data — fetch from our own DB
      const rawId = parseInt(player_external_id.replace("sb-open-", ""), 10);
      const { data: playerRow } = await supabase
        .from("sb_players")
        .select("player_id, player_name, player_nickname, nationality, primary_position, positions")
        .eq("player_id", rawId)
        .single();

      const { data: statsRows } = await supabase
        .from("sb_player_season_stats")
        .select("*")
        .eq("player_id", rawId)
        .order("season_name", { ascending: false })
        .limit(1);

      const stats = statsRows?.[0];
      playerStats = {
        player_name: playerRow?.player_nickname ?? playerRow?.player_name ?? player_name,
        nationality: playerRow?.nationality ?? "Unknown",
        position: playerRow?.primary_position ?? "Unknown",
        positions: playerRow?.positions ?? [],
        team: stats?.team_name ?? "Unknown",
        league: stats ? `${stats.competition_name} (${stats.season_name})` : "Unknown",
        matches_played: stats?.matches_played ?? 0,
        minutes_played: stats?.minutes_played ?? 0,
        goals: stats?.goals ?? 0,
        assists: stats?.assists ?? 0,
        xG: Number(stats?.xg ?? 0),
        xA: Number(stats?.xa ?? 0),
        npxG: Number(stats?.npxg ?? 0),
        key_passes: stats?.key_passes ?? 0,
        passes_completed: stats?.passes_completed ?? 0,
        pass_completion: Number(stats?.pass_completion ?? 0),
        progressive_passes: stats?.progressive_passes ?? 0,
        progressive_carries: stats?.progressive_carries ?? 0,
        tackles: stats?.tackles ?? 0,
        interceptions: stats?.interceptions ?? 0,
        clearances: stats?.clearances ?? 0,
        blocks: stats?.blocks ?? 0,
        aerial_duels: stats?.aerial_duels ?? 0,
        aerial_duel_win_rate: Number(stats?.aerial_duel_win_rate ?? 0),
        ground_duels: stats?.ground_duels ?? 0,
        ground_duel_win_rate: Number(stats?.ground_duel_win_rate ?? 0),
        dribbles: stats?.dribbles ?? 0,
        dribble_success_rate: Number(stats?.dribble_success_rate ?? 0),
        pressures: stats?.pressures ?? 0,
        shot_creating_actions: stats?.shot_creating_actions ?? 0,
        goal_creating_actions: stats?.goal_creating_actions ?? 0,
        yellow_cards: stats?.yellow_cards ?? 0,
        red_cards: stats?.red_cards ?? 0,
      };
      sourceProvider = "statsbomb";
    } else {
      const result = await fetchPlayerFullStats(
        auth.organizationId,
        player_external_id
      );
      playerStats = result.stats;
      sourceProvider = result.provider;
    }

    // Generate report via Claude
    const report = await generateScoutingReport(player_name, playerStats);

    // Save to DB
    const { data: savedReport, error: saveError } = await supabase
      .from("player_reports")
      .insert({
        user_id: auth.userId,
        organization_id: auth.organizationId,
        player_external_id,
        player_name,
        report_data: report as unknown as Record<string, unknown>,
        source_provider: sourceProvider,
      })
      .select("id, created_at")
      .single();

    if (saveError) {
      console.error("Failed to save report:", saveError.message);
    }

    // Update usage tracking
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
    await supabase.rpc("increment_usage", {
      p_org_id: auth.organizationId,
      p_month: currentMonth,
      p_field: "reports_generated",
    }).then(() => {}).catch(() => {
      // If RPC doesn't exist, upsert manually
      supabase
        .from("usage_tracking")
        .upsert(
          {
            organization_id: auth.organizationId,
            month: currentMonth,
            reports_generated: 1,
          },
          { onConflict: "organization_id,month" }
        )
        .then(() => {});
    });

    return new Response(
      JSON.stringify({
        report_id: savedReport?.id ?? null,
        player_external_id,
        player_name,
        report,
        created_at: savedReport?.created_at ?? new Date().toISOString(),
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
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Report error:", errMsg);
    const isRateLimit = errMsg.includes("429") || errMsg.includes("rate_limit");
    return new Response(
      JSON.stringify({
        error: isRateLimit
          ? "AI service is temporarily busy. Please try again in a minute."
          : "Internal server error",
      }),
      {
        status: isRateLimit ? 429 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...(isRateLimit ? { "Retry-After": "60" } : {}),
        },
      }
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────

async function fetchPlayerFullStats(
  organizationId: string,
  playerExternalId: string
): Promise<{ stats: Record<string, unknown>; provider: "wyscout" | "statsbomb" }> {
  const supabase = getServiceClient();

  const { data: credentials } = await supabase
    .from("api_credentials")
    .select("provider, encrypted_credentials")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (!credentials?.length) {
    throw new Error("No active API credentials found.");
  }

  // Determine provider from player ID prefix
  const isWyscout = playerExternalId.startsWith("wy-");
  const isStatsBomb = playerExternalId.startsWith("sb-");

  for (const cred of credentials) {
    if (cred.provider === "wyscout" && (isWyscout || !isStatsBomb)) {
      const wyCreds = cred.encrypted_credentials as { username: string; password: string };
      const rawId = playerExternalId.replace("wy-", "");
      const [details, stats] = await Promise.all([
        wyscoutDetails(wyCreds, rawId, organizationId),
        wyscoutStats(wyCreds, rawId, organizationId),
      ]);
      return {
        stats: { ...details, advancedStats: stats } as unknown as Record<string, unknown>,
        provider: "wyscout",
      };
    }

    if (cred.provider === "statsbomb" && (isStatsBomb || !isWyscout)) {
      const sbCreds = cred.encrypted_credentials as { username: string; password: string };
      const rawId = playerExternalId.replace("sb-", "");
      const seasonStats = await statsbombStats(sbCreds, rawId, organizationId);
      return {
        stats: seasonStats as unknown as Record<string, unknown>,
        provider: "statsbomb",
      };
    }
  }

  throw new Error("No matching credentials for this player's data provider.");
}
