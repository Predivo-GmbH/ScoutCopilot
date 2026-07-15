// Auth helper — extract and verify Supabase JWT, resolve user + organization

import { createClient } from "npm:@supabase/supabase-js@2";

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "scout";
  subscriptionTier: "scout" | "pro" | "club";
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.replace("Bearer ", "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
  // Prefer the new publishable/secret-key regime; fall back to the legacy
  // service_role JWT so nothing breaks while legacy keys remain enabled.
  const supabaseServiceKey =
    Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseServiceKey) throw new Error("SB_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY not set");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify the JWT and get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }

  // Fetch the user's profile with organization
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organization_id) {
    throw new AuthError("User profile or organization not found", 403);
  }

  // Fetch organization tier
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("subscription_tier")
    .eq("id", profile.organization_id)
    .single();

  if (orgError || !org) {
    throw new AuthError("Organization not found", 403);
  }

  return {
    userId: user.id,
    organizationId: profile.organization_id,
    role: profile.role,
    subscriptionTier: org.subscription_tier,
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/** Create a Supabase admin client (service role) for DB operations in edge functions */
export function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("SUPABASE_URL not set");
  // Prefer SB_SECRET_KEY (new key regime); legacy service_role remains the fallback.
  const serviceKey =
    Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) throw new Error("SB_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, serviceKey);
}
