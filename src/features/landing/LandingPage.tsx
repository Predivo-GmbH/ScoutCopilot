import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import {
  Search,
  FileText,
  ArrowLeftRight,
  Bell,
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Shield,
  Menu,
  XIcon,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/shared/Logo'
import { ThemeToggle } from '../../components/shared/ThemeToggle'
import { LanguageSelector } from '../../components/shared/LanguageSelector'
import {
  TIER_PRICES,
  TIER_ANNUAL_TOTAL,
  type BillingInterval,
} from '../../lib/stripe'
import type { SubscriptionTier } from '../../types/database'

/* ─── SVG Visuals ───────────────────────────────────────────────── */

function RadarChartSVG() {
  const { t } = useTranslation()
  const labels = ['aerial', 'passing', 'pace', 'defending', 'shooting', 'dribbling'] as const

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto" aria-hidden="true">
      {/* Grid rings */}
      {[120, 90, 60, 30].map((r) => (
        <polygon
          key={r}
          points={hexPoints(150, 150, r)}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
      {/* Axis lines */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
        const x = 150 + 120 * Math.cos(angle)
        const y = 150 + 120 * Math.sin(angle)
        return (
          <line
            key={i}
            x1="150"
            y1="150"
            x2={x}
            y2={y}
            stroke="var(--color-outline-variant)"
            strokeWidth="1"
            opacity="0.3"
          />
        )
      })}
      {/* Player A */}
      <polygon
        points={radarPoints(150, 150, [95, 70, 85, 60, 90, 75], 120)}
        fill="var(--color-primary)"
        fillOpacity="0.15"
        stroke="var(--color-primary)"
        strokeWidth="2"
      />
      {/* Player B */}
      <polygon
        points={radarPoints(150, 150, [65, 90, 70, 85, 55, 80], 120)}
        fill="var(--color-secondary)"
        fillOpacity="0.12"
        stroke="var(--color-secondary)"
        strokeWidth="2"
      />
      {/* Labels */}
      {labels.map((key, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
        const x = 150 + 140 * Math.cos(angle)
        const y = 150 + 140 * Math.sin(angle)
        return (
          <text
            key={key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-on-surface-variant)"
            fontSize="11"
            fontFamily="var(--font-body)"
          >
            {t(`radarLabels.${key}`)}
          </text>
        )
      })}
    </svg>
  )
}

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    })
    .join(' ')
}

function radarPoints(cx: number, cy: number, values: number[], maxR: number) {
  return values
    .map((v, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
      const r = (v / 100) * maxR
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    })
    .join(' ')
}

/* ─── Component ─────────────────────────────────────────────────── */

