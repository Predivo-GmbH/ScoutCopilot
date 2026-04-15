import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users, Heart, AlertTriangle, Plus, Loader2, Trash2, Search, Download, UserPlus } from 'lucide-react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
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
    } catch (err) {
      console.error('Create squad failed:', err)
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
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('squad.createSquad')}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSquad}
              disabled={createStatus === 'creating' || !createName.trim()}
              loading={createStatus === 'creating'}
            >
              {createStatus === 'creating' ? t('squad.creating') : t('common.create')}
            </Button>
            {createStatus === 'error' && (
              <span className="text-xs text-error">{t('common.failedToSave')}</span>
            )}
          </>
        }
      >
        <div className="space-y-3 max-h-[90vh] overflow-y-auto">
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
        </div>
      </Modal>

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
    } catch (err) {
      console.error('Import team failed:', err)
      setImportError(t('common.failedToSave', 'Failed to save. Please try again.'))
      setImportStatus('error')
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('squad.importTeam', 'Import Team')}
    >
      <div className="max-h-[90vh] overflow-y-auto">
        {importStatus === 'success' && importResult ? (
          /* Success state */
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              {selectedTeam?.logo && (
                <img src={selectedTeam.logo} alt="" className="w-12 h-12 object-contain" width={48} height={48} loading="lazy" />
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
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('common.done', 'Done')}
            </Button>
          </div>
        ) : selectedTeam ? (
          /* Confirmation state — show team + player count */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedTeam.logo && (
                <img src={selectedTeam.logo} alt="" className="w-10 h-10 object-contain" width={40} height={40} loading="lazy" />
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
                      <img src={p.photo} alt="" className="w-7 h-7 rounded-full object-cover bg-surface-container-high" width={28} height={28} loading="lazy" />
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
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmImport}
                disabled={importStatus === 'importing' || isFetchingSquad || squadPlayers.length === 0}
                loading={importStatus === 'importing'}
                leftIcon={Download}
              >
                {importStatus === 'importing' ? t('squad.importing', 'Importing...') : t('squad.importConfirmBtn', 'Import')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedTeam(null); setSquadPlayers([]) }}
                disabled={importStatus === 'importing'}
              >
                {t('common.back', 'Back')}
              </Button>
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
                      <img src={team.logo} alt="" className="w-7 h-7 object-contain shrink-0" width={28} height={28} loading="lazy" />
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

            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Squad Detail ─────────────────────────────────────────────────────────────

function SquadDetail({ squad, onBack, onDelete, onRemovePlayer, onAssignSlot, onRemoveFromSlot, onUpdateFormation, onUpdateBirthDate, onUpdatePosition }: { squad: MockSquad; onBack: () => void; onDelete: (squadId: string) => void; onRemovePlayer: (squadId: string, playerId: string) => void; onAssignSlot: (squadId: string, playerId: string, slotKey: string) => void; onRemoveFromSlot: (squadId: string, playerId: string) => void; onUpdateFormation: (squadId: string, formation: FormationType) => void; onUpdateBirthDate: (squadId: string, playerId: string, birthDate: string) => void; onUpdatePosition: (squadId: string, playerId: string, position: SquadPosition) => void }) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const { importTeamPlayers, addPlayer } = useSquad()
  const gaps = useGapAnalysis(squad.players)
  const [formation, setFormation] = useState<FormationType>(squad.formation)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)

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
            onClick={() => setShowAddPlayerModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant text-on-surface rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors min-h-[44px]"
          >
            <UserPlus size={14} strokeWidth={2} />
            {t('squad.addManualPlayer', 'Add Player')}
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

      {/* Add Manual Player Modal */}
      {showAddPlayerModal && (
        <AddManualPlayerModal
          onClose={() => setShowAddPlayerModal(false)}
          onAdd={(player) => {
            addPlayer(squad.id, player)
            setShowAddPlayerModal(false)
          }}
        />
      )}
    </div>
  )
}

function AddManualPlayerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (player: import('../../lib/mock-data').SquadPlayer) => void }) {
  const { t } = useTranslation()
  const ALL_POSITIONS: SquadPosition[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST']

  const [name, setName] = useState('')
  const [position, setPosition] = useState<SquadPosition>('CM')
  const [nationality, setNationality] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [shirtNumber, setShirtNumber] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const playerId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const player: import('../../lib/mock-data').SquadPlayer = {
      id: playerId,
      name: name.trim(),
      position,
      age: birthDate ? calculateAge(birthDate) ?? 0 : 0,
      birth_date: birthDate || undefined,
      nationality: nationality.trim(),
      shirtNumber: shirtNumber ? parseInt(shirtNumber, 10) : 0,
      contractUntil: '',
      weeklyWage: '',
      marketValue: '',
      status: 'fit',
      image: undefined,
      stats: {},
      radarData: [],
      overallRating: 0,
    }
    onAdd(player)
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('squad.addManualPlayer', 'Add Player')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit as unknown as () => void}
            disabled={!name.trim()}
          >
            {t('squad.addManualPlayer', 'Add Player')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[90vh] overflow-y-auto">
        <Input
          id="manual-player-name"
          label={`${t('common.player')} *`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t('squad.playerNamePlaceholder', 'e.g. John Smith')}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="manual-player-position" className="text-[0.8125rem] font-medium tracking-[0.02em] text-on-surface-variant block mb-1.5">{t('common.position')}</label>
            <select
              id="manual-player-position"
              value={position}
              onChange={(e) => setPosition(e.target.value as SquadPosition)}
              className="w-full h-11 min-h-[44px] px-3 bg-surface-container border border-outline-variant rounded-md text-base md:text-[0.875rem] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              {ALL_POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
          <Input
            id="manual-player-number"
            label={t('squad.number')}
            type="number"
            value={shirtNumber}
            onChange={(e) => setShirtNumber(e.target.value)}
            min={0}
            max={99}
            placeholder="0"
          />
        </div>
        <Input
          id="manual-player-nationality"
          label={t('common.nationality', 'Nationality')}
          type="text"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder={t('squad.nationalityPlaceholder', 'e.g. Switzerland')}
        />
        <Input
          id="manual-player-birthdate"
          label={t('squad.setBirthDate', 'Date of Birth')}
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </form>
    </Modal>
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
