import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import type { SquadPlayer } from '../../../lib/mock-data'

interface SquadTableProps {
  players: SquadPlayer[]
}

const statusStyles: Record<string, { dot: string; text: string; label: string }> = {
  fit: { dot: 'bg-secondary', text: 'text-secondary', label: 'Fit' },
  injured: { dot: 'bg-error', text: 'text-error', label: 'Injured' },
  suspended: { dot: 'bg-amber-500', text: 'text-amber-500', label: 'Suspended' },
  on_loan: { dot: 'bg-tertiary', text: 'text-tertiary', label: 'On Loan' },
}

export function SquadTable({ players }: SquadTableProps) {
  const sorted = [...players].sort((a, b) => a.shirtNumber - b.shirtNumber)

  return (
    <div className="bg-surface-container rounded-md overflow-hidden border border-outline-variant">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
            <th className="px-6 py-3 w-12">#</th>
            <th className="px-4 py-3 min-w-[200px]">Player</th>
            <th className="px-4 py-3 text-center">Position</th>
            <th className="px-4 py-3 text-center">Age</th>
            <th className="px-4 py-3 text-center">Contract</th>
            <th className="px-4 py-3 w-44">Rating</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Market Value</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {sorted.map((player, i) => {
            const st = statusStyles[player.status]
            return (
              <tr
                key={player.id}
                className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors`}
              >
                <td className="px-6 py-4 font-data text-on-surface-variant text-xs">{player.shirtNumber}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={player.name} size={36} imageUrl={player.image} />
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
                <td className="px-4 py-4 text-center font-data">{player.age}</td>
                <td className="px-4 py-4 text-center font-data text-on-surface-variant text-xs">
                  {new Date(player.contractUntil).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-4">
                  <RatingBar rating={player.overallRating} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className={`text-[0.6875rem] font-semibold ${st.text} uppercase tracking-tight`}>{st.label}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-data text-on-surface-variant text-xs">{player.marketValue}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RatingBar({ rating }: { rating: number }) {
  const color = rating >= 78 ? 'bg-secondary' : rating >= 65 ? 'bg-amber-500' : 'bg-error'
  const textColor = rating >= 78 ? 'text-secondary' : rating >= 65 ? 'text-amber-500' : 'text-error'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${rating}%` }} />
      </div>
      <span className={`font-data text-[0.625rem] font-medium min-w-[2rem] text-right ${textColor}`}>{rating}</span>
    </div>
  )
}
