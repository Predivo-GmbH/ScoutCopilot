import { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { useLocalizedNavigate } from '../../../components/shared/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { Download, LayoutGrid, LayoutList, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Loader2, Eye, Search as SearchIcon, UserPlus, Check, Plus, AlertCircle, XCircle } from 'lucide-react'
import type { MockPlayer } from '../../../lib/mock-data'
import type { SquadPlayer, SquadPosition } from '../../../lib/mock-data/types'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { useGeneratedReports } from '../../../lib/useGeneratedReportsHook'
import { useSquad } from '../../squad/hooks/useSquad'
import { calculateAge, formatAge } from '../../../lib/ageUtils'

const PAGE_SIZE = 8
const SEARCH_TIMEOUT_MS = 90_000

/** Stat keys shown as table columns by default (fits without horizontal scroll).
 *  These must match the LABEL values produced by STAT_LABELS in usePlayerSearch.ts. */
const PRIMARY_STAT_KEYS = new Set([
  'Apps', 'Mins', 'Goals', 'Assists', 'xG', 'Pass %',
])

/** Stats already arrive with human-readable labels from usePlayerSearch (e.g. 'Apps', 'xG').
 *  formatStatHeader is a pass-through; no mapping needed. */
function formatStatHeader(key: string): string {
  return key
}

interface SearchResultsTableProps {
  results: MockPlayer[]
  isLoading: boolean
  photoLoadingIds?: Set<string>
}

function exportResultsCsv(results: MockPlayer[], t: (key: string) => string) {
  if (results.length === 0) return
  const statKeys = Object.keys(results[0].stats)
  const headers = ['#', t('csv.name'), t('csv.age'), t('csv.nationality'), t('csv.position'), t('csv.club'), t('csv.league'), ...statKeys, t('csv.matchScore')]
  const rows = results.map((p, i) => [
    i + 1,
    p.name,
    formatAge(p.birth_date),
    p.nationality,
    p.position,
    p.club,
    p.league,
    ...statKeys.map((k) => p.stats[k]),
    p.fitScore,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scout-search-results-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function SearchResultsTable({ results, isLoading, photoLoadingIds }: SearchResultsTableProps) {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const [page, setPage] = useState(1)
  const [prevResultsLen, setPrevResultsLen] = useState(results.length)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'grid' : 'table'
  )
  const { generateReport, isGenerating, hasReport } = useGeneratedReports()
  const { squads, addPlayer, createSquad } = useSquad()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTimedOut, setSearchTimedOut] = useState(false)
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading)

  // Reset timeout flag when loading stops (React-recommended render-time pattern)
  if (prevIsLoading && !isLoading) {
    setSearchTimedOut(false)
  }
  if (prevIsLoading !== isLoading) {
    setPrevIsLoading(isLoading)
  }

  // Timeout: after 90s of loading, show error state
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setSearchTimedOut(true), SEARCH_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [isLoading])

  // Reset page when results change (React-recommended pattern)
  if (prevResultsLen !== results.length) {
    setPrevResultsLen(results.length)
    if (page !== 1) setPage(1)
  }

  if (isLoading) {
    if (searchTimedOut) {
      return (
        <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-md bg-error/10 flex items-center justify-center mb-4">
              <XCircle size={32} strokeWidth={1.5} className="text-error" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">{t('search.timeoutTitle', 'Search is taking longer than expected')}</h3>
            <p className="text-sm text-on-surface-variant max-w-md">
              {t('search.timeoutMessage', 'Please try again.')}
            </p>
          </div>
        </div>
      )
    }
    return <AIThinkingAnimation />
  }

  if (results.length === 0) {
    return (
      <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('search.noResults')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {t('search.noResultsSub')}
          </p>
        </div>
      </div>
    )
  }

  const allStatKeys = Object.keys(results[0]?.stats ?? {})
  const primaryStatKeys = [...PRIMARY_STAT_KEYS].filter((k) => allStatKeys.includes(k))
  const secondaryStatKeys = allStatKeys.filter((k) => !PRIMARY_STAT_KEYS.has(k))

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection(key === '_name' || key === '_club' || key === '_league' ? 'asc' : 'desc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return results
    const dir = sortDirection === 'asc' ? 1 : -1
    return [...results].sort((a, b) => {
      let va: string | number, vb: string | number
      switch (sortKey) {
        case '_name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break
        case '_age': va = a.birth_date ? calculateAge(a.birth_date) ?? 0 : a.age; vb = b.birth_date ? calculateAge(b.birth_date) ?? 0 : b.age; break
        case '_club': va = a.club.toLowerCase(); vb = b.club.toLowerCase(); break
        case '_league': va = a.league.toLowerCase(); vb = b.league.toLowerCase(); break
        case '_matchScore': va = a.fitScore; vb = b.fitScore; break
        default: va = a.stats[sortKey] ?? -Infinity; vb = b.stats[sortKey] ?? -Infinity; break
      }
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }, [results, sortKey, sortDirection])

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const showFrom = (page - 1) * PAGE_SIZE + 1
  const showTo = Math.min(page * PAGE_SIZE, results.length)

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-outline-variant/10">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="font-data text-primary text-lg">{results.length}</span>
          <span className="uppercase tracking-widest text-xs text-on-surface-variant">{results.length === 1 ? t('search.playerFound') : t('search.playersFound')}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => exportResultsCsv(results, t)}
            className="p-2 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={t('search.downloadResults')}
            aria-label={t('search.downloadResults')}
          >
            <Download size={16} strokeWidth={1.5} />
          </button>
          <div className="flex items-center bg-surface-container-high rounded-sm border border-outline-variant/30">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'table' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'}`}
              title={t('search.tableView')}
              aria-label={t('search.tableView')}
            >
              <LayoutList size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'grid' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'}`}
              title={t('search.gridView')}
              aria-label={t('search.gridView')}
            >
              <LayoutGrid size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div>
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 bg-surface-container-highest border-b border-outline-variant/30">
                <th className="w-8 px-1 py-3 text-right text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">#</th>
                <th className="min-w-[180px] px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort('_name')}>
                  <span className="inline-flex items-center gap-0.5">
                    {t('csv.name')}
                    <SortIndicator active={sortKey === '_name'} direction={sortDirection} />
                  </span>
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                  <StatTooltip label={t('csv.position')} tooltip={t('search.statTooltips.position')} />
                </th>
                <th className="w-10 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort('_age')}>
                  <span className="inline-flex items-center gap-0.5">
                    <StatTooltip label={t('common.age')} tooltip={t('search.statTooltips.age')} />
                    <SortIndicator active={sortKey === '_age'} direction={sortDirection} />
                  </span>
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort('_club')}>
                  <span className="inline-flex items-center gap-0.5">
                    <StatTooltip label={t('common.club')} tooltip={t('search.statTooltips.club', t('common.club'))} />
                    <SortIndicator active={sortKey === '_club'} direction={sortDirection} />
                  </span>
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort('_league')}>
                  <span className="inline-flex items-center gap-0.5">
                    <StatTooltip label={t('common.league')} tooltip={t('search.statTooltips.league')} />
                    <SortIndicator active={sortKey === '_league'} direction={sortDirection} />
                  </span>
                </th>
                {primaryStatKeys.map((key) => (
                  <th key={key} className="w-16 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant whitespace-nowrap cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort(key)}>
                    <span className="inline-flex items-center gap-0.5">
                      <StatTooltip label={formatStatHeader(key)} tooltip={t(`search.statTooltips.${key}`, key)} />
                      <SortIndicator active={sortKey === key} direction={sortDirection} />
                    </span>
                  </th>
                ))}
                <th className="w-24 px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant whitespace-nowrap cursor-pointer select-none hover:text-on-surface transition-colors" onClick={() => handleSort('_matchScore')}>
                  <span className="inline-flex items-center gap-0.5">
                    {t('search.matchScore')}
                    <SortIndicator active={sortKey === '_matchScore'} direction={sortDirection} />
                  </span>
                </th>
                <th className="w-12 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant" title={t('common.report')}>
                  <FileText size={12} strokeWidth={1.5} className="mx-auto text-on-surface-variant" />
                </th>
                <th className="w-12 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant" title={t('search.addToSquad')}>
                  <UserPlus size={12} strokeWidth={1.5} className="mx-auto text-on-surface-variant" />
                </th>
                <th className="w-8 px-1 py-3" />
              </tr>
            </thead>
            <tbody>
              {paged.map((player, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i
                const rowBg = globalIndex % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'
                const isExpanded = expandedRows.has(player.id)
                const totalCols = 11 + primaryStatKeys.length
                return (
                  <Fragment key={player.id}>
                    <tr
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/players/${player.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${player.id}`) } }}
                      className={`${rowBg} hover:bg-surface-variant/50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
                    >
                      <td className="px-1 py-2.5 text-[0.625rem] font-data text-on-surface-variant text-right align-middle">
                        {globalIndex + 1}
                      </td>
                      <td className="px-2 py-2.5 align-middle">
                        <div className="flex items-center gap-2 min-w-0 max-w-[220px]">
                          <PlayerAvatarWithFlag name={player.name} nationality={player.nationality} imageUrl={player.image} photoSource={player.photoSource} loading={photoLoadingIds?.has(player.id)} />
                          <span className="font-bold text-on-surface text-[0.8125rem] truncate" title={player.name}>{player.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 align-middle">
                        <div className="flex flex-wrap gap-0.5">
                          {player.position.split(', ').map((pos) => (
                            <span key={pos} className="text-[0.5625rem] font-data bg-surface-container-highest text-on-surface px-1 py-0.5 rounded-sm whitespace-nowrap">
                              {pos}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-1 py-2.5 text-center align-middle font-data text-xs text-on-surface">
                        {formatAge(player.birth_date)}
                      </td>
                      <td className="px-2 py-2.5 align-middle text-xs text-on-surface">
                        <span className="truncate block max-w-[10rem]" title={player.club}>{player.club}</span>
                      </td>
                      <td className="px-2 py-2.5 align-middle text-xs text-on-surface">
                        <span className="truncate block max-w-[10rem]">{player.league}</span>
                      </td>
                      {primaryStatKeys.map((key) => (
                        <td key={key} className="px-1 py-2.5 text-center align-middle font-data text-xs text-on-surface">
                          {player.stats[key] ?? '\u2014'}
                        </td>
                      ))}
                      <td className="px-2 py-2.5 align-middle">
                        <FitScoreBar score={player.fitScore} />
                      </td>
                      <td className="px-1 py-2.5 text-center align-middle">
                        <ReportButton playerId={player.id} hasReport={hasReport} isGenerating={isGenerating} generateReport={generateReport} navigate={navigate} />
                      </td>
                      <td className="px-1 py-2.5 text-center align-middle">
                        <AddToSquadButton player={player} squads={squads} addPlayer={addPlayer} createSquad={createSquad} />
                      </td>
                      <td className="px-1 py-2.5 align-middle">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedRows((prev) => {
                              const next = new Set(prev)
                              if (next.has(player.id)) next.delete(player.id)
                              else next.add(player.id)
                              return next
                            })
                          }}
                          className="p-1 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                          aria-label={isExpanded ? t('search.collapseDetails') : t('search.expandDetails')}
                        >
                          {isExpanded ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className={rowBg}>
                        <td colSpan={totalCols} className="px-6 pb-4 pt-2">
                          <div className="border-t border-outline-variant/20 pt-3">
                            {secondaryStatKeys.length > 0 && (
                              <>
                                <h4 className="text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2">{t('search.detailedStats', 'Detailed Stats')}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-2">
                                  {secondaryStatKeys.map((key) => (
                                    <div key={key} className="flex items-baseline justify-between gap-2">
                                      <span className="text-[0.5625rem] uppercase tracking-widest text-on-surface-variant font-bold whitespace-nowrap">
                                        <StatTooltip label={formatStatHeader(key)} tooltip={t(`search.statTooltips.${key}`, key)} />
                                      </span>
                                      <span className="font-data text-xs text-on-surface font-medium">{player.stats[key] ?? '\u2014'}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map((player, i) => {
            const globalIndex = (page - 1) * PAGE_SIZE + i
            return (
              <div
                key={player.id}
                role="button"
                tabIndex={0}
                aria-label={`${t('common.player')}: ${player.name}`}
                onClick={() => navigate(`/players/${player.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${player.id}`) } }}
                className="bg-surface-container-low border border-outline-variant rounded-md p-4 hover:border-primary/30 hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[0.625rem] font-data text-on-surface-variant">{globalIndex + 1}</span>
                  <PlayerAvatarWithFlag name={player.name} nationality={player.nationality} imageUrl={player.image} photoSource={player.photoSource} loading={photoLoadingIds?.has(player.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-on-surface text-sm truncate">{player.name}</div>
                    <div className="text-[0.625rem] text-on-surface-variant truncate">{player.club} &middot; {player.nationality}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {player.position.split(', ').map((pos) => (
                      <span key={pos} className="text-[0.5625rem] font-data bg-surface-container-highest text-on-surface px-1 py-0.5 rounded-sm">
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                  <StatRow label={t('common.age')} value={formatAge(player.birth_date)} />
                  <StatRow label={t('common.league')} value={player.league} />
                  {allStatKeys.map((key) => (
                    <StatRow key={key} label={formatStatHeader(key)} value={player.stats[key] != null ? String(player.stats[key]) : '\u2014'} />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <FitScoreBar score={player.fitScore} />
                  <div className="flex items-center gap-2">
                    <AddToSquadButton player={player} squads={squads} addPlayer={addPlayer} createSquad={createSquad} />
                    <ReportButton playerId={player.id} hasReport={hasReport} isGenerating={isGenerating} generateReport={generateReport} navigate={navigate} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 bg-surface-container-lowest flex flex-wrap justify-between items-center gap-3 border-t border-outline-variant/10">
          <span className="text-[0.625rem] font-data font-bold uppercase tracking-widest text-on-surface-variant">
            {t('search.showingResults', { from: showFrom, to: showTo, total: results.length })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('search.previousPage', 'Previous page')}
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
              className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('search.nextPage', 'Next page')}
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SortIndicator({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) return <ChevronDown size={10} strokeWidth={1.5} className="opacity-0 group-hover:opacity-30" />
  return direction === 'asc'
    ? <ChevronUp size={10} strokeWidth={1.5} className="text-primary" />
    : <ChevronDown size={10} strokeWidth={1.5} className="text-primary" />
}

/** Hover tooltip for stat column headers — shows full description on hover */
function StatTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLSpanElement>(null)

  const handleEnter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 })
    }
    setShow(true)
  }, [])

  // Don't show tooltip if label equals tooltip (no extra info)
  if (label === tooltip) {
    return <span>{label}</span>
  }

  return (
    <>
      <span
        ref={ref}
        className="cursor-help border-b border-dotted border-on-surface-variant/30"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        onFocus={handleEnter}
        onBlur={() => setShow(false)}
        tabIndex={0}
      >
        {label}
      </span>
      {show && createPortal(
        <div
          className="fixed z-[100] max-w-[220px] px-3 py-2 text-xs text-on-surface bg-surface-container-highest border border-outline-variant rounded-md shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
        >
          <div className="font-bold text-[0.625rem] uppercase tracking-widest text-primary mb-0.5">{label}</div>
          <div className="text-on-surface-variant leading-snug">{tooltip}</div>
        </div>,
        document.body
      )}
    </>
  )
}

function ReportButton({ playerId, hasReport, isGenerating, generateReport, navigate }: {
  playerId: string
  hasReport: (id: string) => boolean
  isGenerating: (id: string) => boolean
  generateReport: (id: string) => void
  navigate: (path: string) => void
}) {
  const { t } = useTranslation()
  if (hasReport(playerId)) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/players/${playerId}`) }}
        className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium min-h-[44px]"
      >
        <Eye size={14} strokeWidth={1.5} />
        {t('common.view')}
      </button>
    )
  }
  if (isGenerating(playerId)) {
    return <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-primary mx-auto" />
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); generateReport(playerId) }}
      className="inline-flex items-center gap-1.5 text-primary hover:text-primary-light transition-colors text-xs font-medium min-h-[44px]"
    >
      <FileText size={14} strokeWidth={1.5} />
      {t('common.generate')}
    </button>
  )
}

function mapPlayerToSquad(player: MockPlayer): SquadPlayer {
  const primaryPos = player.position.split(', ')[0] as SquadPosition
  return {
    id: player.id,
    name: player.name,
    age: calculateAge(player.birth_date) ?? player.age,
    birth_date: player.birth_date,
    nationality: player.nationality,
    position: primaryPos,
    shirtNumber: 0,
    contractUntil: '',
    weeklyWage: '',
    marketValue: '',
    status: 'fit',
    image: player.image,
    stats: player.stats,
    radarData: [],
    overallRating: player.fitScore,
  }
}

function AddToSquadButton({ player, squads, addPlayer, createSquad }: {
  player: MockPlayer
  squads: { id: string; name: string; players: SquadPlayer[] }[]
  addPlayer: (squadId: string, player: SquadPlayer, positionKey?: string) => void
  createSquad: (name: string, description: string) => Promise<string>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<'added' | 'exists' | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  // Position dropdown via portal when opening
  useEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    // Position below the button, right-aligned
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.right,
    })
  }, [open])

  // Close on click outside
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

  // Auto-clear feedback
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 2000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleSquadSelect = useCallback((squadId: string) => {
    const squad = squads.find((s) => s.id === squadId)
    if (squad?.players.some((p) => p.id === player.id)) {
      setFeedback('exists')
      setOpen(false)
      return
    }
    addPlayer(squadId, mapPlayerToSquad(player))
    setFeedback('added')
    setOpen(false)
  }, [squads, player, addPlayer])

  const handleCreateNew = useCallback(async () => {
    const newId = await createSquad('New Squad', '')
    addPlayer(newId, mapPlayerToSquad(player))
    setFeedback('added')
    setOpen(false)
  }, [createSquad, addPlayer, player])

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
        title={t('search.addToSquad')}
        aria-label={t('search.addToSquad')}
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

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[0.5625rem] uppercase tracking-widest text-on-surface-variant">{label}</span>
      <span className="font-data text-xs text-on-surface">{value}</span>
    </div>
  )
}

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

function PlayerAvatarWithFlag({ name, nationality, imageUrl, photoSource, loading }: {
  name: string
  nationality: string
  imageUrl?: string
  photoSource?: 'sportsdb' | 'api-football' | 'stitch'
  loading?: boolean
}) {
  const flagEmoji = countryToFlag(nationality)

  return (
    <div className="relative">
      <PlayerAvatar
        name={name}
        size={32}
        imageUrl={imageUrl}
        clickable
        loading={loading}
        aiGenerated={photoSource === 'stitch'}
      />
      {flagEmoji && !loading && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[0.5rem] leading-none" title={nationality} aria-hidden="true">
          {flagEmoji}
        </span>
      )}
    </div>
  )
}

const FLAG_MAP: Record<string, string> = {
  Sweden: '\u{1F1F8}\u{1F1EA}',
  Italy: '\u{1F1EE}\u{1F1F9}',
  Spain: '\u{1F1EA}\u{1F1F8}',
  Portugal: '\u{1F1F5}\u{1F1F9}',
  France: '\u{1F1EB}\u{1F1F7}',
  Hungary: '\u{1F1ED}\u{1F1FA}',
  Algeria: '\u{1F1E9}\u{1F1FF}',
  Netherlands: '\u{1F1F3}\u{1F1F1}',
  Argentina: '\u{1F1E6}\u{1F1F7}',
  Turkey: '\u{1F1F9}\u{1F1F7}',
  Ghana: '\u{1F1EC}\u{1F1ED}',
  Denmark: '\u{1F1E9}\u{1F1F0}',
  Senegal: '\u{1F1F8}\u{1F1F3}',
  Germany: '\u{1F1E9}\u{1F1EA}',
  England: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  Brazil: '\u{1F1E7}\u{1F1F7}',
}

function countryToFlag(country: string): string | null {
  return FLAG_MAP[country] ?? null
}

function AIThinkingAnimation() {
  const { t } = useTranslation()
  const AI_STEPS = useMemo(() => [
    t('search.aiSteps.querying'),
    t('search.aiSteps.analyzing'),
    t('search.aiSteps.ranking'),
    t('search.aiSteps.compiling'),
  ], [t])

  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = AI_STEPS.map((_, i) =>
      i > 0 ? setTimeout(() => setStep(i), i * 700) : null,
    )
    return () => timers.forEach((timer) => timer && clearTimeout(timer))
  }, [AI_STEPS])

  return (
    <div role="status" aria-live="polite" className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Loader2 size={32} strokeWidth={1.5} className="animate-spin text-primary mb-6" />
        <div className="space-y-3 w-full max-w-xs">
          {AI_STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-0'}`}
            >
              {i < step ? (
                <span className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xs shrink-0">&#10003;</span>
              ) : i === step ? (
                <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </span>
              ) : (
                <span className="w-5 h-5 shrink-0" />
              )}
              <span className={`text-sm ${i < step ? 'text-on-surface-variant' : i === step ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FitScoreBar({ score }: { score: number }) {
  const { t } = useTranslation()
  const color = score >= 80 ? 'bg-secondary' : score >= 60 ? 'bg-warning' : 'bg-error'
  const textColor = score >= 80 ? 'text-secondary' : score >= 60 ? 'text-warning' : 'text-error'

  return (
    <div className="flex items-center gap-3" title={t('search.fitScoreTooltip')}>
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-data text-[0.625rem] font-medium min-w-[2rem] text-right ${textColor}`}>{score}%</span>
    </div>
  )
}
