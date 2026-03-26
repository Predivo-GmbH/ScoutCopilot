import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import { useWatchlistAlerts } from './hooks/useDashboardData'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'

export function AlertsPage() {
  const navigate = useNavigate()
  const { data: alerts, isLoading } = useWatchlistAlerts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Watchlist Alerts</h1>
          {alerts && (
            <span className="text-[0.625rem] font-data font-medium text-white bg-error-container px-2 py-0.5 rounded-sm">
              {alerts.length} NEW
            </span>
          )}
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">All recent alerts from your watched players.</p>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-container-low rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {alerts?.map((alert) => {
            const borderColor = alert.changeType === 'warning' ? 'border-l-amber-500' : alert.changeType === 'positive' ? 'border-l-tertiary' : 'border-l-outline-variant'
            return (
              <div
                key={alert.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/players/${alert.playerId}`, { state: { alert } }) }}
                onClick={() => navigate(`/players/${alert.playerId}`, { state: { alert } })}
                className="bg-surface-container border border-outline-variant rounded-md p-4 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-4">
                  <PlayerAvatar name={alert.playerName} size={44} imageUrl={alert.imageUrl} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-on-surface">{alert.playerName}</h4>
                      <span className="text-[0.625rem] font-data text-on-surface-variant">{alert.club}</span>
                    </div>
                    <div className={`bg-surface-container-lowest p-2 rounded-sm border-l-2 ${borderColor}`}>
                      <p className={`text-xs leading-relaxed ${
                        alert.changeType === 'positive' ? 'text-secondary font-data' :
                        alert.changeType === 'warning' ? 'text-amber-500 font-data' :
                        'text-on-surface-variant'
                      }`}>
                        <Zap size={12} strokeWidth={1.5} className="inline-block mr-1 -mt-0.5" />
                        {alert.change}
                      </p>
                    </div>
                  </div>
                  <span className="text-[0.625rem] font-data text-on-surface-variant/50 shrink-0">{alert.timeAgo}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
