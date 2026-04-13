import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ScrollableTabBar } from '../../components/ui/ScrollableTabBar'
import { useWatchlists } from './hooks/useWatchlists'
import { useWatchlistActions } from '../../lib/useWatchlistActions'
import { WatchlistCard } from './components/WatchlistCard'
import { WatchlistDetail } from './components/WatchlistDetail'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const CATEGORY_OPTIONS = ['all', 'transfer', 'youth', 'position'] as const

export function WatchlistsPage() {
  const { t } = useTranslation()
  const { lists, isLoading, filter, setFilter, selectedWatchlist, selectWatchlist, clearSelection, removePlayerFromWatchlist, deleteWatchlist } = useWatchlists()
  const { createWatchlist, updateWatchlist } = useWatchlistActions()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState<string>('all')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; description: string } | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const editNameRef = useRef<HTMLInputElement>(null)

  const categoryLabels: Record<string, string> = {
    all: t('watchlists.all'),
    transfer: t('watchlists.transferTargets'),
    youth: t('watchlists.youthProspects'),
    position: t('watchlists.positionSpecific'),
  }

  const filterTabs = CATEGORY_OPTIONS.map((key) => ({
    key,
    label: categoryLabels[key],
  }))

  useEffect(() => {
    if (showNewForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showNewForm])

  useEffect(() => {
    if (editTarget && editNameRef.current) {
      editNameRef.current.focus()
    }
  }, [editTarget])

  async function handleCreate() {
    if (!newName.trim()) return
    await createWatchlist(newName.trim(), newDesc.trim(), newCategory)
    setNewName('')
    setNewDesc('')
    setNewCategory('all')
    setShowNewForm(false)
  }

  function handleDeleteWatchlist() {
    if (!deleteTarget) return
    deleteWatchlist(deleteTarget.id)
    setDeleteTarget(null)
  }

  function openEdit(watchlist: { id: string; name: string; description: string }) {
    setEditTarget(watchlist)
    setEditName(watchlist.name)
    setEditDesc(watchlist.description)
  }

  function handleSaveEdit() {
    if (!editTarget || !editName.trim()) return
    updateWatchlist(editTarget.id, editName.trim(), editDesc.trim())
    setEditTarget(null)
  }

  if (selectedWatchlist) {
    return (
      <div className="p-4 sm:p-6">
        <WatchlistDetail
          watchlist={selectedWatchlist}
          onBack={clearSelection}
          onRemovePlayer={removePlayerFromWatchlist}
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('watchlists.heading')}</h1>
          <p className="text-on-surface-variant mt-1 text-sm">{t('watchlists.subheading')}</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setShowNewForm(true)}>{t('watchlists.newWatchlist')}</Button>
      </div>

      {/* New Watchlist Form — Modal */}
      <Modal open={showNewForm} onClose={() => setShowNewForm(false)} title={t('watchlists.createNew')}>
        <div className="space-y-3">
          <input
            ref={nameInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('watchlists.watchlistName')}
            aria-label={t('watchlists.watchlistName')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={t('watchlists.descriptionOptional')}
            aria-label={t('watchlists.descriptionOptional')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            aria-label={t('watchlists.category', 'Category')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
          >
            {CATEGORY_OPTIONS.map((key) => (
              <option key={key} value={key}>{categoryLabels[key]}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newName.trim()}>{t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Watchlist Modal */}
      <Modal open={editTarget !== null} onClose={() => setEditTarget(null)} title={t('watchlists.editWatchlist', 'Edit watchlist')}>
        <div className="space-y-3">
          <input
            ref={editNameRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t('watchlists.watchlistName')}
            aria-label={t('watchlists.watchlistName')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
          />
          <input
            type="text"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder={t('watchlists.descriptionOptional')}
            aria-label={t('watchlists.descriptionOptional')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={!editName.trim()}>{t('common.save', 'Save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Filter Tabs */}
      <ScrollableTabBar
        tabs={filterTabs.map((t) => ({ key: t.key, label: t.label }))}
        activeKey={filter}
        onTabChange={(key) => setFilter(key as typeof filter)}
        className="-mx-4 sm:-mx-6 px-4 sm:px-6"
      />

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" role="status" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-md animate-pulse" />
          ))}
          <span className="sr-only">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-base font-semibold text-on-surface mb-2">{t('watchlists.noWatchlistsYet', 'No watchlists yet')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">{t('watchlists.noWatchlistsGuidance', 'Create one to start tracking players and receive alerts on their performance.')}</p>
          <Button variant="primary" leftIcon={Plus} onClick={() => setShowNewForm(true)}>{t('watchlists.newWatchlist')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lists.map((watchlist) => (
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              isSelected={false}
              onClick={() => selectWatchlist(watchlist.id)}
              onDelete={() => setDeleteTarget({ id: watchlist.id, name: watchlist.name })}
              onEdit={() => openEdit(watchlist)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('common.delete')}
        message={t('watchlists.deleteConfirmMessage', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="destructive"
        onConfirm={handleDeleteWatchlist}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
