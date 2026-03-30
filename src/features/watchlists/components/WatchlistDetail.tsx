import { useState } from 'react'
import { useLocalizedNavigate } from '../../../components/shared/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import type { MockWatchlist } from '../../../lib/mock-data'

interface WatchlistDetailProps {
  watchlist: MockWatchlist
  onBack: () => void
  onRemovePlayer: (playerId: string) => void
}

export function WatchlistDetail({ watchlist, onBack, onRemovePlayer }: WatchlistDetailProps) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const alertStatusStyles: Record<string, { dot: string; text: string; label: string }> = {
    stable: { dot: 'bg-secondary', text: 'text-secondary', label: t('watchlists.stable') },
    price_change: { dot: 'bg-tertiary', text: 'text-tertiary', label: t('watchlists.priceChange') },
    injury: { dot: 'bg-error', text: 'text-error', label: t('watchlists.injuryReport') },
    form_change: { dot: 'bg-primary', text: 'text-primary', label: t('watchlists.formChange') },
  }

  function handleDelete() {
    if (!deleteTarget) return
    onRemovePlayer(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            aria-label={t('common.back', 'Back')}
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="text-xl font-semibold text-on-surface truncate">{watchlist.name}</h2>
          {watchlist.alertCount > 0 && (
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[0.625rem] font-semibold rounded-sm border border-tertiary/20">
              {watchlist.alertCount} {t('watchlists.alerts')}
            </span>
          )}
        </div>
      </div>

      {/* Player Table */}
      {watchlist.players.length > 0 ? (
        <>
        {/* Mobile card layout */}
        <div className="block md:hidden space-y-3">
          {watchlist.players.map((player) => {
            const alert = alertStatusStyles[player.alertStatus]
            return (
              <div
                key={player.id}
                className="bg-surface-container rounded-md border border-outline-variant p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.name} size={40} imageUrl={player.image} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate">{player.name}</p>
                    <p className="text-[0.625rem] text-on-surface-variant font-data">
                      {player.nationality} | {t('watchlists.score')} {player.scoutScore}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-surface-container-low rounded-sm text-[0.625rem] font-semibold text-on-surface-variant uppercase shrink-0">
                    {player.club}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[0.5625rem] text-on-surface-variant uppercase">{t('common.position')}</p>
                    <p className="font-data text-sm text-on-surface-variant">{player.position}</p>
                  </div>
                  <div>
                    <p className="text-[0.5625rem] text-on-surface-variant uppercase">{t('common.age')}</p>
                    <p className="font-data text-sm">{player.age}</p>
                  </div>
                  <div>
                    <p className="text-[0.5625rem] text-on-surface-variant uppercase">{player.keyMetric.label}</p>
                    <p className="text-primary font-data font-semibold text-sm">{player.keyMetric.value}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-md ${alert.dot}`} />
                    <span className={`text-[0.6875rem] font-semibold ${alert.text} uppercase tracking-tight`}>
                      {alert.label}
                    </span>
                  </div>
                  <span className="font-data text-on-surface-variant text-[0.6875rem]">{player.addedDate}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-outline-variant">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={FileText}
                    onClick={() => navigate(`/players/${player.id}`)}
                  >
                    {t('common.report')}
                  </Button>
                  <button
                    onClick={() => setDeleteTarget({ id: player.id, name: player.name })}
                    className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={t('watchlists.removeFromWatchlist')}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table layout */}
        <div className="hidden md:block bg-surface-container rounded-md overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <th className="px-6 py-3">{t('common.player')}</th>
                <th className="px-4 py-3 text-center">{t('common.club')}</th>
                <th className="px-4 py-3 text-center">{t('common.position')}</th>
                <th className="px-4 py-3 text-center">{t('common.age')}</th>
                <th className="px-4 py-3 text-center">{t('watchlists.keyMetric')}</th>
                <th className="px-4 py-3">{t('watchlists.alertStatus')}</th>
                <th className="px-4 py-3">{t('watchlists.added')}</th>
                <th className="px-4 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {watchlist.players.map((player, i) => {
                const alert = alertStatusStyles[player.alertStatus]
                return (
                  <tr
                    key={player.id}
                    className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors group`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={player.name} size={40} imageUrl={player.image} />
                        <div>
                          <p className="font-semibold text-on-surface">{player.name}</p>
                          <p className="text-[0.625rem] text-on-surface-variant font-data">
                            {player.nationality} | {t('watchlists.score')} {player.scoutScore}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-surface-container-low rounded-sm text-[0.625rem] font-semibold text-on-surface-variant uppercase">
                        {player.club}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-data text-on-surface-variant">{player.position}</td>
                    <td className="px-4 py-4 text-center font-data">{player.age}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col">
                        <span className="text-primary font-data font-semibold">{player.keyMetric.value}</span>
                        <span className="text-[0.5625rem] text-on-surface-variant uppercase">{player.keyMetric.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-md ${alert.dot}`} />
                        <span className={`text-[0.6875rem] font-semibold ${alert.text} uppercase tracking-tight`}>
                          {alert.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-data text-on-surface-variant text-[0.6875rem]">{player.addedDate}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={FileText}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/players/${player.id}`)
                          }}
                        >
                          {t('common.report')}
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: player.id, name: player.name })
                          }}
                          className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={t('watchlists.removeFromWatchlist')}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-on-surface-variant">{t('watchlists.noPlayersYet')}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('watchlists.removeFromWatchlist')}
        message={t('watchlists.removeConfirm', { name: deleteTarget?.name ?? '', watchlist: watchlist.name })}
        confirmLabel={t('common.remove')}
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
