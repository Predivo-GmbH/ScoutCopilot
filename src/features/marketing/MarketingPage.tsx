import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { PublicNav } from '../../components/layout/PublicNav'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { useWaitlist } from '../waitlist/useWaitlist'
import { MARKETING_PAGES } from './pages'

interface MarketingPageProps {
  section: 'for' | 'guides'
}

/** SEO use-case / guide page — data-driven from pages.ts. */
export function MarketingPage({ section }: MarketingPageProps) {
  const { i18n } = useTranslation()
  const { openWaitlist } = useWaitlist()
  const lang = i18n.language || 'en'
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? MARKETING_PAGES[`${section}/${slug}`] : undefined

  if (!page) return <Navigate to={`/${lang}`} replace />

  const path = `${section}/${page.slug}`
  // English-only content: canonical always points at /en/ so the /de/ URL doesn't
  // create a duplicate-content signal. (Translate + add de hreflang when localised.)
  const canonical = `https://scoutcopilot.com/en/${path}`

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* React 19 native document metadata — hoisted to <head> automatically.
          Deliberately NOT react-helmet-async: helmet's imperative head mutation
          conflicts with React 19's own head reconciliation (NotFoundError:
          removeChild), which crashed these pages on staging. */}
      <title>{page.title}</title>
      <meta name="description" content={page.metaDescription} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_US" />

      <PublicNav />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-32 md:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{page.eyebrow}</p>
        <h1 className="mb-6 text-[2.25rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-[3rem]">{page.h1}</h1>
        <p className="mb-12 text-base leading-relaxed text-on-surface-variant">{page.intro}</p>

        {page.sections.map((s) => (
          <section key={s.heading} className="mb-10">
            <h2 className="mb-3 text-lg font-semibold">{s.heading}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed text-on-surface-variant">{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-2 space-y-2 text-sm text-on-surface-variant">
                {s.bullets.map((b) => <li key={b}>• {b}</li>)}
              </ul>
            )}
          </section>
        ))}

        <div className="mt-12 rounded-xl border border-outline-variant/30 bg-surface-container p-6 text-center">
          <p className="mb-4 text-sm text-on-surface-variant">See what ScoutCopilot surfaces for your next signing.</p>
          <button
            onClick={() => openWaitlist('marketing')}
            className="inline-flex cursor-pointer items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Start free trial
          </button>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
