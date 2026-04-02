/**
 * StatsBomb Open Data Import Script
 *
 * Fetches event-level data from StatsBomb's free open dataset on GitHub,
 * aggregates it into per-player season stats, and upserts into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   npx tsx scripts/import-statsbomb.ts [--competition=11] [--season=90]
 *
 * Without flags, imports Phase 1: La Liga 2020/21 + FIFA World Cup 2022.
 * With a GitHub PAT, set GITHUB_TOKEN=xxx for 5,000 req/hour (vs 60 unauthenticated).
 */

import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────

const OPEN_DATA_BASE =
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional, for higher rate limit

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Phase 1 defaults: La Liga 2020/21 + FIFA World Cup 2022
const PHASE_1_COMPETITIONS = [
  { competition_id: 11, season_id: 90 }, // La Liga 2020/21
  { competition_id: 43, season_id: 106 }, // FIFA World Cup 2022
];

// ── Types ─────────────────────────────────────────────────────────

interface Competition {
  competition_id: number;
  season_id: number;
  competition_name: string;
  season_name: string;
  country_name: string;
  match_updated: string;
  match_available: string;
}

interface Match {
  match_id: number;
  match_date: string;
  kick_off: string;
  home_team: { home_team_id: number; home_team_name: string };
  away_team: { away_team_id: number; away_team_name: string };
  home_score: number;
  away_score: number;
  competition: { competition_id: number; competition_name: string };
  season: { season_id: number; season_name: string };
  stadium?: { id: number; name: string };
  match_week?: number;
}

interface LineupPlayer {
  player_id: number;
  player_name: string;
  player_nickname: string | null;
  jersey_number: number;
  country: { id: number; name: string };
  positions: Array<{
    position: string;
    from: string;
    to: string | null;
    from_period: number;
    to_period: number | null;
    start_reason: string;
    end_reason: string | null;
  }>;
}

interface LineupTeam {
  team_id: number;
  team_name: string;
  lineup: LineupPlayer[];
}

interface Event {
  id: string;
  type: { id: number; name: string };
  player?: { id: number; name: string };
  team?: { id: number; name: string };
  location?: [number, number];
  duration?: number;
  under_pressure?: boolean;
  pass?: {
    recipient?: { id: number; name: string };
    length?: number;
    angle?: number;
    end_location?: [number, number];
    goal_assist?: boolean;
    shot_assist?: boolean;
    through_ball?: boolean;
    cross?: boolean;
    outcome?: { id: number; name: string };
  };
  shot?: {
    statsbomb_xg?: number;
    outcome?: { id: number; name: string };
    type?: { id: number; name: string };
  };
  duel?: {
    type?: { id: number; name: string };
    outcome?: { id: number; name: string };
  };
  dribble?: {
    outcome?: { id: number; name: string };
  };
  carry?: {
    end_location?: [number, number];
  };
  foul_committed?: {
    card?: { id: number; name: string };
  };
  interception?: {
    outcome?: { id: number; name: string };
  };
}

// ── Player Accumulator ────────────────────────────────────────────

interface PlayerAccumulator {
  player_id: number;
  player_name: string;
  player_nickname: string | null;
  nationality: string;
  jersey_number: number;
  team_name: string;
  positions: Set<string>;
  matchIds: Set<number>;
  // Stats
  goals: number;
  assists: number;
  xg: number;
  xa: number;
  npxg: number;
  key_passes: number;
  passes_attempted: number;
  passes_completed: number;
  progressive_passes: number;
  progressive_carries: number;
  through_balls: number;
  long_balls: number;
  crosses: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  aerial_duels: number;
  aerial_duels_won: number;
  ground_duels: number;
  ground_duels_won: number;
  dribbles: number;
  dribbles_successful: number;
  pressures: number;
  shot_creating_actions: number;
  goal_creating_actions: number;
  yellow_cards: number;
  red_cards: number;
  // For xA computation: track shots assisted by each player
  assisted_shot_xgs: number;
}

