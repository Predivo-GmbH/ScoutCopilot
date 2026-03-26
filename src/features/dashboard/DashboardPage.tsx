import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  Eye,
  Activity,
  Clock,
  Bell,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../features/auth/useAuth'
import { useDashboardStats, useRecentSearches, useWatchlistAlerts } from './hooks/useDashboardData'
import { formatNumber } from '../../lib/utils'

const STAT_ICONS = [Search, FileText, Eye, Activity]
const STAT_COLORS = ['primary', 'secondary', 'tertiary', 'primary'] as const

export function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: searches, isLoading: searchesLoading } = useRecentSearches()
  const { data: alerts, isLoading: alertsLoading } = useWatchlistAlerts()

  const greeting = getGreeting()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Scout'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            {greeting}, {firstName}.
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Here's your scouting overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md border border-outline-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[0.6875rem] font-data font-medium uppercase tracking-widest text-on-surface-variant">All Systems Operational</span>
        </div>
      </div>

      {/* Stat Cards — with trend indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.items.map((item, i) => {
          const Icon = STAT_ICONS[i]
          const color = STAT_COLORS[i]
          const isPositive = item.change >= 0
          return (
            <div
              key={item.label}
              className="bg-surface-container-low p-5 rounded-md border border-outline-variant hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center bg-${color}/10 border border-${color}/20`}>
                  <Icon size={16} strokeWidth={1.5} className={`text-${color}`} />
                </div>
                <div className={`flex items-center gap-1 text-[0.625rem] font-data font-medium ${isPositive ? 'text-secondary' : 'text-error'}`}>
                  {isPositive ? <TrendingUp size={12} strokeWidth={1.5} /> : <TrendingDown size={12} strokeWidth={1.5} />}
                  {isPositive ? '+' : ''}{item.change}%
                </div>
              </div>
              <span className="text-2xl font-semibold font-data text-on-surface">
                {formatNumber(item.value)}
              </span>
              <p className="text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          )
        })}
        {statsLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container-low p-5 rounded-md border border-outline-variant">
            <div className="h-9 w-9 bg-surface-container rounded-md animate-pulse mb-3" />
            <div className="h-7 w-20 bg-surface-container rounded-md animate-pulse mb-1" />
            <div className="h-3 w-24 bg-surface-container rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Searches */}
        <div className="lg:col-span-3">
          <Card
            header={
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <Clock size={16} strokeWidth={1.5} className="text-primary" />
                  Recent Searches
                </h3>
                <button
                  onClick={() => navigate('/search')}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={12} strokeWidth={1.5} />
                </button>
              </div>
            }
          >
            {searchesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-container rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="-m-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container">
                      <th className="px-6 py-3 text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest">Query</th>
                      <th className="px-6 py-3 text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest text-center">Results</th>
                      <th className="px-6 py-3 text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest">Date</th>
                      <th className="px-6 py-3 text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searches?.slice(0, 7).map((search, i) => (
                      <tr
                        key={search.id}
                        className={`${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'} hover:bg-surface-container transition-colors cursor-pointer`}
                        onClick={() => navigate('/search')}
                      >
                        <td className="px-6 py-3 text-xs font-medium text-on-surface max-w-[300px] truncate">
                          "{search.query}"
                        </td>
                        <td className="px-6 py-3 text-xs font-data text-center text-on-surface-variant">
                          {formatNumber(search.resultCount)}
                        </td>
                        <td className="px-6 py-3 text-xs font-data text-on-surface-variant">
                          {new Date(search.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={search.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Watchlist Alerts */}
        <div className="lg:col-span-2">
          <Card
            header={
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <Bell size={16} strokeWidth={1.5} className="text-tertiary" />
                  Watchlist Alerts
                </h3>
                <span className="text-xs font-data font-medium text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-sm border border-tertiary/20">
                  {alerts?.length ?? 0}
                </span>
              </div>
            }
          >
            {alertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-surface-container rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 -m-6 p-4">
                {alerts?.map((alert) => (
                  <div
                    key={alert.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/watchlists') }}
                    className="p-3 rounded-md bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-3 border border-outline-variant cursor-pointer"
                    onClick={() => navigate('/watchlists')}
                  >
                    <div className="w-10 h-10 rounded-md bg-surface-container-highest flex items-center justify-center text-xs font-semibold text-on-surface-variant shrink-0">
                      {alert.playerName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-on-surface">{alert.playerName}</h4>
                        <span className="text-[0.625rem] font-data text-on-surface-variant shrink-0">{alert.timeAgo}</span>
                      </div>
                      <p className="text-[0.625rem] text-on-surface-variant">
                        {alert.club} &middot;{' '}
                        <span className={alert.changeType === 'positive' ? 'text-secondary' : alert.changeType === 'warning' ? 'text-tertiary' : 'text-on-surface-variant'}>
                          {alert.change}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-[0.75rem] font-medium text-on-surface-variant uppercase tracking-widest">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="New Player Search"
            description="Execute complex queries using natural language or metric filters."
            icon={Search}
            color="primary"
            onClick={() => navigate('/search')}
          />
          <QuickAction
            title="Generate Report"
            description="Synthesize data into professional scouting reports in seconds."
            icon={FileText}
            color="secondary"
            onClick={() => navigate('/report')}
          />
          <QuickAction
            title="Compare Players"
            description="Visual percentile overlays and head-to-head metric analysis."
            icon={TrendingUp}
            color="tertiary"
            onClick={() => navigate('/compare')}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// ─── Sub-components ────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles = {
    complete: 'bg-secondary/10 text-secondary border-secondary/20',
    processing: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    failed: 'bg-error/10 text-error border-error/20',
  }
  const style = styles[status as keyof typeof styles] ?? styles.complete
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase ${style} border`}>
      {status}
    </span>
  )
}

function QuickAction({ title, description, icon: Icon, color, onClick }: {
  title: string
  description: string
  icon: typeof Search
  color: 'primary' | 'secondary' | 'tertiary'
  onClick: () => void
}) {
  const iconBg = {
    primary: 'bg-primary/10 border-primary/20',
    secondary: 'bg-secondary/10 border-secondary/20',
    tertiary: 'bg-tertiary/10 border-tertiary/20',
  }
  const iconColor = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onClick={onClick}
      className="bg-surface-container p-5 rounded-md border border-outline-variant hover:border-primary/30 hover:bg-surface-container-high transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${iconBg[color]}`}>
          <Icon size={20} strokeWidth={1.5} className={iconColor[color]} />
        </div>
        <ArrowUpRight size={16} strokeWidth={1.5} className="text-on-surface-variant/30 group-hover:text-primary transition-colors" />
      </div>
      <h4 className="text-sm font-semibold text-on-surface mb-1">{title}</h4>
      <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  )
}
