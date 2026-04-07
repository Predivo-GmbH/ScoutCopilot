/**
 * Fetch player photos from API-Football and store URLs in sb_players.photo_url
 *
 * API-Football free tier: 100 requests/day, 10 requests/minute
 * Each call searches by player name and matches by nationality.
 *
 * Usage:
 *   npx tsx scripts/fetch-player-photos.ts [--limit 80] [--offset 0]
 *
 * Run daily until all players have photos. The script skips players
 * that already have a photo_url set.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rlcsuqwqzoqjykdiqjye.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}
if (!API_FOOTBALL_KEY) {
  console.error("Set API_FOOTBALL_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const offsetIdx = args.indexOf("--offset");
const BATCH_LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 80;
const BATCH_OFFSET = offsetIdx >= 0 ? parseInt(args[offsetIdx + 1]) : 0;

interface ApiFootballResponse {
  response: Array<{
    player: {
      id: number;
      name: string;
      firstname: string;
      lastname: string;
      nationality: string;
      photo: string;
    };
  }>;
  results: number;
  errors: Record<string, string>;
}

async function searchApiFootball(name: string): Promise<ApiFootballResponse> {
  const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_FOOTBALL_KEY!,
      Accept: "application/json",
    },
  });

  if (res.status === 429) {
    throw new Error("RATE_LIMIT");
  }
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<ApiFootballResponse>;
}

function normalizeNationality(nat: string): string {
  // API-Football and StatsBomb may use slightly different nationality names
  const map: Record<string, string> = {
    "Korea Republic": "South Korea",
    "Korea DPR": "North Korea",
    "IR Iran": "Iran",
    "Côte d'Ivoire": "Ivory Coast",
    "Cote d'Ivoire": "Ivory Coast",
    USA: "United States",
    "USA ": "United States",
  };
  return map[nat] ?? nat;
}

async function main() {
  // Fetch players without photos
  const { data: players, error } = await supabase
    .from("sb_players")
    .select("player_id, player_name, player_nickname, nationality")
    .is("photo_url", null)
    .order("player_id")
    .range(BATCH_OFFSET, BATCH_OFFSET + BATCH_LIMIT - 1);

  if (error) {
    console.error("DB error:", error.message);
    process.exit(1);
  }

  if (!players || players.length === 0) {
    console.log("All players already have photos (or no players in range).");
    return;
  }

  console.log(
    `Processing ${players.length} players (offset ${BATCH_OFFSET}, limit ${BATCH_LIMIT})...`
  );

  let found = 0;
  let notFound = 0;
  let rateLimited = false;

  for (let i = 0; i < players.length; i++) {
    if (rateLimited) break;

    const p = players[i];
    const searchName = p.player_nickname ?? p.player_name;

    // Rate limit: max 10/min — wait 6.5s between calls
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 6500));
    }

    try {
      const data = await searchApiFootball(searchName);

      if (data.results === 0 || data.response.length === 0) {
        // Try with last name only
        const lastName = searchName.split(" ").pop()!;
        if (lastName !== searchName && lastName.length > 2) {
          await new Promise((r) => setTimeout(r, 6500));
          const retry = await searchApiFootball(lastName);
          const match = retry.response.find(
            (r) =>
              normalizeNationality(r.player.nationality) ===
              normalizeNationality(p.nationality ?? "")
          );
          if (match) {
            await supabase
              .from("sb_players")
              .update({ photo_url: match.player.photo })
              .eq("player_id", p.player_id);
            found++;
            console.log(`  [${i + 1}/${players.length}] ✓ ${searchName} → ${match.player.photo}`);
            continue;
          }
        }
        notFound++;
        console.log(`  [${i + 1}/${players.length}] ✗ ${searchName} — not found`);
        continue;
      }

      // Match by nationality to pick the right player
      const exactMatch =
        data.response.find(
          (r) =>
            normalizeNationality(r.player.nationality) ===
            normalizeNationality(p.nationality ?? "")
        ) ?? data.response[0]; // fallback to first result

      await supabase
        .from("sb_players")
        .update({ photo_url: exactMatch.player.photo })
        .eq("player_id", p.player_id);

      found++;
      console.log(
        `  [${i + 1}/${players.length}] ✓ ${searchName} → ${exactMatch.player.photo}`
      );
    } catch (err) {
      if ((err as Error).message === "RATE_LIMIT") {
        console.log(`  Rate limited at player ${i + 1}. Run again tomorrow.`);
        rateLimited = true;
      } else {
        console.error(`  [${i + 1}] Error for ${searchName}:`, (err as Error).message);
        notFound++;
      }
    }
  }

  console.log(`\nDone: ${found} found, ${notFound} not found, ${rateLimited ? "rate limited" : "completed"}`);

  // Show remaining count
  const { count } = await supabase
    .from("sb_players")
    .select("player_id", { count: "exact", head: true })
    .is("photo_url", null);

  console.log(`Remaining players without photos: ${count}`);
}

main();