export function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [interval, setInterval] = useState<BillingInterval>('year')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const tierKeys = ['scout', 'pro', 'club'] as const
  const tiers = tierKeys.map((key) => ({
    key: key as SubscriptionTier,
    name: t(`landing.tiers.${key}.name`),
    description: t(`landing.tiers.${key}.description`),
    highlighted: key === 'pro',
    features: t(`landing.tiers.${key}.features`, { returnObjects: true }) as string[],
  }))

  const COMPARISON_ROWS: Array<{ feature: string; scout: string | boolean; pro: string | boolean; club: string | boolean }> = [
    { feature: t('landing.comparison.dataSourceConnections'), scout: '1', pro: '2', club: '2 + custom' },
    { feature: t('landing.comparison.aiScoutingReports'), scout: '10/mo', pro: t('common.unlimited'), club: t('common.unlimited') },
    { feature: t('landing.comparison.shortlists'), scout: '25/mo', pro: t('common.unlimited'), club: t('common.unlimited') },
    { feature: t('landing.comparison.playerComparison'), scout: '3', pro: '10', club: '10' },
    { feature: t('landing.comparison.leagueScope'), scout: '1', pro: t('common.all'), club: t('common.all') },
    { feature: t('landing.comparison.tacticalFitAnalysis'), scout: false, pro: true, club: true },
    { feature: t('landing.comparison.pdfExport'), scout: false, pro: true, club: true },
    { feature: t('landing.comparison.userSeats'), scout: '1', pro: '3', club: '10+' },
  ]

  const ROI_ROWS = [
    { task: t('landing.roi.row1'), manual: t('landing.roi.row1Manual'), copilot: t('landing.roi.row1Copilot') },
    { task: t('landing.roi.row2'), manual: t('landing.roi.row2Manual'), copilot: t('landing.roi.row2Copilot') },
    { task: t('landing.roi.row3'), manual: t('landing.roi.row3Manual'), copilot: t('landing.roi.row3Copilot') },
    { task: t('landing.roi.row4'), manual: t('landing.roi.row4Manual'), copilot: t('landing.roi.row4Copilot') },
  ]

  const faqItems = t('landing.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-md">{t('common.skipToContent')}</a>
      <Helmet>
        <title>{t('landing.meta.title')}</title>
        <meta name="description" content={t('landing.meta.description')} />
        <link rel="canonical" href="https://scoutcopilot.com" />
        <meta property="og:title" content={t('landing.meta.title')} />
        <meta property="og:description" content={t('landing.meta.description')} />
        <meta property="og:url" content="https://scoutcopilot.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          })}
        </script>
      </Helmet>
      {/* ── Navigation ──────────────────────────────────────────── */}
      <header>
      <nav
        className={`fixed top-0 w-full z-30 transition-colors duration-[150ms] ${
          scrolled
            ? 'bg-surface-container-low border-b border-outline-variant/40'
            : 'bg-transparent'
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Logo size="md" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollTo('features')} className="text-on-surface-variant hover:text-on-surface transition-colors">
              {t('common.features')}
            </button>
            <button onClick={() => scrollTo('pricing')} className="text-on-surface-variant hover:text-on-surface transition-colors">
              {t('common.pricing')}
            </button>
            <button onClick={() => scrollTo('faq')} className="text-on-surface-variant hover:text-on-surface transition-colors">
              {t('common.faq')}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle className="p-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              {t('common.logIn')}
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              {t('common.getStarted')}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-on-surface-variant min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t('common.toggleMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XIcon size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[64px] z-20" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-surface-container-low border-b border-outline-variant/40 px-6 pb-4 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => scrollTo('features')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.features')}</button>
              <button onClick={() => scrollTo('pricing')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.pricing')}</button>
              <button onClick={() => scrollTo('faq')} className="text-sm text-on-surface-variant text-left py-3 min-h-[44px]">{t('common.faq')}</button>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <LanguageSelector />
                <ThemeToggle className="p-2" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>{t('common.logIn')}</Button>
                <Button size="sm" onClick={() => navigate('/signup')}>{t('common.getStarted')}</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
      </header>

      <main id="main-content">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-6">
              <Trans i18nKey="landing.hero.heading" components={{ highlight: <span className="text-primary-light" /> }}>
                Stop drowning in spreadsheets. Get AI-ranked shortlists in <span className="text-primary-light">30&nbsp;seconds</span>.
              </Trans>
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {t('landing.hero.subheading')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" rightIcon={ArrowRight} onClick={() => navigate('/signup')}>
                {t('common.startFreeTrial')}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => scrollTo('pricing')}>
                {t('landing.hero.seePricing')}
              </Button>
            </div>
            <p className="text-on-surface-variant text-xs mt-4">
              {t('landing.hero.noCreditCard')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <RadarChartSVG />
            <div className="flex items-center gap-6 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 bg-primary rounded-full" />
                <span>{t('landing.hero.playerA')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 bg-secondary rounded-full" />
                <span>{t('landing.hero.playerB')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tactical Capabilities ─────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">
            {t('landing.features.heading')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Natural Language Search */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('landing.features.nlSearch.title')}</h3>
                <Search size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('landing.features.nlSearch.description')}
              </p>
              {/* Mock search input */}
              <div className="bg-surface-container border border-outline-variant rounded-md p-3 flex items-center gap-3">
                <Search size={14} strokeWidth={1.5} className="text-on-surface-variant/70 shrink-0" />
                <span className="font-mono text-xs text-on-surface-variant">
                  {t('landing.features.nlSearch.mock')}
                </span>
                <div className="w-0.5 h-4 bg-primary animate-pulse ml-auto shrink-0" />
              </div>
            </div>

            {/* AI Scouting Reports */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('landing.features.aiReports.title')}</h3>
                <FileText size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('landing.features.aiReports.description')}
              </p>
              {/* Mock report skeleton */}
              <div className="bg-surface-container border border-outline-variant rounded-md p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2.5">
                  <div className="h-2 bg-outline-variant/30 rounded-sm w-full" />
                  <div className="h-2 bg-outline-variant/30 rounded-sm w-4/5" />
                  <div className="h-2 bg-outline-variant/30 rounded-sm w-3/5" />
                </div>
                <div className="w-14 h-14 rounded-md border border-outline-variant/30 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 40" className="w-10 h-10 opacity-30">
                    <polygon points={hexPoints(20, 20, 16)} fill="none" stroke="var(--color-outline-variant)" strokeWidth="1" />
                    <polygon points={hexPoints(20, 20, 10)} fill="none" stroke="var(--color-outline-variant)" strokeWidth="1" />
                    <polygon points={radarPoints(20, 20, [80, 65, 90, 70, 85, 75], 16)} fill="var(--color-primary)" fillOpacity="0.2" stroke="var(--color-primary)" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Player Comparison */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('landing.features.comparison.title')}</h3>
                <ArrowLeftRight size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('landing.features.comparison.description')}
              </p>
              {/* Mock comparison table */}
              <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="py-2 px-3 text-left text-on-surface-variant font-medium">{t('landing.hero.playerA').toUpperCase()}</th>
                      <th className="py-2 px-3 text-left text-primary-light font-medium">{t('landing.hero.playerB').toUpperCase()}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr>
                      <td className="py-1.5 px-3 text-on-surface-variant">92% PASS ACC</td>
                      <td className="py-1.5 px-3 text-on-surface-variant">88% PASS ACC</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 text-on-surface-variant">4.2 TKL/90</td>
                      <td className="py-1.5 px-3 text-on-surface-variant">5.1 TKL/90</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Watchlist Alerts */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">{t('landing.features.watchlist.title')}</h3>
                <Bell size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                {t('landing.features.watchlist.description')}
              </p>
              {/* Mock alert rows */}
              <div className="space-y-2">
                <div className="bg-surface-container border border-outline-variant rounded-md px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-sm bg-error shrink-0" />
                  <span className="font-mono text-xs text-on-surface-variant">
                    {t('landing.features.watchlist.alertMock')}
                  </span>
                </div>
                <div className="bg-surface-container border border-outline-variant rounded-md px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                  <span className="font-mono text-xs text-on-surface-variant">
                    {t('landing.features.watchlist.signalMock')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ──────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4 text-center">
            <Trans i18nKey="landing.roi.heading" components={{ mono: <span className="font-mono" /> }}>
              A junior analyst costs <span className="font-mono">$50K</span>/year. ScoutCopilot starts at <span className="font-mono">$X</span>/month.
            </Trans>
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-12">
            <Trans i18nKey="landing.roi.subheading" components={{ highlight: <span className="font-mono font-bold text-secondary-light" /> }}>
              That's <span className="font-mono font-bold text-secondary-light">27-52 hours</span> saved per week, returned to your scouting staff for what actually matters.
            </Trans>
          </p>

          <div>
            <table className="w-full text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-3 sm:px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest">
                    {t('landing.roi.colTask')}
                  </th>
                  <th className="py-4 px-3 sm:px-6 text-[0.625rem] font-semibold text-center uppercase tracking-widest">
                    {t('landing.roi.colManual')}
                  </th>
                  <th className="py-4 px-3 sm:px-6 text-[0.625rem] font-semibold text-center uppercase tracking-widest text-secondary-light">
                    {t('landing.roi.colCopilot')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {ROI_ROWS.map((r) => (
                  <tr key={r.task}>
                    <td className="py-3 px-3 sm:px-6 text-sm">{r.task}</td>
                    <td className="py-3 px-3 sm:px-6 text-center font-mono text-xs text-on-surface-variant">
                      {r.manual}
                    </td>
                    <td className="py-3 px-3 sm:px-6 text-center font-mono text-xs text-secondary-light">
                      {r.copilot}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ─────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4 text-center">
            {t('landing.pricing.heading')}
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-10">
            {t('landing.pricing.subheading')}
          </p>

          {/* Toggle */}
          <div className="flex flex-col items-center gap-2 mb-12">
            <div className="inline-flex rounded-full bg-surface-container-low border border-outline-variant p-1">
              <button
                onClick={() => setInterval('month')}
                className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  interval === 'month'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('common.monthly')}
              </button>
              <button
                onClick={() => setInterval('year')}
                className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  interval === 'year'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('common.annual')}
              </button>
            </div>
            {interval === 'year' && (
              <span className="text-xs font-medium text-tertiary-light">{t('landing.pricing.saveAnnual')}</span>
            )}
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {tiers.map((tier) => {
              const price = TIER_PRICES[tier.key]
              const displayPrice = interval === 'month' ? price.month : price.year
              const annualTotal = TIER_ANNUAL_TOTAL[tier.key]

              return (
                <div
                  key={tier.key}
                  className={`p-8 rounded-md flex flex-col relative ${
                    tier.highlighted
                      ? 'bg-surface-container border-2 border-primary'
                      : 'bg-surface-container-low border border-outline-variant'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[0.625rem] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                      {t('landing.pricing.mostPopular')}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3
                      className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                        tier.highlighted ? 'text-primary-light' : 'text-on-surface-variant'
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-bold">${displayPrice}</span>
                      <span className="text-on-surface-variant text-sm">{t('common.mo')}</span>
                    </div>
                    {interval === 'year' && (
                      <p className="text-on-surface-variant text-xs mt-1">
                        {t('landing.pricing.billedAnnually', { amount: `$${annualTotal}` })}
                      </p>
                    )}
                    <p className="text-on-surface-variant text-sm mt-3">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-10 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-3 items-start text-sm">
                        <Check size={16} strokeWidth={1.5} className="text-tertiary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    rightIcon={ArrowRight}
                    onClick={() => navigate('/signup')}
                  >
                    {t('common.getStarted')}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest">
                    {t('landing.pricing.feature')}
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">
                    {t('landing.tiers.scout.name')}
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 bg-surface-container/50 uppercase tracking-widest">
                    {t('landing.tiers.pro.name')}
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">
                    {t('landing.tiers.club.name')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 px-6 text-sm">{row.feature}</td>
                    <ComparisonCell value={row.scout} />
                    <ComparisonCell value={row.pro} highlighted />
                    <ComparisonCell value={row.club} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">
            {t('landing.faqHeading')}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto bg-surface-container border border-outline-variant rounded-lg p-10 text-center">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4">
            {t('landing.cta.heading')}
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
            {t('landing.cta.subheading')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Button size="lg" rightIcon={ArrowRight} onClick={() => navigate('/signup')}>
              {t('common.startFreeTrial')}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield size={14} strokeWidth={1.5} className="text-tertiary" />
            <span className="text-xs text-on-surface-variant">{t('landing.cta.guarantee')}</span>
          </div>
        </div>
      </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-outline-variant/20 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Logo size="sm" linkTo="/" />
            <p className="text-on-surface-variant text-xs mt-1">{t('landing.footer.tagline')}</p>
          </div>
          <nav className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-on-surface-variant text-center">
            <button onClick={() => scrollTo('features')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
              {t('common.features')}
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
              {t('common.pricing')}
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">
              {t('common.faq')}
            </button>
            <Link to="/terms" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.terms')}</Link>
            <Link to="/privacy" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.privacy')}</Link>
            <Link to="/imprint" className="hover:text-on-surface transition-colors py-2 min-h-[44px] flex items-center justify-center">{t('common.imprint')}</Link>
          </nav>
          <p className="text-on-surface-variant text-xs">{t('common.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Sub-components ────────────────────────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-${question.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between p-6 text-left min-h-[44px]"
      >
        <span className="font-semibold text-sm pr-4">{question}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-on-surface-variant transition-transform duration-[150ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={panelId} className="px-6 pb-6">
          <p className="text-on-surface-variant text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function ComparisonCell({ value, highlighted }: { value: string | boolean; highlighted?: boolean }) {
  const bgClass = highlighted ? 'bg-surface-container/50' : ''

  if (typeof value === 'boolean') {
    return (
      <td className={`py-3 px-6 text-center ${bgClass}`}>
        {value ? (
          <Check size={16} strokeWidth={1.5} className="text-tertiary inline-block" />
        ) : (
          <X size={16} strokeWidth={1.5} className="text-on-surface-variant/30 inline-block" />
        )}
      </td>
    )
  }

  return (
    <td className={`py-3 px-6 text-center font-mono text-xs ${bgClass}`}>{value}</td>
  )
}
