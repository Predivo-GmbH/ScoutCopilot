// Fetch real player photos from TheSportsDB
// Called internally by the search function for players without photos
// POST /generate-photo { player_ids: number[] }
// Also supports being called directly with service_role key

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

/** Strip diacritics so search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface SportsDbPlayer {
  strPlayer?: string;
  strThumb?: string;
  strCutout?: string;
}

async function fetchPlayerPhoto(playerName: string): Promise<string | null> {
  const safeName = stripAccents(playerName);
  const url = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;
  console.log(`Searching TheSportsDB for "${safeName}"…`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`TheSportsDB error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const players: SportsDbPlayer[] = data?.player ?? [];

  if (players.length === 0) {
    console.error(`No results for "${safeName}" on TheSportsDB`);
    return null;
  }

  // Prefer cutout (transparent PNG), fall back to thumb
  const photo = players[0].strCutout || players[0].strThumb || null;
  if (photo) {
    console.log(`Found photo for ${playerName}: ${photo.slice(0, 80)}…`);
  } else {
    console.error(`TheSportsDB returned player "${players[0].strPlayer}" but no photo`);
  }
  return photo;
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
    const playerIds: number[] = body.player_ids ?? [];

    if (playerIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing player_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TheSportsDB is fast — can process multiple players per request
    const batch = playerIds.slice(0, 10);

    const supabase = getServiceClient();

    const { data: players, error } = await supabase
      .from("sb_players")
      .select("player_id, player_name, player_nickname, nationality, photo_url")
      .in("player_id", batch);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ player_id: number; status: string; photo_url?: string }> = [];

    for (const p of players ?? []) {
      if (p.photo_url) {
        results.push({ player_id: p.player_id, status: "already_has_photo", photo_url: p.photo_url });
        continue;
      }

      const displayName = p.player_nickname ?? p.player_name;
      const photoUrl = await fetchPlayerPhoto(displayName);

      if (photoUrl) {
        await supabase
          .from("sb_players")
          .update({ photo_url: photoUrl })
          .eq("player_id", p.player_id);

        results.push({ player_id: p.player_id, status: "found", photo_url: photoUrl });
      } else {
        results.push({ player_id: p.player_id, status: "not_found" });
      }
    }

    return new Response(
      JSON.stringify({
        found: results.filter((r) => r.status === "found").length,
        not_found: results.filter((r) => r.status === "not_found").length,
        skipped: results.filter((r) => r.status === "already_has_photo").length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-photo error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