function createAccumulator(
  p: LineupPlayer,
  teamName: string
): PlayerAccumulator {
  return {
    player_id: p.player_id,
    player_name: p.player_name,
    player_nickname: p.player_nickname,
    nationality: p.country.name,
    jersey_number: p.jersey_number,
    team_name: teamName,
    positions: new Set(),
    matchIds: new Set(),
    goals: 0, assists: 0, xg: 0, xa: 0, npxg: 0,
    key_passes: 0, passes_attempted: 0, passes_completed: 0,
    progressive_passes: 0, progressive_carries: 0,
    through_balls: 0, long_balls: 0, crosses: 0,
    tackles: 0, interceptions: 0, clearances: 0, blocks: 0,
    aerial_duels: 0, aerial_duels_won: 0,
    ground_duels: 0, ground_duels_won: 0,
    dribbles: 0, dribbles_successful: 0,
    pressures: 0,
    shot_creating_actions: 0, goal_creating_actions: 0,
    yellow_cards: 0, red_cards: 0,
    assisted_shot_xgs: 0,
  };
}

// ── StatsBomb Position Mapping ────────────────────────────────────

const SB_POSITION_MAP: Record<string, string> = {
  Goalkeeper: "GK",
  "Right Back": "RB",
  "Right Wing Back": "RB",
  "Left Back": "LB",
  "Left Wing Back": "LB",
  "Right Center Back": "CB",
  "Left Center Back": "CB",
  "Center Back": "CB",
  "Right Defensive Midfield": "CDM",
  "Left Defensive Midfield": "CDM",
  "Center Defensive Midfield": "CDM",
  "Right Center Midfield": "CM",
  "Left Center Midfield": "CM",
  "Center Midfield": "CM",
  "Right Attacking Midfield": "CAM",
  "Left Attacking Midfield": "CAM",
  "Center Attacking Midfield": "CAM",
  "Right Wing": "RW",
  "Left Wing": "LW",
  "Right Center Forward": "ST",
  "Left Center Forward": "ST",
  "Center Forward": "ST",
  Striker: "ST",
};

function mapPosition(sbPosition: string): string {
  return SB_POSITION_MAP[sbPosition] ?? sbPosition;
}

