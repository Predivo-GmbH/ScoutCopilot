import { useNavigate } from 'react-router-dom'
import type { MockPlayer } from '../../../lib/mock-data'

interface SearchResultsTableProps {
  results: MockPlayer[]
  isLoading: boolean
}

export function SearchResultsTable({ results, isLoading }: SearchResultsTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-high rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  const statKeys = Object.keys(results[0]?.stats ?? {})

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="font-data text-primary text-lg">{results.length}</span>
          <span className="uppercase tracking-widest text-xs text-on-surface-variant">players found</span>
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant">
              <th className="px-6 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant w-8">#</th>
              <th className="px-4 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">Player</th>
              <th className="px-4 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">Position</th>
              <th className="px-4 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">Age</th>
              <th className="px-4 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant">League</th>
              {statKeys.map((key) => (
                <th key={key} className="px-4 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant text-right">
                  {key}
                </th>
              ))}
              <th className="px-6 py-3 text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant w-48">Fit Score</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {results.map((player, i) => (
              <tr
                key={player.id}
                onClick={() => navigate(`/report/${player.id}`)}
                className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} border-b border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer`}
              >
                <td className="px-6 py-4 font-data text-on-surface-variant text-xs">{i + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-surface-container-highest flex items-center justify-center text-[0.625rem] font-semibold text-on-surface-variant">
                      {player.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-on-surface">{player.name}</div>
                      <div className="text-[0.625rem] text-on-surface-variant uppercase tracking-tight">{player.club}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-on-surface-variant">{player.position}</td>
                <td className="px-4 py-4 font-data">{player.age}</td>
                <td className="px-4 py-4 text-on-surface-variant">{player.league}</td>
                {statKeys.map((key) => (
                  <td key={key} className="px-4 py-4 font-data text-right text-on-surface-variant">
                    {player.stats[key]}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <FitScoreBar score={player.fitScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FitScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-secondary' : score >= 60 ? 'bg-tertiary' : 'bg-error'
  const textColor = score >= 80 ? 'text-secondary' : score >= 60 ? 'text-tertiary' : 'text-error'

  return (
    <div className="flex flex-col gap-1">
      <span className={`font-data text-[0.625rem] font-medium ${textColor}`}>{score}%</span>
      <div className="w-full h-1.5 bg-surface-variant rounded-sm overflow-hidden">
        <div className={`h-full ${color} rounded-sm`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
