/**
 * Post-build prerendering for ScoutCopilot's PUBLIC routes.
 *
 * ScoutCopilot ships as a plain SPA, so a crawler that does not run JS sees only
 * the empty index.html shell on every marketing/SEO page. This script uses
 * Puppeteer to render each public route from the freshly built dist/ and saves
 * the fully rendered HTML, so Googlebot (and other non-JS crawlers) get real,
 * keyword-rich content and the correct per-page <title>/meta.
 *
 * Run after `vite build` (wired into `npm run build`): npx tsx scripts/prerender.ts
 *
 * ── Route source of truth ──────────────────────────────────────────────────
 *  - Base public routes (en): reused from scripts/monitor-routes.mjs.
 *  - Marketing routes (en, /for/* + /guides/*): derived from
 *    src/features/marketing/pages.ts — the SAME source scripts/generate-sitemap.ts
 *    uses, so the prerendered set can never drift from the sitemap.
 * English only: the marketing pages are English-only content, and the base pages
 * are prerendered for /en. The /de routes stay SPA-served (no /de dir is created),
 * so their behaviour is unchanged.
 *
 * ── Output layout ──────────────────────────────────────────────────────────
 * Because every route lives under /:lang, a leaf like /en also doubles as the
 * parent directory of /en/for/... . A flat "<route>.html" sibling (as flat-routed
 * fleet projects use) would collide there, so we emit directory-index files:
 *   /en                 -> dist/en/index.html
 *   /en/pricing         -> dist/en/pricing/index.html
 *   /en/for/academies   -> dist/en/for/academies/index.html
 * The deployed .htaccess serves <dir>/index.html with an internal rewrite (no 301
 * slash redirect) and falls through to the SPA shell for any non-prerendered route.
 */
import puppeteer from 'puppeteer'
import { createServer, type Server } from 'http'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, extname, dirname } from 'path'
import { MONITOR_ROUTES } from './monitor-routes.mjs'
import { FOR_PAGES, GUIDE_PAGES } from '../src/features/marketing/pages'

const DIST = join(import.meta.dirname, '..', 'dist')

// Bind an EPHEMERAL port (0), never a fixed one. A fixed port is silently unsafe on
// Windows: another project's preview server on that port does not stop us binding it,
// but `localhost` may resolve elsewhere first, so Puppeteer would scrape the wrong app
// and every route would prerender as that app's shell with the build still "succeeding".
// Resolved at listen time in startServer().
let BASE = ''

interface Route {
  path: string
  file: string
}

// Base public routes (en only) — reused from the monitor's single source of truth.
const BASE_PATHS = MONITOR_ROUTES.map((r) => r.path).filter(
  (p) => p === '/en' || p.startsWith('/en/'),
)

// Marketing SEO routes — derived from pages.ts, same source as generate-sitemap.ts.
const MARKETING_PATHS = [
  ...FOR_PAGES.map((p) => `/en/for/${p.slug}`),
  ...GUIDE_PAGES.map((p) => `/en/guides/${p.slug}`),
]

// Every route is emitted as <path>/index.html (directory-index) — see header note.
const ROUTES: Route[] = [...BASE_PATHS, ...MARKETING_PATHS].map((path) => ({
  path,
  file: `${path.slice(1)}/index.html`,
}))

// Marker text the localized 404 page renders (en + de). If a route prerenders to
// one of these, the route was removed/broken and we must fail the build.
const NOT_FOUND_MARKERS = ['Page not found', 'Seite nicht gefunden']

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

// Simple static file server for the dist folder, with SPA fallback to index.html.
function startServer(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url ?? '/'
      let filePath = join(DIST, url === '/' ? 'index.html' : url)

      // SPA fallback: serve index.html for routes without a file extension.
      if (!existsSync(filePath) && !extname(url)) {
        filePath = join(DIST, 'index.html')
      }

      try {
        const content = readFileSync(filePath)
        const ext = extname(filePath)
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
        res.end(content)
      } catch {
        res.writeHead(404)
        res.end('Not found')
      }
    })
    // 127.0.0.1 + port 0: our own loopback address, an OS-assigned free port.
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      BASE = `http://127.0.0.1:${port}`
      resolve(server)
    })
  })
}

interface HeadTag {
  fullTag: string
  remove: boolean
}

/**
 * Remove duplicate meta/title/link tags in <head>.
 * The static index.html ships baseline SEO tags; the app injects its own per-page
 * tags (React 19 native document metadata on the marketing pages, react-helmet-async
 * on landing/legal). Puppeteer captures both -> duplicates. Keep only the LAST
 * occurrence of each unique tag (the app's version), which is authoritative.
 */
