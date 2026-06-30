/**
 * SINGLE SOURCE OF TRUTH for ScoutCopilot's public routes (en + de).
 *
 * Consumed by:
 *   - scripts/write-monitor-manifest.mjs → emits dist/monitor-routes.json
 *     (deployed) which the production-monitor (separate repo) fetches FROM PROD
 *     to smoke-test every route. Removing a route here stops it being monitored
 *     automatically — no monitor-repo edit, no stale alarm.
 *
 * NOTE: ScoutCopilot is a pure SPA (no per-route prerender), so there is no
 * build-time route-existence gate like the prerendered projects have — the
 * monitor's not-found check catches a broken/removed route instead.
 *
 * Keep in sync with the base routes in scripts/generate-sitemap.ts. Base public
 * routes are language-expanded here into the concrete URLs a visitor hits.
 */
const BASE_ROUTES = ['', '/pricing', '/privacy', '/terms', '/imprint']
const LOCALES = ['en', 'de']

export const MONITOR_ROUTES = LOCALES.flatMap((lang) =>
  BASE_ROUTES.map((r) => ({ path: `/${lang}${r}` })),
)

/** Just the path strings. */
export const ROUTE_PATHS = MONITOR_ROUTES.map((r) => r.path)
