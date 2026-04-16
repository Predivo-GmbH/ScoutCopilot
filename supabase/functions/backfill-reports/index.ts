// Backfill edge function — enriches old player_reports with missing data
// POST /backfill-reports { dry_run?: boolean }
//
// Finds reports missing transfer_history, contract_info, similar_players,
// image, or age, then fills in the gaps without overwriting existing fields.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { generateScoutingReport } from "../_shared/claude.ts";

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

/** Strip diacritics so TheSportsDB search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface SportsDbResult {
  photoUrl: string | null;
  dateBorn: string | null;
}

async function fetchFromSportsDb(playerName: string): Promise<SportsDbResult> {
  const empty: SportsDbResult = { photoUrl: null, dateBorn: null };
  const safeName = stripAccents(playerName).slice(0, 100);
  const url = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return empty;

    const data = await res.json();
    const players = data?.player ?? [];
    if (players.length === 0) return empty;

    const match = players[0];
    const rawPhoto = match.strCutout || match.strThumb || null;
    const photo = rawPhoto?.replace("https://www.thesportsdb.com/images/", "https://r2.thesportsdb.com/images/") ?? null;
    return {
      photoUrl: photo,
      dateBorn: match.dateBorn ?? null,
    };
  } catch {
    return empty;
  }
}

/** Calculate age from a date string like "1998-06-20" */
function calcAge(dateBorn: string): number | null {
  const d = new Date(dateBorn);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

/** Fields from generateScoutingReport that we consider backfillable */
const REPORT_FIELDS = ["transfer_history", "contract_info", "similar_players"] as const;

// ── Similar Players (database-driven) — copied from report/index.ts ──

const SIMILARITY_STATS = [
  "goals", "assists", "xg", "xa", "npxg",
  "pass_completion", "progressive_passes", "progressive_carries",
  "key_passes", "tackles", "interceptions", "clearances",
  "aerial_duel_win_rate", "ground_duel_win_rate",
  "dribbles", "dribble_success_rate", "pressures",
  "shot_creating_actions", "goal_creating_actions",
] as const;

const STAT_RANGES: Record<string, number> = {
  goals: 30, assists: 20, xg: 25, xa: 15, npxg: 20,
  pass_completion: 100, progressive_passes: 200, progressive_carries: 150,
  key_passes: 100, tackles: 100, interceptions: 80, clearances: 100,
  aerial_duel_win_rate: 100, ground_duel_win_rate: 100,
  dribbles: 150, dribble_success_rate: 100, pressures: 400,
  shot_creating_actions: 150, goal_creating_actions: 50,
};

interface SimilarPlayer {
  playerId: number;
  name: string;
  club: string;
  position: string;
  photo_url: string | null;
  birth_date: string | null;
  similarity_pct: number;
  reasoning: string;
}

async function findSimilarPlayers(
  supabase: ReturnType<typeof getServiceClient>,
  currentPlayerId: number,
  currentStats: Record<string, unknown>
): Promise<SimilarPlayer[]> {
  const position = (currentStats.position as string) ?? "Unknown";

  const positionGroups: Record<string, string[]> = {
    ST: ["ST", "CF"], CF: ["CF", "ST"],
    LW: ["LW", "RW", "LM"], RW: ["RW", "LW", "RM"],
    LM: ["LM", "LW"], RM: ["RM", "RW"],
    CAM: ["CAM", "CM"], CM: ["CM", "CAM", "CDM"], CDM: ["CDM", "CM"],
    CB: ["CB"], LB: ["LB", "LWB"], RB: ["RB", "RWB"],
    LWB: ["LWB", "LB"], RWB: ["RWB", "RB"],
    GK: ["GK"],
  };
  const targetPositions = positionGroups[position.toUpperCase()] ?? [position];

  const { data: candidates } = await supabase
    .from("sb_player_season_stats")
    .select(`
      *,
      sb_players!inner (
        player_id, player_name, player_nickname,
        primary_position, photo_url, birth_date
      )
    `)
    .in("sb_players.primary_position", targetPositions.map((p) => p.toUpperCase()))
    .neq("sb_players.player_id", currentPlayerId)
    .gt("minutes_played", 200)
    .order("season_name", { ascending: false })
    .limit(200);

  if (!candidates || candidates.length === 0) return [];

  const seen = new Set<number>();
  const uniqueCandidates = candidates.filter((c: { sb_players: { player_id: number } }) => {
    if (seen.has(c.sb_players.player_id)) return false;
    seen.add(c.sb_players.player_id);
    return true;
  });

  const currentVector: number[] = SIMILARITY_STATS.map((stat) => {
    const val = Number(currentStats[stat] ?? currentStats[stat.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] ?? 0);
    return val / (STAT_RANGES[stat] || 1);
  });

  const scored = uniqueCandidates.map((c: Record<string, unknown>) => {
    const candidateVector: number[] = SIMILARITY_STATS.map((stat) => {
      const val = Number((c as Record<string, unknown>)[stat] ?? 0);
      return val / (STAT_RANGES[stat] || 1);
    });

    let distance = 0;
    for (let i = 0; i < currentVector.length; i++) {
      distance += (currentVector[i] - candidateVector[i]) ** 2;
    }
    distance = Math.sqrt(distance);

    const statDiffs = SIMILARITY_STATS.map((stat, i) => ({
      stat,
      diff: Math.abs(currentVector[i] - candidateVector[i]),
    }));
    statDiffs.sort((a, b) => a.diff - b.diff);
    const topMatchingStats = statDiffs.slice(0, 3).map((s) =>
      s.stat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        .replace("Xg", "xG").replace("Xa", "xA").replace("Npxg", "npxG")
    );

    const player = c.sb_players as {
      player_id: number;
      player_name: string;
      player_nickname: string | null;
      primary_position: string | null;
      photo_url: string | null;
      birth_date: string | null;
    };

    return {
      playerId: player.player_id,
      name: player.player_nickname ?? player.player_name,
      club: (c as Record<string, unknown>).team_name as string ?? "Unknown",
      position: player.primary_position ?? "Unknown",
      photo_url: player.photo_url ?? null,
      birth_date: player.birth_date ?? null,
      distance,
      reasoning: `Similar statistical profile in ${topMatchingStats.join(", ").toLowerCase()}`,
    };
  });

  scored.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
  const top5 = scored.slice(0, 5);

  const scaleFactor = 20;
  return top5.map((p: typeof scored[0]) => ({
    playerId: p.playerId,
    name: p.name,
    club: p.club,
    position: p.position,
    photo_url: p.photo_url,
    birth_date: p.birth_date,
    similarity_pct: Math.round(Math.max(0, 100 - p.distance * scaleFactor)),
    reasoning: p.reasoning,
  }));
}

/** Check if similar_players entries lack real DB data (no photo_url, no playerId) */
function needsSimilarPlayersBackfill(similarPlayers: unknown): boolean {
  if (!Array.isArray(similarPlayers) || similarPlayers.length === 0) return true;
  // If any entry lacks playerId (a number), it's old AI-generated data
  return similarPlayers.some(
    (sp: Record<string, unknown>) => typeof sp.playerId !== "number"
  );
}


interface BackfillResult {
  report_id: string;
  player_name: string;
  player_external_id: string;
  missing_fields: string[];
  action: "updated" | "skipped" | "error";
  error?: string;
}

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    const supabase = getServiceClient();

    // Accept either a user JWT (owner/admin) or the service_role key
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    let orgFilter: string | null = null;

    // Auth: compare token directly — JWT payload decode is forgeable
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const isServiceRole = !!serviceRoleKey && token === serviceRoleKey;

    if (isServiceRole) {
      console.log("[backfill] Called with service_role key — processing all orgs");
    } else {
      // Called with user JWT — scope to their org
      const auth = await getAuthContext(req);
      if (auth.role !== "owner" && auth.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Only owners and admins can run backfill" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      orgFilter = auth.organizationId;
    }

    // Fetch reports (scoped to org if user JWT, all if service_role)
    let query = supabase
      .from("player_reports")
      .select("id, player_external_id, player_name, report_data")
      .order("created_at", { ascending: false });

    if (orgFilter) {
      query = query.eq("organization_id", orgFilter);
    }

    const { data: reports, error: fetchError } = await query;

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch reports: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reports || reports.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reports found", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Identify reports with missing fields
    const reportsToBackfill: Array<{
      id: string;
      player_external_id: string;
      player_name: string;
      report_data: Record<string, unknown>;
      missingFields: string[];
    }> = [];

    for (const report of reports) {
      const rd = (report.report_data ?? {}) as Record<string, unknown>;
      const missing: string[] = [];

      // Check report fields
      for (const field of REPORT_FIELDS) {
        if (field === "similar_players") {
          // Special check: backfill if missing OR if entries lack real DB data
          if (needsSimilarPlayersBackfill(rd[field])) {
            missing.push(field);
          }
        } else if (rd[field] === undefined || rd[field] === null) {
          missing.push(field);
        } else if (Array.isArray(rd[field]) && (rd[field] as unknown[]).length === 0) {
          // Also backfill empty arrays (e.g. transfer_history: [])
          missing.push(field);
        }
      }

      // Check metadata fields
      if (!rd.image && !rd.photo_url) missing.push("image");
      if (rd.age === undefined || rd.age === null || rd.age === 0) missing.push("age");

      if (missing.length > 0) {
        reportsToBackfill.push({
          id: report.id,
          player_external_id: report.player_external_id,
          player_name: report.player_name,
          report_data: rd,
          missingFields: missing,
        });
      }
    }

    if (reportsToBackfill.length === 0) {
      return new Response(
        JSON.stringify({
          message: "All reports are complete — nothing to backfill",
          total_reports: reports.length,
          results: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Dry run: just report what would be updated
    if (dryRun) {
      const preview: BackfillResult[] = reportsToBackfill.map((r) => ({
        report_id: r.id,
        player_name: r.player_name,
        player_external_id: r.player_external_id,
        missing_fields: r.missingFields,
        action: "skipped" as const,
      }));

      return new Response(
        JSON.stringify({
          dry_run: true,
          total_reports: reports.length,
          reports_needing_backfill: reportsToBackfill.length,
          results: preview,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each report
    const results: BackfillResult[] = [];

    for (const report of reportsToBackfill) {
      try {
        const updatedData = { ...report.report_data };
        const missingReportFields = report.missingFields.filter(
          (f) => REPORT_FIELDS.includes(f as typeof REPORT_FIELDS[number])
        );

        // Regenerate report via Claude only if report fields are missing
        if (missingReportFields.length > 0) {
          // Build minimal player stats from existing report data for Claude
          const playerStats: Record<string, unknown> = {};
          // Copy over any stats-like fields from existing report
          for (const [key, val] of Object.entries(report.report_data)) {
            if (!REPORT_FIELDS.includes(key as typeof REPORT_FIELDS[number])) {
              playerStats[key] = val;
            }
          }

          const freshReport = await generateScoutingReport(
            report.player_name,
            playerStats
          );
          const freshData = freshReport as unknown as Record<string, unknown>;

          // Merge ONLY missing fields — never overwrite existing
          for (const field of missingReportFields) {
            if (freshData[field] !== undefined && freshData[field] !== null) {
              updatedData[field] = freshData[field];
            }
          }
        }

        // Re-run similar players from DB if flagged
        if (
          report.missingFields.includes("similar_players") &&
          report.player_external_id.startsWith("sb-open-")
        ) {
          const rawId = parseInt(report.player_external_id.replace("sb-open-", ""), 10);

          // Fetch this player's latest season stats for similarity comparison
          const { data: statsRows } = await supabase
            .from("sb_player_season_stats")
            .select("*")
            .eq("player_id", rawId)
            .order("season_name", { ascending: false })
            .limit(1);

          const stats = statsRows?.[0];
          if (stats) {
            // Fetch player metadata for position
            const { data: playerRow } = await supabase
              .from("sb_players")
              .select("primary_position")
              .eq("player_id", rawId)
              .single();

            const playerStats: Record<string, unknown> = {
              position: playerRow?.primary_position ?? updatedData.position ?? "Unknown",
              goals: stats.goals ?? 0,
              assists: stats.assists ?? 0,
              xg: Number(stats.xg ?? 0),
              xa: Number(stats.xa ?? 0),
              npxg: Number(stats.npxg ?? 0),
              pass_completion: Number(stats.pass_completion ?? 0),
              progressive_passes: stats.progressive_passes ?? 0,
              progressive_carries: stats.progressive_carries ?? 0,
              key_passes: stats.key_passes ?? 0,
              tackles: stats.tackles ?? 0,
              interceptions: stats.interceptions ?? 0,
              clearances: stats.clearances ?? 0,
              aerial_duel_win_rate: Number(stats.aerial_duel_win_rate ?? 0),
              ground_duel_win_rate: Number(stats.ground_duel_win_rate ?? 0),
              dribbles: stats.dribbles ?? 0,
              dribble_success_rate: Number(stats.dribble_success_rate ?? 0),
              pressures: stats.pressures ?? 0,
              shot_creating_actions: stats.shot_creating_actions ?? 0,
              goal_creating_actions: stats.goal_creating_actions ?? 0,
            };

            try {
              const dbSimilarPlayers = await findSimilarPlayers(supabase, rawId, playerStats);
              updatedData.similar_players = dbSimilarPlayers;
              console.log(`[backfill] Re-computed similar players for ${report.player_name}: ${dbSimilarPlayers.length} found`);
            } catch (err) {
              console.error(`[backfill] Similar players lookup failed for ${report.player_name}:`, (err as Error).message);
            }
          }
        }

        // Enrich image if missing
        if (report.missingFields.includes("image")) {
          // Try sb_players table first (for StatsBomb players)
          if (report.player_external_id.startsWith("sb-open-")) {
            const rawId = parseInt(report.player_external_id.replace("sb-open-", ""), 10);
            const { data: playerRow } = await supabase
              .from("sb_players")
              .select("photo_url")
              .eq("player_id", rawId)
              .single();

            if (playerRow?.photo_url) {
              updatedData.image = playerRow.photo_url;
            }
          }

          // If still no image, try TheSportsDB
          if (!updatedData.image) {
            const sportsDb = await fetchFromSportsDb(report.player_name);
            if (sportsDb.photoUrl) {
              updatedData.image = sportsDb.photoUrl;
            }

            // Also use birth date for age if needed
            if (report.missingFields.includes("age") && sportsDb.dateBorn) {
              const age = calcAge(sportsDb.dateBorn);
              if (age !== null) {
                updatedData.age = age;
              }
            }
          }
        }

        // Enrich age from TheSportsDB if still missing (and not already set above)
        if (
          report.missingFields.includes("age") &&
          (updatedData.age === undefined || updatedData.age === null || updatedData.age === 0)
        ) {
          const sportsDb = await fetchFromSportsDb(report.player_name);
          if (sportsDb.dateBorn) {
            const age = calcAge(sportsDb.dateBorn);
            if (age !== null) {
              updatedData.age = age;
            }
          }
        }

        // Also inject player metadata from sb_players if missing
        if (report.player_external_id.startsWith("sb-open-")) {
          const rawId = parseInt(report.player_external_id.replace("sb-open-", ""), 10);
          if (!updatedData.nationality || !updatedData.position) {
            const { data: playerRow } = await supabase
              .from("sb_players")
              .select("nationality, primary_position")
              .eq("player_id", rawId)
              .single();

            if (playerRow) {
              if (!updatedData.nationality) updatedData.nationality = playerRow.nationality;
              if (!updatedData.position) updatedData.position = playerRow.primary_position;
            }
          }
        }

        // Update the row
        const { error: updateError } = await supabase
          .from("player_reports")
          .update({ report_data: updatedData })
          .eq("id", report.id);

        if (updateError) {
          results.push({
            report_id: report.id,
            player_name: report.player_name,
            player_external_id: report.player_external_id,
            missing_fields: report.missingFields,
            action: "error",
            error: updateError.message,
          });
        } else {
          results.push({
            report_id: report.id,
            player_name: report.player_name,
            player_external_id: report.player_external_id,
            missing_fields: report.missingFields,
            action: "updated",
          });
        }
      } catch (err) {
        results.push({
          report_id: report.id,
          player_name: report.player_name,
          player_external_id: report.player_external_id,
          missing_fields: report.missingFields,
          action: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const updated = results.filter((r) => r.action === "updated").length;
    const errors = results.filter((r) => r.action === "error").length;

    return new Response(
      JSON.stringify({
        dry_run: false,
        total_reports: reports.length,
        reports_processed: reportsToBackfill.length,
        updated,
        errors,
        results,
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
    console.error("backfill-reports error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
