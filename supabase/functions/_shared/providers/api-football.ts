// API-Football (api-sports.io) provider — player photos, transfers, injuries
// Free tier: 100 req/day, 10 req/min, all endpoints, all leagues
// Docs: https://www.api-football.com/documentation-v3

import { waitForRateLimit } from "../rate-limiter.ts";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

// ── Types ─────────────────────────────────────────────────────────

export interface ApiFootballPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string | null;
      country: string | null;
    };
    nationality: string;
    height: string | null; // "188 cm"
    weight: string | null; // "76 kg"
    injured: boolean;
    photo: string; // CDN URL: https://media.api-sports.io/football/players/{id}.png
  };
  statistics: ApiFootballPlayerStats[];
}

export interface ApiFootballPlayerStats {
  team: { id: number; name: string; logo: string };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  games: {
    appearences: number | null; // API typo: "appearences"
    lineups: number | null;
    minutes: number | null;
    number: number | null;
    position: string | null;
    rating: string | null;
    captain: boolean;
  };
  shots: { total: number | null; on: number | null };
  goals: {
    total: number | null;
    conceded: number | null;
    assists: number | null;
    saves: number | null;
  };
  passes: {
    total: number | null;
    key: number | null;
    accuracy: number | null;
  };
  tackles: {
    total: number | null;
    blocks: number | null;
    interceptions: number | null;
  };
  duels: { total: number | null; won: number | null };
  dribbles: {
    attempts: number | null;
    success: number | null;
    past: number | null;
  };
  fouls: { drawn: number | null; committed: number | null };
  cards: {
    yellow: number | null;
    yellowred: number | null;
    red: number | null;
  };
  penalty: {
    won: number | null;
    commited: number | null; // API typo
    scored: number | null;
    missed: number | null;
    saved: number | null;
  };
}

export interface ApiFootballTransfer {
  player: { id: number; name: string };
  update: string;
  transfers: Array<{
    date: string;
    type: string; // "Loan", "Free", "N/A", "$45M"
    teams: {
      in: { id: number; name: string; logo: string };
      out: { id: number; name: string; logo: string };
    };
  }>;
}

export interface ApiFootballSidelined {
  type: string; // "Injury" or "Suspension"
  start: string;
  end: string | null;
}

export interface ApiFootballSearchResult {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: { date: string; place: string | null; country: string | null };
    nationality: string;
    height: string | null;
    weight: string | null;
    photo: string;
    injured: boolean;
  };
  statistics: ApiFootballPlayerStats[];
}

// ── API Client ────────────────────────────────────────────────────

async function apiFootballFetch(
  endpoint: string,
  organizationId: string
): Promise<unknown> {
  await waitForRateLimit(organizationId);

  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY not configured");
  }

  const response = await fetch(`${API_FOOTBALL_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": apiKey,
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    throw new Error("API-Football rate limit exceeded — try again shortly");
  }

  if (!response.ok) {
    throw new Error(
      `API-Football error (${response.status}): ${await response.text()}`
    );
  }

  const json = (await response.json()) as {
    response: unknown[];
    errors: Record<string, string>;
    results: number;
    paging: { current: number; total: number };
  };

  if (Object.keys(json.errors).length > 0) {
    throw new Error(
      `API-Football errors: ${JSON.stringify(json.errors)}`
    );
  }

  return json;
}

// ── Player Search ─────────────────────────────────────────────────

export async function searchPlayersByName(
  name: string,
  organizationId: string,
  leagueId?: number,
  season?: number
): Promise<ApiFootballSearchResult[]> {
  let endpoint = `/players?search=${encodeURIComponent(name)}`;
  if (leagueId) endpoint += `&league=${leagueId}`;
  if (season) endpoint += `&season=${season}`;

  const json = (await apiFootballFetch(endpoint, organizationId)) as {
    response: ApiFootballSearchResult[];
    paging: { current: number; total: number };
  };

  return json.response ?? [];
}

// ── Player by ID ──────────────────────────────────────────────────

export async function getPlayer(
  playerId: number,
  season: number,
  organizationId: string
): Promise<ApiFootballPlayer | null> {
  const json = (await apiFootballFetch(
    `/players?id=${playerId}&season=${season}`,
    organizationId
  )) as { response: ApiFootballPlayer[] };

  return json.response?.[0] ?? null;
}

// ── Player Photo URL ──────────────────────────────────────────────
// No API call needed — photos follow a predictable CDN pattern

export function getPlayerPhotoUrl(playerId: number): string {
  return `https://media.api-sports.io/football/players/${playerId}.png`;
}

