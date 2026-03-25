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
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useDashboardStats, useRecentSearches, useWatchlistAlerts } from './hooks/useDashboardData'
import { formatNumber } from '../../lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: searches, isLoading: searchesLoading } = useRecentSearches()
  const { data: alerts, isLoading: alertsLoading } = useWatchlistAlerts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Good morning. Here is your scouting overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md border border-outline-variant">
          <span className="w-2 h-2 rounded-md bg-secondary" />
          <span className="text-[0.6875rem] font-data font-medium uppercase tracking-widest text-on-surface-variant">System Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Searches"
          value={stats?.totalSearches}
          icon={Search}
          loading={statsLoading}
        />
        <StatCard
          label="Reports Generated"
          value={stats?.reportsGenerated}
          icon={FileText}
          loading={statsLoading}
        />
        <StatCard
          label="Players Tracked"
          value={stats?.playersTracked}
          icon={Eye}
          loading={statsLoading}
        />
        <StatCard
          label="API Calls This Month"
          value={stats?.apiCallsThisMonth}
          icon={Activity}
          loading={statsLoading}
        />
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
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View All
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
                        className={`${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'} hover:bg-surface-container transition-colors`}
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
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/search') }}
                    className="p-3 rounded-md bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-3 border border-outline-variant cursor-pointer"
                    onClick={() => navigate('/search')}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

// ─── Sub-components ────────────────────────────────────────

function StatCard({ label, value, icon: Icon, loading }: {
  label: string
  value?: number
  icon: typeof Search
  loading: boolean
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-md border border-outline-variant hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} strokeWidth={1.5} className="text-on-surface-variant" />
        <p className="text-[0.75rem] font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-surface-container rounded-md animate-pulse" />
      ) : (
        <span className="text-3xl font-semibold font-data text-on-surface">
          {formatNumber(value ?? 0)}
        </span>
      )}
    </div>
  )
}

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
      className="bg-surface-container p-6 rounded-md border border-outline-variant hover:border-primary/30 hover:bg-surface-container-high transition-all cursor-pointer group"
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
