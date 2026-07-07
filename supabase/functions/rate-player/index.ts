// Rate Player Edge Function — AI-powered rating from stats
// POST /rate-player { players: Array<{ player_external_id, player_name, stats }> }
// Returns: { ratings: Array<{ player_external_id, rating: number (0-99), reasoning: string }> }

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext } from "../_shared/auth.ts";
import { logAnthropicUsage } from "../_shared/log-usage.ts";
import { anthropicMessages } from "../_shared/anthropic-model.ts";

interface PlayerInput {
  player_external_id: string;
  player_name: string;
  position?: string;
  stats: Record<string, number>;
}

interface RatingResult {
  player_external_id: string;
  rating: number;
  reasoning: string;
}

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
    await getAuthContext(req);

    const { players } = (await req.json()) as { players: PlayerInput[] };
    if (!players || !Array.isArray(players) || players.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty 'players' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit batch size
    const batch = players.slice(0, 10);
    const results: RatingResult[] = [];

    // Players with stats get AI rating; those without get null
    const withStats = batch.filter(
      (p) => p.stats && Object.values(p.stats).some((v) => typeof v === "number" && v > 0)
    );
    const withoutStats = batch.filter(
      (p) => !p.stats || !Object.values(p.stats).some((v) => typeof v === "number" && v > 0)
    );

    // No-stats players get 0 rating with explanation
    for (const p of withoutStats) {
      results.push({
        player_external_id: p.player_external_id,
        rating: 0,
        reasoning: "No statistics available to generate a rating",
      });
    }

    // AI-rate players with stats
    if (withStats.length > 0) {
      const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!apiKey) {
        // Fallback: formula-based rating
        for (const p of withStats) {
          results.push(formulaRating(p));
        }
      } else {
        try {
          const aiRatings = await getAIRatings(apiKey, withStats);
          results.push(...aiRatings);
        } catch (err) {
          console.error("AI rating failed, using formula fallback:", (err as Error).message);
          for (const p of withStats) {
            results.push(formulaRating(p));
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ ratings: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Rate player error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Formula-based rating fallback when AI is unavailable */
function formulaRating(p: PlayerInput): RatingResult {
  const s = p.stats;
  const matches = s.matches_played ?? 0;
  if (matches === 0) {
    return {
      player_external_id: p.player_external_id,
      rating: 0,
      reasoning: "No matches played",
    };
  }

  const per90 = (v: number) => (v / Math.max(1, (s.minutes_played ?? 1) / 90));

  // Offensive contribution
  const goalsPer90 = per90(s.goals ?? 0);
  const assistsPer90 = per90(s.assists ?? 0);
  const xGPer90 = per90(s.xG ?? 0);
  const xAPer90 = per90(s.xA ?? 0);
  const keyPassesPer90 = per90(s.key_passes ?? 0);

  // Defensive contribution
  const tacklesPer90 = per90(s.tackles ?? 0);
  const interceptsPer90 = per90(s.interceptions ?? 0);

  // Possession
  const passCompletion = s.pass_completion ?? 0;
  const dribbleSuccess = s.dribble_success_rate ?? 0;

  // Weighted score (0-100 range)
  let score = 50; // baseline
  score += Math.min(goalsPer90 * 15, 20);
  score += Math.min(assistsPer90 * 10, 10);
  score += Math.min(xGPer90 * 10, 10);
  score += Math.min(xAPer90 * 8, 8);
  score += Math.min(keyPassesPer90 * 3, 6);
  score += Math.min(tacklesPer90 * 3, 6);
  score += Math.min(interceptsPer90 * 3, 5);
  score += Math.min((passCompletion / 100) * 5, 5);
  score += Math.min((dribbleSuccess / 100) * 3, 3);

  // Experience bonus
  if (matches >= 20) score += 3;
  else if (matches >= 10) score += 1;

  const rating = Math.min(99, Math.max(1, Math.round(score)));

  return {
    player_external_id: p.player_external_id,
    rating,
    reasoning: `Rating based on per-90 statistics across ${matches} matches`,
  };
}

/** AI-powered rating using Claude */
async function getAIRatings(
  apiKey: string,
  players: PlayerInput[]
): Promise<RatingResult[]> {
  const playersJson = players.map((p) => ({
    id: p.player_external_id,
    name: p.player_name,
    position: p.position ?? "Unknown",
    stats: p.stats,
  }));

  const systemPrompt = `You are a professional football scout rating players on a 1-99 scale based on their statistics.

Rating guidelines:
- 85-99: World class, elite performers
- 75-84: Very good, top league quality
- 65-74: Good, solid professional
- 55-64: Average professional
- 45-54: Below average
- 1-44: Poor / limited data

Consider the player's position when evaluating stats. A defender with 0 goals is normal; a striker with 0 goals is not.
Evaluate per-90-minute rates, not raw totals. Consider matches played for sample size.

Return ONLY a JSON array with objects: { "id": "player_external_id", "rating": number, "reasoning": "1-2 sentence explanation" }
No markdown, no extra text.`;

  // Model is resolved dynamically (AI_MODEL_FAST secret, with retirement fallback)
  // per fleet standard: standards/ai-model-resolution.md
  const response = await anthropicMessages(apiKey, "fast", {
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Rate these players:\n${JSON.stringify(playersJson, null, 2)}`,
      },
    ],
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
    model?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  await logAnthropicUsage('ScoutCopilot', 'rate-player', data);

  const text = data.content?.[0]?.text ?? "[]";
  // Newer models may wrap JSON in markdown code fences — strip them (same as _shared/claude.ts)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    text.match(/(\[[\s\S]*\])/);
  const parsed = JSON.parse((jsonMatch ? jsonMatch[1] : text).trim()) as Array<{
    id: string;
    rating: number;
    reasoning: string;
  }>;

  return parsed.map((r) => ({
    player_external_id: r.id,
    rating: Math.min(99, Math.max(0, Math.round(r.rating))),
    reasoning: r.reasoning,
  }));
}