function getPrimaryPosition(positions: Set<string>): string {
  // Convert to mapped positions and pick the most common
  const mapped = [...positions].map(mapPosition);
  const counts = new Map<string, number>();
  for (const p of mapped) {
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  let best = "Unknown";
  let bestCount = 0;
  for (const [pos, count] of counts) {
    if (count > bestCount) {
      best = pos;
      bestCount = count;
    }
  }
  return best;
}

// ── GitHub Fetch with Rate Limiting ───────────────────────────────

let requestCount = 0;

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${OPEN_DATA_BASE}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  // Rate limit: 200ms between requests
  requestCount++;
  if (requestCount % 50 === 0) {
    console.log(`  [${requestCount} requests made so far]`);
  }
  await delay(200);

  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    console.warn(`Rate limited at request ${requestCount}. Waiting 60s...`);
    await delay(60000);
    return fetchJson(path); // retry
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Event Processing ──────────────────────────────────────────────

function processEvents(
  events: Event[],
  matchId: number,
  accumulators: Map<number, PlayerAccumulator>
): void {
  // Build a map of pass -> subsequent shot for xA computation
  const shotAssistMap = new Map<number, number>(); // passerId -> shot xG

  for (const evt of events) {
    const playerId = evt.player?.id;
    if (!playerId) continue;

    const acc = accumulators.get(playerId);
    if (!acc) continue;

    acc.matchIds.add(matchId);

    switch (evt.type.name) {
      case "Pass": {
        acc.passes_attempted++;
        const outcome = evt.pass?.outcome;
        if (!outcome) acc.passes_completed++; // no outcome = complete

        if (evt.pass?.goal_assist) {
          acc.assists++;
          acc.goal_creating_actions++;
          acc.shot_creating_actions++;
        }
        if (evt.pass?.shot_assist) {
          acc.key_passes++;
          acc.shot_creating_actions++;
        }
        if (evt.pass?.through_ball) acc.through_balls++;
        if (evt.pass?.cross) acc.crosses++;
        if (evt.pass?.length && evt.pass.length > 32) acc.long_balls++;

        // Progressive pass: moves ball >= 10m toward opponent goal
        if (evt.pass?.end_location && evt.location) {
          const startDist = 120 - evt.location[0];
          const endDist = 120 - evt.pass.end_location[0];
          if (startDist - endDist >= 10) acc.progressive_passes++;
        }
        break;
      }

      case "Shot": {
        const xg = evt.shot?.statsbomb_xg ?? 0;
        acc.xg += xg;
        if (evt.shot?.type?.name !== "Penalty") {
          acc.npxg += xg;
        }
        if (evt.shot?.outcome?.name === "Goal") acc.goals++;
        break;
      }

      case "Duel": {
        const duelType = evt.duel?.type?.name ?? "";
        const won =
          evt.duel?.outcome?.name === "Won" ||
          evt.duel?.outcome?.name === "Success In Play" ||
          evt.duel?.outcome?.name === "Success Out";

        if (duelType === "Tackle") {
          acc.tackles++;
        } else if (duelType.includes("Aerial")) {
          acc.aerial_duels++;
          if (won) acc.aerial_duels_won++;
        } else {
          acc.ground_duels++;
          if (won) acc.ground_duels_won++;
        }
        break;
      }

      case "Dribble": {
        acc.dribbles++;
        if (evt.dribble?.outcome?.name === "Complete")
          acc.dribbles_successful++;
        break;
      }

      case "Interception":
        acc.interceptions++;
        break;

      case "Clearance":
        acc.clearances++;
        break;

      case "Block":
        acc.blocks++;
        break;

      case "Pressure":
        acc.pressures++;
        break;

      case "Foul Committed": {
        const card = evt.foul_committed?.card?.name ?? "";
        if (card === "Yellow Card" || card === "Second Yellow")
          acc.yellow_cards++;
        if (card === "Red Card") acc.red_cards++;
        break;
      }

      case "Carry": {
        if (evt.carry?.end_location && evt.location) {
          const startDist = 120 - evt.location[0];
          const endDist = 120 - evt.carry.end_location[0];
          if (startDist - endDist >= 10) acc.progressive_carries++;
        }
        break;
      }
    }
  }

  // Compute xA: for each pass with shot_assist, find the next shot event
  // and sum the shot's xG as the passer's xA
  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    if (
      evt.type.name === "Pass" &&
      evt.pass?.shot_assist &&
      evt.player?.id
    ) {
      // Find the next shot event (should be within a few events)
      for (let j = i + 1; j < Math.min(i + 10, events.length); j++) {
        if (events[j].type.name === "Shot" && events[j].shot?.statsbomb_xg) {
          const acc = accumulators.get(evt.player.id);
          if (acc) {
            acc.xa += events[j].shot!.statsbomb_xg!;
          }
          break;
        }
      }
    }
  }
}

// ── Supabase Upserts ──────────────────────────────────────────────

async function upsertCompetition(
  comp: Competition,
  matchCount: number
): Promise<void> {
  const { error } = await supabase.from("sb_competitions").upsert(
    {
      competition_id: comp.competition_id,
      season_id: comp.season_id,
      competition_name: comp.competition_name,
      season_name: comp.season_name,
      country_name: comp.country_name,
      match_count: matchCount,
      imported_at: new Date().toISOString(),
    },
    { onConflict: "competition_id,season_id" }
  );
  if (error) console.error("  Error upserting competition:", error.message);
}

async function upsertMatches(matches: Match[]): Promise<void> {
  const rows = matches.map((m) => ({
    match_id: m.match_id,
    competition_id: m.competition.competition_id,
    season_id: m.season.season_id,
    match_date: m.match_date,
    home_team_id: m.home_team.home_team_id,
    home_team_name: m.home_team.home_team_name,
    away_team_id: m.away_team.away_team_id,
    away_team_name: m.away_team.away_team_name,
    home_score: m.home_score,
    away_score: m.away_score,
    stadium_name: m.stadium?.name ?? null,
    match_week: m.match_week ?? null,
  }));

  // Batch in chunks of 100
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("sb_matches")
      .upsert(chunk, { onConflict: "match_id" });
    if (error) console.error("  Error upserting matches:", error.message);
  }
}

