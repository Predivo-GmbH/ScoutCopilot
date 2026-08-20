// Import Team Edge Function — Search teams and fetch squads via API-Football
// POST /import-team { action: "search-teams", query: string }
// POST /import-team { action: "get-squad", team_id: number }

import { logError } from '../_shared/error-log.ts'
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import {
  searchTeams,
  getTeamSquad,
  type ApiFootballTeam,
} from "../_shared/providers/api-football.ts";

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

    // Rate limit: 30 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(
      `import-team:${auth.organizationId}`,
      30 / 60,
      30
    );
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

    const body = await req.json();
    const { action } = body;

    if (action === "search-teams") {
      return await handleSearchTeams(body, auth.organizationId, corsHeaders);
    } else if (action === "get-squad") {
      return await handleGetSquad(body, auth.organizationId, corsHeaders);
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}. Use "search-teams" or "get-squad".` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    await logError('import-team', 'request', err)
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Import-team error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Search Teams ─────────────────────────────────────────────────

async function handleSearchTeams(
  body: { query?: string },
  organizationId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { query } = body;
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return new Response(
      JSON.stringify({ error: "Provide a search query (min 2 characters)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results = await searchTeams(query.trim(), organizationId);

  // Map to a clean response (exclude venue details the frontend doesn't need)
  const teams = results.map((r: ApiFootballTeam) => ({
    id: r.team.id,
    name: r.team.name,
    country: r.team.country,
    logo: r.team.logo,
    founded: r.team.founded,
    national: r.team.national,
    venue: r.venue?.name ?? null,
  }));

  return new Response(JSON.stringify({ teams }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Get Squad ────────────────────────────────────────────────────

async function handleGetSquad(
  body: { team_id?: number },
  organizationId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { team_id } = body;
  if (!team_id || typeof team_id !== "number") {
    return new Response(
      JSON.stringify({ error: "Provide a numeric team_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const players = await getTeamSquad(team_id, organizationId);

  // Map positions from API-Football's generic terms to our position codes
  const mapped = players.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    number: p.number,
    position: mapApiFootballPosition(p.position),
    positionRaw: p.position,
    photo: p.photo,
  }));

  return new Response(JSON.stringify({ players: mapped }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Helpers ──────────────────────────────────────────────────────

/** Map API-Football squad position strings to SquadPosition codes */
function mapApiFootballPosition(raw: string): string {
  switch (raw) {
    case "Goalkeeper":
      return "GK";
    case "Defender":
      return "CB";
    case "Midfielder":
      return "CM";
    case "Attacker":
      return "ST";
    default:
      return "CM";
  }
}
