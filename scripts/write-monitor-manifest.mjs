/**
 * Emit dist/monitor-routes.json from the single source of truth so it deploys
 * as a static asset at https://scoutcopilot.com/monitor-routes.json.
 *
 * The production monitor fetches this and smoke-tests every route. Because the
 * monitor reads the list from PROD, adding/removing a route in
 * scripts/monitor-routes.mjs is the only edit needed. Runs in `npm run build`.
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { MONITOR_ROUTES } from './monitor-routes.mjs'

const DIST = join(import.meta.dirname, '..', 'dist')
if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true })

const manifest = {
  generated: new Date().toISOString(),
  notFoundMarkers: ['Page not found', 'Seite nicht gefunden'],
  routes: MONITOR_ROUTES.map((r) => ({
    path: r.path,
    ...(r.mustContain ? { mustContain: r.mustContain } : {}),
  })),
}

const out = join(DIST, 'monitor-routes.json')
writeFileSync(out, JSON.stringify(manifest, null, 2))
console.log(`✓ Wrote ${out} with ${manifest.routes.length} routes.`)
