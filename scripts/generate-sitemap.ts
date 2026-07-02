/**
 * Build-time sitemap generator.
 * Generates paired EN/DE URLs with xhtml:link hreflang annotations.
 * Run after vite build: tsx scripts/generate-sitemap.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FOR_PAGES, GUIDE_PAGES } from '../src/features/marketing/pages'

const BASE_URL = 'https://scoutcopilot.com'
const LOCALES = ['en', 'de'] as const
const today = new Date().toISOString().split('T')[0]

interface RouteDef {
  path: string
  priority: number
  changefreq: string
  /** English-only content (SEO marketing pages): list /en/ only, no de hreflang. */
  enOnly?: boolean
}

const routes: RouteDef[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.9, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.5, changefreq: 'yearly' },
  { path: '/terms', priority: 0.5, changefreq: 'yearly' },
  { path: '/imprint', priority: 0.5, changefreq: 'yearly' },
  // SEO marketing pages (use-cases + guides) — data-driven from src/features/marketing/pages.ts.
  // English-only content, so /en/ only (until translated).
  ...FOR_PAGES.map((p) => ({ path: `/for/${p.slug}`, priority: 0.7, changefreq: 'monthly', enOnly: true })),
  ...GUIDE_PAGES.map((p) => ({ path: `/guides/${p.slug}`, priority: 0.7, changefreq: 'monthly', enOnly: true })),
]

function generateSitemap(): string {
  const urls: string[] = []

  for (const route of routes) {
    const barePath = route.path === '/' ? '' : route.path
    const enUrl = `${BASE_URL}/en${barePath}`
    const deUrl = `${BASE_URL}/de${barePath}`
    const locales = route.enOnly ? (['en'] as const) : LOCALES
    const hreflang = route.enOnly
      ? `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>`
      : `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>`

    for (const locale of locales) {
      const loc = `${BASE_URL}/${locale}${barePath}`
      urls.push(`  <url>
    <loc>${loc}</loc>
${hreflang}
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`)
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}

const sitemap = generateSitemap()
const outPath = resolve(import.meta.dirname, '..', 'dist', 'sitemap.xml')
writeFileSync(outPath, sitemap, 'utf-8')
const urlCount = (sitemap.match(/<url>/g) ?? []).length
console.log(`Sitemap generated: ${outPath} (${urlCount} URLs across ${routes.length} routes)`)
