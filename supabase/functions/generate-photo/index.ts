// Generate player photos via Stitch (Google) API
// Called internally by the search function for players without photos
// POST /generate-photo { player_ids: number[] }
// Also supports being called directly with service_role key

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const STITCH_MCP_URL = "https://stitch.googleapis.com/mcp";

interface StitchScreen {
  screenshot?: { downloadUrl?: string };
  id?: string;
  screenType?: string;
  screenMetadata?: { status?: string };
}

interface StitchDesign {
  screens?: StitchScreen[];
}

interface StitchOutputComponent {
  design?: StitchDesign;
  text?: string;
}

interface StitchResult {
  outputComponents?: StitchOutputComponent[];
}

/** Strip diacritics so prompts stay ASCII-safe for the Stitch API. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function generatePortrait(
  playerName: string,
  nationality: string,
  projectId: string,
  stitchApiKey: string
): Promise<string | null> {
  const safeName = stripAccents(playerName);
  const safeNat = stripAccents(nationality);
  const prompt = `A high-quality, professional studio headshot of ${safeName}, ${safeNat} football player, wearing a plain neutral-colored football jersey with no logos, no emblems, no brands, no text. Looking directly at the camera with a confident expression, neutral grey background, professional studio lighting, high resolution, photorealistic.`;
  console.log(`Generating portrait for ${safeName} (${safeNat})…`);

  const res = await fetch(STITCH_MCP_URL, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": stitchApiKey,
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
    console.error(`Stitch API error: ${res.status} — ${body}`);
    return null;
  }

  const json = await res.json();
  console.log("Stitch raw keys:", Object.keys(json?.result ?? {}));

  // Try structuredContent first (already parsed), then fall back to text
  let parsed: StitchResult | null = null;

  const structured = json?.result?.structuredContent;
  if (structured?.outputComponents) {
    parsed = structured as StitchResult;
  } else {
    const contentText = json?.result?.content?.[0]?.text;
    if (!contentText) {
      console.error("Stitch returned no content — full response:", JSON.stringify(json).slice(0, 500));
      return null;
    }
    try {
      parsed = JSON.parse(contentText) as StitchResult;
    } catch (e) {
      console.error("Failed to parse Stitch response:", (e as Error).message);
      return null;
    }
  }

  const screen = parsed?.outputComponents?.find((c) => c.design)?.design
    ?.screens?.[0];
  if (screen?.screenshot?.downloadUrl) {
    console.log(`Generated photo for ${playerName}: ${screen.screenshot.downloadUrl.slice(0, 80)}...`);
    return screen.screenshot.downloadUrl;
  }
  console.error("No downloadUrl in parsed Stitch response");
  return null;
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

  const stitchApiKey = Deno.env.get("STITCH_API_KEY");
  const stitchProjectId = Deno.env.get("STITCH_PROJECT_ID");

  if (!stitchApiKey || !stitchProjectId) {
    return new Response(
      JSON.stringify({ error: "STITCH_API_KEY or STITCH_PROJECT_ID not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    // Process one player per request — each Stitch call takes 30-60s
    const batch = playerIds.slice(0, 1);

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
      // Skip if already has a photo
      if (p.photo_url) {
        results.push({ player_id: p.player_id, status: "already_has_photo", photo_url: p.photo_url });
        continue;
      }

      const displayName = p.player_nickname ?? p.player_name;
      const nationality = p.nationality ?? "Unknown";

      const photoUrl = await generatePortrait(
        displayName,
        nationality,
        stitchProjectId,
        stitchApiKey
      );

      if (photoUrl) {
        await supabase
          .from("sb_players")
          .update({ photo_url: photoUrl })
          .eq("player_id", p.player_id);

        results.push({ player_id: p.player_id, status: "generated", photo_url: photoUrl });
      } else {
        results.push({ player_id: p.player_id, status: "failed" });
      }
    }

    return new Response(
      JSON.stringify({
        generated: results.filter((r) => r.status === "generated").length,
        failed: results.filter((r) => r.status === "failed").length,
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
