import { useMemo } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Zap } from 'lucide-react'
import { useWatchlistAlerts } from './hooks/useDashboardData'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../lib/usePlayerPhotoFetch'

export function AlertsPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { data: alerts, isLoading } = useWatchlistAlerts()

  // On-demand photo fetching for alert players without images
  const alertPhotoPlayers = useMemo(
    () => (alerts ?? []).map((a) => ({ id: a.playerId, image: a.imageUrl })),
    [alerts],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(alertPhotoPlayers)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-4 min-h-[44px]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t('alerts.backToDashboard')}
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('alerts.heading')}</h1>
          {alerts && (
            <span className="text-[0.625rem] font-data font-medium text-on-error-container bg-error-container px-2 py-0.5 rounded-sm">
              {alerts.length} {t('dashboard.new')}
            </span>
          )}
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">{t('alerts.subtitle')}</p>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-live="polite">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-container-low rounded-md animate-pulse" />
          ))}
          <span className="sr-only">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts?.map((alert) => {
            const borderColor = alert.changeType === 'warning' ? 'border-l-warning' : alert.changeType === 'positive' ? 'border-l-tertiary' : 'border-l-outline-variant'
            const resolvedPhoto = getPhoto({ id: alert.playerId, image: alert.imageUrl })
            return (
              <div
                key={alert.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/players/${alert.playerId}`, { state: { alert } }) }}
                onClick={() => navigate(`/players/${alert.playerId}`, { state: { alert } })}
                className="bg-surface-container border border-outline-variant rounded-md p-4 cursor-pointer hover:bg-surface-container-high transition-colors min-h-[44px]"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <PlayerAvatar name={alert.playerName} size={44} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(alert.playerId)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <h4 className="text-sm font-bold text-on-surface">{alert.playerName}</h4>
                      <span className="text-[0.625rem] font-data text-on-surface-variant">{alert.club}</span>
                      <span className="text-[0.625rem] font-data text-on-surface-variant/70 sm:hidden">{alert.timeAgo}</span>
                    </div>
                    <div className={`bg-surface-container-lowest p-2 rounded-sm border-l-2 ${borderColor}`}>
                      <p className={`text-xs leading-relaxed ${
                        alert.changeType === 'positive' ? 'text-secondary font-data' :
                        alert.changeType === 'warning' ? 'text-warning font-data' :
                        'text-on-surface-variant'
                      }`}>
                        <Zap size={12} strokeWidth={1.5} className="inline-block mr-1 -mt-0.5" />
                        {t(alert.changeKey, alert.changeParams)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[0.625rem] font-data text-on-surface-variant/70 shrink-0 hidden sm:block">{alert.timeAgo}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
