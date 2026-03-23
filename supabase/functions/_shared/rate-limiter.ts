// Token bucket rate limiter per organization
// In-memory — resets when edge function cold-starts (acceptable for serverless)

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_RATE = 8; // requests per second (conservative below Wyscout's 12/s)
const DEFAULT_CAPACITY = 8;

export function checkRateLimit(
  organizationId: string,
  rate: number = DEFAULT_RATE,
  capacity: number = DEFAULT_CAPACITY
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let bucket = buckets.get(organizationId);

  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(organizationId, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * rate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  // Calculate wait time for next token
  const retryAfterMs = Math.ceil(((1 - bucket.tokens) / rate) * 1000);
  return { allowed: false, retryAfterMs };
}

/** Wait until rate limit allows, with a maximum wait time */
export async function waitForRateLimit(
  organizationId: string,
  maxWaitMs: number = 5000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const { allowed, retryAfterMs } = checkRateLimit(organizationId);
    if (allowed) return;
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterMs, 100)));
  }
  throw new Error("Rate limit exceeded — too many concurrent requests");
}
