import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users, Heart, AlertTriangle, Plus, X, Loader2, Trash2, Search } from 'lucide-react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { calculateAge } from '../../lib/ageUtils'
import type { FormationType, MockSquad } from '../../lib/mock-data'
import { useSquad } from './hooks/useSquad'
import { useGapAnalysis } from './hooks/useGapAnalysis'
import { FormationPitch, FormationSelector } from './components/FormationPitch'
import { GapAnalysisSection } from './components/GapAnalysisSection'
import { SquadTable } from './components/SquadTable'
import { SquadCard } from './components/SquadCard'

export function SquadPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { squads, isLoading, selectedSquad, selectSquad, clearSelection, createSquad, deleteSquad, removePlayer } = useSquad()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createStatus, setCreateStatus] = useState<'idle' | 'creating' | 'error'>('idle')

  async function handleCreateSquad() {
    if (!createName.trim()) return
    setCreateStatus('creating')
    try {
      await createSquad(createName.trim(), createDescription.trim())
      setShowCreateModal(false)
      setCreateName('')
      setCreateDescription('')
      setCreateStatus('idle')
    } catch {
      setCreateStatus('error')
      setTimeout(() => setCreateStatus('idle'), 3000)
    }
  }

  if (selectedSquad) {
    return <SquadDetail squad={selectedSquad} onBack={clearSelection} onDelete={deleteSquad} onRemovePlayer={removePlayer} />
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">{t('squad.heading')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('squad.subheading')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
        >
          <Plus size={16} strokeWidth={2} />
          {t('squad.createSquad')}
        </button>
      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60" onClick={() => setShowCreateModal(false)}>
          <div className="bg-surface-container border border-outline-variant rounded-md w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-on-surface">{t('squad.createSquad')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-on-surface min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="squad-name" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">{t('squad.squadName')}</label>
                <input
                  id="squad-name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t('squad.squadNamePlaceholder')}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="squad-description" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">{t('squad.description')}</label>
                <textarea
                  id="squad-description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder={t('squad.descriptionPlaceholder')}
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCreateSquad}
                  disabled={createStatus === 'creating' || !createName.trim()}
                  className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-2"
                >
                  {createStatus === 'creating' ? (
                    <><Loader2 size={14} className="animate-spin" /> {t('squad.creating')}</>
                  ) : (
                    t('common.create')
                  )}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-md text-sm font-medium transition-colors min-h-[44px]"
                >
                  {t('common.cancel')}
                </button>
                {createStatus === 'error' && (
                  <span className="text-xs text-error">{t('common.failedToSave')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Squad Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" role="status" aria-live="polite">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-surface-container-high rounded-md animate-pulse" />
          ))}
          <span className="sr-only">{t('common.loading', 'Loading...')}</span>
        </div>
      ) : squads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <Users size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('squad.noSquadsYet')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {t('squad.noSquadsSub')}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            {t('squad.startSearch')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {squads.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              isSelected={false}
              onClick={() => selectSquad(squad.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SquadDetail({ squad, onBack, onDelete, onRemovePlayer }: { squad: MockSquad; onBack: () => void; onDelete: (squadId: string) => void; onRemovePlayer: (squadId: string, playerId: string) => void }) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const gaps = useGapAnalysis(squad.players)
  const [formation, setFormation] = useState<FormationType>(squad.formation)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPlayers = squad.players.length
  const avgAge = totalPlayers > 0 ? (squad.players.reduce((s, p) => s + (calculateAge(p.birth_date) ?? 0), 0) / totalPlayers).toFixed(1) : '0'
  const injuredCount = squad.players.filter((p) => p.status === 'injured').length
  const onLoanCount = squad.players.filter((p) => p.status === 'on_loan').length

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setIsDeleting(true)
    onDelete(squad.id)
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-3 min-h-[44px]"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            {t('squad.allSquads')}
          </button>
          <h1 className="text-xl font-bold text-on-surface">{squad.name}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {squad.club} &middot; {squad.season}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            disabled={isDeleting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
              confirmDelete
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'text-error hover:bg-error/10 border border-error/30'
            } disabled:opacity-50`}
            title={confirmDelete ? t('squad.confirmDeleteSquad') : t('squad.deleteSquad')}
          >
            {isDeleting ? (
              <><Loader2 size={14} className="animate-spin" /> {t('squad.deleting')}</>
            ) : (
              <><Trash2 size={14} strokeWidth={1.5} /> {confirmDelete ? t('common.delete') : t('squad.deleteSquad')}</>
            )}
          </button>
          <FormationSelector value={formation} onChange={setFormation} />
        </div>
      </div>

      {/* Squad Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('squad.squadSize')} value={String(totalPlayers)} />
        <StatCard icon={Users} label={t('squad.avgAge')} value={avgAge} />
        <StatCard icon={AlertTriangle} label={t('squad.injured')} value={String(injuredCount)} variant={injuredCount > 0 ? 'warning' : 'default'} />
        <StatCard icon={Heart} label={t('squad.onLoan')} value={String(onLoanCount)} variant={onLoanCount > 0 ? 'info' : 'default'} />
      </div>

      {/* Formation Pitch */}
      <FormationPitch formation={formation} players={squad.players} />

      {/* Gap Analysis */}
      <GapAnalysisSection gaps={gaps} />

      {/* Full Squad Table */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface mb-4">{t('squad.fullRoster')}</h3>
        {squad.players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-container rounded-md border border-outline-variant">
            <div className="w-14 h-14 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
              <Users size={28} strokeWidth={1.5} className="text-on-surface-variant" />
            </div>
            <h3 className="text-base font-semibold text-on-surface mb-1">{t('squad.noPlayersYet')}</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mb-6">{t('squad.noPlayersSub')}</p>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
            >
              <Search size={14} strokeWidth={2} />
              {t('squad.searchPlayers')}
            </button>
          </div>
        ) : (
          <SquadTable players={squad.players} onRemovePlayer={(playerId) => onRemovePlayer(squad.id, playerId)} />
        )}
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, variant = 'default' }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: string
  variant?: 'default' | 'warning' | 'info'
}) {
  const iconColor = variant === 'warning' ? 'text-warning' : variant === 'info' ? 'text-tertiary' : 'text-primary'
  return (
    <div className="bg-surface-container border border-outline-variant rounded-md px-4 py-3 flex items-center gap-3">
      <Icon size={18} strokeWidth={1.5} className={iconColor} />
      <div>
        <p className="font-data text-lg font-bold text-on-surface">{value}</p>
        <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">{label}</p>
      </div>
    </div>
  )
}
