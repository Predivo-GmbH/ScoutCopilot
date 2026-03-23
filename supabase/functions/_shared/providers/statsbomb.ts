// StatsBomb API client — typed endpoints compatible with StatsBomb Open Data

import { waitForRateLimit } from "../rate-limiter.ts";

const STATSBOMB_BASE_URL = "https://data.statsbomb.com/api/v2";
// Open data fallback (free, same schema)
const STATSBOMB_OPEN_URL = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

export interface StatsBombCredentials {
  username: string;
  password: string;
}

export interface StatsBombPlayer {
  player_id: number;
  player_name: string;
  player_nickname: string | null;
  birth_date: string;
  player_gender: string;
  player_weight: number | null;
  player_height: number | null;
  country: { id: number; name: string };
}

export interface StatsBombPlayerSeason {
  player_id: number;
  player_name: string;
  team_name: string;
  competition_name: string;
  season_name: string;
  statistics: Record<string, number>;
}

export interface StatsBombSearchParams {
  competitionId?: number;
  seasonId?: number;
  positions?: string[];
  limit?: number;
}

async function statsbombFetch(
  path: string,
  credentials: StatsBombCredentials | null,
  organizationId: string,
  useOpenData = false
): Promise<unknown> {
  await waitForRateLimit(organizationId);

  const baseUrl = useOpenData ? STATSBOMB_OPEN_URL : STATSBOMB_BASE_URL;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (credentials && !useOpenData) {
    headers.Authorization = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }

  const response = await fetch(`${baseUrl}${path}`, { headers });

  if (response.status === 429) {
    throw new Error("StatsBomb rate limit exceeded — try again shortly");
  }

  if (!response.ok) {
    throw new Error(`StatsBomb API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function getCompetitions(
  credentials: StatsBombCredentials,
  organizationId: string
): Promise<Array<{ competition_id: number; competition_name: string; season_id: number; season_name: string }>> {
  return (await statsbombFetch(
    "/competitions",
    credentials,
    organizationId
  )) as Array<{ competition_id: number; competition_name: string; season_id: number; season_name: string }>;
}

export async function getLineups(
  credentials: StatsBombCredentials,
  matchId: number,
  organizationId: string
): Promise<unknown[]> {
  return (await statsbombFetch(
    `/lineups/${matchId}`,
    credentials,
    organizationId
  )) as unknown[];
}

export async function getPlayerMatchStats(
  credentials: StatsBombCredentials,
  matchId: number,
  organizationId: string
): Promise<unknown[]> {
  return (await statsbombFetch(
    `/events/${matchId}`,
    credentials,
    organizationId
  )) as unknown[];
}

export async function searchPlayers(
  credentials: StatsBombCredentials,
  params: StatsBombSearchParams,
  organizationId: string
): Promise<StatsBombPlayerSeason[]> {
  let path = "/player-stats";
  const queryParts: string[] = [];
  if (params.competitionId) queryParts.push(`competition_id=${params.competitionId}`);
  if (params.seasonId) queryParts.push(`season_id=${params.seasonId}`);
  if (queryParts.length) path += `?${queryParts.join("&")}`;

  return (await statsbombFetch(path, credentials, organizationId)) as StatsBombPlayerSeason[];
}

export async function getPlayerSeasonStats(
  credentials: StatsBombCredentials,
  playerId: number | string,
  organizationId: string
): Promise<StatsBombPlayerSeason> {
  return (await statsbombFetch(
    `/players/${playerId}/season-stats`,
    credentials,
    organizationId
  )) as StatsBombPlayerSeason;
}
