import { useMemo, useState, useEffect } from 'react'
import { useLocalizedNavigate } from '../../../components/shared/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { formatAge } from '../../../lib/ageUtils'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'
import type { SquadPlayer } from '../../../lib/mock-data'

interface SquadTableProps {
  players: SquadPlayer[]
  onRemovePlayer?: (playerId: string) => void
}

const statusKeys: Record<string, string> = {
  fit: 'squad.fit',
  injured: 'squad.injured',
  suspended: 'squad.suspended',
  on_loan: 'squad.onLoan',
}

const statusDotStyles: Record<string, string> = {
  fit: 'bg-secondary',
  injured: 'bg-error',
  suspended: 'bg-warning',
  on_loan: 'bg-tertiary',
}

const statusTextStyles: Record<string, string> = {
  fit: 'text-secondary',
  injured: 'text-error',
  suspended: 'text-warning',
  on_loan: 'text-tertiary',
}

export function SquadTable({ players, onRemovePlayer }: SquadTableProps) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [removedName, setRemovedName] = useState<string | null>(null)
  const sorted = [...players].sort((a, b) => a.shirtNumber - b.shirtNumber)

  // Auto-clear removal feedback
  useEffect(() => {
    if (!removedName) return
    const timer = setTimeout(() => setRemovedName(null), 3000)
    return () => clearTimeout(timer)
  }, [removedName])

  function handleRemove(player: SquadPlayer) {
    onRemovePlayer?.(player.id)
    setRemovedName(player.name)
    setConfirmingId(null)
  }

  // On-demand photo fetching for squad players without images
  const photoFetchPlayers = useMemo(
    () => sorted.map((p) => ({ id: p.id, image: p.image })),
    [sorted],
  )
  const { getPhoto, loadingIds, reportBrokenUrl } = usePlayerPhotoFetch(photoFetchPlayers)

  return (
    <>
      {/* Mobile card layout */}
      <div className="block md:hidden space-y-3">
        {sorted.map((player) => {
          const dot = statusDotStyles[player.status]
          const textColor = statusTextStyles[player.status]
          const statusKey = statusKeys[player.status]
          const resolvedPhoto = getPhoto(player)
          return (
            <div
              key={player.id}
              onClick={() => navigate(`/players/${player.id}`, { state: { playerName: player.name } })}
              className="bg-surface-container rounded-md border border-outline-variant p-4 space-y-3 cursor-pointer active:bg-surface-container-high transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <span className="font-data text-on-surface-variant text-xs w-6 text-center shrink-0">{player.shirtNumber}</span>
                <PlayerAvatar name={player.name} size={36} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(player.id)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} onImageError={() => reportBrokenUrl(player.id)} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface truncate">{player.name}</p>
                  <p className="text-[0.625rem] text-on-surface-variant font-data">{player.nationality}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className={`text-[0.6875rem] font-semibold ${textColor} uppercase tracking-tight`}>{t(statusKey)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded-sm">
                  {player.position}
                </span>
                {player.altPositions?.map((alt) => (
                  <span key={alt} className="text-[0.625rem] font-data bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-sm">
                    {alt}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[0.5625rem] text-on-surface-variant uppercase">{t('common.age')}</p>
                  <p className="font-data text-sm">{player.birth_date ? formatAge(player.birth_date) : (player.age > 0 ? String(player.age) : '—')}</p>
                </div>
                <div>
                  <p className="text-[0.5625rem] text-on-surface-variant uppercase">{t('squad.rating')}</p>
                  <RatingBar rating={player.overallRating} hasStats={!!player.stats && Object.values(player.stats).some((v) => typeof v === 'number' && v > 0)} />
                </div>
                <div>
                  <p className="text-[0.5625rem] text-on-surface-variant uppercase">{t('squad.marketValue')}</p>
                  <p className="font-data text-on-surface-variant text-xs">{player.marketValue}</p>
                </div>
              </div>
              {onRemovePlayer && (
                confirmingId === player.id ? (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant">
                    <span className="text-xs text-on-surface-variant">{t('squad.confirmRemove')}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmingId(null) }}
                        className="px-2 py-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors min-h-[32px]"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(player) }}
                        className="px-2 py-1 text-xs text-error font-medium hover:bg-error/10 rounded transition-colors min-h-[32px]"
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmingId(player.id) }}
                      className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
                      aria-label={t('squad.removePlayer')}
                      title={t('squad.removePlayer')}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block bg-surface-container rounded-md overflow-hidden border border-outline-variant">
        <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
              <th className="px-6 py-3 w-12">{t('squad.number')}</th>
              <th className="px-4 py-3 min-w-[200px]">{t('common.player')}</th>
              <th className="px-4 py-3 text-center">{t('common.position')}</th>
              <th className="px-4 py-3 text-center">{t('common.age')}</th>
              <th className="px-4 py-3 text-center">{t('squad.contract')}</th>
              <th className="px-4 py-3 w-44">{t('squad.rating')}</th>
              <th className="px-4 py-3">{t('squad.status')}</th>
              <th className="px-4 py-3 text-right">{t('squad.marketValue')}</th>
              {onRemovePlayer && <th className="px-4 py-3 w-12"><span className="sr-only">{t('squad.removePlayer')}</span></th>}
            </tr>
          </thead>
          <tbody className="text-sm">
            {sorted.map((player, i) => {
              const dot = statusDotStyles[player.status]
              const textColor = statusTextStyles[player.status]
              const statusKey = statusKeys[player.status]
              const resolvedPhoto = getPhoto(player)
              return (
                <tr
                  key={player.id}
                  tabIndex={0}
                  role="link"
                  onClick={() => navigate(`/players/${player.id}`, { state: { playerName: player.name } })}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${player.id}`, { state: { playerName: player.name } }) } }}
                  className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
                >
                  <td className="px-6 py-4 font-data text-on-surface-variant text-xs">{player.shirtNumber}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} size={36} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(player.id)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} onImageError={() => reportBrokenUrl(player.id)} />
                      <div>
                        <p className="font-semibold text-on-surface">{player.name}</p>
                        <p className="text-[0.625rem] text-on-surface-variant font-data">{player.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded-sm">
                      {player.position}
                    </span>
                    {player.altPositions?.map((alt) => (
                      <span key={alt} className="text-[0.625rem] font-data bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-sm ml-1">
                        {alt}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-4 text-center font-data">{player.birth_date ? formatAge(player.birth_date) : (player.age > 0 ? String(player.age) : '—')}</td>
                  <td className="px-4 py-4 text-center font-data text-on-surface-variant text-xs">
                    {player.contractUntil ? new Date(player.contractUntil).toLocaleDateString(t('common.locale', 'en-GB'), { month: 'short', year: 'numeric' }) : '\u2014'}
                  </td>
                  <td className="px-4 py-4">
                    <RatingBar rating={player.overallRating} hasStats={!!player.stats && Object.values(player.stats).some((v) => typeof v === 'number' && v > 0)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className={`text-[0.6875rem] font-semibold ${textColor} uppercase tracking-tight`}>{t(statusKey)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-data text-on-surface-variant text-xs">{player.marketValue}</td>
                  {onRemovePlayer && (
                    <td className="px-4 py-4 text-center">
                      {confirmingId === player.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(player) }}
                            className="px-2 py-1 text-xs text-error font-medium hover:bg-error/10 rounded transition-colors min-h-[32px]"
                          >
                            {t('common.remove')}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmingId(null) }}
                            className="px-2 py-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors min-h-[32px]"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmingId(player.id) }}
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
                          aria-label={t('squad.removePlayer')}
                          title={t('squad.removePlayer')}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
      {removedName && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-secondary text-on-secondary px-4 py-2.5 rounded-md shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-in]">
          {t('squad.playerRemoved', { name: removedName, defaultValue: `${removedName} removed` })}
        </div>
      )}
    </>
  )
}

function RatingBar({ rating, hasStats }: { rating: number; hasStats: boolean }) {
  const { t } = useTranslation()

  if (rating === 0 && !hasStats) {
    return (
      <span className="text-[0.625rem] font-data text-on-surface-variant/50 italic">
        {t('squad.noRating', 'N/A')}
      </span>
    )
  }

  if (rating === 0 && hasStats) {
    return (
      <span className="text-[0.625rem] font-data text-on-surface-variant animate-pulse">
        {t('squad.ratingPending', 'Rating...')}
      </span>
    )
  }

  const color = rating >= 78 ? 'bg-secondary' : rating >= 65 ? 'bg-warning' : 'bg-error'
  const textColor = rating >= 78 ? 'text-secondary' : rating >= 65 ? 'text-warning' : 'text-error'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${rating}%` }} />
      </div>
      <span className={`font-data text-[0.625rem] font-medium min-w-[2rem] text-right ${textColor}`}>{rating}</span>
    </div>
  )
}
