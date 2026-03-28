import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, X, ArrowRight } from 'lucide-react'
import { Logo } from '../../components/shared/Logo'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LanguageSelector } from '../../components/shared/LanguageSelector'
import { TIER_PRICES, TIER_ANNUAL_TOTAL, createCheckoutSession, type BillingInterval } from '../../lib/stripe'
import type { SubscriptionTier } from '../../types/database'

const TIER_KEYS = ['scout', 'pro', 'club'] as const

const TIER_META: Record<string, { key: SubscriptionTier; highlighted: boolean }> = {
  scout: { key: 'scout', highlighted: false },
  pro: { key: 'pro', highlighted: true },
  club: { key: 'club', highlighted: false },
}

const COMPARISON_ROWS: Array<{
  featureKey: string
  scout: string | boolean
  pro: string | boolean
  club: string | boolean
}> = [
  { featureKey: 'pricingRows.dataSourceConnections', scout: '1', pro: 'pricingValues.twoWyscoutStatsbomb', club: 'pricingValues.twoPlusCustom' },
  { featureKey: 'pricingRows.nlPlayerSearch', scout: 'pricingValues.unlimited', pro: 'pricingValues.unlimited', club: 'pricingValues.unlimited' },
  { featureKey: 'pricingRows.aiScoutingReports', scout: 'pricingValues.tenPerMonth', pro: 'pricingValues.unlimited', club: 'pricingValues.unlimited' },
  { featureKey: 'pricingRows.shortlists', scout: 'pricingValues.twentyFivePerMonth', pro: 'pricingValues.unlimited', club: 'pricingValues.unlimited' },
  { featureKey: 'pricingRows.playerComparison', scout: 'pricingValues.threePlayers', pro: 'pricingValues.tenPlayers', club: 'pricingValues.tenPlayers' },
  { featureKey: 'pricingRows.leagueScope', scout: 'pricingValues.oneLeague', pro: 'pricingValues.allLeagues', club: 'pricingValues.allLeagues' },
  { featureKey: 'pricingRows.tacticalFitAnalysis', scout: false, pro: true, club: true },
  { featureKey: 'pricingRows.developmentTrajectory', scout: false, pro: true, club: true },
  { featureKey: 'pricingRows.pdfExport', scout: false, pro: true, club: true },
  { featureKey: 'pricingRows.watchlists', scout: false, pro: true, club: true },
  { featureKey: 'pricingRows.customAiModels', scout: false, pro: false, club: true },
  { featureKey: 'pricingRows.scoutCopilotApi', scout: false, pro: false, club: true },
  { featureKey: 'pricingRows.bulkOperations', scout: false, pro: false, club: true },
  { featureKey: 'pricingRows.customMetrics', scout: false, pro: false, club: true },
  { featureKey: 'pricingRows.userSeats', scout: '1', pro: '3', club: '10+' },
  { featureKey: 'pricingRows.support', scout: 'pricingValues.email48hr', pro: 'pricingValues.email24hr', club: 'pricingValues.dedicatedChannel' },
  { featureKey: 'pricingRows.dataRetention', scout: 'pricingValues.threeMonths', pro: 'pricingValues.sixMonths', club: 'pricingValues.twentyFourMonths' },
]