async function upsertPlayers(
  accumulators: Map<number, PlayerAccumulator>
): Promise<void> {
  const rows = [...accumulators.values()].map((acc) => {
    const mappedPositions = [...acc.positions].map(mapPosition);
    const uniquePositions = [...new Set(mappedPositions)];
    return {
      player_id: acc.player_id,
      player_name: acc.player_name,
      player_nickname: acc.player_nickname,
      nationality: acc.nationality,
      jersey_number: acc.jersey_number,
      primary_position: getPrimaryPosition(acc.positions),
      positions: uniquePositions,
    };
  });

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("sb_players")
      .upsert(chunk, { onConflict: "player_id" });
    if (error) console.error("  Error upserting players:", error.message);
  }
}

async function upsertPlayerStats(
  accumulators: Map<number, PlayerAccumulator>,
  competitionId: number,
  seasonId: number,
  competitionName: string,
  seasonName: string
): Promise<void> {
  const rows = [...accumulators.values()]
    .filter((acc) => acc.matchIds.size > 0)
    .map((acc) => {
      const matchesPlayed = acc.matchIds.size;
      const minutesPlayed = matchesPlayed * 90; // simplified estimate

      return {
        player_id: acc.player_id,
        competition_id: competitionId,
        season_id: seasonId,
        competition_name: competitionName,
        season_name: seasonName,
        team_name: acc.team_name,
        matches_played: matchesPlayed,
        minutes_played: minutesPlayed,
        goals: acc.goals,
        assists: acc.assists,
        xg: Number(acc.xg.toFixed(3)),
        xa: Number(acc.xa.toFixed(3)),
        npxg: Number(acc.npxg.toFixed(3)),
        key_passes: acc.key_passes,
        passes_completed: acc.passes_completed,
        passes_attempted: acc.passes_attempted,
        pass_completion:
          acc.passes_attempted > 0
            ? Number(
                ((acc.passes_completed / acc.passes_attempted) * 100).toFixed(2)
              )
            : 0,
        progressive_passes: acc.progressive_passes,
        through_balls: acc.through_balls,
        long_balls: acc.long_balls,
        crosses: acc.crosses,
        progressive_carries: acc.progressive_carries,
        tackles: acc.tackles,
        interceptions: acc.interceptions,
        clearances: acc.clearances,
        blocks: acc.blocks,
        aerial_duels: acc.aerial_duels,
        aerial_duels_won: acc.aerial_duels_won,
        aerial_duel_win_rate:
          acc.aerial_duels > 0
            ? Number(
                ((acc.aerial_duels_won / acc.aerial_duels) * 100).toFixed(2)
              )
            : 0,
        ground_duels: acc.ground_duels,
        ground_duels_won: acc.ground_duels_won,
        ground_duel_win_rate:
          acc.ground_duels > 0
            ? Number(
                ((acc.ground_duels_won / acc.ground_duels) * 100).toFixed(2)
              )
            : 0,
        dribbles: acc.dribbles,
        dribbles_successful: acc.dribbles_successful,
        dribble_success_rate:
          acc.dribbles > 0
            ? Number(
                ((acc.dribbles_successful / acc.dribbles) * 100).toFixed(2)
              )
            : 0,
        pressures: acc.pressures,
        shot_creating_actions: acc.shot_creating_actions,
        goal_creating_actions: acc.goal_creating_actions,
        yellow_cards: acc.yellow_cards,
        red_cards: acc.red_cards,
      };
    });

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("sb_player_season_stats")
      .upsert(chunk, { onConflict: "player_id,competition_id,season_id" });
    if (error)
      console.error("  Error upserting player stats:", error.message);
  }
}

// ── Import a Single Competition ───────────────────────────────────

