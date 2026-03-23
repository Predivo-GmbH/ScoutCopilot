// Wyscout API client — typed endpoints for player search and stats

import { waitForRateLimit } from "../rate-limiter.ts";

const WYSCOUT_BASE_URL = "https://apirest.wyscout.com/v3";

export interface WyscoutCredentials {
  username: string;
  password: string;
}

export interface WyscoutPlayer {
  playerId: number;
  shortName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthArea: { id: number; name: string };
  role: { code2: string; code3: string; name: string };
  foot: string;
  height: number;
  weight: number;
  currentTeam: {
    teamId: number;
    name: string;
    area: { id: number; name: string };
  };
  marketValue?: number;
  contractExpiration?: string;
}

export interface WyscoutPlayerStats {
  playerId: number;
  competitionId: number;
  seasonId: number;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  total: Record<string, number>;
  average: Record<string, number>;
  percent: Record<string, number>;
}

export interface WyscoutSearchParams {
  positions?: string[];
  foot?: string;
  ageMin?: number;
  ageMax?: number;
  competitionId?: number;
  marketValueMin?: number;
  marketValueMax?: number;
  heightMin?: number;
  heightMax?: number;
  limit?: number;
  offset?: number;
}

async function wyscoutFetch(
  path: string,
  credentials: WyscoutCredentials,
  organizationId: string
): Promise<unknown> {
  await waitForRateLimit(organizationId);

  const authHeader = btoa(`${credentials.username}:${credentials.password}`);
  const response = await fetch(`${WYSCOUT_BASE_URL}${path}`, {
    headers: {
      Authorization: `Basic ${authHeader}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    throw new Error("Wyscout rate limit exceeded — try again shortly");
  }

  if (!response.ok) {
    throw new Error(`Wyscout API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function searchPlayers(
  credentials: WyscoutCredentials,
  params: WyscoutSearchParams,
  organizationId: string
): Promise<WyscoutPlayer[]> {
  const queryParts: string[] = [];
  if (params.positions?.length) queryParts.push(`positions=${params.positions.join(",")}`);
  if (params.foot) queryParts.push(`foot=${params.foot}`);
  if (params.ageMin) queryParts.push(`ageMin=${params.ageMin}`);
  if (params.ageMax) queryParts.push(`ageMax=${params.ageMax}`);
  if (params.competitionId) queryParts.push(`competitionId=${params.competitionId}`);
  if (params.marketValueMin) queryParts.push(`marketValueMin=${params.marketValueMin}`);
  if (params.marketValueMax) queryParts.push(`marketValueMax=${params.marketValueMax}`);
  if (params.heightMin) queryParts.push(`heightMin=${params.heightMin}`);
  if (params.heightMax) queryParts.push(`heightMax=${params.heightMax}`);
  queryParts.push(`limit=${params.limit ?? 50}`);
  if (params.offset) queryParts.push(`offset=${params.offset}`);

  const qs = queryParts.length ? `?${queryParts.join("&")}` : "";
  const data = (await wyscoutFetch(`/players${qs}`, credentials, organizationId)) as {
    players: WyscoutPlayer[];
  };
  return data.players ?? [];
}

export async function getPlayerStats(
  credentials: WyscoutCredentials,
  playerId: number | string,
  organizationId: string
): Promise<WyscoutPlayerStats> {
  const data = (await wyscoutFetch(
    `/players/${playerId}/advancedstats`,
    credentials,
    organizationId
  )) as WyscoutPlayerStats;
  return data;
}

export async function getPlayerDetails(
  credentials: WyscoutCredentials,
  playerId: number | string,
  organizationId: string
): Promise<WyscoutPlayer> {
  const data = (await wyscoutFetch(
    `/players/${playerId}`,
    credentials,
    organizationId
  )) as WyscoutPlayer;
  return data;
}
