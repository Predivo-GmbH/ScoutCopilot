import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users, Heart, AlertTriangle, Plus, X, Loader2, Trash2, Search, Download } from 'lucide-react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { calculateAge } from '../../lib/ageUtils'
import type { FormationType, MockSquad, SquadPosition } from '../../lib/mock-data'
import { useSquad } from './hooks/useSquad'
import { useGapAnalysis } from './hooks/useGapAnalysis'
import { FormationPitch, FormationSelector } from './components/FormationPitch'
import { GapAnalysisSection } from './components/GapAnalysisSection'
import { SquadTable } from './components/SquadTable'
import { SquadCard } from './components/SquadCard'
import { supabase } from '../../lib/supabase'

export function SquadPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { squads, isLoading, selectedSquad, selectSquad, clearSelection, createSquad, deleteSquad, removePlayer, assignToSlot, removeFromSlot, updateFormation, updatePlayerBirthDate, updatePlayerPosition } = useSquad()
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
    return <SquadDetail squad={selectedSquad} onBack={clearSelection} onDelete={deleteSquad} onRemovePlayer={removePlayer} onAssignSlot={assignToSlot} onRemoveFromSlot={removeFromSlot} onUpdateFormation={updateFormation} onUpdateBirthDate={updatePlayerBirthDate} onUpdatePosition={updatePlayerPosition} />
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
              <button onClick={() => setShowCreateModal(false)} aria-label={t('common.close', 'Close')} className="text-on-surface-variant hover:text-on-surface min-w-[44px] min-h-[44px] flex items-center justify-center">
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

// ── Import Team Modal ────────────────────────────────────────────────────────

interface ApiTeamResult {
  id: number
  name: string
  country: string
  logo: string
  founded: number | null
  national: boolean
  venue: string | null
}

interface ApiSquadPlayer {
  id: number
  name: string
  age: number
  number: number | null
  position: string
  positionRaw: string
  photo: string
}

type ImportStatus = 'idle' | 'importing' | 'success' | 'error'

