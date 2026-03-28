import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, LayoutGrid, LayoutList, ChevronLeft, ChevronRight, FileText, Loader2, Eye } from 'lucide-react'
import type { MockPlayer } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { useGeneratedReports } from '../../../lib/useGeneratedReportsHook'

const PAGE_SIZE = 8

interface SearchResultsTableProps {
  results: MockPlayer[]
  isLoading: boolean
}

function exportResultsCsv(results: MockPlayer[], t: (key: string) => string) {
  if (results.length === 0) return
  const statKeys = Object.keys(results[0].stats)
  const headers = ['#', t('csv.name'), t('csv.age'), t('csv.nationality'), t('csv.position'), t('csv.club'), t('csv.league'), ...statKeys, t('csv.matchScore')]
  const rows = results.map((p, i) => [
    i + 1,
    p.name,
    p.age,
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

export function SearchResultsTable({ results, isLoading }: SearchResultsTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [prevResultsLen, setPrevResultsLen] = useState(results.length)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'grid' : 'table'
  )
  const { generateReport, isGenerating, hasReport } = useGeneratedReports()

  // Reset page when results change (React-recommended pattern)
  if (prevResultsLen !== results.length) {
    setPrevResultsLen(results.length)
    if (page !== 1) setPage(1)
  }

  if (isLoading) {
    return <AIThinkingAnimation />
  }

  if (results.length === 0) {
    return null
  }

  const statKeys = Object.keys(results[0]?.stats ?? {})
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
          <span className="uppercase tracking-widest text-xs text-on-surface-variant">{t('search.playersFound')}</span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant w-8">#</th>
                <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant min-w-[200px]">{t('common.player')}</th>
                <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">{t('common.position')}</th>
                <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">{t('common.age')}</th>
                <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">{t('common.league')}</th>
                {statKeys.map((key) => (
                  <th key={key} className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant text-right">
                    {key}
                  </th>
                ))}
                <th className="px-6 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant w-48">{t('search.matchScore')}</th>
                <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant text-center">{t('common.report')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paged.map((player, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i
                return (
                  <tr
                    key={player.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/players/${player.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${player.id}`) } }}
                    className={`${globalIndex % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} border-b border-outline-variant/30 hover:bg-surface-variant/50 transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
                  >
                    <td className="px-6 py-4 font-data text-on-surface-variant text-xs">{globalIndex + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatarWithFlag name={player.name} nationality={player.nationality} imageUrl={player.image} />
                        <div>
                          <div className="font-bold text-on-surface">{player.name}</div>
                          <div className="text-[0.625rem] text-on-surface-variant flex items-center gap-1.5">
                            <span className="uppercase tracking-tight">{player.club}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-outline-variant" />
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {player.position.split(', ').map((pos) => (
                          <span key={pos} className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded-sm">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-data">{player.age}</td>
                    <td className="px-4 py-4 text-on-surface-variant text-xs">{player.league}</td>
                    {statKeys.map((key) => (
                      <td key={key} className="px-4 py-4 font-data text-right text-on-surface-variant">
                        {player.stats[key]}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <FitScoreBar score={player.fitScore} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ReportButton playerId={player.id} hasReport={hasReport} isGenerating={isGenerating} generateReport={generateReport} navigate={navigate} />
                    </td>
                  </tr>
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
                  <PlayerAvatarWithFlag name={player.name} nationality={player.nationality} imageUrl={player.image} />
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
                  <StatRow label={t('common.age')} value={String(player.age)} />
                  <StatRow label={t('common.league')} value={player.league} />
                  {statKeys.map((key) => (
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

function PlayerAvatarWithFlag({ name, nationality, imageUrl }: { name: string; nationality: string; imageUrl?: string }) {
  const flagEmoji = countryToFlag(nationality)

  return (
    <div className="relative">
      <PlayerAvatar name={name} size={32} imageUrl={imageUrl} />
      {flagEmoji && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[0.5rem] leading-none" title={nationality}>
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
  const color = score >= 80 ? 'bg-secondary' : score >= 60 ? 'bg-warning' : 'bg-error'
  const textColor = score >= 80 ? 'text-secondary' : score >= 60 ? 'text-warning' : 'text-error'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-data text-[0.625rem] font-medium min-w-[2rem] text-right ${textColor}`}>{score}%</span>
    </div>
  )
}
