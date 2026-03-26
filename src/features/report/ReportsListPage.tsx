import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, FileText, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { playerReports } from '../../lib/mock-data'
import { useGeneratedReports } from '../../lib/useGeneratedReportsHook'

const recommendation = {
  sign: { label: 'Sign', className: 'text-secondary bg-secondary/10 border-secondary/20' },
  monitor: { label: 'Monitor', className: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
  pass: { label: 'Pass', className: 'text-error bg-error/10 border-error/20' },
}

export function ReportsListPage() {
  const navigate = useNavigate()
  const { generatedReportIds, removeReport } = useGeneratedReports()
  const reports = Object.values(playerReports).filter((r) => generatedReportIds.includes(r.playerId))
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  function handleDelete() {
    if (!deleteTarget) return
    removeReport(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Players</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {reports.length} scouted {reports.length === 1 ? 'player' : 'players'}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No players scouted yet</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            Search for players and generate reports to add them here.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-light transition-colors"
          >
            Start a search
          </button>
        </div>
      ) : (
        <div className="bg-surface-container rounded-md overflow-hidden border border-outline-variant">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <th className="px-6 py-3">Player</th>
                <th className="px-4 py-3 text-center">Club</th>
                <th className="px-4 py-3 text-center">Position</th>
                <th className="px-4 py-3 text-center">Age</th>
                <th className="px-4 py-3 text-center">Fit Score</th>
                <th className="px-4 py-3 text-center">Recommendation</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reports.map((report, i) => {
                const rec = recommendation[report.recommendation]
                return (
                  <tr
                    key={report.playerId}
                    className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors group`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={report.playerName} size={40} imageUrl={report.image} />
                        <div>
                          <p className="font-semibold text-on-surface">{report.playerName}</p>
                          <p className="text-[0.625rem] text-on-surface-variant font-data">
                            {report.nationality} | SCORE: {report.fitScore}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-surface-container-low rounded-sm text-[0.625rem] font-semibold text-on-surface-variant uppercase">
                        {report.club}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-data text-on-surface-variant">{report.position}</td>
                    <td className="px-4 py-4 text-center font-data">{report.age}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-primary font-data font-semibold">{report.fitScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.className}`}>
                        {rec.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={FileText}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/players/${report.playerId}`)
                          }}
                        >
                          Report
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: report.playerId, name: report.playerName })
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
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Player"
        message={`Are you sure you want to remove ${deleteTarget?.name ?? 'this player'} from your scouted players? This will delete the generated report.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
