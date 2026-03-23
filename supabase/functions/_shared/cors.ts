// CORS headers for Supabase Edge Functions

const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",") ?? ["*"];

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": allowedOrigins[0],
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}
