import { useState, useRef, useEffect } from 'react'
import { Plus, X, Search } from 'lucide-react'
import type { MockComparisonPlayer } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { dotColors } from '../constants'

interface PlayerSelectorProps {
  selectedPlayers: MockComparisonPlayer[]
  availablePlayers: MockComparisonPlayer[]
  maxPlayers: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

export function PlayerSelector({ selectedPlayers, availablePlayers, maxPlayers, onAdd, onRemove }: PlayerSelectorProps) {
  const slotsRemaining = maxPlayers - selectedPlayers.length
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = availablePlayers.filter((p) =>
    `${p.name} ${p.club} ${p.position}`.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    if (dropdownOpen) inputRef.current?.focus()
  }, [dropdownOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {selectedPlayers.map((player, i) => (
        <div
          key={player.id}
          className="bg-surface-container p-4 border border-outline-variant rounded-md flex items-center gap-3 relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-1 h-full ${dotColors[i]}`} />
          <PlayerAvatar name={player.name} size={48} imageUrl={player.image} />
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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-full min-h-[76px] bg-transparent border-2 border-dashed border-outline-variant rounded-md p-4 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            <Plus size={24} strokeWidth={1.5} className="mb-1" />
            <span className="text-[0.625rem] font-medium uppercase tracking-widest">Add Player</span>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-outline-variant rounded-md shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-outline-variant">
                <div className="relative">
                  <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search players..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-md py-2 pl-9 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="p-3 text-xs text-on-surface-variant text-center">No players found</p>
                ) : (
                  filtered.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => {
                        onAdd(player.id)
                        setDropdownOpen(false)
                        setSearch('')
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container-high transition-colors text-left"
                    >
                      <PlayerAvatar name={player.name} size={32} imageUrl={player.image} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface truncate">{player.name}</p>
                        <p className="text-[0.6rem] font-data text-on-surface-variant truncate">{player.club} &middot; {player.position}</p>
                      </div>
                      <span className="text-[0.6rem] font-data text-on-surface-variant/60">{player.age}y</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
