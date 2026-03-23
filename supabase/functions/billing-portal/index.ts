import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getAuthContext, AuthError, getServiceClient } from "../_shared/auth.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://scoutcopilot.predivo.ch";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await getAuthContext(req);

    // Get org's Stripe customer ID
    const supabase = getServiceClient();
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", auth.organizationId)
      .single();

    if (orgError || !org?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Stripe billing portal session
    const response = await fetch(
      "https://api.stripe.com/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          customer: org.stripe_customer_id,
          return_url: `${SITE_URL}/settings`,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? "Stripe API error");
    }

    const session = await response.json();

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