export function PricingPage() {
  const { t } = useTranslation()
  const [interval, setInterval] = useState<BillingInterval>('year')
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null)
  const navigate = useNavigate()

  const faqItems = t('landing.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>

  async function handleSelectTier(tier: SubscriptionTier) {
    setLoadingTier(tier)
    try {
      const url = await createCheckoutSession(tier, interval)
      try {
        const parsed = new URL(url)
        if (parsed.hostname === 'checkout.stripe.com') {
          window.location.href = url
        } else {
          navigate('/pricing')
        }
      } catch {
        navigate('/pricing')
      }
    } catch {
      // If not authenticated, redirect to signup
      navigate('/signup')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>{t('pricing.meta.title')}</title>
        <meta name="description" content={t('pricing.meta.description')} />
        <link rel="canonical" href="https://scoutcopilot.com/pricing" />
        <meta property="og:title" content={t('pricing.meta.title')} />
        <meta property="og:description" content={t('pricing.meta.description')} />
        <meta property="og:url" content="https://scoutcopilot.com/pricing" />
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
      {/* Nav */}
      <nav className="w-full sticky top-0 z-30 bg-surface border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Logo size="md" linkTo="/" />
            <div className="hidden md:flex gap-6 text-sm">
              <Link to="/#features" className="text-on-surface-variant hover:text-on-surface transition-colors">{t('common.features')}</Link>
              <span className="text-on-surface border-b-2 border-primary pb-1">{t('common.pricing')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector className="hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">{t('pricing.signIn')}</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>{t('common.startFreeTrial')}</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t('pricing.heading')}</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10">
            {t('pricing.subheading')}
          </p>

          {/* Interval Toggle */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex rounded-full bg-surface-container-low border border-outline-variant p-1">
              <button
                onClick={() => setInterval('month')}
                className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors min-h-[44px] ${
                  interval === 'month'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('common.monthly')}
              </button>
              <button
                onClick={() => setInterval('year')}
                className={`relative z-10 rounded-full px-5 py-1.5 text-sm font-medium transition-colors min-h-[44px] ${
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
        </header>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {TIER_KEYS.map((tierKey) => {
            const meta = TIER_META[tierKey]
            const price = TIER_PRICES[meta.key]
            const displayPrice = interval === 'month' ? price.month : price.year
            const annualTotal = TIER_ANNUAL_TOTAL[meta.key]
            const tierName = t(`landing.tiers.${tierKey}.name`)
            const tierDescription = t(`landing.tiers.${tierKey}.description`)
            const tierFeatures = t(`landing.tiers.${tierKey}.features`, { returnObjects: true }) as string[]

            return (
              <div
                key={meta.key}
                className={`p-8 rounded-md flex flex-col h-full relative transition-colors ${
                  meta.highlighted
                    ? 'bg-surface-container border-2 border-primary'
                    : 'bg-surface-container-low border border-outline-variant hover:bg-surface-container'
                }`}
              >
                {meta.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[0.625rem] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                    {t('landing.pricing.mostPopular')}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${meta.highlighted ? 'text-primary-light' : 'text-on-surface-variant'}`}>
                    {tierName}
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
                  <p className="text-on-surface-variant text-sm mt-3">{tierDescription}</p>
                </div>

                <ul className="space-y-3 mb-10 flex-grow">
                  {tierFeatures.map((feature) => (
                    <li key={feature} className="flex gap-3 items-start text-sm">
                      <Check size={16} strokeWidth={1.5} className="text-tertiary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={meta.highlighted ? 'primary' : 'secondary'}
                  className="w-full"
                  loading={loadingTier === meta.key}
                  rightIcon={ArrowRight}
                  onClick={() => handleSelectTier(meta.key)}
                >
                  {t('common.getStarted')}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <section className="mb-32">
          <h2 className="text-2xl font-semibold mb-8 text-center">{t('pricing.featureComparison')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-4 sm:px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest sticky left-0 bg-surface-container-low z-10 min-w-[140px]">{t('landing.pricing.feature')}</th>
                  <th className="py-4 px-4 sm:px-6 text-[0.625rem] font-semibold text-center w-28 sm:w-40 uppercase tracking-widest">{t('landing.tiers.scout.name')}</th>
                  <th className="py-4 px-4 sm:px-6 text-[0.625rem] font-semibold text-center w-28 sm:w-40 bg-surface-container/50 uppercase tracking-widest">{t('landing.tiers.pro.name')}</th>
                  <th className="py-4 px-4 sm:px-6 text-[0.625rem] font-semibold text-center w-28 sm:w-40 uppercase tracking-widest">{t('landing.tiers.club.name')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.featureKey}>
                    <td className="py-3 px-4 sm:px-6 text-sm sticky left-0 bg-surface-container-low z-10">{t(row.featureKey)}</td>
                    <ComparisonCell value={row.scout} />
                    <ComparisonCell value={row.pro} highlighted />
                    <ComparisonCell value={row.club} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl font-semibold mb-10 text-center">{t('pricing.faqHeading')}</h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="bg-surface-container-low border border-outline-variant p-6 rounded-md">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-surface-container border border-outline-variant p-6 sm:p-10 rounded-md text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Badge variant="tertiary">{t('pricing.guaranteed')}</Badge>
                <span className="text-sm font-semibold">{t('pricing.guarantee')}</span>
              </div>
              <p className="text-on-surface-variant text-sm">
                {t('pricing.contactSub')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto min-h-[44px]" onClick={() => window.location.href = 'mailto:hello@predivo.ch'}>{t('pricing.contactSupport')}</Button>
              <Button className="w-full sm:w-auto min-h-[44px]" onClick={() => navigate('/signup')} rightIcon={ArrowRight}>{t('common.startFreeTrial')}</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/20 bg-surface text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-12 max-w-7xl mx-auto gap-4">
          <Logo size="sm" linkTo="/" />
          <div className="text-on-surface-variant text-xs">{t('common.copyright')}</div>
          <div className="flex gap-6">
            <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">{t('common.terms')}</Link>
            <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors">{t('common.privacy')}</Link>
            <Link to="/imprint" className="text-on-surface-variant hover:text-on-surface transition-colors">{t('common.imprint')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ComparisonCell({ value, highlighted }: { value: string | boolean; highlighted?: boolean }) {
  const { t } = useTranslation()
  const bgClass = highlighted ? 'bg-surface-container/50' : ''

  if (typeof value === 'boolean') {
    return (
      <td className={`py-3 px-4 sm:px-6 text-center ${bgClass}`}>
        {value ? (
          <Check size={16} strokeWidth={1.5} className="text-tertiary inline-block" />
        ) : (
          <X size={16} strokeWidth={1.5} className="text-on-surface-variant/30 inline-block" />
        )}
      </td>
    )
  }

  // Values starting with 'pricingValues.' are translation keys; plain numbers stay as-is
  const display = value.startsWith('pricingValues.') ? t(value) : value
  return (
    <td className={`py-3 px-4 sm:px-6 text-center font-mono text-xs ${bgClass}`}>{display}</td>
  )
}
