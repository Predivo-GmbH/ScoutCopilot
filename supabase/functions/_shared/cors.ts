// CORS headers for Supabase Edge Functions

const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
if (!allowedOriginsEnv) {
  console.warn("ALLOWED_ORIGINS env var is not set — all CORS requests will be rejected.");
}
const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(",").map((o) => o.trim()) : [];

/** Build CORS headers dynamically based on the request Origin. */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const matched = allowedOrigins.includes(origin) ? origin : "";

  return {
    "Access-Control-Allow-Origin": matched,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/**
 * Call at the top of every handler. Returns per-request CORS headers
 * and a preflight response for OPTIONS, or null otherwise.
 */
export function handleCors(req: Request): { corsHeaders: Record<string, string>; preflightResponse: Response | null } {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return { corsHeaders, preflightResponse: new Response(null, { status: 204, headers: corsHeaders }) };
  }
  return { corsHeaders, preflightResponse: null };
}
