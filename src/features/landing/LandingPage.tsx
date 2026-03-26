import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
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
import { Badge } from '../../components/ui/Badge'
import { Logo } from '../../components/shared/Logo'
import { ThemeToggle } from '../../components/shared/ThemeToggle'
import {
  TIER_PRICES,
  TIER_ANNUAL_TOTAL,
  type BillingInterval,
} from '../../lib/stripe'
import type { SubscriptionTier } from '../../types/database'

/* ─── Data ──────────────────────────────────────────────────────── */

const STATS = [
  {
    value: '12+',
    unit: 'Hours',
    label: 'Manual Efficiency Gap',
    description: 'Time spent per recruitment shortlist manually cleaning and cross-referencing raw spreadsheets.',
  },
  {
    value: '4,000+',
    unit: '',
    label: 'Invisible Data Points',
    description: 'Metrics per player ignored by standard filters, including tactical positioning and high-intensity triggers.',
  },
  {
    value: '83%',
    unit: '',
    label: 'Underutilized Subscriptions',
    description: 'Of Wyscout subscribers only use basic search features, missing 90% of the platform\'s analytical value.',
  },
]

const STEPS = [
  {
    title: 'Connect API',
    description: 'Securely bind your Wyscout or StatsBomb API keys to our ingestion engine.',
  },
  {
    title: 'Ask Questions',
    description: 'Input tactical requirements in plain English or use our institutional presets.',
  },
  {
    title: 'Get Ranked Results',
    description: 'Receive AI-weighted shortlists that match your specific tactical philosophy.',
  },
  {
    title: 'Export Reports',
    description: 'One-click PDF or CSV exports formatted for Director and Coaching staff review.',
  },
]

const ROI_ROWS = [
  { task: 'Build a position-specific shortlist', manual: '3-5 hours', copilot: '2-5 minutes' },
  { task: 'Generate a scouting report', manual: '2-4 hours', copilot: '1-2 minutes' },
  { task: 'Compare 5 candidates', manual: '4-8 hours', copilot: '5-10 minutes' },
  { task: 'Pre-window longlist (50+ players)', manual: '2-3 weeks', copilot: '1-2 hours' },
]

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
      'PDF export (branded)',
      '3 user seats',
      'Priority support (24hr)',
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
      'Bulk operations',
      'Custom metric definitions',
      'Dedicated onboarding (1hr)',
      'Dedicated support channel',
    ],
  },
]

const COMPARISON_ROWS: Array<{
  feature: string
  scout: string | boolean
  pro: string | boolean
  club: string | boolean
}> = [
  { feature: 'Data source connections', scout: '1', pro: '2', club: '2 + custom' },
  { feature: 'AI scouting reports', scout: '10/mo', pro: 'Unlimited', club: 'Unlimited' },
  { feature: 'Shortlists', scout: '25/mo', pro: 'Unlimited', club: 'Unlimited' },
  { feature: 'Player comparison', scout: '3 players', pro: '10 players', club: '10 players' },
  { feature: 'League scope', scout: '1 league', pro: 'All leagues', club: 'All leagues' },
  { feature: 'Tactical fit analysis', scout: false, pro: true, club: true },
  { feature: 'PDF export (branded)', scout: false, pro: true, club: true },
  { feature: 'User seats', scout: '1', pro: '3', club: '10+' },
]

const FAQ_ITEMS = [
  {
    question: 'How can AI match an experienced scout?',
    answer:
      "It doesn't replace your scouts — it eliminates the 80% of their work that isn't judgment. Your scouts spend most of their time filtering databases and building spreadsheets. ScoutCopilot handles that pre-screening phase in seconds so your scouts apply their judgment to a pre-filtered shortlist instead of grinding through 500 players.",
  },
  {
    question: 'We already have Wyscout — why pay more?',
    answer:
      "You're paying thousands per year for data access but querying it through manual filters and Excel exports. ScoutCopilot is the AI layer that turns your existing data investment into a competitive advantage — natural language queries, tactical fit analysis, and development trajectory predictions that no current Wyscout interface provides.",
  },
  {
    question: 'What if the AI makes mistakes?',
    answer:
      "Every recommendation shows the underlying data and ranking rationale — no black box. The tool is an assistant, not an authority: it generates shortlists, your team makes decisions. At the Club tier, custom models learn your club's specific philosophy over time.",
  },
  {
    question: 'Is our data secure?',
    answer:
      'Your API credentials are stored in Supabase Vault with AES-256-GCM encryption. All API calls execute server-side using your credentials. We never store or cache player data beyond your active session. Your data never leaves your account.',
  },
  {
    question: 'Can we try before committing?',
    answer:
      'Yes. Start with a 14-day free trial on any plan — no credit card required. Plus every paid plan comes with a 30-day money-back guarantee, no questions asked.',
  },
]

