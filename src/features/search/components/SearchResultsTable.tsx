import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, LayoutGrid, ChevronLeft, ChevronRight, FileText, Loader2, Eye } from 'lucide-react'
import type { MockPlayer } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { useGeneratedReports } from '../../../lib/useGeneratedReportsHook'

const PAGE_SIZE = 8

interface SearchResultsTableProps {
  results: MockPlayer[]
  isLoading: boolean
}

export function SearchResultsTable({ results, isLoading }: SearchResultsTableProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { generateReport, isGenerating, hasReport } = useGeneratedReports()

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
      <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/10">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="font-data text-primary text-lg">{results.length}</span>
          <span className="uppercase tracking-widest text-xs text-on-surface-variant">players found</span>
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Download results">
            <Download size={16} strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Grid view">
            <LayoutGrid size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant">
              <th className="px-6 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant w-8">#</th>
              <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant min-w-[200px]">Player</th>
              <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">Position</th>
              <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">Age</th>
              <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant">League</th>
              {statKeys.map((key) => (
                <th key={key} className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant text-right">
                  {key}
                </th>
              ))}
              <th className="px-6 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant w-48">Match Score</th>
              <th className="px-4 py-4 text-[0.625rem] uppercase tracking-widest font-bold text-on-surface-variant text-center">Report</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {paged.map((player, i) => {
              const globalIndex = (page - 1) * PAGE_SIZE + i
              return (
                <tr
                  key={player.id}
                  onClick={() => navigate(`/players/${player.id}`)}
                  className={`${globalIndex % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} border-b border-outline-variant/30 hover:bg-surface-variant/50 transition-colors cursor-pointer group`}
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
                    {hasReport(player.id) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/players/${player.id}`) }}
                        className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                      >
                        <Eye size={14} strokeWidth={1.5} />
                        View
                      </button>
                    ) : isGenerating(player.id) ? (
                      <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-primary mx-auto" />
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); generateReport(player.id) }}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-light transition-colors text-xs font-medium"
                      >
                        <FileText size={14} strokeWidth={1.5} />
                        Generate
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-surface-container-lowest flex justify-between items-center border-t border-outline-variant/10">
          <span className="text-[0.625rem] font-data font-bold uppercase tracking-widest text-on-surface-variant">
            Showing {showFrom} to {showTo} of {results.length} results
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            {getPageNumbers(page, totalPages).map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-data text-xs">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-sm font-data text-xs font-bold transition-colors ${
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
              className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-sm text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
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

const AI_STEPS = [
  'Querying player database...',
  'Analyzing statistical profiles...',
  'Ranking by fit score...',
  'Compiling results...',
]

function AIThinkingAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = AI_STEPS.map((_, i) =>
      i > 0 ? setTimeout(() => setStep(i), i * 700) : null,
    )
    return () => timers.forEach((t) => t && clearTimeout(t))
  }, [])

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
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
  const color = score >= 80 ? 'bg-secondary' : score >= 60 ? 'bg-amber-500' : 'bg-error'
  const textColor = score >= 80 ? 'text-secondary' : score >= 60 ? 'text-amber-500' : 'text-error'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-data text-[0.625rem] font-medium min-w-[2rem] text-right ${textColor}`}>{score}%</span>
    </div>
  )
}
