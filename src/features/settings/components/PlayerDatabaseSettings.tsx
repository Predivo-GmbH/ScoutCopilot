import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, UserPlus, Check, Plus, AlertCircle, Loader2, ArrowUpDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'
import { useSquad } from '../../squad/hooks/useSquad'
import { calculateAge, formatAge } from '../../../lib/ageUtils'
import type { SquadPlayer, SquadPosition } from '../../../lib/mock-data/types'

const PAGE_SIZE = 50

interface SbPlayer {
  id: number
  player_id: number
  player_name: string
  player_nickname: string | null
  nationality: string
  jersey_number: number | null
  primary_position: string
  positions: string[]
  photo_url: string | null
  birth_date: string | null
}

type SortField = 'player_name' | 'nationality' | 'primary_position' | 'birth_date'
type SortDir = 'asc' | 'desc'

function mapSbPlayerToSquad(player: SbPlayer): SquadPlayer {
  const posMap: Record<string, SquadPosition> = {
    'Goalkeeper': 'GK', 'GK': 'GK',
    'Center Back': 'CB', 'CB': 'CB',
    'Left Back': 'LB', 'LB': 'LB',
    'Right Back': 'RB', 'RB': 'RB',
    'Left Wing Back': 'LB', 'Right Wing Back': 'RB',
    'Defensive Midfield': 'CDM', 'CDM': 'CDM',
    'Center Midfield': 'CM', 'CM': 'CM',
    'Left Midfield': 'CM', 'Right Midfield': 'CM',
    'Center Attacking Midfield': 'CAM', 'CAM': 'CAM',
    'Left Wing': 'LW', 'LW': 'LW',
    'Right Wing': 'RW', 'RW': 'RW',
    'Center Forward': 'ST', 'ST': 'ST',
    'Striker': 'ST',
  }
  const pos = posMap[player.primary_position] ?? 'CM'
  return {
    id: `sb-open-${player.player_id}`,
    name: player.player_nickname ?? player.player_name,
    age: calculateAge(player.birth_date) ?? 0,
    birth_date: player.birth_date ?? undefined,
    nationality: player.nationality,
    position: pos,
    shirtNumber: player.jersey_number ?? 0,
    contractUntil: '',
    weeklyWage: '',
    marketValue: '',
    status: 'fit',
    image: player.photo_url ?? undefined,
    stats: {},
    radarData: [],
    overallRating: 0,
  }
}