// ── Transfers ─────────────────────────────────────────────────────

export async function getTransfers(
  playerId: number,
  organizationId: string
): Promise<ApiFootballTransfer | null> {
  const json = (await apiFootballFetch(
    `/transfers?player=${playerId}`,
    organizationId
  )) as { response: ApiFootballTransfer[] };

  return json.response?.[0] ?? null;
}

// ── Injuries / Sidelined ──────────────────────────────────────────

export async function getSidelined(
  playerId: number,
  organizationId: string
): Promise<ApiFootballSidelined[]> {
  const json = (await apiFootballFetch(
    `/sidelined?player=${playerId}`,
    organizationId
  )) as { response: ApiFootballSidelined[] };

  return json.response ?? [];
}

// ── Team Squad ────────────────────────────────────────────────────

export async function getTeamSquad(
  teamId: number,
  organizationId: string
): Promise<Array<{ id: number; name: string; age: number; number: number | null; position: string; photo: string }>> {
  const json = (await apiFootballFetch(
    `/players/squads?team=${teamId}`,
    organizationId
  )) as {
    response: Array<{
      team: { id: number; name: string; logo: string };
      players: Array<{
        id: number;
        name: string;
        age: number;
        number: number | null;
        position: string;
        photo: string;
      }>;
    }>;
  };

  return json.response?.[0]?.players ?? [];
}

// ── Helper: Parse height/weight strings ───────────────────────────

export function parseHeight(h: string | null): number {
  if (!h) return 0;
  const match = h.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function parseWeight(w: string | null): number {
  if (!w) return 0;
  const match = w.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// ── Map to ScoutCopilot generic format ────────────────────────────

export function mapToGenericPlayer(
  result: ApiFootballSearchResult
): Record<string, unknown> {
  const p = result.player;
  const mainStats = result.statistics?.[0]; // first league's stats

  return {
    player_external_id: `apifb-${p.id}`,
    player_name: p.name,
    age: p.age,
    nationality: p.nationality,
    position: mainStats?.games?.position ?? "Unknown",
    positions: mainStats?.games?.position ? [mainStats.games.position] : [],
    foot: "unknown",
    height: parseHeight(p.height),
    weight: parseWeight(p.weight),
    team: mainStats?.team?.name ?? "Unknown",
    league: mainStats?.league?.name ?? "Unknown",
    market_value: 0, // API-Football doesn't provide market value
    contract_expiry: "",
    photo_url: p.photo,
    injured: p.injured,
    stats: {
      matches_played: mainStats?.games?.appearences ?? 0,
      minutes_played: mainStats?.games?.minutes ?? 0,
      goals: mainStats?.goals?.total ?? 0,
      assists: mainStats?.goals?.assists ?? 0,
      xG: 0, // not available
      xA: 0,
      npxG: 0,
      key_passes: mainStats?.passes?.key ?? 0,
      passes_completed: mainStats?.passes?.total ?? 0,
      pass_completion: mainStats?.passes?.accuracy ?? 0,
      progressive_passes: 0, // not available
      progressive_carries: 0,
      through_balls: 0,
      long_balls: 0,
      crosses: 0,
      tackles: mainStats?.tackles?.total ?? 0,
      interceptions: mainStats?.tackles?.interceptions ?? 0,
      clearances: 0,
      blocks: mainStats?.tackles?.blocks ?? 0,
      aerial_duels: 0,
      aerial_duel_win_rate: 0,
      ground_duels: mainStats?.duels?.total ?? 0,
      ground_duel_win_rate:
        mainStats?.duels?.total && mainStats?.duels?.won
          ? Number(
              ((mainStats.duels.won / mainStats.duels.total) * 100).toFixed(2)
            )
          : 0,
      dribbles: mainStats?.dribbles?.attempts ?? 0,
      dribble_success_rate:
        mainStats?.dribbles?.attempts && mainStats?.dribbles?.success
          ? Number(
              (
                (mainStats.dribbles.success / mainStats.dribbles.attempts) *
                100
              ).toFixed(2)
            )
          : 0,
      pressures: 0,
      shot_creating_actions: 0,
      goal_creating_actions: 0,
      yellow_cards: mainStats?.cards?.yellow ?? 0,
      red_cards: mainStats?.cards?.red ?? 0,
    },
    provider: "api-football",
  };
}
