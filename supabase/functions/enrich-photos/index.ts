// Enrich player photos — fetches photos from API-Football for sb_players without photo_url
// POST /enrich-photos { batch_size?: number }
// Protected: requires service_role or admin auth

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

interface ApiSearchResult {
  player: {
    id: number;
    name: string;
    nationality: string;
    photo: string;
  };
}

async function searchApiFootball(
  name: string,
  apiKey: string
): Promise<ApiSearchResult[]> {
  const res = await fetch(
    `${API_FOOTBALL_BASE}/players?search=${encodeURIComponent(name)}`,
    {
      headers: {
        "x-apisports-key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (res.status === 429) {
    throw new Error("RATE_LIMIT");
  }
  if (!res.ok) {
    throw new Error(`API-Football ${res.status}`);
  }

  const json = await res.json();
  console.log(`API-Football search "${name}": ${json.results ?? 0} results, errors: ${JSON.stringify(json.errors ?? {})}`);
  return json.response ?? [];
}

function normalizeNat(nat: string): string {
  const map: Record<string, string> = {
    "Korea Republic": "South Korea",
    "IR Iran": "Iran",
    "Côte d'Ivoire": "Ivory Coast",
    USA: "United States",
  };
  return map[nat] ?? nat;
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

  // Auth: require service_role key
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!serviceRoleKey || token !== serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "This endpoint requires service_role key" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API_FOOTBALL_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batch_size ?? 15, 30); // max 30 per call

    const supabase = getServiceClient();

    // Get players without photos
    const { data: players, error } = await supabase
      .from("sb_players")
      .select("player_id, player_name, player_nickname, nationality")
      .is("photo_url", null)
      .order("player_id")
      .limit(batchSize);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ message: "All players have photos", found: 0, not_found: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let found = 0;
    let notFound = 0;
    const results: string[] = [];

    for (const p of players) {
      const searchName = p.player_nickname ?? p.player_name;

      try {
        // Rate limit: 6.5s between calls (10/min)
        if (found + notFound > 0) {
          await new Promise((r) => setTimeout(r, 6500));
        }

        const data = await searchApiFootball(searchName, apiKey);

        let match: ApiSearchResult | undefined;

        if (data.length > 0) {
          // Match by nationality
          const pNat = normalizeNat(p.nationality ?? "");
          match = data.find(
            (r) => normalizeNat(r.player.nationality) === pNat
          );
          if (!match) {
            // Log what we got vs what we expected
            results.push(`  (${searchName}: ${data.length} results, nationalities: ${data.slice(0,3).map(r => r.player.nationality).join(", ")} — wanted: ${pNat})`);
            match = data[0]; // fallback to first
          }
        }

        if (!match) {
          // Try last name only
          const lastName = searchName.split(" ").pop()!;
          if (lastName !== searchName && lastName.length > 2) {
            await new Promise((r) => setTimeout(r, 6500));
            const retry = await searchApiFootball(lastName, apiKey);
            match = retry.find(
              (r) =>
                normalizeNat(r.player.nationality) ===
                normalizeNat(p.nationality ?? "")
            );
          }
        }

        if (match) {
          await supabase
            .from("sb_players")
            .update({ photo_url: match.player.photo })
            .eq("player_id", p.player_id);
          found++;
          results.push(`✓ ${searchName} → ${match.player.photo}`);
        } else {
          notFound++;
          results.push(`✗ ${searchName} (API returned ${data.length} results)`);
        }
      } catch (err) {
        if ((err as Error).message === "RATE_LIMIT") {
          results.push(`⚠ Rate limited at ${searchName}`);
          break;
        }
        notFound++;
        results.push(`✗ ${searchName}: ${(err as Error).message}`);
      }
    }

    // Count remaining
    const { count } = await supabase
      .from("sb_players")
      .select("player_id", { count: "exact", head: true })
      .is("photo_url", null);

    return new Response(
      JSON.stringify({
        found,
        not_found: notFound,
        remaining: count,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
