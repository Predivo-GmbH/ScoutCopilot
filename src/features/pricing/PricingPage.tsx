import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { Check, X, ArrowRight } from 'lucide-react'
import { Logo } from '../../components/shared/Logo'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { TIER_PRICES, TIER_ANNUAL_TOTAL, createCheckoutSession, type BillingInterval } from '../../lib/stripe'
import type { SubscriptionTier } from '../../types/database'

const TIERS: Array<{
  key: SubscriptionTier
  name: string
  description: string
  highlighted: boolean
  features: string[]
}> = [
  {
    key: 'scout',
    name: 'Scout',
    description: 'For individual scouts and small agencies',
    highlighted: false,
    features: [
      '1 data source connection',
      'Unlimited NL player search',
      '10 AI scouting reports/mo',
      '25 shortlists/mo',
      'Compare up to 3 players',
      '1 league scope',
      '1 user seat',
      'Email support (48hr)',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    description: 'For professional scouting departments',
    highlighted: true,
    features: [
      '2 data sources (Wyscout + StatsBomb)',
      'Unlimited NL player search',
      'Unlimited AI scouting reports',
      'Unlimited shortlists',
      'Compare up to 10 players',
      'All leagues',
      'Tactical fit analysis',
      'Development trajectory',
      'PDF export (branded)',
      'Watchlists',
      '3 user seats',
      'Priority email support (24hr)',
    ],
  },
  {
    key: 'club',
    name: 'Club',
    description: 'For clubs with larger scouting departments',
    highlighted: false,
    features: [
      'Everything in Pro, plus:',
      '10 user seats (expandable)',
      'Custom AI models',
      'Scout Copilot API access',
      'Transfer value estimation',
      'Bulk operations',
      'Custom metric definitions',
      'Dedicated onboarding (1hr)',
      'Dedicated Slack/Teams channel',
      '24-month data retention',
    ],
  },
]

const COMPARISON_ROWS: Array<{
  feature: string
  scout: string | boolean
  pro: string | boolean
  club: string | boolean
}> = [
  { feature: 'Data source connections', scout: '1', pro: '2 (Wyscout + StatsBomb)', club: '2 + custom' },
  { feature: 'NL player search', scout: 'Unlimited', pro: 'Unlimited', club: 'Unlimited' },
  { feature: 'AI scouting reports', scout: '10/mo', pro: 'Unlimited', club: 'Unlimited' },
  { feature: 'Shortlists', scout: '25/mo', pro: 'Unlimited', club: 'Unlimited' },
  { feature: 'Player comparison', scout: '3 players', pro: '10 players', club: '10 players' },
  { feature: 'League scope', scout: '1 league', pro: 'All leagues', club: 'All leagues' },
  { feature: 'Tactical fit analysis', scout: false, pro: true, club: true },
  { feature: 'Development trajectory', scout: false, pro: true, club: true },
  { feature: 'PDF export (branded)', scout: false, pro: true, club: true },
  { feature: 'Watchlists', scout: false, pro: true, club: true },
  { feature: 'Custom AI models', scout: false, pro: false, club: true },
  { feature: 'Scout Copilot API', scout: false, pro: false, club: true },
  { feature: 'Bulk operations', scout: false, pro: false, club: true },
  { feature: 'Custom metrics', scout: false, pro: false, club: true },
  { feature: 'User seats', scout: '1', pro: '3', club: '10+' },
  { feature: 'Support', scout: 'Email (48hr)', pro: 'Email (24hr)', club: 'Dedicated channel' },
  { feature: 'Data retention', scout: '3 months', pro: '6 months', club: '24 months' },
]

const FAQ_ITEMS = [
  {
    question: 'How can an AI tool match the judgment of an experienced scout?',
    answer: 'It doesn\'t replace your scouts — it eliminates the 80% of their work that isn\'t judgment. Your scouts spend most of their time filtering databases, cross-referencing stats, and building spreadsheets. Scout Copilot handles that entire pre-screening phase in seconds. Your scouts then apply their judgment to a pre-filtered shortlist instead of grinding through 500 players manually.',
  },
  {
    question: 'We already have Wyscout/StatsBomb — why pay for another tool?',
    answer: 'You\'re paying thousands per year for data access, but querying it through manual filters, exporting to Excel, and building comparisons by hand. Scout Copilot is the AI layer that turns your existing data investment into a competitive advantage. Natural language queries, tactical fit analysis, and development trajectory predictions are capabilities no current Wyscout or StatsBomb interface provides.',
  },
  {
    question: 'What if the AI makes mistakes or gives bad recommendations?',
    answer: 'Three safeguards: (1) Every recommendation shows the underlying data and why each player ranked where they did — no black box. (2) The tool is an assistant, not an authority. It generates shortlists; your team makes decisions. (3) At the Club tier, custom models learn your club\'s specific philosophy over time.',
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing cycle. No lock-in, no penalties.',
  },
]

export function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('year')
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null)
  const navigate = useNavigate()

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
        <title>Pricing — ScoutCopilot</title>
        <meta name="description" content="Simple, transparent pricing for AI football scouting. Scout, Pro, and Club tiers. 14-day free trial, no credit card required." />
      </Helmet>
      {/* Nav */}
      <nav className="w-full sticky top-0 z-30 bg-surface border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Logo size="md" linkTo="/" />
            <div className="hidden md:flex gap-6 text-sm">
              <Link to="/#features" className="text-on-surface-variant hover:text-on-surface transition-colors">Features</Link>
              <span className="text-on-surface border-b-2 border-primary pb-1">Pricing</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Start Free Trial</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10">
            Less than 1% of a junior analyst's salary. 100x faster scouting.
          </p>

          {/* Interval Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${interval === 'month' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Monthly
            </span>
            <button
              onClick={() => setInterval(interval === 'month' ? 'year' : 'month')}
              className={`relative w-12 h-6 rounded-md border border-outline-variant p-0.5 transition-colors ${interval === 'year' ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <div
                className="w-5 h-5 bg-inverse-surface rounded-sm transition-transform"
                style={{ transform: interval === 'year' ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${interval === 'year' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                Annual
              </span>
              <Badge variant="tertiary">Save 17%</Badge>
            </div>
          </div>
        </header>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {TIERS.map((tier) => {
            const price = TIER_PRICES[tier.key]
            const displayPrice = interval === 'month' ? price.month : price.year
            const annualTotal = TIER_ANNUAL_TOTAL[tier.key]

            return (
              <div
                key={tier.key}
                className={`p-8 rounded-md flex flex-col h-full relative transition-colors ${
                  tier.highlighted
                    ? 'bg-surface-container border-2 border-primary'
                    : 'bg-surface-container-low border border-outline-variant hover:bg-surface-container'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[0.625rem] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${tier.highlighted ? 'text-primary-light' : 'text-on-surface-variant'}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold">${displayPrice}</span>
                    <span className="text-on-surface-variant text-sm">/mo</span>
                  </div>
                  {interval === 'year' && (
                    <p className="text-on-surface-variant text-xs mt-1">
                      ${annualTotal}/yr billed annually
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
                  loading={loadingTier === tier.key}
                  rightIcon={ArrowRight}
                  onClick={() => handleSelectTier(tier.key)}
                >
                  Get Started
                </Button>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <section className="mb-32">
          <h2 className="text-2xl font-semibold mb-8 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest">Feature</th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-40 uppercase tracking-widest">Scout</th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-40 bg-surface-container/50 uppercase tracking-widest">Pro</th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-40 uppercase tracking-widest">Club</th>
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
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl font-semibold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="bg-surface-container-low border border-outline-variant p-6 rounded-md">
                <h4 className="font-semibold mb-2">{item.question}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-surface-container border border-outline-variant p-10 rounded-md text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="tertiary">GUARANTEED</Badge>
                <span className="text-sm font-semibold">30-day money-back guarantee</span>
              </div>
              <p className="text-on-surface-variant text-sm">
                Questions? We are here to help your scouting department get started.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => window.location.href = 'mailto:hello@predivo.ch'}>Contact Support</Button>
              <Button onClick={() => navigate('/signup')} rightIcon={ArrowRight}>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/20 bg-surface text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-4">
          <Logo size="sm" linkTo="/" />
          <div className="text-on-surface-variant text-xs">&copy; 2026 Predivo GmbH. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors">Terms</Link>
            <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors">Privacy</Link>
            <Link to="/imprint" className="text-on-surface-variant hover:text-on-surface transition-colors">Imprint</Link>
          </div>
        </div>
      </footer>
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
