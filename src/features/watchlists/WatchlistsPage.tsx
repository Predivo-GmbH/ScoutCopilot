import { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useWatchlists } from './hooks/useWatchlists'
import { useWatchlistActions } from '../../lib/WatchlistContext'
import { WatchlistCard } from './components/WatchlistCard'
import { WatchlistDetail } from './components/WatchlistDetail'

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'transfer', label: 'Transfer Targets' },
  { key: 'youth', label: 'Youth Prospects' },
  { key: 'position', label: 'Position-Specific' },
] as const

export function WatchlistsPage() {
  const { lists, isLoading, filter, setFilter, selectedWatchlist, selectWatchlist, clearSelection, removePlayerFromWatchlist } = useWatchlists()
  const { createWatchlist } = useWatchlistActions()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showNewForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showNewForm])

  function handleCreate() {
    if (!newName.trim()) return
    createWatchlist(newName.trim(), newDesc.trim())
    setNewName('')
    setNewDesc('')
    setShowNewForm(false)
  }

  if (selectedWatchlist) {
    return (
      <div className="p-6">
        <WatchlistDetail
          watchlist={selectedWatchlist}
          onBack={clearSelection}
          onRemovePlayer={removePlayerFromWatchlist}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Watchlists</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Track and monitor your target players.</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setShowNewForm(true)}>New Watchlist</Button>
      </div>

      {/* New Watchlist Form */}
      {showNewForm && (
        <div className="bg-surface-container border border-outline-variant rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-on-surface">Create New Watchlist</h3>
            <button onClick={() => setShowNewForm(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              ref={nameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Watchlist name"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
              filter === tab.key
                ? 'bg-surface-container-highest text-on-surface border border-primary/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lists.map((watchlist) => (
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              isSelected={false}
              onClick={() => selectWatchlist(watchlist.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
