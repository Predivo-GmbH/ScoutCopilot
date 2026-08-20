// SEC-020: Credentials are stored as plaintext JSON in `encrypted_credentials`
// column (misnomer). Supabase Vault (pgsodium) is required for at-rest
// encryption but is NOT available on the current Free plan. Migration steps
// when upgrading to Pro: 1) enable pgsodium extension via Dashboard >
// Database > Extensions, 2) create an encryption key via
// `select * from pgsodium.create_key()`, 3) add DB functions
// `encrypt_credentials(jsonb, uuid)` / `decrypt_credentials(bytea, uuid)`
// wrapping pgsodium_encrypt/pgsodium_decrypt, 4) alter table to store
// bytea instead of jsonb, 5) update this edge function to call the DB
// functions. Current mitigation: RLS restricts access to org owners/admins,
// GET never returns credential values, and the service-role key is only
// available in edge functions (not client-side).

// Credentials Edge Function — BYOK API credential management
// GET    /credentials       — list org's credentials (masked)
// POST   /credentials       — add new credential
// PUT    /credentials       — update credential
// DELETE /credentials       — remove credential

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { AuthError, getAuthContext, getServiceClient } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logError } from '../_shared/error-log.ts'

serve(async (req: Request) => {
  const { corsHeaders, preflightResponse } = handleCors(req);
  if (preflightResponse) return preflightResponse;

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

    // Only owners and admins can manage credentials
    if (auth.role === "scout") {
      return new Response(
        JSON.stringify({ error: "Only organization owners and admins can manage API credentials" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = getServiceClient();

    switch (req.method) {
      case "GET":
        return await handleGet(supabase, auth.organizationId, corsHeaders);
      case "POST":
        return await handlePost(supabase, auth.organizationId, req, corsHeaders);
      case "PUT":
        return await handlePut(supabase, auth.organizationId, req, corsHeaders);
      case "DELETE":
        return await handleDelete(supabase, auth.organizationId, req, corsHeaders);
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Credentials error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── GET — List credentials (masked) ─────────────────────────────

async function handleGet(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { data, error } = await supabase
    .from("api_credentials")
    .select("id, provider, is_active, created_at, updated_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ credentials: data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── POST — Add new credential ───────────────────────────────────

async function handlePost(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { provider, username, password } = await req.json();

  if (!provider || !username || !password) {
    return new Response(
      JSON.stringify({ error: "Missing 'provider', 'username', or 'password'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (provider !== "wyscout" && provider !== "statsbomb") {
    return new Response(
      JSON.stringify({ error: "Provider must be 'wyscout' or 'statsbomb'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate credentials by making a test API call
  const isValid = await validateCredentials(provider, username, password);
  if (!isValid.success) {
    return new Response(
      JSON.stringify({
        error: `Credential validation failed: ${isValid.message}`,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Store credentials
  const { data, error } = await supabase
    .from("api_credentials")
    .upsert(
      {
        organization_id: organizationId,
        provider,
        encrypted_credentials: { username, password },
        is_active: true,
      },
      { onConflict: "organization_id,provider" }
    )
    .select("id, provider, is_active, created_at")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "Credential saved successfully", credential: data }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ── PUT — Update credential ─────────────────────────────────────

async function handlePut(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { id, username, password, is_active } = await req.json();

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing credential 'id'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (username && password) {
    updateData.encrypted_credentials = { username, password };
  }
  if (typeof is_active === "boolean") {
    updateData.is_active = is_active;
  }

  if (Object.keys(updateData).length === 0) {
    return new Response(
      JSON.stringify({ error: "No fields to update" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // If updating credentials, validate first
  if (username && password) {
    // Get existing provider
    const { data: existing } = await supabase
      .from("api_credentials")
      .select("provider")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .single();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await validateCredentials(existing.provider, username, password);
    if (!isValid.success) {
      return new Response(
        JSON.stringify({ error: `Credential validation failed: ${isValid.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  const { data, error } = await supabase
    .from("api_credentials")
    .update(updateData)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("id, provider, is_active, updated_at")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: "Credential not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ message: "Credential updated", credential: data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ── DELETE — Remove credential ──────────────────────────────────

async function handleDelete(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { id } = await req.json();

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing credential 'id'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { error, count } = await supabase
    .from("api_credentials")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (count === 0) {
    return new Response(
      JSON.stringify({ error: "Credential not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ message: "Credential deleted" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ── Credential validation ───────────────────────────────────────

async function validateCredentials(
  provider: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  // Skip validation in mock mode
  if (Deno.env.get("MOCK_DATA") === "true") {
    return { success: true, message: "Mock mode — validation skipped" };
  }

  try {
    const authHeader = btoa(`${username}:${password}`);

    if (provider === "wyscout") {
      const response = await fetch("https://apirest.wyscout.com/v3/competitions", {
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
      });
      if (response.ok) return { success: true, message: "Wyscout credentials valid" };
      if (response.status === 401) return { success: false, message: "Invalid Wyscout credentials" };
      return { success: false, message: `Wyscout API returned ${response.status}` };
    }

    if (provider === "statsbomb") {
      const response = await fetch("https://data.statsbomb.com/api/v2/competitions", {
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
      });
      if (response.ok) return { success: true, message: "StatsBomb credentials valid" };
      if (response.status === 401) return { success: false, message: "Invalid StatsBomb credentials" };
      return { success: false, message: `StatsBomb API returned ${response.status}` };
    }

    return { success: false, message: "Unknown provider" };
  } catch (err) {
    await logError('credentials', 'request', err)
    return { success: false, message: `Connection error: ${(err as Error).message}` };
  }
}
