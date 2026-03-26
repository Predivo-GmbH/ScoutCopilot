import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const alertStatusStyles: Record<string, { dot: string; text: string; label: string }> = {
    stable: { dot: 'bg-secondary', text: 'text-secondary', label: 'Stable' },
    price_change: { dot: 'bg-tertiary', text: 'text-tertiary', label: 'Price Change' },
    injury: { dot: 'bg-error', text: 'text-error', label: 'Injury Report' },
    form_change: { dot: 'bg-primary', text: 'text-primary', label: 'Form Change' },
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
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="text-xl font-semibold text-on-surface">{watchlist.name}</h2>
          {watchlist.alertCount > 0 && (
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[0.625rem] font-semibold rounded-sm border border-tertiary/20">
              {watchlist.alertCount} Alerts
            </span>
          )}
        </div>
      </div>

      {/* Player Table */}
      {watchlist.players.length > 0 ? (
        <div className="bg-surface-container rounded-md overflow-hidden border border-outline-variant">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <th className="px-6 py-3">Player</th>
                <th className="px-4 py-3 text-center">Club</th>
                <th className="px-4 py-3 text-center">Position</th>
                <th className="px-4 py-3 text-center">Age</th>
                <th className="px-4 py-3 text-center">Key Metric</th>
                <th className="px-4 py-3">Alert Status</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
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
                            {player.nationality} | SCORE: {player.scoutScore}
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
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={FileText}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/players/${player.id}`)
                          }}
                        >
                          Report
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: player.id, name: player.name })
                          }}
                          className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors"
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
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-on-surface-variant">No players in this watchlist yet.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove from Watchlist"
        message={`Are you sure you want to remove ${deleteTarget?.name ?? 'this player'} from "${watchlist.name}"?`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
