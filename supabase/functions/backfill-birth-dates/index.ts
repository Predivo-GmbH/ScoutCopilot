// Backfill birth dates for sb_players from TheSportsDB
// POST /backfill-birth-dates { batch_size?: number, offset?: number, dry_run?: boolean }
// Requires service_role key in Authorization header

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

/** Strip diacritics so TheSportsDB search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Small delay helper */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    // Auth: require the admin key (compare directly — JWT payload decode is forgeable).
    // Accept EITHER the new SB_SECRET_KEY or the legacy service_role key (additive).
    const secretKey = Deno.env.get("SB_SECRET_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const authorized =
      (!!secretKey && token === secretKey) ||
      (!!serviceRoleKey && token === serviceRoleKey);
    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "This endpoint requires service_role key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = typeof body.batch_size === "number" ? body.batch_size : 200;
    const offset = typeof body.offset === "number" ? body.offset : 0;
    const dryRun = body.dry_run === true;

    const supabase = getServiceClient();

    // Count total null birth_dates
    const { count: totalNull } = await supabase
      .from("sb_players")
      .select("player_id", { count: "exact", head: true })
      .is("birth_date", null);

    // Fetch batch
    const { data: players, error: fetchError } = await supabase
      .from("sb_players")
      .select("player_id, player_name, player_nickname")
      .is("birth_date", null)
      .order("player_id", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch players: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({
          total_null: totalNull ?? 0,
          processed: 0,
          updated: 0,
          not_found: 0,
          not_found_players: [],
          next_offset: null,
          message: "No players with null birth_date found at this offset",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({
          dry_run: true,
          total_null: totalNull ?? 0,
          batch_size: batchSize,
          offset,
          players_in_batch: players.length,
          next_offset: players.length === batchSize ? offset + batchSize : null,
          sample_players: players.slice(0, 10).map((p) => ({
            player_id: p.player_id,
            player_name: p.player_nickname ?? p.player_name,
          })),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updated = 0;
    let notFound = 0;
    const notFoundPlayers: Array<{ player_id: number; player_name: string }> = [];

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const displayName = p.player_nickname ?? p.player_name;
      const safeName = stripAccents(displayName).slice(0, 100);
      const url = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const match = data?.player?.[0];

          if (match?.dateBorn) {
            const parsed = new Date(match.dateBorn);
            if (!isNaN(parsed.getTime())) {
              await supabase
                .from("sb_players")
                .update({ birth_date: match.dateBorn })
                .eq("player_id", p.player_id);
              updated++;
            } else {
              notFound++;
              notFoundPlayers.push({ player_id: p.player_id, player_name: displayName });
            }
          } else {
            notFound++;
            notFoundPlayers.push({ player_id: p.player_id, player_name: displayName });
          }
        } else {
          notFound++;
          notFoundPlayers.push({ player_id: p.player_id, player_name: displayName });
        }
      } catch {
        notFound++;
        notFoundPlayers.push({ player_id: p.player_id, player_name: displayName });
      }

      // Be polite to the API
      if (i < players.length - 1) {
        await delay(100);
      }
    }

    const nextOffset = players.length === batchSize ? offset + batchSize : null;

    return new Response(
      JSON.stringify({
        total_null: totalNull ?? 0,
        processed: players.length,
        updated,
        not_found: notFound,
        not_found_players: notFoundPlayers,
        next_offset: nextOffset,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("backfill-birth-dates error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
