// Claude API client for NL parsing and report generation

const CLAUDE_MODEL = "claude-3-haiku-20240307";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
}

async function callClaude(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens = 4096
): Promise<string> {
  // In edge functions, the org provides their own Claude key or we use the platform key
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`Claude API ${response.status}:`, err);
    throw new Error(`Claude API error (${response.status}): ${err}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content[0]?.text ?? "";
}

// ── NL Query Parsing ──────────────────────────────────────────────

export interface ParsedSearchParams {
  player_name?: string;
  position?: string;
  positions?: string[];
  foot?: "left" | "right" | "both";
  age_min?: number;
  age_max?: number;
  league?: string;
  leagues?: string[];
  nationality?: string;
  metrics?: string[];
  metric_thresholds?: Record<string, { min?: number; max?: number }>;
  market_value_min?: number;
  market_value_max?: number;
  height_min?: number;
  height_max?: number;
  sort_by?: string;
  limit?: number;
}

const SEARCH_SYSTEM_PROMPT = `You are a football scouting query parser. Convert natural language scouting queries into structured JSON parameters.

You understand:
- Positions: GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST
- Common aliases: "center-back" = CB, "left-back" = LB, "striker" = ST, "defensive midfielder" = CDM, "number 10" = CAM, "winger" = LW/RW, "full-back" = LB/RB
- Metrics: goals, assists, xG, xA, key_passes, tackles, interceptions, clearances, aerial_duels, aerial_duel_win_rate, progressive_passes, progressive_carries, pass_completion, crosses, dribbles, dribble_success_rate, pressures, blocks, shot_creating_actions, goal_creating_actions, npxG, through_balls, long_balls, ground_duels, ground_duel_win_rate
- Casual descriptions: "fast" relates to progressive_carries and dribbles, "can pass" relates to progressive_passes and pass_completion, "strong in the air" relates to aerial_duels and aerial_duel_win_rate, "creative" relates to key_passes, xA, shot_creating_actions
- Leagues: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Eredivisie, Championship, 2. Bundesliga, Serie B, Ligue 2, Belgian Pro League, Scottish Premiership, Liga Portugal, Super Lig, etc.
- Market value formats: "2M" = 2000000, "500K" = 500000

Return ONLY valid JSON matching this schema:
{
  "player_name": "string (if the query is searching for a specific player by name, e.g. 'Granit Xhaka' or 'show me Lamine Yamal')",
  "position": "string (primary position code)",
  "positions": ["array of position codes if multiple"],
  "foot": "left | right | both",
  "age_min": "number",
  "age_max": "number",
  "league": "string (primary league name)",
  "leagues": ["array of league names if multiple"],
  "nationality": "string",
  "metrics": ["array of metric names the user cares about"],
  "metric_thresholds": { "metric_name": { "min": number, "max": number } },
  "market_value_min": "number",
  "market_value_max": "number",
  "height_min": "number (cm)",
  "height_max": "number (cm)",
  "sort_by": "string (primary metric to rank by)",
  "limit": "number (default 20)"
}

If the query is a player name (e.g. "Granit Xhaka", "Lamine Yamal", "Mbappé"), set "player_name" to the player's full name. You may also set position/nationality if you know them, but player_name is the priority.
Omit any fields that are not specified or implied by the query. Always include "metrics" with the most relevant metrics for the position and query context even if not explicitly mentioned. Default limit to 20 if not specified.`;

export async function parseSearchQuery(
  query: string
): Promise<ParsedSearchParams> {
  const response = await callClaude(SEARCH_SYSTEM_PROMPT, [
    { role: "user", content: query },
  ], 1024);

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    response.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error("Failed to parse search query into structured parameters");
  }

  return JSON.parse(jsonMatch[1].trim());
}

// ── Player Ranking ────────────────────────────────────────────────

export interface RankedPlayer {
  player_external_id: string;
  player_name: string;
  rank: number;
  fit_score: number;
  fit_reasoning: string;
  player_data: Record<string, unknown>;
}

const RANKING_SYSTEM_PROMPT = `You are a football scouting analyst. Given a search query and a list of player stats, rank the players by how well they fit the search criteria.

IMPORTANT: If the original query is a player name (e.g. "Granit Xhaka", "Lamine Yamal"), this is a NAME SEARCH. The user wants to find THAT specific player. In this case:
- Players whose name exactly or closely matches the searched name should get fit_score 95-100
- Players with partially matching names (e.g. same last name) should get fit_score 60-80
- Players with no name similarity should get fit_score 10-30
- Name matching is the PRIMARY ranking criterion for name searches — stats are secondary

For tactical/criteria searches (e.g. "young left-footed CB in Bundesliga"), rank by how well players match the tactical criteria.

For each player, provide:
1. A fit_score from 0-100 (how well they match the criteria)
2. A brief fit_reasoning (1-2 sentences)

Return ONLY valid JSON as an array:
[
  {
    "player_external_id": "string",
    "player_name": "string",
    "rank": 1,
    "fit_score": 85.5,
    "fit_reasoning": "Strong aerial presence with 72% duel win rate, progressive passing in top quartile for Ligue 2 CBs."
  }
]

Rank by fit_score descending. Be specific about why each player ranks where they do, referencing actual stats.`;

export async function rankPlayers(
  query: string,
  parsedParams: ParsedSearchParams,
  players: Record<string, unknown>[]
): Promise<RankedPlayer[]> {
  const userMessage = `Original query: "${query}"
Parsed parameters: ${JSON.stringify(parsedParams)}

Players to rank:
${JSON.stringify(players, null, 2)}`;

  const response = await callClaude(RANKING_SYSTEM_PROMPT, [
    { role: "user", content: userMessage },
  ], 4096);

  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    response.match(/(\[[\s\S]*\])/);

  if (!jsonMatch) {
    throw new Error("Failed to rank players");
  }

  return JSON.parse(jsonMatch[1].trim());
}

// ── Report Generation ─────────────────────────────────────────────

export interface ScoutingReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  style_of_play: string;
  stats_analysis: Record<string, unknown>;
  recommendation: string;
  fit_contexts: string[];
  transfer_history: Array<{ club: string; date: string; fee: string }>;
  contract_info: { estimated_value: string; contract_status: string; agent: string };
  similar_players: Array<{
    name: string;
    club: string;
    age: number;
    similarity_pct: number;
    reasoning: string;
  }>;
}

const REPORT_SYSTEM_PROMPT = `You are an expert football scout writing a professional scouting report. Given a player's full statistical profile, produce a detailed analysis.

Return ONLY valid JSON:
{
  "summary": "2-3 sentence executive summary of the player",
  "strengths": ["3-5 key strengths backed by specific stats"],
  "weaknesses": ["2-4 areas for improvement backed by specific stats"],
  "style_of_play": "A paragraph describing how the player plays, tactical tendencies, movement patterns inferred from stats",
  "stats_analysis": {
    "attacking": { "rating": "A/B/C/D", "key_metrics": {} },
    "defending": { "rating": "A/B/C/D", "key_metrics": {} },
    "passing": { "rating": "A/B/C/D", "key_metrics": {} },
    "physical": { "rating": "A/B/C/D", "key_metrics": {} }
  },
  "recommendation": "Final recommendation paragraph including what type of team/system this player would suit",
  "fit_contexts": ["3-5 tactical contexts where this player would excel, e.g. '4-3-3 high press as left-sided CB'"],
  "transfer_history": [
    { "club": "Club name", "date": "YYYY or YYYY-MM", "fee": "€Xm or Free or Loan or Unknown" }
  ],
  "contract_info": {
    "estimated_value": "Estimated market value range, e.g. €15-20m",
    "contract_status": "Known or estimated contract end date and status, e.g. Under contract until 2027",
    "agent": "Agent name if known, otherwise Unknown"
  },
  "similar_players": [
    {
      "name": "Player name",
      "club": "Current club",
      "age": 25,
      "similarity_pct": 85,
      "reasoning": "Brief explanation of why this player is similar in style/profile"
    }
  ]
}

For transfer_history: include known transfers from your training data. List chronologically (oldest first). If unknown, return an empty array.
For contract_info: provide best estimates from your training data. Use "Unknown" for fields you cannot estimate.
For similar_players: identify 3-5 players with a similar playing style, statistical profile, and/or physical attributes. Include a similarity percentage (0-100) and brief reasoning.

Be specific. Reference actual numbers. Compare to positional averages where possible. Write in professional scouting language.`;

export async function generateScoutingReport(
  playerName: string,
  playerStats: Record<string, unknown>
): Promise<ScoutingReport> {
  const response = await callClaude(REPORT_SYSTEM_PROMPT, [
    {
      role: "user",
      content: `Generate a scouting report for ${playerName}.\n\nFull stats:\n${JSON.stringify(playerStats, null, 2)}`,
    },
  ], 4096);

  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    response.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error("Failed to generate scouting report");
  }

  return JSON.parse(jsonMatch[1].trim());
}

// ── Comparison ────────────────────────────────────────────────────

export interface PlayerComparison {
  title: string;
  players: Array<{
    player_external_id: string;
    player_name: string;
    overall_rank: number;
    per_metric_ranks: Record<string, number>;
    highlights: string[];
  }>;
  analysis: string;
  recommendation: string;
}

const COMPARISON_SYSTEM_PROMPT = `You are an expert football analyst comparing players. Given multiple players' stats and optional tactical context, produce a detailed comparison.

Return ONLY valid JSON:
{
  "title": "Comparison title, e.g. 'Left-Back Comparison: Premier League Targets'",
  "players": [
    {
      "player_external_id": "string",
      "player_name": "string",
      "overall_rank": 1,
      "per_metric_ranks": { "metric_name": 1 },
      "highlights": ["2-3 standout observations for this player"]
    }
  ],
  "analysis": "2-3 paragraph comparative analysis discussing how the players differ in style, strengths, and weaknesses relative to each other",
  "recommendation": "Final recommendation with tactical context — which player suits which system"
}

Be specific with stats. Rank players per-metric and overall. Reference specific numbers in your analysis.`;

export async function comparePlayers(
  players: Array<{ id: string; name: string; stats: Record<string, unknown> }>,
  context?: string
): Promise<PlayerComparison> {
  const userMessage = `Compare these players${context ? ` for the following context: ${context}` : ""}:

${players.map((p) => `Player: ${p.name} (ID: ${p.id})\nStats: ${JSON.stringify(p.stats, null, 2)}`).join("\n\n")}`;

  const response = await callClaude(COMPARISON_SYSTEM_PROMPT, [
    { role: "user", content: userMessage },
  ], 4096);

  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    response.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error("Failed to generate comparison");
  }

  return JSON.parse(jsonMatch[1].trim());
}
