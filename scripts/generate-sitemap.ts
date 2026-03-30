/**
 * Build-time sitemap generator.
 * Generates paired EN/DE URLs with xhtml:link hreflang annotations.
 * Run after vite build: tsx scripts/generate-sitemap.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE_URL = 'https://scoutcopilot.com'
const LOCALES = ['en', 'de'] as const
const today = new Date().toISOString().split('T')[0]

const routes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.9, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.5, changefreq: 'yearly' },
  { path: '/terms', priority: 0.5, changefreq: 'yearly' },
  { path: '/imprint', priority: 0.5, changefreq: 'yearly' },
]

function generateSitemap(): string {
  const urls: string[] = []

  for (const route of routes) {
    const barePath = route.path === '/' ? '' : route.path
    for (const locale of LOCALES) {
      const loc = `${BASE_URL}/${locale}${barePath}`
      const enUrl = `${BASE_URL}/en${barePath}`
      const deUrl = `${BASE_URL}/de${barePath}`

      urls.push(`  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
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
console.log(`Sitemap generated: ${outPath} (${routes.length * LOCALES.length} URLs, ${routes.length} routes x ${LOCALES.length} languages)`)
