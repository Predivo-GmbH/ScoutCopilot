// Fetch real player photos from TheSportsDB, fall back to Stitch AI generation
// Called internally by the search function for players without photos
// POST /generate-photo { player_ids: number[] }
// Also supports being called directly with service_role key

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const STITCH_MCP_URL = "https://stitch.googleapis.com/mcp";

/** Strip diacritics so search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ── TheSportsDB (primary) ──────────────────────────────────────────

interface SportsDbPlayer {
  strPlayer?: string;
  strThumb?: string;
  strCutout?: string;
}

async function fetchFromSportsDb(playerName: string): Promise<string | null> {
  const safeName = stripAccents(playerName);
  const url = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;
  console.log(`[SportsDB] Searching for "${safeName}"…`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[SportsDB] HTTP ${res.status}`);
    return null;
  }

  const data = await res.json();
  const players: SportsDbPlayer[] = data?.player ?? [];

  if (players.length === 0) {
    console.log(`[SportsDB] No results for "${safeName}"`);
    return null;
  }

  const photo = players[0].strCutout || players[0].strThumb || null;
  if (photo) {
    console.log(`[SportsDB] Found photo for ${playerName}: ${photo.slice(0, 80)}…`);
  } else {
    console.log(`[SportsDB] Player "${players[0].strPlayer}" found but no photo`);
  }
  return photo;
}

// ── Stitch AI (fallback) ───────────────────────────────────────────

interface StitchScreen {
  screenshot?: { downloadUrl?: string };
}

interface StitchOutputComponent {
  design?: { screens?: StitchScreen[] };
  text?: string;
}

interface StitchResult {
  outputComponents?: StitchOutputComponent[];
}

async function generateWithStitch(
  playerName: string,
  nationality: string,
  projectId: string,
  apiKey: string,
): Promise<string | null> {
  const safeName = stripAccents(playerName);
  const safeNat = stripAccents(nationality);
  const prompt = `A high-quality, professional studio headshot of ${safeName}, ${safeNat} football player, wearing a plain neutral-colored football jersey with no logos, no emblems, no brands, no text. Looking directly at the camera with a confident expression, neutral grey background, professional studio lighting, high resolution, photorealistic.`;
  console.log(`[Stitch] Generating portrait for ${safeName} (${safeNat})…`);

  const res = await fetch(STITCH_MCP_URL, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "generate_screen_from_text",
        arguments: { projectId, prompt },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[Stitch] HTTP ${res.status} — ${body}`);
    return null;
  }

  const json = await res.json();

  // Try structuredContent first, then fall back to content text
  let parsed: StitchResult | null = null;
  const structured = json?.result?.structuredContent;
  if (structured?.outputComponents) {
    parsed = structured as StitchResult;
  } else {
    const contentText = json?.result?.content?.[0]?.text;
    if (!contentText) {
      console.error("[Stitch] No content in response:", JSON.stringify(json).slice(0, 500));
      return null;
    }
    try {
      parsed = JSON.parse(contentText) as StitchResult;
    } catch (e) {
      console.error("[Stitch] JSON parse error:", (e as Error).message);
      return null;
    }
  }

  const screen = parsed?.outputComponents?.find((c) => c.design)?.design?.screens?.[0];
  if (screen?.screenshot?.downloadUrl) {
    console.log(`[Stitch] Generated photo for ${playerName}: ${screen.screenshot.downloadUrl.slice(0, 80)}…`);
    return screen.screenshot.downloadUrl;
  }
  console.error("[Stitch] No downloadUrl in response");
  return null;
}

// ── Main handler ───────────────────────────────────────────────────

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stitchApiKey = Deno.env.get("STITCH_API_KEY");
  const stitchProjectId = Deno.env.get("STITCH_PROJECT_ID");

  try {
    const body = await req.json().catch(() => ({}));
    const playerIds: number[] = body.player_ids ?? [];

    if (playerIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing player_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TheSportsDB is fast; Stitch fallback is slow (30-60s each), so limit batch
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

    const results: Array<{ player_id: number; status: string; source?: string; photo_url?: string }> = [];

    for (const p of players ?? []) {
      if (p.photo_url) {
        results.push({ player_id: p.player_id, status: "already_has_photo", photo_url: p.photo_url });
        continue;
      }

      const displayName = p.player_nickname ?? p.player_name;
      const nationality = p.nationality ?? "Unknown";

      // 1. Try TheSportsDB (real photo, instant)
      let photoUrl = await fetchFromSportsDb(displayName);

      // 2. Fallback: Stitch AI generation (slower, names get genericized)
      if (!photoUrl && stitchApiKey && stitchProjectId) {
        console.log(`[Fallback] No SportsDB photo for "${displayName}", trying Stitch…`);
        photoUrl = await generateWithStitch(displayName, nationality, stitchProjectId, stitchApiKey);
      }

      if (photoUrl) {
        await supabase
          .from("sb_players")
          .update({ photo_url: photoUrl })
          .eq("player_id", p.player_id);

        const source = photoUrl.includes("thesportsdb.com") ? "sportsdb" : "stitch";
        results.push({ player_id: p.player_id, status: "found", source, photo_url: photoUrl });
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