function ImportTeamModal({
  squad,
  onClose,
  onImport,
}: {
  squad: MockSquad
  onClose: () => void
  onImport: (players: ApiSquadPlayer[], teamName: string, existingPlayerIds: Set<string>) => Promise<{ imported: number; skipped: number }>
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState<ApiTeamResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<ApiTeamResult | null>(null)
  const [squadPlayers, setSquadPlayers] = useState<ApiSquadPlayer[]>([])
  const [isFetchingSquad, setIsFetchingSquad] = useState(false)
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [importError, setImportError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search teams via API-Football edge function
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setTeams([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data, error } = await supabase.functions.invoke('import-team', {
          body: { action: 'search-teams', query: query.trim() },
        })
        if (!error && data?.teams) {
          setTeams(data.teams as ApiTeamResult[])
        }
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Fetch squad when team is selected
  async function handleSelectTeam(team: ApiTeamResult) {
    setSelectedTeam(team)
    setIsFetchingSquad(true)
    setSquadPlayers([])
    try {
      const { data, error } = await supabase.functions.invoke('import-team', {
        body: { action: 'get-squad', team_id: team.id },
      })
      if (!error && data?.players) {
        setSquadPlayers(data.players as ApiSquadPlayer[])
      }
    } finally {
      setIsFetchingSquad(false)
    }
  }

  async function handleConfirmImport() {
    if (!selectedTeam || squadPlayers.length === 0) return
    setImportStatus('importing')
    setImportError('')
    try {
      const existingIds = new Set(squad.players.map((p) => p.id))
      const result = await onImport(squadPlayers, selectedTeam.name, existingIds)
      setImportResult(result)
      setImportStatus('success')
    } catch {
      setImportError(t('common.failedToSave', 'Failed to save. Please try again.'))
      setImportStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60" onClick={onClose}>
      <div
        className="bg-surface-container border border-outline-variant rounded-md w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download size={16} strokeWidth={2} className="text-primary" />
            <h3 className="text-sm font-semibold text-on-surface">
              {t('squad.importTeam', 'Import Team')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="text-on-surface-variant hover:text-on-surface min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {importStatus === 'success' && importResult ? (
          /* Success state */
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              {selectedTeam?.logo && (
                <img src={selectedTeam.logo} alt="" className="w-12 h-12 object-contain" />
              )}
              <p className="text-sm font-medium text-on-surface">
                {t('squad.importSuccess', {
                  imported: importResult.imported,
                  team: selectedTeam?.name,
                  defaultValue: `Imported {{imported}} players from {{team}}`,
                })}
              </p>
              {importResult.skipped > 0 && (
                <p className="text-xs text-on-surface-variant">
                  {t('squad.importSkipped', {
                    count: importResult.skipped,
                    defaultValue: `{{count}} already in squad — skipped`,
                  })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
            >
              {t('common.done', 'Done')}
            </button>
          </div>
        ) : selectedTeam ? (
          /* Confirmation state — show team + player count */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedTeam.logo && (
                <img src={selectedTeam.logo} alt="" className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="text-sm font-semibold text-on-surface">{selectedTeam.name}</p>
                <p className="text-xs text-on-surface-variant">{selectedTeam.country}{selectedTeam.venue ? ` · ${selectedTeam.venue}` : ''}</p>
              </div>
            </div>

            {isFetchingSquad ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-on-surface-variant" />
                <span className="ml-2 text-xs text-on-surface-variant">{t('squad.fetchingSquad', 'Fetching squad...')}</span>
              </div>
            ) : squadPlayers.length > 0 ? (
              <>
                <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-md divide-y divide-outline-variant">
                  {squadPlayers.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                      <img src={p.photo} alt="" className="w-7 h-7 rounded-full object-cover bg-surface-container-high" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-on-surface truncate">{p.name}</p>
                        <p className="text-[0.625rem] text-on-surface-variant">{p.positionRaw} · {p.age}y{p.number ? ` · #${p.number}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">
                  {t('squad.importConfirm', {
                    count: squadPlayers.length,
                    team: selectedTeam.name,
                    defaultValue: `Import {{count}} players from {{team}}?`,
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-4">
                {t('squad.noSquadData', 'No squad data available for this team')}
              </p>
            )}

            {importError && (
              <p className="text-xs text-error">{importError}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmImport}
                disabled={importStatus === 'importing' || isFetchingSquad || squadPlayers.length === 0}
                className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-2"
              >
                {importStatus === 'importing' ? (
                  <><Loader2 size={14} className="animate-spin" /> {t('squad.importing', 'Importing...')}</>
                ) : (
                  <><Download size={14} strokeWidth={2} /> {t('squad.importConfirmBtn', 'Import')}</>
                )}
              </button>
              <button
                onClick={() => { setSelectedTeam(null); setSquadPlayers([]) }}
                disabled={importStatus === 'importing'}
                className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-md text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50"
              >
                {t('common.back', 'Back')}
              </button>
            </div>
          </div>
        ) : (
          /* Search state */
          <div className="space-y-3">
            <div>
              <label htmlFor="import-team-search" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
                {t('squad.clubName', 'Club Name')}
              </label>
              <div className="relative">
                <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  id="import-team-search"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedTeam(null)
                  }}
                  placeholder={t('squad.searchClubPlaceholder', 'e.g. Barcelona, Arsenal...')}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-9 pr-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-on-surface-variant" />
              </div>
            ) : teams.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto border border-outline-variant rounded-md divide-y divide-outline-variant">
                {teams.map((team) => (
                  <li key={team.id}>
                    <button
                      onClick={() => handleSelectTeam(team)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left min-h-[44px]"
                    >
                      <img src={team.logo} alt="" className="w-7 h-7 object-contain shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{team.name}</span>
                        <span className="text-[0.625rem] text-on-surface-variant">{team.country}{team.founded ? ` · Est. ${team.founded}` : ''}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim().length >= 2 && !isSearching ? (
              <p className="text-sm text-on-surface-variant text-center py-4">
                {t('squad.noTeamsFound', 'No teams found')}
              </p>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-md text-sm font-medium transition-colors min-h-[44px]"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Squad Detail ─────────────────────────────────────────────────────────────

function SquadDetail({ squad, onBack, onDelete, onRemovePlayer, onAssignSlot, onRemoveFromSlot, onUpdateFormation, onUpdateBirthDate, onUpdatePosition }: { squad: MockSquad; onBack: () => void; onDelete: (squadId: string) => void; onRemovePlayer: (squadId: string, playerId: string) => void; onAssignSlot: (squadId: string, playerId: string, slotKey: string) => void; onRemoveFromSlot: (squadId: string, playerId: string) => void; onUpdateFormation: (squadId: string, formation: FormationType) => void; onUpdateBirthDate: (squadId: string, playerId: string, birthDate: string) => void; onUpdatePosition: (squadId: string, playerId: string, position: SquadPosition) => void }) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { importTeamPlayers } = useSquad()
  const gaps = useGapAnalysis(squad.players)
  const [formation, setFormation] = useState<FormationType>(squad.formation)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const totalPlayers = squad.players.length
  const playersWithAge = squad.players.filter((p) => calculateAge(p.birth_date) !== null)
  const avgAge = playersWithAge.length > 0 ? (playersWithAge.reduce((s, p) => s + calculateAge(p.birth_date)!, 0) / playersWithAge.length).toFixed(1) : '—'
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
      {/* Import Team Modal */}
      {showImportModal && (
        <ImportTeamModal
          squad={squad}
          onClose={() => setShowImportModal(false)}
          onImport={(players, teamName, existingPlayerIds) =>
            importTeamPlayers(squad.id, players, teamName, existingPlayerIds)
          }
        />
      )}

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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            <Search size={14} strokeWidth={2} />
            {t('squad.searchAndAdd')}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors min-h-[44px]"
          >
            <Download size={14} strokeWidth={2} />
            {t('squad.importTeam', 'Import Team')}
          </button>
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
          <FormationSelector value={formation} onChange={(f) => { setFormation(f); onUpdateFormation(squad.id, f) }} />
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
      <FormationPitch formation={formation} players={squad.players} squadId={squad.id} onAssignSlot={onAssignSlot} onRemoveFromSlot={onRemoveFromSlot} />

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
          <SquadTable players={squad.players} onRemovePlayer={(playerId) => onRemovePlayer(squad.id, playerId)} onUpdateBirthDate={(playerId, birthDate) => onUpdateBirthDate(squad.id, playerId, birthDate)} onUpdatePosition={(playerId, position) => onUpdatePosition(squad.id, playerId, position)} />
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
