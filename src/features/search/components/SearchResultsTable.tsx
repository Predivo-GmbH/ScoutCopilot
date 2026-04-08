import { useState, useEffect, useMemo, Fragment } from 'react'
import { useLocalizedNavigate } from '../../../components/shared/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { Download, LayoutGrid, LayoutList, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, Loader2, Eye, Search as SearchIcon } from 'lucide-react'
import type { MockPlayer } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { useGeneratedReports } from '../../../lib/useGeneratedReportsHook'
import { formatAge } from '../../../lib/ageUtils'

const PAGE_SIZE = 8

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Reset page when results change (React-recommended pattern)
  if (prevResultsLen !== results.length) {
    setPrevResultsLen(results.length)
    if (page !== 1) setPage(1)
  }

  if (isLoading) {
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
  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const showFrom = (page - 1) * PAGE_SIZE + 1
  const showTo = Math.min(page * PAGE_SIZE, results.length)

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
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
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 bg-surface-container-highest border-b border-outline-variant/30">
                <th className="w-8 px-1 py-3 text-right text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">#</th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                  {t('csv.name')}
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant" title={t('search.statTooltips.position')}>
                  {t('csv.position')}
                </th>
                <th className="w-10 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant" title={t('search.statTooltips.age')}>
                  {t('common.age')}
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                  {t('common.club')}
                </th>
                <th className="px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant" title={t('search.statTooltips.league')}>
                  {t('common.league')}
                </th>
                {allStatKeys.map((key) => (
                  <th key={key} className="w-16 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant whitespace-nowrap cursor-help" title={t(`search.statTooltips.${key}`, key)}>
                    {key}
                  </th>
                ))}
                <th className="w-24 px-2 py-3 text-left text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                  {t('search.matchScore')}
                </th>
                <th className="w-16 px-1 py-3 text-center text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant">
                  {t('common.report')}
                </th>
                <th className="w-8 px-1 py-3" />
              </tr>
            </thead>
            <tbody>
              {paged.map((player, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i
                const rowBg = globalIndex % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'
                const isExpanded = expandedRows.has(player.id)
                const totalCols = 10 + allStatKeys.length
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
                        <div className="flex items-center gap-2 min-w-0">
                          <PlayerAvatarWithFlag name={player.name} nationality={player.nationality} imageUrl={player.image} photoSource={player.photoSource} loading={photoLoadingIds?.has(player.id)} />
                          <span className="font-bold text-on-surface text-[0.8125rem] truncate">{player.name}</span>
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
                        <span className="truncate block max-w-[7rem]">{player.club}</span>
                      </td>
                      <td className="px-2 py-2.5 align-middle text-xs text-on-surface">
                        <span className="truncate block max-w-[7rem]">{player.league}</span>
                      </td>
                      {allStatKeys.map((key) => (
                        <td key={key} className="px-1 py-2.5 text-center align-middle font-data text-xs text-on-surface" title={t(`search.statTooltips.${key}`, key)}>
                          {player.stats[key] ?? '\u2014'}
                        </td>
                      ))}
                      <td className="px-2 py-2.5 align-middle">
                        <FitScoreBar score={player.fitScore} />
                      </td>
                      <td className="px-1 py-2.5 text-center align-middle">
                        <ReportButton playerId={player.id} hasReport={hasReport} isGenerating={isGenerating} generateReport={generateReport} navigate={navigate} />
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
                            <h4 className="text-[0.5625rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2">{t('search.allStats')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-2">
                              {allStatKeys.map((key) => (
                                <div key={key} className="flex items-baseline justify-between gap-2" title={t(`search.statTooltips.${key}`, key)}>
                                  <span className="text-[0.5625rem] uppercase tracking-widest text-on-surface-variant font-bold cursor-help whitespace-nowrap">{key}</span>
                                  <span className="font-data text-xs text-on-surface font-medium">{player.stats[key] ?? '\u2014'}</span>
                                </div>
                              ))}
                            </div>
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
                    <StatRow key={key} label={key} value={String(player.stats[key])} />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <FitScoreBar score={player.fitScore} />
                  <ReportButton playerId={player.id} hasReport={hasReport} isGenerating={isGenerating} generateReport={generateReport} navigate={navigate} />
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
              className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
              className="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
  photoSource?: 'sportsdb' | 'stitch'
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
