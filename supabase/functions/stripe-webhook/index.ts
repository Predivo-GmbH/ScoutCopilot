import { getServiceClient } from "../_shared/auth.ts";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Map Stripe price IDs to tiers — update after creating Stripe products
const PRICE_TO_TIER: Record<string, { tier: string; seats: number }> = {
  price_scout_monthly_placeholder: { tier: "scout", seats: 1 },
  price_scout_annual_placeholder: { tier: "scout", seats: 1 },
  price_pro_monthly_placeholder: { tier: "pro", seats: 3 },
  price_pro_annual_placeholder: { tier: "pro", seats: 3 },
  price_club_monthly_placeholder: { tier: "club", seats: 10 },
  price_club_annual_placeholder: { tier: "club", seats: 10 },
};

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<Record<string, unknown>> {
  // Stripe webhook signature verification using Web Crypto API
  const parts = signature.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const sigPart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !sigPart) {
    throw new Error("Invalid signature format");
  }

  const timestamp = timestampPart.slice(2);
  const expectedSig = sigPart.slice(3);

  const signedPayload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const computedSigBytes = new Uint8Array(signatureBytes);

  // Convert hex expectedSig to bytes for timing-safe comparison
  const expectedSigBytes = new Uint8Array(expectedSig.length / 2);
  for (let i = 0; i < expectedSig.length; i += 2) {
    expectedSigBytes[i / 2] = parseInt(expectedSig.substring(i, i + 2), 16);
  }

  if (
    computedSigBytes.length !== expectedSigBytes.length ||
    !crypto.subtle.timingSafeEqual(computedSigBytes, expectedSigBytes)
  ) {
    throw new Error("Signature verification failed");
  }

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  return JSON.parse(body);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    const eventType = event.type as string;
    const data = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;

    const supabase = getServiceClient();

    switch (eventType) {
      case "checkout.session.completed": {
        const metadata = data.metadata as Record<string, string>;
        const orgId = metadata?.organization_id;
        const subscriptionId = data.subscription as string;
        const customerId = data.customer as string;

        if (!orgId) break;

        // Fetch subscription to get the price/tier
        // For now, use metadata tier directly
        const tier = metadata?.tier ?? "scout";
        const seats = PRICE_TO_TIER[`price_${tier}_monthly_placeholder`]?.seats ?? 1;

        await supabase
          .from("organizations")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: tier,
            max_seats: seats,
          })
          .eq("id", orgId);

        break;
      }

      case "customer.subscription.updated": {
        const customerId = data.customer as string;
        const items = (data.items as Record<string, unknown>)?.data as Array<Record<string, unknown>>;
        const priceId = (items?.[0]?.price as Record<string, string>)?.id;

        const tierInfo = priceId ? PRICE_TO_TIER[priceId] : null;

        if (tierInfo) {
          await supabase
            .from("organizations")
            .update({
              subscription_tier: tierInfo.tier,
              max_seats: tierInfo.seats,
            })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const customerId = data.customer as string;

        await supabase
          .from("organizations")
          .update({
            subscription_tier: "scout",
            stripe_subscription_id: null,
            max_seats: 1,
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "invoice.payment_failed": {
        const customerId = data.customer as string;
        // Log the payment failure — could also store in a payment_issues table
        console.error(`Payment failed for customer: ${customerId}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
