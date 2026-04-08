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
    const photo = match.strCutout || match.strThumb || null;
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

    // Decode JWT payload to check role
    let isServiceRole = false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isServiceRole = payload.role === "service_role";
    } catch { /* not a valid JWT */ }

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
        if (rd[field] === undefined || rd[field] === null) {
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
