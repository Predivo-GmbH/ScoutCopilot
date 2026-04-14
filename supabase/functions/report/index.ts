// Report Edge Function — AI scouting report generation
// POST /report { player_external_id: string, player_name: string }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { generateScoutingReport, TransferHistoryEntry, ContractInfo } from "../_shared/claude.ts";
import { getMockPlayer } from "../_shared/mock-data.ts";
import { getPlayerStats as wyscoutStats, getPlayerDetails as wyscoutDetails } from "../_shared/providers/wyscout.ts";
import { getPlayerSeasonStats as statsbombStats } from "../_shared/providers/statsbomb.ts";
import { searchPlayersByName as apiFootballSearch, getTransfers as apiFootballTransfers, getPlayer as apiFootballGetPlayer, mapToGenericPlayer as apiFootballMap } from "../_shared/providers/api-football.ts";
import type { ApiFootballSearchResult } from "../_shared/providers/api-football.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await getAuthContext(req);

    // Rate limit: 10 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 10 / 60, 10);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      );
    }

    const { player_external_id, player_name } = await req.json();
    if (!player_external_id || !player_name) {
      return new Response(
        JSON.stringify({ error: "Missing 'player_external_id' or 'player_name'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check tier limits for report generation
    const supabase = getServiceClient();
    if (auth.subscriptionTier === "scout") {
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
      const { data: usage } = await supabase
        .from("usage_tracking")
        .select("reports_generated")
        .eq("organization_id", auth.organizationId)
        .eq("month", currentMonth)
        .single();

      if (usage && usage.reports_generated >= 10) {
        return new Response(
          JSON.stringify({
            error: "Monthly report limit reached (10/10). Upgrade to Pro for unlimited reports.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch full player stats
    const useMock = Deno.env.get("MOCK_DATA") === "true";
    let playerStats: Record<string, unknown>;
    let sourceProvider: "wyscout" | "statsbomb" = "statsbomb";
    let playerPhotoUrl: string | undefined;

    if (useMock) {
      const mock = getMockPlayer(player_external_id);
      if (!mock) {
        return new Response(
          JSON.stringify({ error: "Player not found in mock data" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      playerStats = {
        player_name: mock.player_name,
        age: mock.age,
        nationality: mock.nationality,
        position: mock.position,
        positions: mock.positions,
        foot: mock.foot,
        height: mock.height,
        weight: mock.weight,
        team: mock.team,
        league: mock.league,
        market_value: mock.market_value,
        ...mock.stats,
      };
    } else if (player_external_id.startsWith("apifb-")) {
      // API-Football player — fetch stats from squad_players + live API
      const rawApifbId = parseInt(player_external_id.replace("apifb-", ""), 10);

      // Get stored data from squad_players
      const { data: squadRow } = await supabase
        .from("squad_players")
        .select("player_name, position_key, player_data")
        .eq("player_external_id", player_external_id)
        .limit(1)
        .maybeSingle();

      const pd = (squadRow?.player_data ?? {}) as Record<string, unknown>;

      // Try fetching fresh stats from API-Football (current season)
      let apifbStats: Record<string, unknown> = {};
      try {
        const currentSeason = new Date().getFullYear();
        const apifbPlayer = await apiFootballGetPlayer(
          rawApifbId,
          currentSeason,
          auth.organizationId
        );
        if (apifbPlayer) {
          const mapped = apiFootballMap(
            apifbPlayer as unknown as ApiFootballSearchResult
          );
          apifbStats = (mapped.stats ?? {}) as Record<string, unknown>;
          // Fill in metadata from live API if squad_players is sparse
          if (!pd.nationality && mapped.nationality) pd.nationality = mapped.nationality;
          if (!pd.age && mapped.age) pd.age = mapped.age;
          if (mapped.height) apifbStats.height = mapped.height;
          if (mapped.weight) apifbStats.weight = mapped.weight;
          if (mapped.team) apifbStats.team = mapped.team;
          if (mapped.league) apifbStats.league = mapped.league;
          if (mapped.birth_date) apifbStats.birth_date = mapped.birth_date;
          if (mapped.photo_url) playerPhotoUrl = mapped.photo_url as string;
        }
      } catch (apifbErr) {
        console.error("[Report] API-Football stats fetch failed:", (apifbErr as Error).message);
        // Continue with whatever data we have from squad_players
      }

      playerStats = {
        player_name: squadRow?.player_name ?? player_name,
        age: (pd.age as number) || undefined,
        birth_date: (apifbStats.birth_date as string) || undefined,
        nationality: (pd.nationality as string) || "Unknown",
        position: squadRow?.position_key || (pd.position as string) || "Unknown",
        positions: squadRow?.position_key ? [squadRow.position_key] : [],
        team: (apifbStats.team as string) || "Unknown",
        league: (apifbStats.league as string) || "Unknown",
        photo_url: (pd.image as string) || playerPhotoUrl || undefined,
        ...apifbStats,
      };
      sourceProvider = "statsbomb"; // Closest match for DB schema; provider field is informational
      if (pd.image) playerPhotoUrl = pd.image as string;
    } else if (player_external_id.startsWith("sb-open-")) {
      // StatsBomb open data — fetch from our own DB
      const rawId = parseInt(player_external_id.replace("sb-open-", ""), 10);
      const { data: playerRow } = await supabase
        .from("sb_players")
        .select("player_id, player_name, player_nickname, nationality, primary_position, positions, photo_url, birth_date")
        .eq("player_id", rawId)
        .single();

      // Fetch most recent stats
      const { data: statsRows } = await supabase
        .from("sb_player_season_stats")
        .select("*")
        .eq("player_id", rawId)
        .order("season_name", { ascending: false })
        .limit(1);

      const stats = statsRows?.[0];
      const isNationalTeam = false;

      playerStats = {
        player_name: playerRow?.player_nickname ?? playerRow?.player_name ?? player_name,
        birth_date: playerRow?.birth_date ?? undefined,
        nationality: playerRow?.nationality ?? "Unknown",
        position: playerRow?.primary_position ?? "Unknown",
        positions: playerRow?.positions ?? [],
        team: stats?.team_name ?? "Unknown",
        is_national_team: isNationalTeam,
        league: stats ? `${stats.competition_name} (${stats.season_name})` : "Unknown",
        matches_played: stats?.matches_played ?? 0,
        minutes_played: stats?.minutes_played ?? 0,
        goals: stats?.goals ?? 0,
        assists: stats?.assists ?? 0,
        xG: Number(stats?.xg ?? 0),
        xA: Number(stats?.xa ?? 0),
        npxG: Number(stats?.npxg ?? 0),
        key_passes: stats?.key_passes ?? 0,
        passes_completed: stats?.passes_completed ?? 0,
        pass_completion: Number(stats?.pass_completion ?? 0),
        progressive_passes: stats?.progressive_passes ?? 0,
        progressive_carries: stats?.progressive_carries ?? 0,
        tackles: stats?.tackles ?? 0,
        interceptions: stats?.interceptions ?? 0,
        clearances: stats?.clearances ?? 0,
        blocks: stats?.blocks ?? 0,
        aerial_duels: stats?.aerial_duels ?? 0,
        aerial_duel_win_rate: Number(stats?.aerial_duel_win_rate ?? 0),
        ground_duels: stats?.ground_duels ?? 0,
        ground_duel_win_rate: Number(stats?.ground_duel_win_rate ?? 0),
        dribbles: stats?.dribbles ?? 0,
        dribble_success_rate: Number(stats?.dribble_success_rate ?? 0),
        pressures: stats?.pressures ?? 0,
        shot_creating_actions: stats?.shot_creating_actions ?? 0,
        goal_creating_actions: stats?.goal_creating_actions ?? 0,
        yellow_cards: stats?.yellow_cards ?? 0,
        red_cards: stats?.red_cards ?? 0,
      };
      sourceProvider = "statsbomb";
      if (playerRow?.photo_url) playerPhotoUrl = playerRow.photo_url;
    } else {
      const result = await fetchPlayerFullStats(
        auth.organizationId,
        player_external_id
      );
      playerStats = result.stats;
      sourceProvider = result.provider;
    }

    // Generate report via Claude
    const report = await generateScoutingReport(player_name, playerStats);

    // Enrich report with player metadata so the reports list page can display it
    // The frontend reads report_data.image, .age, .nationality, .position, .team, .league
    const enrichedReport: Record<string, unknown> = { ...report as unknown as Record<string, unknown> };

    // Inject photo_url as "image" (matching frontend field name in ReportsListPage)
    if (playerPhotoUrl) {
      // StatsBomb: photo_url fetched from sb_players during stats lookup
      enrichedReport.image = playerPhotoUrl;
    } else if (playerStats.imageDataURL && typeof playerStats.imageDataURL === "string") {
      // Wyscout: imageDataURL from player details
      enrichedReport.image = playerStats.imageDataURL;
    } else if (playerStats.photo_url && typeof playerStats.photo_url === "string") {
      // API-Football: photo_url from player data
      enrichedReport.image = playerStats.photo_url;
    }

    // Inject player metadata for the reports list page
    if (playerStats.birth_date) {
      enrichedReport.birth_date = playerStats.birth_date;
      enrichedReport.age = Math.floor(
        (Date.now() - new Date(playerStats.birth_date as string).getTime()) / 31557600000
      );
    }
    if (playerStats.nationality !== undefined) enrichedReport.nationality = playerStats.nationality;
    if (playerStats.position !== undefined) enrichedReport.position = playerStats.position;
    if (playerStats.team !== undefined) enrichedReport.team = playerStats.team;
    if (playerStats.league !== undefined) enrichedReport.league = playerStats.league;
    if (playerStats.is_national_team !== undefined) enrichedReport.is_national_team = playerStats.is_national_team;

    // Replace AI-generated similar_players with database-driven similar players
    if (player_external_id.startsWith("sb-open-")) {
      try {
        const dbSimilarPlayers = await findSimilarPlayers(
          supabase,
          parseInt(player_external_id.replace("sb-open-", ""), 10),
          playerStats
        );
        enrichedReport.similar_players = dbSimilarPlayers;
      } catch (err) {
        console.error("Similar players lookup failed:", (err as Error).message);
      }
    }

    // Fetch real transfer history and contract info from TheSportsDB / API-Football
    try {
      const transferData = await fetchTransferAndContractData(
        player_name,
        auth.organizationId,
        (playerStats.nationality as string) ?? undefined
      );
      if (transferData.transfer_history.length > 0) {
        enrichedReport.transfer_history = transferData.transfer_history;
      }
      if (transferData.contract_info) {
        enrichedReport.contract_info = transferData.contract_info;
      }
      // Fill in birth_date from TheSportsDB if not already in the DB
      if (!enrichedReport.birth_date && transferData.dateBorn) {
        enrichedReport.birth_date = transferData.dateBorn;
        enrichedReport.age = Math.floor(
          (Date.now() - new Date(transferData.dateBorn).getTime()) / 31557600000
        );
        // Also persist to sb_players for future lookups
        if (player_external_id.startsWith("sb-open-")) {
          const rawId = parseInt(player_external_id.replace("sb-open-", ""), 10);
          await supabase
            .from("sb_players")
            .update({ birth_date: transferData.dateBorn })
            .eq("player_id", rawId);
        }
      }
    } catch (transferErr) {
      console.error("Transfer/contract data fetch failed:", (transferErr as Error).message);
      // Non-fatal: report still saves without transfer data
    }

    // Save to DB
    const { data: savedReport, error: saveError } = await supabase
      .from("player_reports")
      .insert({
        user_id: auth.userId,
        organization_id: auth.organizationId,
        player_external_id,
        player_name,
        report_data: enrichedReport,
        source_provider: sourceProvider,
      })
      .select("id, created_at")
      .single();

    if (saveError) {
      console.error("Failed to save report:", saveError.message);
    }

    // Update usage tracking
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
    await supabase.rpc("increment_usage", {
      p_org_id: auth.organizationId,
      p_month: currentMonth,
      p_field: "reports_generated",
    }).then(() => {}).catch(() => {
      // If RPC doesn't exist, upsert manually
      supabase
        .from("usage_tracking")
        .upsert(
          {
            organization_id: auth.organizationId,
            month: currentMonth,
            reports_generated: 1,
          },
          { onConflict: "organization_id,month" }
        )
        .then(() => {});
    });

    return new Response(
      JSON.stringify({
        report_id: savedReport?.id ?? null,
        player_external_id,
        player_name,
        report,
        created_at: savedReport?.created_at ?? new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Report error:", errMsg);
    const isRateLimit = errMsg.includes("429") || errMsg.includes("rate_limit");
    return new Response(
      JSON.stringify({
        error: isRateLimit
          ? "AI service is temporarily busy. Please try again in a minute."
          : "Internal server error",
      }),
      {
        status: isRateLimit ? 429 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...(isRateLimit ? { "Retry-After": "60" } : {}),
        },
      }
    );
  }
});

// ── Transfer & Contract Data (TheSportsDB + API-Football fallback) ─

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

/** Strip diacritics so search queries stay ASCII-safe. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface SportsDbFormerTeam {
  strFormerTeam?: string;
  strJoined?: string;
  strDeparted?: string;
  strMoveType?: string; // "Contract", "Loan", "Free Transfer", etc.
}

interface SportsDbContract {
  strTeam?: string;
  strYearStart?: string;
  strYearEnd?: string;
  strWage?: string;
}

interface SportsDbPlayerSearchResult {
  idPlayer?: string;
  strPlayer?: string;
  strNationality?: string;
  strSport?: string;
  dateBorn?: string;
}

async function fetchTransferAndContractData(
  playerName: string,
  organizationId?: string,
  playerNationality?: string
): Promise<{
  transfer_history: TransferHistoryEntry[];
  contract_info: ContractInfo | null;
  dateBorn: string | null;
}> {
  const result = {
    transfer_history: [] as TransferHistoryEntry[],
    contract_info: null as ContractInfo | null,
    dateBorn: null as string | null,
  };

  try {
    // Step 1: Search TheSportsDB for the player's idPlayer
    const safeName = stripAccents(playerName).slice(0, 100);
    const searchUrl = `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(safeName)}`;
    console.log(`[TransferData] Searching TheSportsDB for "${safeName}"…`);

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.error(`[TransferData] TheSportsDB search HTTP ${searchRes.status}`);
      throw new Error("TheSportsDB search failed");
    }

    const searchData = await searchRes.json();
    const players: SportsDbPlayerSearchResult[] = searchData?.player ?? [];

    if (players.length === 0 || !players[0].idPlayer) {
      console.log(`[TransferData] No TheSportsDB results for "${safeName}"`);
      throw new Error("Player not found on TheSportsDB");
    }

    // Disambiguate: pick best match instead of blindly using players[0]
    const soccerPlayers = players.filter(
      (p) => p.idPlayer && (!p.strSport || p.strSport === "Soccer")
    );
    const candidates = soccerPlayers.length > 0 ? soccerPlayers : players;

    const nameNorm = stripAccents(playerName).toLowerCase().trim();
    let bestMatch = candidates[0];

    // Prefer exact name match (case-insensitive, accent-stripped)
    const exactMatch = candidates.find(
      (p) => stripAccents(p.strPlayer ?? "").toLowerCase().trim() === nameNorm
    );
    if (exactMatch) {
      bestMatch = exactMatch;
    } else if (playerNationality) {
      // Cross-reference nationality if no exact name match
      const natNorm = playerNationality.toLowerCase().trim();
      const natMatch = candidates.find(
        (p) => p.strNationality?.toLowerCase().trim() === natNorm
      );
      if (natMatch) {
        bestMatch = natMatch;
      }
    }

    const idPlayer = bestMatch.idPlayer!;
    result.dateBorn = bestMatch.dateBorn ?? null;
    console.log(`[TransferData] Found idPlayer=${idPlayer} for "${bestMatch.strPlayer}" (from ${candidates.length} candidates)`);

    // Step 2: Fetch former teams and contracts in parallel
    const [formerTeamsRes, contractsRes] = await Promise.all([
      fetch(`${SPORTSDB_BASE}/lookupformerteams.php?id=${idPlayer}`),
      fetch(`${SPORTSDB_BASE}/lookupcontracts.php?id=${idPlayer}`),
    ]);

    // Parse former teams (transfer history)
    if (formerTeamsRes.ok) {
      const formerData = await formerTeamsRes.json();
      const formerTeams: SportsDbFormerTeam[] = formerData?.formerteams ?? [];

      result.transfer_history = formerTeams
        .filter((ft) => ft.strFormerTeam)
        .map((ft) => ({
          club: ft.strFormerTeam!,
          date: ft.strJoined
            ? `${ft.strJoined}${ft.strDeparted ? ` – ${ft.strDeparted}` : ""}`
            : "Unknown",
          role: ft.strMoveType ?? "Transfer",
        }));

      console.log(`[TransferData] Found ${result.transfer_history.length} former teams`);
    } else {
      console.error(`[TransferData] Former teams HTTP ${formerTeamsRes.status}`);
    }

    // Parse contracts
    if (contractsRes.ok) {
      const contractData = await contractsRes.json();
      const contracts: SportsDbContract[] = contractData?.contracts ?? [];

      if (contracts.length > 0) {
        // Most recent contract first (usually the last entry, but sort to be safe)
        const sorted = [...contracts].sort((a, b) => {
          const yearA = parseInt(a.strYearStart ?? "0", 10);
          const yearB = parseInt(b.strYearStart ?? "0", 10);
          return yearB - yearA;
        });

        const current = sorted[0];
        result.contract_info = {
          current_club: current.strTeam ?? "Unknown",
          contract_start: current.strYearStart ?? "Unknown",
          contract_end: current.strYearEnd ?? "Unknown",
          wage: current.strWage || undefined,
        };

        console.log(
          `[TransferData] Contract: ${result.contract_info.current_club} (${result.contract_info.contract_start}–${result.contract_info.contract_end})`
        );
      }
    } else {
      console.error(`[TransferData] Contracts HTTP ${contractsRes.status}`);
    }

    // If we got at least some data from TheSportsDB, return it
    if (result.transfer_history.length > 0 || result.contract_info) {
      return result;
    }

    // If TheSportsDB returned the player but no transfer/contract data, try API-Football
    throw new Error("TheSportsDB returned no transfer/contract data");
  } catch (sportsDbErr) {
    console.log(
      `[TransferData] TheSportsDB incomplete: ${(sportsDbErr as Error).message}. Trying API-Football fallback…`
    );

    // Fallback: API-Football
    if (!organizationId) {
      console.log("[TransferData] No organizationId for API-Football fallback, returning partial data");
      return result;
    }

    try {
      // Search API-Football for the player
      const apiPlayers = await apiFootballSearch(playerName, organizationId);

      if (apiPlayers.length === 0) {
        console.log(`[TransferData] API-Football: no results for "${playerName}"`);
        return result;
      }

      const apiPlayer = apiPlayers[0];
      const apiPlayerId = apiPlayer.player.id;
      console.log(`[TransferData] API-Football: found player ID ${apiPlayerId}`);

      // Fetch transfers
      const transferData = await apiFootballTransfers(apiPlayerId, organizationId);

      if (transferData?.transfers && transferData.transfers.length > 0) {
        result.transfer_history = transferData.transfers.map((t) => ({
          club: t.teams.in.name,
          date: t.date,
          role: t.type || "Transfer", // "Loan", "Free", "$45M", etc.
        }));

        console.log(
          `[TransferData] API-Football: found ${result.transfer_history.length} transfers`
        );
      }

      // API-Football player stats include contract end date
      const mainStats = apiPlayer.statistics?.[0];
      if (mainStats) {
        // API-Football doesn't have explicit contract start/wage,
        // but the current team is known from stats
        if (!result.contract_info) {
          result.contract_info = {
            current_club: mainStats.team?.name ?? "Unknown",
            contract_start: "Unknown",
            contract_end: "Unknown",
          };
        }
      }
    } catch (apiErr) {
      console.error(`[TransferData] API-Football fallback failed: ${(apiErr as Error).message}`);
    }

    return result;
  }
}

// ── Helpers ───────────────────────────────────────────────────────

async function fetchPlayerFullStats(
  organizationId: string,
  playerExternalId: string
): Promise<{ stats: Record<string, unknown>; provider: "wyscout" | "statsbomb" }> {
  const supabase = getServiceClient();

  const { data: credentials } = await supabase
    .from("api_credentials")
    .select("provider, encrypted_credentials")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (!credentials?.length) {
    throw new Error("No active API credentials found.");
  }

  // Determine provider from player ID prefix
  const isWyscout = playerExternalId.startsWith("wy-");
  const isStatsBomb = playerExternalId.startsWith("sb-");

  for (const cred of credentials) {
    if (cred.provider === "wyscout" && (isWyscout || !isStatsBomb)) {
      const wyCreds = cred.encrypted_credentials as { username: string; password: string };
      const rawId = playerExternalId.replace("wy-", "");
      const [details, stats] = await Promise.all([
        wyscoutDetails(wyCreds, rawId, organizationId),
        wyscoutStats(wyCreds, rawId, organizationId),
      ]);
      return {
        stats: { ...details, advancedStats: stats } as unknown as Record<string, unknown>,
        provider: "wyscout",
      };
    }

    if (cred.provider === "statsbomb" && (isStatsBomb || !isWyscout)) {
      const sbCreds = cred.encrypted_credentials as { username: string; password: string };
      const rawId = playerExternalId.replace("sb-", "");
      const seasonStats = await statsbombStats(sbCreds, rawId, organizationId);
      return {
        stats: seasonStats as unknown as Record<string, unknown>,
        provider: "statsbomb",
      };
    }
  }

  throw new Error("No matching credentials for this player's data provider.");
}

// ── Similar Players (database-driven) ─────────────────────────────

/** Stats used for similarity comparison — must exist in sb_player_season_stats */
const SIMILARITY_STATS = [
  "goals", "assists", "xg", "xa", "npxg",
  "pass_completion", "progressive_passes", "progressive_carries",
  "key_passes", "tackles", "interceptions", "clearances",
  "aerial_duel_win_rate", "ground_duel_win_rate",
  "dribbles", "dribble_success_rate", "pressures",
  "shot_creating_actions", "goal_creating_actions",
] as const;

/** Normalization ranges per stat (approximate ranges for professional players) */
const STAT_RANGES: Record<string, number> = {
  goals: 30, assists: 20, xg: 25, xa: 15, npxg: 20,
  pass_completion: 100, progressive_passes: 200, progressive_carries: 150,
  key_passes: 100, tackles: 100, interceptions: 80, clearances: 100,
  aerial_duel_win_rate: 100, ground_duel_win_rate: 100,
  dribbles: 150, dribble_success_rate: 100, pressures: 400,
  shot_creating_actions: 150, goal_creating_actions: 50,
};

interface SimilarPlayer {
  playerId: number;
  name: string;
  club: string;
  position: string;
  photo_url: string | null;
  birth_date: string | null;
  similarity_pct: number;
  reasoning: string;
}

async function findSimilarPlayers(
  supabase: ReturnType<typeof getServiceClient>,
  currentPlayerId: number,
  currentStats: Record<string, unknown>
): Promise<SimilarPlayer[]> {
  // Get current player's position
  const position = (currentStats.position as string) ?? "Unknown";

  // Map position to similar positions for broader candidate pool
  const positionGroups: Record<string, string[]> = {
    ST: ["ST", "CF"], CF: ["CF", "ST"],
    LW: ["LW", "RW", "LM"], RW: ["RW", "LW", "RM"],
    LM: ["LM", "LW"], RM: ["RM", "RW"],
    CAM: ["CAM", "CM"], CM: ["CM", "CAM", "CDM"], CDM: ["CDM", "CM"],
    CB: ["CB"], LB: ["LB", "LWB"], RB: ["RB", "RWB"],
    LWB: ["LWB", "LB"], RWB: ["RWB", "RB"],
    GK: ["GK"],
  };
  const targetPositions = positionGroups[position.toUpperCase()] ?? [position];

  // Fetch candidates: players with same/similar position
  const { data: candidates } = await supabase
    .from("sb_player_season_stats")
    .select(`
      *,
      sb_players!inner (
        player_id, player_name, player_nickname,
        primary_position, photo_url, birth_date
      )
    `)
    .in("sb_players.primary_position", targetPositions.map((p) => p.toUpperCase()))
    .neq("sb_players.player_id", currentPlayerId)
    .gt("minutes_played", 200)
    .order("season_name", { ascending: false })
    .limit(200);

  if (!candidates || candidates.length === 0) return [];

  // Deduplicate: keep only latest season per player
  const seen = new Set<number>();
  const uniqueCandidates = candidates.filter((c: { sb_players: { player_id: number } }) => {
    if (seen.has(c.sb_players.player_id)) return false;
    seen.add(c.sb_players.player_id);
    return true;
  });

  // Build current player's stat vector (normalized)
  const currentVector: number[] = SIMILARITY_STATS.map((stat) => {
    const val = Number(currentStats[stat] ?? currentStats[stat.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] ?? 0);
    return val / (STAT_RANGES[stat] || 1);
  });

  // Calculate distance for each candidate
  const scored = uniqueCandidates.map((c: Record<string, unknown>) => {
    const candidateVector: number[] = SIMILARITY_STATS.map((stat) => {
      const val = Number((c as Record<string, unknown>)[stat] ?? 0);
      return val / (STAT_RANGES[stat] || 1);
    });

    // Sum of squared differences
    let distance = 0;
    for (let i = 0; i < currentVector.length; i++) {
      distance += (currentVector[i] - candidateVector[i]) ** 2;
    }
    distance = Math.sqrt(distance);

    // Determine which stats are most similar for reasoning
    const statDiffs = SIMILARITY_STATS.map((stat, i) => ({
      stat,
      diff: Math.abs(currentVector[i] - candidateVector[i]),
    }));
    statDiffs.sort((a, b) => a.diff - b.diff);
    const topMatchingStats = statDiffs.slice(0, 3).map((s) =>
      s.stat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        .replace("Xg", "xG").replace("Xa", "xA").replace("Npxg", "npxG")
    );

    const player = c.sb_players as {
      player_id: number;
      player_name: string;
      player_nickname: string | null;
      primary_position: string | null;
      photo_url: string | null;
      birth_date: string | null;
    };

    return {
      playerId: player.player_id,
      name: player.player_nickname ?? player.player_name,
      club: (c as Record<string, unknown>).team_name as string ?? "Unknown",
      position: player.primary_position ?? "Unknown",
      photo_url: player.photo_url ?? null,
      birth_date: player.birth_date ?? null,
      distance,
      reasoning: `Similar statistical profile in ${topMatchingStats.join(", ").toLowerCase()}`,
    };
  });

  // Sort by distance ascending (most similar first), take top 5
  scored.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
  const top5 = scored.slice(0, 5);

  // Convert distance to similarity_pct
  // Scale factor: a distance of 0 = 95%, distance of ~2 = ~55%
  const scaleFactor = 20;
  return top5.map((p: typeof scored[0]) => ({
    playerId: p.playerId,
    name: p.name,
    club: p.club,
    position: p.position,
    photo_url: p.photo_url,
    birth_date: p.birth_date,
    similarity_pct: Math.round(Math.max(0, 100 - p.distance * scaleFactor)),
    reasoning: p.reasoning,
  }));
}