/* ─── SVG Visuals ───────────────────────────────────────────────── */

function RadarChartSVG() {
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
      {['Aerial', 'Passing', 'Pace', 'Defending', 'Shooting', 'Dribbling'].map((label, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
        const x = 150 + 140 * Math.cos(angle)
        const y = 150 + 140 * Math.sin(angle)
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-on-surface-variant)"
            fontSize="11"
            fontFamily="var(--font-body)"
          >
            {label}
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

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Helmet>
        <title>ScoutCopilot — AI Football Scouting</title>
        <meta name="description" content="AI-powered football scouting assistant. Get ranked player shortlists, scouting reports, and head-to-head comparisons in seconds — from your Wyscout or StatsBomb data." />
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
              Features
            </button>
            <button onClick={() => scrollTo('pricing')} className="text-on-surface-variant hover:text-on-surface transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollTo('faq')} className="text-on-surface-variant hover:text-on-surface transition-colors">
              FAQ
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle className="p-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-on-surface-variant"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[64px] z-20" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-surface-container-low border-b border-outline-variant/40 px-6 pb-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => scrollTo('features')} className="text-sm text-on-surface-variant text-left py-2">Features</button>
              <button onClick={() => scrollTo('pricing')} className="text-sm text-on-surface-variant text-left py-2">Pricing</button>
              <button onClick={() => scrollTo('faq')} className="text-sm text-on-surface-variant text-left py-2">FAQ</button>
              <div className="flex items-center gap-3 pt-2">
                <ThemeToggle className="p-2" />
                <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>Log In</Button>
                <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
      </header>

      <main>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h1 className="text-[2.25rem] md:text-[3rem] font-bold leading-[1.1] tracking-[-0.02em] mb-6">
              Stop drowning in spreadsheets. Get AI-ranked shortlists in{' '}
              <span className="text-primary-light">30&nbsp;seconds</span>.
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              An AI assistant that connects to your Wyscout or StatsBomb API and turns
              natural language questions into ranked player shortlists, comparison reports,
              and scouting briefs — in seconds instead of hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" rightIcon={ArrowRight} onClick={() => navigate('/signup')}>
                Start Free Trial
              </Button>
              <Button variant="secondary" size="lg" onClick={() => scrollTo('pricing')}>
                See Pricing
              </Button>
            </div>
            <p className="text-on-surface-variant text-xs mt-4">
              No credit card required. 14-day free trial.
            </p>
          </div>

          <div className="flex justify-center">
            <RadarChartSVG />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section className="border-y border-outline-variant/30 py-12 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-outline-variant/30">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center px-6">
              <p className="font-mono text-3xl md:text-4xl font-bold text-tertiary-light mb-1">
                {stat.value}{stat.unit && <span className="text-2xl md:text-3xl uppercase"> {stat.unit}</span>}
              </p>
              <p className="text-[0.625rem] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                {stat.label}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tactical Capabilities ─────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">
            Mission-critical tools for modern recruitment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Natural Language Search */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">Natural Language Search</h3>
                <Search size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Query your data using tactical concepts instead of rigid spreadsheet filters.
              </p>
              {/* Mock search input */}
              <div className="bg-surface-container border border-outline-variant rounded-md p-3 flex items-center gap-3">
                <Search size={14} strokeWidth={1.5} className="text-on-surface-variant/50 shrink-0" />
                <span className="font-mono text-xs text-on-surface-variant">
                  Left-footed CB under 24, top 10% aerial win rate in Serie A
                </span>
                <div className="w-0.5 h-4 bg-primary animate-pulse ml-auto shrink-0" />
              </div>
            </div>

            {/* AI Scouting Reports */}
            <div className="bg-surface-container-low border border-outline-variant rounded-md p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest">AI Scouting Reports</h3>
                <FileText size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Automated tactical analysis that reads like a human scout's eye with 0% bias.
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
                <h3 className="text-sm font-bold uppercase tracking-widest">Player Comparison</h3>
                <ArrowLeftRight size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Side-by-side performance delta analysis with league-weighted normalization.
              </p>
              {/* Mock comparison table */}
              <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="py-2 px-3 text-left text-on-surface-variant font-medium">PLAYER A</th>
                      <th className="py-2 px-3 text-left text-primary-light font-medium">PLAYER B</th>
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
                <h3 className="text-sm font-bold uppercase tracking-widest">Watchlist Alerts</h3>
                <Bell size={20} strokeWidth={1.5} className="text-primary-light shrink-0" />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Real-time intelligence on contract status and market movement signals.
              </p>
              {/* Mock alert rows */}
              <div className="space-y-2">
                <div className="bg-surface-container border border-outline-variant rounded-md px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-sm bg-error shrink-0" />
                  <span className="font-mono text-xs text-on-surface-variant">
                    ALERT: L. Martínez (Inter) Market Value Spike +12%
                  </span>
                </div>
                <div className="bg-surface-container border border-outline-variant rounded-md px-3 py-2.5 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                  <span className="font-mono text-xs text-on-surface-variant">
                    SIGNAL: J. Neves (Benfica) 100th percentile Progressive Carries
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-16 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-3xl font-bold text-on-surface/20">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-outline-variant/50" />
                  )}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ──────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4 text-center">
            A junior analyst costs <span className="font-mono">$50K</span>/year.{' '}
            ScoutCopilot starts at <span className="font-mono">$X</span>/month.
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-12">
            That's <span className="font-mono font-bold text-secondary-light">27-52 hours</span> saved per week,
            returned to your scouting staff for what actually matters.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest">
                    Task
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center uppercase tracking-widest">
                    Manual
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center uppercase tracking-widest text-secondary-light">
                    ScoutCopilot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {ROI_ROWS.map((r) => (
                  <tr key={r.task}>
                    <td className="py-3 px-6 text-sm">{r.task}</td>
                    <td className="py-3 px-6 text-center font-mono text-xs text-on-surface-variant">
                      {r.manual}
                    </td>
                    <td className="py-3 px-6 text-center font-mono text-xs text-secondary-light">
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
      <section id="pricing" className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4 text-center">
            Simple, transparent pricing
          </h2>
          <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-10">
            Less than 1% of a junior analyst's salary. 100x faster scouting.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${interval === 'month' ? 'text-on-surface' : 'text-on-surface-variant'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setInterval(interval === 'month' ? 'year' : 'month')}
              className={`relative w-12 h-6 rounded-md border border-outline-variant p-0.5 transition-colors ${interval === 'year' ? 'bg-primary' : 'bg-surface-container'}`}
              aria-label="Toggle billing interval"
            >
              <div
                className="w-5 h-5 bg-inverse-surface rounded-sm transition-transform"
                style={{ transform: interval === 'year' ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${interval === 'year' ? 'text-on-surface' : 'text-on-surface-variant'}`}
              >
                Annual
              </span>
              <Badge variant="tertiary">Save 17%</Badge>
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {TIERS.map((tier) => {
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
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[0.625rem] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                      Most Popular
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
                    rightIcon={ArrowRight}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-surface-container-low rounded-md overflow-hidden border border-outline-variant">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-on-surface-variant uppercase tracking-widest">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">
                    Scout
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 bg-surface-container/50 uppercase tracking-widest">
                    Pro
                  </th>
                  <th className="py-4 px-6 text-[0.625rem] font-semibold text-center w-28 md:w-40 uppercase tracking-widest">
                    Club
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
      <section id="faq" className="py-24 px-6 md:px-8 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-3xl mx-auto bg-surface-container border border-outline-variant rounded-lg p-10 text-center">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-bold tracking-[-0.01em] mb-4">
            Ready to scout smarter?
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
            Your competitors are already using AI. Get your scouting AI operational before
            the next transfer window opens.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Button size="lg" rightIcon={ArrowRight} onClick={() => navigate('/signup')}>
              Start Free Trial
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield size={14} strokeWidth={1.5} className="text-tertiary" />
            <span className="text-xs text-on-surface-variant">30-day money-back guarantee</span>
          </div>
        </div>
      </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-outline-variant/20 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Logo size="sm" linkTo="/" />
            <p className="text-on-surface-variant text-xs mt-1">Built for professional football scouting</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
            <button onClick={() => scrollTo('features')} className="hover:text-on-surface transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-on-surface transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-on-surface transition-colors">
              FAQ
            </button>
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-on-surface transition-colors">Privacy</Link>
            <Link to="/imprint" className="hover:text-on-surface transition-colors">Imprint</Link>
          </div>
          <p className="text-on-surface-variant text-xs">&copy; 2026 Predivo GmbH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Sub-components ────────────────────────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-semibold text-sm pr-4">{question}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-on-surface-variant transition-transform duration-[150ms] ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6">
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