export function PlayerDatabaseSettings() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('player_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const { data: players = [], isLoading, error } = useQuery<SbPlayer[]>({
    queryKey: ['sb-players-database'],
    queryFn: async () => {
      // Supabase default limit is 1,000 rows — paginate to fetch all
      const PAGE = 1000
      let allRows: unknown[] = []
      let offset = 0
      let hasMore = true
      while (hasMore) {
        const { data, error } = await supabase
          .from('sb_players' as string)
          .select('*')
          .order('player_name', { ascending: true })
          .range(offset, offset + PAGE - 1)
        if (error) throw error
        if (!data || data.length === 0) { hasMore = false; break }
        allRows = allRows.concat(data)
        if (data.length < PAGE) { hasMore = false; break }
        offset += PAGE
      }
      return allRows as unknown as SbPlayer[]
    },
    staleTime: 5 * 60 * 1000,
  })

  // Filter
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return players
    const term = searchTerm.toLowerCase()
    return players.filter((p) =>
      p.player_name.toLowerCase().includes(term) ||
      (p.player_nickname?.toLowerCase().includes(term)) ||
      p.nationality.toLowerCase().includes(term) ||
      p.primary_position.toLowerCase().includes(term)
    )
  }, [players, searchTerm])

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'player_name':
          cmp = (a.player_nickname ?? a.player_name).localeCompare(b.player_nickname ?? b.player_name)
          break
        case 'nationality':
          cmp = a.nationality.localeCompare(b.nationality)
          break
        case 'primary_position':
          cmp = a.primary_position.localeCompare(b.primary_position)
          break
        case 'birth_date':
          cmp = (a.birth_date ?? '').localeCompare(b.birth_date ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortField, sortDir])

  // Pagination — clamp page to valid range when filter shrinks results
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const effectivePage = Math.min(page, totalPages)
  const paged = sorted.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE)
  const showFrom = sorted.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1
  const showTo = Math.min(effectivePage * PAGE_SIZE, sorted.length)

  // On-demand photo fetching for database players without images
  const photoFetchPlayers = useMemo(
    () => paged.map((p) => ({ id: `sb-open-${p.player_id}`, image: p.photo_url ?? undefined })),
    [paged],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(photoFetchPlayers)

  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
        return field
      }
      setSortDir('asc')
      return field
    })
  }, [])

  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.playerDatabase.heading')}</h2>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('settings.playerDatabase.searchPlaceholder')}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-10 pr-4 py-2.5 text-base md:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
          />
        </div>

        {/* Count */}
        <div className="flex items-center gap-2">
          <span className="font-data text-primary text-lg">{sorted.length}</span>
          <span className="uppercase tracking-widest text-xs text-on-surface-variant">
            {sorted.length === 1 ? t('common.player') : t('common.players')}
          </span>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} strokeWidth={1.5} className="animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-sm text-error py-4">{t('common.error')}: {String(error)}</div>
        )}

        {/* Table (desktop) */}
        {!isLoading && !error && (
          <>
            <div className="hidden md:block overflow-hidden rounded-md border border-outline-variant/30">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-highest border-b border-outline-variant/30">
                    <th className="w-8 px-2 py-3 text-right text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">#</th>
                    <SortHeader field="player_name" label={t('settings.playerDatabase.name')} activeField={sortField} dir={sortDir} onSort={handleSort} />
                    <SortHeader field="nationality" label={t('settings.playerDatabase.nationality')} activeField={sortField} dir={sortDir} onSort={handleSort} />
                    <SortHeader field="primary_position" label={t('common.position')} activeField={sortField} dir={sortDir} onSort={handleSort} />
                    <SortHeader field="birth_date" label={t('settings.playerDatabase.birthDate')} activeField={sortField} dir={sortDir} onSort={handleSort} />
                    <th className="w-10 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                      {t('settings.playerDatabase.addToSquad')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((player, i) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + i
                    const rowBg = globalIndex % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'
                    return (
                      <tr key={player.id} className={`${rowBg} hover:bg-surface-variant/50 transition-colors`}>
                        <td className="px-2 py-2.5 text-[0.625rem] font-data text-on-surface-variant text-right align-middle">{globalIndex + 1}</td>
                        <td className="px-2 py-2.5 align-middle">
                          <div className="flex items-center gap-2 min-w-0">
                            <PlayerAvatar name={player.player_nickname ?? player.player_name} size={32} imageUrl={getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })} clickable loading={loadingIds.has(`sb-open-${player.player_id}`)} aiGenerated={!!(getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })) && derivePhotoSource(getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })) === 'stitch'} />
                            <div className="min-w-0">
                              <span className="font-bold text-on-surface text-[0.8125rem] truncate block">{player.player_nickname ?? player.player_name}</span>
                              {player.player_nickname && player.player_nickname !== player.player_name && (
                                <span className="text-[0.625rem] text-on-surface-variant truncate block">{player.player_name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 align-middle text-xs text-on-surface">{player.nationality}</td>
                        <td className="px-2 py-2.5 align-middle">
                          <div className="flex flex-wrap gap-0.5">
                            {(player.positions.length > 0 ? player.positions : [player.primary_position]).filter(Boolean).filter((p) => p !== 'Unknown').map((pos) => (
                              <span key={pos} className="text-[0.5625rem] font-data bg-surface-container-highest text-on-surface px-1 py-0.5 rounded-sm whitespace-nowrap">{pos}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 align-middle font-data text-xs text-on-surface">
                          {player.birth_date ? (
                            <span title={player.birth_date}>{formatAge(player.birth_date)}</span>
                          ) : (
                            <span className="text-on-surface-variant">{'\u2014'}</span>
                          )}
                        </td>
                        <td className="px-1 py-2.5 text-center align-middle">
                          <DbAddToSquadButton player={player} />
                        </td>
                      </tr>
                    )
                  })}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-on-surface-variant">{t('settings.playerDatabase.noResults')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Card list (mobile) */}
            <div className="md:hidden space-y-3">
              {paged.map((player, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i
                return (
                  <div key={player.id} className="bg-surface-container-low border border-outline-variant rounded-md p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[0.625rem] font-data text-on-surface-variant">{globalIndex + 1}</span>
                      <PlayerAvatar name={player.player_nickname ?? player.player_name} size={32} imageUrl={getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })} clickable loading={loadingIds.has(`sb-open-${player.player_id}`)} aiGenerated={!!(getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })) && derivePhotoSource(getPhoto({ id: `sb-open-${player.player_id}`, image: player.photo_url ?? undefined })) === 'stitch'} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-on-surface text-sm truncate">{player.player_nickname ?? player.player_name}</div>
                        <div className="text-[0.625rem] text-on-surface-variant truncate">{player.nationality}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(player.positions.length > 0 ? player.positions : [player.primary_position]).filter(Boolean).filter((p) => p !== 'Unknown').map((pos) => (
                          <span key={pos} className="text-[0.5625rem] font-data bg-surface-container-highest text-on-surface px-1 py-0.5 rounded-sm">{pos}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[0.5625rem] uppercase tracking-widest text-on-surface-variant">{t('common.age')}</span>
                          <span className="ml-2 font-data text-xs text-on-surface">{formatAge(player.birth_date)}</span>
                        </div>
                      </div>
                      <DbAddToSquadButton player={player} />
                    </div>
                  </div>
                )
              })}
              {paged.length === 0 && (
                <div className="text-center text-sm text-on-surface-variant py-8">{t('settings.playerDatabase.noResults')}</div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-outline-variant/30">
                <span className="text-[0.625rem] font-data font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('settings.playerDatabase.showing', { from: showFrom, to: showTo, total: sorted.length })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('settings.playerDatabase.previousPage')}
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} />
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) => (
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-11 h-11 flex items-center justify-center text-on-surface-variant font-data text-xs">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-11 h-11 flex items-center justify-center rounded-sm font-data text-xs font-bold transition-colors ${
                          page === p
                            ? 'border border-primary-container bg-primary-container/10 text-primary-container'
                            : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('settings.playerDatabase.nextPage')}
                  >
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ── Sort Header ──────────────────────────────────────────────────────────

