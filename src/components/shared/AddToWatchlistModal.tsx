import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Check, Minus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { useWatchlistActions } from '../../lib/useWatchlistActions'
import { formatAge } from '../../lib/ageUtils'
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
  const { t } = useTranslation()
  const { watchlists, addPlayerToWatchlist, removePlayerFromWatchlist, createWatchlist } = useWatchlistActions()
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useCallback((node: HTMLInputElement | null) => {
    node?.focus()
  }, [])

  // Focus trap and auto-focus
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Auto-focus first focusable element
    const timer = setTimeout(() => {
      const el = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      el?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
      previouslyFocused?.focus()
    }
  }, [])

  function isPlayerInWatchlist(watchlistId: string): boolean {
    const w = watchlists.find((wl) => wl.id === watchlistId)
    return w ? w.players.some((p) => p.id === player.id) : false
  }

  function handleToggle(watchlistId: string) {
    if (isPlayerInWatchlist(watchlistId)) {
      removePlayerFromWatchlist(watchlistId, player.id)
    } else {
      addPlayerToWatchlist(watchlistId, player)
    }
  }

  async function handleCreateAndAdd() {
    if (!newName.trim()) return
    const id = await createWatchlist(newName.trim(), newDesc.trim())
    addPlayerToWatchlist(id, player)
    setCreatingNew(false)
    setNewName('')
    setNewDesc('')
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-watchlist-title"
    >
      <div ref={contentRef} className="bg-surface-container rounded-md border border-outline-variant shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h3 id="add-to-watchlist-title" className="text-base font-semibold text-on-surface">{t('addToWatchlist.heading')}</h3>
          <button onClick={onClose} aria-label={t('common.close')} className="text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Player Info */}
        <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant">
          <p className="text-sm font-semibold text-on-surface">{player.name}</p>
          <p className="text-[0.625rem] text-on-surface-variant">{player.club} &middot; {player.position} &middot; {player.birth_date ? `${formatAge(player.birth_date)}y` : (player.age > 0 ? `${player.age}y` : '\u2014')}</p>
        </div>

        {/* Watchlist List */}
        <div className="px-6 py-3 max-h-64 overflow-y-auto space-y-1">
          {watchlists.map((w) => {
            const isIn = isPlayerInWatchlist(w.id)
            return (
              <button
                key={w.id}
                onClick={() => handleToggle(w.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors group/item min-h-[44px] ${
                  isIn
                    ? 'bg-secondary/5 text-on-surface hover:bg-error/5'
                    : 'hover:bg-surface-container-high text-on-surface cursor-pointer'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-[0.625rem] text-on-surface-variant">{w.playerCount} {t('common.players')}</p>
                </div>
                {isIn && (
                  <div className="shrink-0">
                    <Check size={16} strokeWidth={2} className="text-secondary group-hover/item:hidden" />
                    <Minus size={16} strokeWidth={2} className="text-error hidden group-hover/item:block" />
                  </div>
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
                placeholder={t('watchlists.watchlistName')}
                aria-label={t('watchlists.watchlistName')}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd()
                }}
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('watchlists.descriptionOptional')}
                aria-label={t('watchlists.descriptionOptional')}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd()
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setCreatingNew(false)}>{t('common.cancel')}</Button>
                <Button variant="primary" size="sm" onClick={handleCreateAndAdd} disabled={!newName.trim()}>{t('common.create')}</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreatingNew(true)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors font-medium min-h-[44px]"
            >
              <Plus size={16} strokeWidth={1.5} />
              {t('addToWatchlist.createNew')}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>{t('addToWatchlist.done')}</Button>
        </div>
      </div>
    </div>
  )
}