async function importCompetition(
  competitionId: number,
  seasonId: number
): Promise<void> {
  console.log(
    `\nImporting competition ${competitionId}, season ${seasonId}...`
  );

  // Fetch all matches for this competition/season
  const matches = await fetchJson<Match[]>(
    `/matches/${competitionId}/${seasonId}.json`
  );
  console.log(`  Found ${matches.length} matches`);

  if (matches.length === 0) return;

  const competitionName =
    matches[0].competition.competition_name ?? "Unknown";
  const seasonName = matches[0].season.season_name ?? "Unknown";

  // Upsert competition record
  const allComps = await fetchJson<Competition[]>("/competitions.json");
  const compRecord = allComps.find(
    (c) =>
      c.competition_id === competitionId && c.season_id === seasonId
  );
  if (compRecord) {
    await upsertCompetition(compRecord, matches.length);
  }

  // Upsert match records
  await upsertMatches(matches);

  // Accumulate player stats across all matches
  const accumulators = new Map<number, PlayerAccumulator>();
  let processedMatches = 0;

  for (const match of matches) {
    processedMatches++;
    if (processedMatches % 20 === 0 || processedMatches === matches.length) {
      console.log(
        `  Processing match ${processedMatches}/${matches.length} (${match.home_team.home_team_name} vs ${match.away_team.away_team_name})`
      );
    }

    try {
      // Fetch lineups
      const lineups = await fetchJson<LineupTeam[]>(
        `/lineups/${match.match_id}.json`
      );

      // Register players from lineups
      for (const team of lineups) {
        for (const player of team.lineup) {
          if (!accumulators.has(player.player_id)) {
            accumulators.set(
              player.player_id,
              createAccumulator(player, team.team_name)
            );
          }
          const acc = accumulators.get(player.player_id)!;
          // Update team name to most recent
          acc.team_name = team.team_name;
          // Collect positions
          for (const pos of player.positions) {
            if (pos.position) acc.positions.add(pos.position);
          }
        }
      }

      // Fetch and process events
      const events = await fetchJson<Event[]>(
        `/events/${match.match_id}.json`
      );
      processEvents(events, match.match_id, accumulators);
    } catch (err) {
      console.error(
        `  Error processing match ${match.match_id}:`,
        (err as Error).message
      );
    }
  }

  console.log(
    `  Aggregated stats for ${accumulators.size} players across ${processedMatches} matches`
  );

  // Upsert players
  console.log("  Upserting players...");
  await upsertPlayers(accumulators);

  // Upsert player season stats
  console.log("  Upserting player season stats...");
  await upsertPlayerStats(
    accumulators,
    competitionId,
    seasonId,
    competitionName,
    seasonName
  );

  console.log(
    `  ✓ Competition ${competitionName} ${seasonName} imported successfully`
  );
}

// ── Main ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("StatsBomb Open Data Import");
  console.log("=========================\n");

  // Parse CLI args
  const args = process.argv.slice(2);
  let targets = PHASE_1_COMPETITIONS;

  const compArg = args.find((a) => a.startsWith("--competition="));
  const seasonArg = args.find((a) => a.startsWith("--season="));

  if (compArg && seasonArg) {
    targets = [
      {
        competition_id: parseInt(compArg.split("=")[1]),
        season_id: parseInt(seasonArg.split("=")[1]),
      },
    ];
  } else if (args.includes("--all")) {
    // Fetch all available competitions
    console.log("Fetching all available competitions...");
    const comps = await fetchJson<Competition[]>("/competitions.json");
    targets = comps.map((c) => ({
      competition_id: c.competition_id,
      season_id: c.season_id,
    }));
    console.log(`Found ${targets.length} competition-season combos\n`);
  }

  console.log(`Importing ${targets.length} competition(s):`);
  for (const t of targets) {
    console.log(
      `  - competition_id=${t.competition_id}, season_id=${t.season_id}`
    );
  }

  const startTime = Date.now();

  for (const target of targets) {
    await importCompetition(target.competition_id, target.season_id);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ Import complete in ${elapsed}s`);
  console.log(`  Total GitHub API requests: ${requestCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
