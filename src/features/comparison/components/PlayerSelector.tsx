import { Plus, X, User } from 'lucide-react'
import type { MockComparisonPlayer } from '../../../lib/mock-data'

interface PlayerSelectorProps {
  players: MockComparisonPlayer[]
  maxPlayers: number
  onRemove: (id: string) => void
}

const playerColors = ['border-primary', 'border-secondary', 'border-tertiary', 'border-on-surface-variant']
const dotColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-on-surface-variant']

export function PlayerSelector({ players, maxPlayers, onRemove }: PlayerSelectorProps) {
  const slotsRemaining = maxPlayers - players.length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {players.map((player, i) => (
        <div
          key={player.id}
          className={`bg-surface-container p-4 border border-outline-variant rounded-md flex items-center gap-3 relative overflow-hidden`}
        >
          <div className={`absolute top-0 right-0 w-1 h-full ${dotColors[i]}`} />
          <div className="w-12 h-12 rounded-md bg-surface-container-highest flex items-center justify-center shrink-0">
            <User size={20} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-on-surface truncate">{player.name}</h3>
            <p className="text-[0.625rem] font-data text-on-surface-variant uppercase tracking-widest truncate">
              {player.club} &middot; {player.position}
            </p>
          </div>
          <button
            onClick={() => onRemove(player.id)}
            className="text-on-surface-variant hover:text-error transition-colors shrink-0"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      ))}

      {slotsRemaining > 0 && (
        <button className="bg-transparent border-2 border-dashed border-outline-variant rounded-md p-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all">
          <Plus size={24} strokeWidth={1.5} className="mb-1" />
          <span className="text-[0.625rem] font-medium uppercase tracking-widest">Add Player</span>
        </button>
      )}
    </div>
  )
}

export { playerColors, dotColors }
