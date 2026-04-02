import { handleCors } from "../_shared/cors.ts";
import { getAuthContext, AuthError, getServiceClient } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://scoutcopilot.com";

// Price ID mapping — replace with real Stripe price IDs
const PRICE_IDS: Record<string, Record<string, string>> = {
  scout: {
    month: "price_scout_monthly_placeholder",
    year: "price_scout_annual_placeholder",
  },
  pro: {
    month: "price_pro_monthly_placeholder",
    year: "price_pro_annual_placeholder",
  },
  club: {
    month: "price_club_monthly_placeholder",
    year: "price_club_annual_placeholder",
  },
};

async function stripeRequest(
  endpoint: string,
  body: Record<string, string>
): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Stripe API error");
  }

  return response.json();
}

Deno.serve(async (req) => {
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

    // Rate limit: 5 requests/minute per organization
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 5 / 60, 5);
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

    const { tier, interval } = await req.json();

    // Validate inputs
    if (!["scout", "pro", "club"].includes(tier)) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["month", "year"].includes(interval)) {
      return new Response(JSON.stringify({ error: "Invalid interval" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = PRICE_IDS[tier][interval];

    // Get user email for Stripe
    const supabase = getServiceClient();
    const { data: userData } = await supabase.auth.admin.getUserById(auth.userId);
    const email = userData?.user?.email;

    // Check if org already has a Stripe customer
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", auth.organizationId)
      .single();

    const sessionParams: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${SITE_URL}/settings?billing=success`,
      cancel_url: `${SITE_URL}/pricing?canceled=true`,
      "metadata[organization_id]": auth.organizationId,
      "metadata[user_id]": auth.userId,
      "metadata[tier]": tier,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    if (org?.stripe_customer_id) {
      sessionParams.customer = org.stripe_customer_id;
      delete sessionParams.customer_email;
    }

    const session = await stripeRequest("/checkout/sessions", sessionParams);

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