function SortHeader({ field, label, activeField, dir, onSort }: {
  field: SortField
  label: string
  activeField: SortField
  dir: SortDir
  onSort: (field: SortField) => void
}) {
  const isActive = activeField === field
  return (
    <th className="px-2 py-3 text-left">
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant hover:text-on-surface transition-colors"
      >
        {label}
        {isActive ? (
          dir === 'asc' ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />
        ) : (
          <ArrowUpDown size={10} strokeWidth={1.5} className="opacity-40" />
        )}
      </button>
    </th>
  )
}

// ── Add to Squad Button ──────────────────────────────────────────────────

function DbAddToSquadButton({ player }: { player: SbPlayer }) {
  const { t } = useTranslation()
  const { squads, addPlayer, createSquad } = useSquad()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<'added' | 'exists' | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.right })
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 2000)
    return () => clearTimeout(timer)
  }, [feedback])

  const squadPlayer = useMemo(() => mapSbPlayerToSquad(player), [player])

  const handleSquadSelect = useCallback((squadId: string) => {
    const squad = squads.find((s) => s.id === squadId)
    if (squad?.players.some((p) => p.id === squadPlayer.id)) {
      setFeedback('exists')
      setOpen(false)
      return
    }
    addPlayer(squadId, squadPlayer)
    setFeedback('added')
    setOpen(false)
  }, [squads, squadPlayer, addPlayer])

  const handleCreateNew = useCallback(async () => {
    const newId = await createSquad('New Squad', '')
    addPlayer(newId, squadPlayer)
    setFeedback('added')
    setOpen(false)
  }, [createSquad, addPlayer, squadPlayer])

  if (feedback === 'added') {
    return (
      <span className="inline-flex items-center gap-1 text-secondary text-xs font-medium min-h-[44px]">
        <Check size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">{t('search.addedToSquad')}</span>
      </span>
    )
  }

  if (feedback === 'exists') {
    return (
      <span className="inline-flex items-center gap-1 text-warning text-xs font-medium min-h-[44px]">
        <AlertCircle size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">{t('search.alreadyInSquad')}</span>
      </span>
    )
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="p-1.5 rounded-sm text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        title={t('settings.playerDatabase.addToSquad')}
        aria-label={t('settings.playerDatabase.addToSquad')}
      >
        <UserPlus size={14} strokeWidth={1.5} />
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[100] min-w-[180px] bg-surface-container-high border border-outline-variant rounded-md shadow-lg py-1"
          style={{ top: dropdownPos.top, left: dropdownPos.left, transform: 'translateX(-100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {squads.length === 0 ? (
            <div className="px-3 py-2 text-xs text-on-surface-variant">{t('search.noSquads')}</div>
          ) : (
            squads.map((squad) => (
              <button
                key={squad.id}
                onClick={() => handleSquadSelect(squad.id)}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-variant/50 transition-colors truncate"
              >
                {squad.name}
              </button>
            ))
          )}
          <div className="border-t border-outline-variant/30 mt-1 pt-1">
            <button
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
            >
              <Plus size={12} strokeWidth={1.5} />
              {t('search.createNewSquad')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Pagination helper (same as SearchResultsTable) ───────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
