import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Check, X, ArrowRight, Shield } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PublicNav } from '../../components/layout/PublicNav'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { FaqItem } from '../../components/shared/FaqItem'
import { TIER_PRICES, TIER_ANNUAL_TOTAL, createCheckoutSession, type BillingInterval } from '../../lib/stripe'
import { redirectToStripeUrl } from '../../lib/stripeRedirect'
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
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'
  const [interval, setInterval] = useState<BillingInterval>('year')
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null)
  const navigate = useLocalizedNavigate()

  const faqItems = t('landing.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>

  async function handleSelectTier(tier: SubscriptionTier) {
    setLoadingTier(tier)
    try {
      const url = await createCheckoutSession(tier, interval)
      redirectToStripeUrl(url, `${window.location.origin}/pricing`)
    } catch (err) {
      console.error('Checkout session failed:', err)
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
        <link rel="canonical" href={`https://scoutcopilot.com/${lang}/pricing`} />
        <link rel="alternate" hrefLang="en" href="https://scoutcopilot.com/en/pricing" />
        <link rel="alternate" hrefLang="de" href="https://scoutcopilot.com/de/pricing" />
        <link rel="alternate" hrefLang="x-default" href="https://scoutcopilot.com/en/pricing" />
        <meta property="og:title" content={t('pricing.meta.title')} />
        <meta property="og:description" content={t('pricing.meta.description')} />
        <meta property="og:url" content={`https://scoutcopilot.com/${lang}/pricing`} />
        <meta property="og:locale" content={lang === 'de' ? 'de_DE' : 'en_US'} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://scoutcopilot.com/og-image.png" />
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

      <PublicNav activeItem="pricing" />

      <main>
        {/* Header */}
        <section className="pt-32 pb-16 px-6 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-4">{t('pricing.heading')}</h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto mb-10">
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
          </div>
        </section>

        {/* Tier Cards */}
        <section className="px-6 md:px-8 pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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
                  className={`p-4 sm:p-8 rounded-md flex flex-col h-full relative ${
                    meta.highlighted
                      ? 'bg-surface-container border-2 border-primary'
                      : 'bg-surface-container-low border border-outline-variant'
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
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">{t('pricing.featureComparison')}</h2>
            <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="py-4 px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest sticky left-0 bg-surface-container-low z-10">{t('landing.pricing.feature')}</th>
                    <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">{t('landing.tiers.scout.name')}</th>
                    <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 bg-surface-container/50 uppercase tracking-widest">{t('landing.tiers.pro.name')}</th>
                    <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">{t('landing.tiers.club.name')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.featureKey}>
                      <td className="py-3 px-6 text-sm sticky left-0 bg-surface-container-low z-10">{t(row.featureKey)}</td>
                      <ComparisonCell value={row.scout} />
                      <ComparisonCell value={row.pro} highlighted />
                      <ComparisonCell value={row.club} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-container-low to-transparent" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 md:px-8 bg-surface-container-lowest">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">{t('pricing.faqHeading')}</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 md:px-8">
          <div className="max-w-3xl mx-auto bg-surface-container border border-outline-variant rounded-lg p-6 sm:p-10 text-center">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4">
              {t('pricing.guarantee')}
            </h2>
            <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
              {t('pricing.contactSub')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button variant="secondary" onClick={() => window.location.href = 'mailto:hello@predivo.ch'}>{t('pricing.contactSupport')}</Button>
              <Button size="lg" rightIcon={ArrowRight} onClick={() => navigate('/signup')}>
                {t('common.startFreeTrial')}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield size={14} strokeWidth={1.5} className="text-tertiary" />
              <span className="text-xs text-on-surface-variant">{t('pricing.guaranteed')}</span>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function ComparisonCell({ value, highlighted }: { value: string | boolean; highlighted?: boolean }) {
  const { t } = useTranslation()
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

  // Values starting with 'pricingValues.' are translation keys; plain numbers stay as-is
  const display = value.startsWith('pricingValues.') ? t(value) : value
  return (
    <td className={`py-3 px-6 text-center font-mono text-xs ${bgClass}`}>{display}</td>
  )
}
