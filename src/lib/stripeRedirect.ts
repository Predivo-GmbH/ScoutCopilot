/**
 * Validates a Stripe URL and redirects, or falls back to a local path.
 */
export function redirectToStripeUrl(url: string | undefined, fallbackPath: string): void {
  if (!url) {
    window.location.href = fallbackPath
    return
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname.endsWith('stripe.com')) {
      window.location.href = url
    } else {
      window.location.href = fallbackPath
    }
  } catch {
    window.location.href = fallbackPath
  }
}
