import { useState, useRef, useCallback } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { useWatchlistActions } from '../../lib/useWatchlistActions'
import type { MockWatchlistPlayer } from '../../lib/mock-data'

interface AddToWatchlistModalProps {
  open: boolean
  player: MockWatchlistPlayer | null
  onClose: () => void
}

export function AddToWatchlistModal({ open, player, onClose }: AddToWatchlistModalProps) {
  if (!open || !player) return null
  return <AddToWatchlistModalInner player={player} onClose={onClose} />
}

/** Inner component remounts each time the modal opens, so state resets automatically */
function AddToWatchlistModalInner({ player, onClose }: { player: MockWatchlistPlayer; onClose: () => void }) {
  const { watchlists, addPlayerToWatchlist, createWatchlist } = useWatchlistActions()
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set())
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useCallback((node: HTMLInputElement | null) => {
    node?.focus()
  }, [])

  // Check which watchlists already contain this player
  const alreadyIn = new Set(
    watchlists.filter((w) => w.players.some((p) => p.id === player.id)).map((w) => w.id),
  )

  function handleAdd(watchlistId: string) {
    if (alreadyIn.has(watchlistId) || addedTo.has(watchlistId)) return
    addPlayerToWatchlist(watchlistId, player)
    setAddedTo((prev) => new Set(prev).add(watchlistId))
  }

  function handleCreateAndAdd() {
    if (!newName.trim()) return
    const id = createWatchlist(newName.trim(), newDesc.trim())
    addPlayerToWatchlist(id, player)
    setAddedTo((prev) => new Set(prev).add(id))
    setCreatingNew(false)
    setNewName('')
    setNewDesc('')
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className="bg-surface-container rounded-md border border-outline-variant shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3 className="text-base font-semibold text-on-surface">Add to Watchlist</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Player Info */}
        <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant">
          <p className="text-sm font-semibold text-on-surface">{player.name}</p>
          <p className="text-[0.625rem] text-on-surface-variant">{player.club} &middot; {player.position} &middot; {player.age}y</p>
        </div>

        {/* Watchlist List */}
        <div className="px-6 py-3 max-h-64 overflow-y-auto space-y-1">
          {watchlists.map((w) => {
            const isIn = alreadyIn.has(w.id) || addedTo.has(w.id)
            return (
              <button
                key={w.id}
                onClick={() => handleAdd(w.id)}
                disabled={isIn}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors ${
                  isIn
                    ? 'bg-secondary/5 text-on-surface-variant cursor-default'
                    : 'hover:bg-surface-container-high text-on-surface cursor-pointer'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-[0.625rem] text-on-surface-variant">{w.playerCount} players</p>
                </div>
                {isIn && (
                  <Check size={16} strokeWidth={2} className="text-secondary shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Create New */}
        <div className="px-6 py-3 border-t border-outline-variant">
          {creatingNew ? (
            <div className="space-y-2">
              <input
                ref={nameInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Watchlist name"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd()
                }}
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd()
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setCreatingNew(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleCreateAndAdd} disabled={!newName.trim()}>Create & Add</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreatingNew(true)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors font-medium"
            >
              <Plus size={16} strokeWidth={1.5} />
              Create new watchlist
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}
