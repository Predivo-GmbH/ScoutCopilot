import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  Eye,
  Activity,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  GitCompareArrows,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { useDashboardStats, useRecentSearches, useWatchlistAlerts } from './hooks/useDashboardData'
import { formatNumber } from '../../lib/utils'

const STAT_ICONS = [Search, FileText, Eye, Activity]

export function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: searches, isLoading: searchesLoading } = useRecentSearches()
  const { data: alerts, isLoading: alertsLoading } = useWatchlistAlerts()

  const greeting = getGreeting()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Scout'

  return (
    <div className="p-6 md:p-8 space-y-8">
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
          <span className="text-[0.625rem] font-data font-medium uppercase tracking-widest text-on-surface-variant">All Systems Operational</span>
        </div>
      </div>

      {/* Metric Cards — icon top-right, value bottom-left (Stitch layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats?.items.map((item, i) => {
          const Icon = STAT_ICONS[i]
          const isPositive = item.change >= 0
          return (
            <div
              key={item.label}
              className="bg-surface-container border border-outline-variant p-6 rounded-md flex flex-col justify-between min-h-[120px]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[0.625rem] font-data uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                <Icon size={18} strokeWidth={1.5} className="text-primary shrink-0" />
              </div>
              <div className="mt-auto">
                <span className="text-3xl font-data font-bold text-on-surface">
                  {formatNumber(item.value)}
                </span>
                {item.change !== 0 && (
                  <span className={`ml-2 text-xs font-data font-medium ${isPositive ? 'text-secondary' : 'text-error'} inline-flex items-center gap-0.5`}>
                    {isPositive ? <TrendingUp size={12} strokeWidth={1.5} /> : <TrendingDown size={12} strokeWidth={1.5} />}
                    {isPositive ? '+' : ''}{item.change}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {statsLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container border border-outline-variant p-6 rounded-md">
            <div className="h-3 w-24 bg-surface-container-high rounded-sm animate-pulse mb-8" />
            <div className="h-8 w-20 bg-surface-container-high rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      {/* Quick Terminal Operations (Stitch style) */}
      <div>
        <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Quick Terminal Operations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Primary — blue bg */}
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/search') }}
            onClick={() => navigate('/search')}
            className="bg-primary-container p-6 rounded-md text-left cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Search size={28} strokeWidth={1.5} className="text-white mb-4" />
            <h4 className="text-white font-bold text-lg mb-1">New Player Search</h4>
            <p className="text-xs text-primary-fixed leading-relaxed">Launch targeted scout query engine</p>
          </div>
          {/* Secondary cards */}
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/report') }}
            onClick={() => navigate('/report')}
            className="bg-surface-container border border-outline-variant p-6 rounded-md text-left cursor-pointer hover:bg-surface-container-high transition-colors group"
          >
            <FileText size={28} strokeWidth={1.5} className="text-primary mb-4" />
            <h4 className="text-on-surface font-bold text-lg mb-1">Generate Report</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Compile intelligence into PDF</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/compare') }}
            onClick={() => navigate('/compare')}
            className="bg-surface-container border border-outline-variant p-6 rounded-md text-left cursor-pointer hover:bg-surface-container-high transition-colors group"
          >
            <GitCompareArrows size={28} strokeWidth={1.5} className="text-primary mb-4" />
            <h4 className="text-on-surface font-bold text-lg mb-1">Compare Players</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">Side-by-side metric analytics</p>
          </div>
        </div>
      </div>

      {/* Two-Column Workspace */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Recent NL Queries */}
        <div className="flex-1">
          <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Clock size={14} strokeWidth={1.5} className="text-primary" />
                Recent NL Queries
              </h3>
              <button
                onClick={() => navigate('/search')}
                className="text-[0.625rem] font-data uppercase text-primary hover:underline flex items-center gap-1"
              >
                View All Logs <ArrowRight size={10} strokeWidth={1.5} />
              </button>
            </div>
            {searchesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-surface-container-high rounded-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="px-6 py-3 text-[0.625rem] font-data text-on-surface-variant uppercase tracking-wider">Query Input</th>
                    <th className="px-4 py-3 text-[0.625rem] font-data text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-[0.625rem] font-data text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {searches?.slice(0, 6).map((search) => (
                    <tr
                      key={search.id}
                      className="hover:bg-surface-container-high transition-colors cursor-pointer"
                      onClick={() => navigate('/search')}
                    >
                      <td className="px-6 py-3 text-xs font-medium text-on-surface max-w-[320px] truncate">
                        '{search.query}'
                      </td>
                      <td className="px-4 py-3 text-[0.625rem] font-data text-on-surface-variant">
                        {new Date(search.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={search.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ExternalLink size={12} strokeWidth={1.5} className="text-on-surface-variant/30 hover:text-primary transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Watchlist Alerts Panel (Stitch style with quote blocks) */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
            <div className="px-4 py-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Zap size={14} strokeWidth={1.5} className="text-tertiary" />
                Watchlist Alerts
              </h3>
              <span className="text-[0.625rem] font-data font-medium text-white bg-error-container px-2 py-0.5 rounded-sm">
                {String(alerts?.length ?? 0).padStart(2, '0')} NEW
              </span>
            </div>
            {alertsLoading ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-surface-container-high rounded-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {alerts?.map((alert, i) => {
                  const borderColor = alert.changeType === 'warning' ? 'border-l-amber-500' : 'border-l-tertiary'
                  return (
                    <div
                      key={alert.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/watchlists') }}
                      onClick={() => navigate('/watchlists')}
                      className={`p-3 rounded-sm border border-outline-variant cursor-pointer transition-all ${
                        i === 0
                          ? 'bg-surface-container-high'
                          : 'bg-surface-container opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center text-[0.625rem] font-semibold text-primary shrink-0">
                          {alert.playerName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-on-surface leading-none">{alert.playerName}</h4>
                          <p className="text-[0.625rem] font-data text-on-surface-variant mt-0.5">{alert.club}</p>
                        </div>
                      </div>
                      {/* Quote block */}
                      <div className={`bg-surface-container-lowest p-2.5 rounded-sm border-l-2 ${borderColor} mb-2`}>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          <span className={alert.changeType === 'positive' ? 'text-secondary font-data' : alert.changeType === 'warning' ? 'text-amber-500 font-data' : ''}>
                            {alert.change}
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[0.625rem] font-data text-on-surface-variant">{alert.timeAgo}</span>
                        <button className="text-[0.625rem] font-data text-primary hover:underline">View Profile</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: 'bg-tertiary/10 text-tertiary border-tertiary/20',
    processing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    failed: 'bg-error/10 text-error border-error/20',
  }
  const labels: Record<string, string> = {
    complete: 'SUCCESS',
    processing: 'WARNING',
    failed: 'FAILED',
  }
  const style = styles[status] ?? styles.complete
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[0.625rem] font-data font-medium ${style} border`}>
      {labels[status] ?? status.toUpperCase()}
    </span>
  )
}