function deduplicateHead(html: string): string {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return html

  const headContent = headMatch[1]
  const seen = new Map<string, number>()
  // Match self-closing and paired tags in head.
  const tagRegex = /<(meta|title|link)(\s[^>]*)?\/?>([\s\S]*?<\/\1>)?/gi
  const tags: HeadTag[] = []
  let match: RegExpExecArray | null
  while ((match = tagRegex.exec(headContent)) !== null) {
    const fullTag = match[0]
    const tagName = match[1].toLowerCase()
    const attrs = match[2] || ''

    // Build a unique key for deduplication.
    let key: string | undefined
    if (tagName === 'title') {
      key = 'title'
    } else if (tagName === 'meta') {
      const nameMatch = attrs.match(/(?:name|property)=["']([^"']+)["']/i)
      key = nameMatch ? `meta:${nameMatch[1]}` : `meta-raw:${attrs.trim()}`
    } else if (tagName === 'link') {
      const relMatch = attrs.match(/rel=["']([^"']+)["']/i)
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i)
      const hreflangMatch = attrs.match(/hreflang=["']([^"']+)["']/i)
      if (relMatch?.[1] === 'canonical') {
        key = 'link:canonical'
      } else if (relMatch?.[1] === 'alternate' && hreflangMatch) {
        key = `link:alternate:${hreflangMatch[1]}`
      } else {
        key = `link:${relMatch?.[1] || ''}:${hrefMatch?.[1] || ''}`
      }
    }

    // Track position — later occurrences overwrite earlier ones.
    if (key) {
      const prev = seen.get(key)
      if (prev !== undefined) tags[prev].remove = true
      seen.set(key, tags.length)
    }
    tags.push({ fullTag, remove: false })
  }

  // Remove duplicate tags from head content.
  let cleanedHead = headContent
  for (const tag of tags) {
    if (tag.remove) cleanedHead = cleanedHead.replace(tag.fullTag, '')
  }

  // Clean up excessive blank lines.
  cleanedHead = cleanedHead.replace(/\n{3,}/g, '\n\n')

  return html.replace(headMatch[0], `<head>${cleanedHead}</head>`)
}

async function prerender(): Promise<void> {
  console.log(`Starting prerender of ${ROUTES.length} public routes...`)
  const server = await startServer()

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const failures: string[] = []

  for (const route of ROUTES) {
    const page = await browser.newPage()
    const url = `${BASE}${route.path}`
    console.log(`  Rendering ${route.path}...`)

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 })
    // Wait for the app to render real content.
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {})

    let html = await page.content()

    // Guard: Vite/Rolldown's runtime modulepreload helper (used to warm the cache
    // for sibling deps of a lazy-loaded route chunk) can resolve asset URLs as an
    // ABSOLUTE `new URL(dep, importerUrl).href` instead of a root-relative path.
    // During prerender importerUrl is always this script's own local server (BASE
    // = http://127.0.0.1:<port>), so if that codepath fires, the <link
    // rel="modulepreload"> it injects gets baked into the DOM as an absolute
    // http://127.0.0.1:<port>/... href. page.content() captures that literally
    // into the static file we ship. Once deployed to the real domain, that becomes
    // a foreign-origin script load that script-src 'self' CSP correctly blocks
    // (this bit Valrano, confirmed root cause 2026-08-13). A prerendered file must
    // be origin-portable, so strip any leaked reference to our own local server
    // back to a root-relative path -- this closes the bug class regardless of why a
    // given build chose the absolute codepath.
    if (html.includes(BASE)) {
      console.warn(
        `  WARNING: ${route.path} had ${html.split(BASE).length - 1} baked-in prerender-origin URL(s) (${BASE}) -- rewriting to root-relative`,
      )
      html = html.split(BASE).join('')
    }

    // HARD-FAIL GUARD (fleet-wide, 2026-08-13): the strip above self-heals the known
    // BASE-origin leak, but if ANY absolute local-server origin still survives (a
    // novel variant the strip did not cover), it would ship a foreign-origin script
    // that a strict CSP blocks in prod -- a silent, intermittent white-screen. Turn
    // that into a LOUD build failure so a leaked build can never reach production.
    // Matches both localhost and 127.0.0.1 -- this server binds to 127.0.0.1 (see
    // startServer()), but the check stays broad in case that ever changes.
    if (/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(html)) {
      throw new Error(
        `prerender guard: ${route.file} (route ${route.path}) still contains an absolute localhost URL after strip -- refusing to ship an origin-locked prerendered file. Inspect the modulepreload/asset href injection.`,
      )
    }

    // The app sets the authoritative per-page document.title (native metadata or Helmet).
    const pageTitle = await page.title()

    // Puppeteer's page.content() returns HTML without a doctype — add it back.
    if (!html.toLowerCase().startsWith('<!doctype')) {
      html = '<!doctype html>\n' + html
    }

    // Normalize <title>: the static index.html <title> otherwise survives deduplicateHead
    // (its "keep last" heuristic can keep the generic static title), shipping the SAME
    // generic title on every page. Replace all <title> with the resolved document.title
    // so each page gets its unique, keyword-rich title.
    if (pageTitle) {
      const safeTitle = pageTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      html = html
        .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
        .replace(/<head([^>]*)>/i, `<head$1><title>${safeTitle}</title>`)
    }

    // Strip duplicate head tags (static baseline vs. per-page injected).
    html = deduplicateHead(html)

    // Guard: a route that prerendered to the localized 404 page is a removed/broken
    // route — fail the build rather than ship a broken page the monitor would flag.
    if (NOT_FOUND_MARKERS.some((m) => html.includes(m))) {
      failures.push(`${route.path} prerendered as the 404 page (route removed or broken?)`)
    }

    const outPath = join(DIST, route.file)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html, 'utf-8')
    console.log(`  ✓ ${route.file} saved`)
    await page.close()
  }

  await browser.close()
  server.close()

  if (failures.length > 0) {
    console.error('✗ Prerender FAILED:')
    for (const f of failures) console.error(`    ${f}`)
    process.exit(1)
  }

  console.log(`Prerender complete — ${ROUTES.length} routes.`)
}

prerender().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
