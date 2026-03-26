import { useNavigate } from 'react-router-dom'
import { Eye, Search as SearchIcon } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { playerReports } from '../../lib/mock-data'
import { useGeneratedReports } from '../../lib/useGeneratedReportsHook'

const recommendation = {
  sign: { label: 'Sign', className: 'text-secondary bg-secondary/10 border-secondary/20' },
  monitor: { label: 'Monitor', className: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
  pass: { label: 'Pass', className: 'text-error bg-error/10 border-error/20' },
}

export function ReportsListPage() {
  const navigate = useNavigate()
  const { generatedReportIds } = useGeneratedReports()
  const reports = Object.values(playerReports).filter((r) => generatedReportIds.includes(r.playerId))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Reports</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {reports.length} scouting reports generated
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No reports yet</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            Search for players and generate reports to see them here.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-light transition-colors"
          >
            Start a search
          </button>
        </div>
      ) : (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-[0.625rem] uppercase tracking-widest text-on-surface-variant">
                <th className="text-left py-3 px-4 font-medium">Player</th>
                <th className="text-left py-3 px-4 font-medium">Position</th>
                <th className="text-left py-3 px-4 font-medium">Club</th>
                <th className="text-left py-3 px-4 font-medium">League</th>
                <th className="text-center py-3 px-4 font-medium">Fit Score</th>
                <th className="text-center py-3 px-4 font-medium">Recommendation</th>
                <th className="text-center py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const rec = recommendation[report.recommendation]
                return (
                  <tr
                    key={report.playerId}
                    className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => navigate(`/report/${report.playerId}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={report.playerName} size={36} imageUrl={report.image} />
                        <div>
                          <div className="font-semibold text-on-surface">{report.playerName}</div>
                          <div className="text-[0.625rem] text-on-surface-variant">{report.age}y &middot; {report.nationality}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{report.position}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{report.club}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{report.league}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-data font-semibold text-on-surface">{report.fitScore}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.className}`}>
                        {rec.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/report/${report.playerId}`) }}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-light transition-colors text-xs"
                      >
                        <Eye size={14} strokeWidth={1.5} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  )
}
