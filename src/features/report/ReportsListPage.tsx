import { useState, useMemo, useCallback } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search as SearchIcon, FileText, Trash2, Flag, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { supabase } from '../../lib/supabase'
import { formatAge } from '../../lib/ageUtils'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../lib/usePlayerPhotoFetch'

interface ReportListItem {
  playerId: string
  playerName: string
  age: number | null
  birth_date?: string
  nationality: string
  position: string
  club: string
  isNationalTeam: boolean
  league: string
  image?: string
  fitScore: number
  recommendation: 'sign' | 'monitor' | 'pass'
}

function mapRecommendation(raw: unknown): 'sign' | 'monitor' | 'pass' {
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase()
    if (lower.includes('sign')) return 'sign'
    if (lower.includes('pass') || lower.includes('avoid')) return 'pass'
  }
  return 'monitor'
}

function mapDbRowToListItem(row: {
  player_external_id: string
  player_name: string
  report_data: Record<string, unknown>
}): ReportListItem {
  const rd = row.report_data ?? {}

  // Extract player metadata from report_data (stored by the edge function from playerStats)
  const playerData = rd as Record<string, unknown>

  return {
    playerId: row.player_external_id,
    playerName: row.player_name,
    age: typeof playerData.age === 'number' ? playerData.age : null,
    birth_date: (playerData.birth_date as string) ?? undefined,
    nationality: (playerData.nationality as string) ?? '',
    position: (playerData.position as string) ?? '',
    club: (playerData.team as string) ?? (playerData.club as string) ?? '',
    isNationalTeam: playerData.is_national_team === true,
    league: (playerData.league as string) ?? '',
    image: playerData.image as string | undefined,
    fitScore: typeof playerData.fit_score === 'number' ? playerData.fit_score : 0,
    recommendation: mapRecommendation(rd.recommendation),
  }
}

function ClubDisplay({ club, isNationalTeam }: { club: string; isNationalTeam: boolean }) {
  const { t } = useTranslation()
  if (!club || club === 'Unknown') return <span className="text-on-surface-variant/50">—</span>

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="truncate max-w-[160px]">{club}</span>
      {isNationalTeam && (
        <span
          className="inline-flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 rounded-sm text-[0.5rem] font-data font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary border border-tertiary/20"
          title={t('reportsList.nationalTeam')}
        >
          <Flag size={8} strokeWidth={2} />
          {t('reportsList.nationalTeamShort')}
        </span>
      )}
    </span>
  )
}

export function ReportsListPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()
  const queryClient = useQueryClient()

  const recommendation = {
    sign: { label: t('reportsList.badgeSign'), className: 'text-secondary bg-secondary/10 border-secondary/20' },
    monitor: { label: t('reportsList.badgeMonitor'), className: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
    pass: { label: t('reportsList.badgePass'), className: 'text-error bg-error/10 border-error/20' },
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'name' | 'age' | 'position' | 'fitScore' | 'recommendation'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = useCallback((key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'fitScore' ? 'desc' : 'asc')
    }
  }, [sortKey])

  const { data: reports = [] } = useQuery({
    queryKey: ['player-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_reports')
        .select('player_external_id, player_name, report_data')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapDbRowToListItem)
    },
  })

  // Filtered and sorted reports
  const filteredReports = useMemo(() => {
    const term = searchQuery.toLowerCase().trim()
    let result = reports
    if (term) {
      result = result.filter((r) =>
        r.playerName.toLowerCase().includes(term) ||
        r.club.toLowerCase().includes(term) ||
        r.nationality.toLowerCase().includes(term) ||
        r.position.toLowerCase().includes(term)
      )
    }

    const recOrder = { sign: 0, monitor: 1, pass: 2 }
    const dir = sortDir === 'asc' ? 1 : -1

    return [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.playerName.localeCompare(b.playerName)
          break
        case 'age': {
          const ageA = a.birth_date ? formatAge(a.birth_date) : '\u2014'
          const ageB = b.birth_date ? formatAge(b.birth_date) : '\u2014'
          const numA = ageA === '\u2014' ? 999 : parseInt(ageA, 10)
          const numB = ageB === '\u2014' ? 999 : parseInt(ageB, 10)
          cmp = numA - numB
          break
        }
        case 'position':
          cmp = a.position.localeCompare(b.position)
          break
        case 'fitScore':
          cmp = a.fitScore - b.fitScore
          break
        case 'recommendation':
          cmp = (recOrder[a.recommendation] ?? 1) - (recOrder[b.recommendation] ?? 1)
          break
      }
      return cmp * dir
    })
  }, [reports, searchQuery, sortKey, sortDir])

  // On-demand photo fetching for report players without images
  const photoFetchPlayers = useMemo(
    () => reports.map((r) => ({ id: r.playerId, image: r.image })),
    [reports],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(photoFetchPlayers)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    await supabase
      .from('player_reports')
      .delete()
      .eq('player_external_id', deleteTarget.id)
    queryClient.invalidateQueries({ queryKey: ['player-reports'] })
    setDeleteTarget(null)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('reportsList.heading')}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('reportsList.scoutedCount', { count: reports.length })}
        </p>
      </div>

      {/* Search input */}
      {reports.length > 0 && (
        <div className="relative">
          <SearchIcon size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('reportsList.searchPlaceholder', 'Search by name, club, nationality...')}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
          />
        </div>
      )}

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('reportsList.noPlayersYet')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {t('reportsList.noPlayersSub')}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            {t('reportsList.startSearch')}
          </button>
        </div>
      ) : (
        <>
        {/* Mobile card layout */}
        <div className="block sm:hidden space-y-3">
          {filteredReports.map((report) => {
            const rec = recommendation[report.recommendation]
            const resolvedPhoto = getPhoto({ id: report.playerId, image: report.image })
            return (
              <div
                key={report.playerId}
                onClick={() => navigate(`/players/${report.playerId}`)}
                className="bg-surface-container rounded-md border border-outline-variant p-4 space-y-3 cursor-pointer active:bg-surface-container-high transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={report.playerName} size={40} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(report.playerId)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate">{report.playerName}</p>
                    <p className="text-[0.625rem] text-on-surface-variant font-data flex items-center gap-1">
                      <span>{report.nationality}</span>
                      <span>|</span>
                      <ClubDisplay club={report.club} isNationalTeam={report.isNationalTeam} />
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border shrink-0 ${rec.className}`}>
                    {rec.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('common.position')}</p>
                    <p className="font-data text-sm text-on-surface-variant">{report.position}</p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('common.age')}</p>
                    <p className="font-data text-sm">{formatAge(report.birth_date)}</p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('reportsList.fitScore')}</p>
                    <p className="text-primary font-data font-semibold text-sm">{report.fitScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-outline-variant">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={FileText}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/players/${report.playerId}`)
                    }}
                  >
                    {t('common.report')}
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget({ id: report.playerId, name: report.playerName })
                    }}
                    className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={t('reportsList.removePlayer')}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table layout */}
        <div className="hidden sm:block bg-surface-container rounded-md overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <SortableHeader label={t('common.player')} sortKey="name" currentKey={sortKey} direction={sortDir} onSort={handleSort} className="px-6 py-3" />
                <th className="px-4 py-3 text-center">{t('common.club')}</th>
                <SortableHeader label={t('common.position')} sortKey="position" currentKey={sortKey} direction={sortDir} onSort={handleSort} className="px-4 py-3 text-center" />
                <SortableHeader label={t('common.age')} sortKey="age" currentKey={sortKey} direction={sortDir} onSort={handleSort} className="px-4 py-3 text-center" />
                <SortableHeader label={t('reportsList.fitScore')} sortKey="fitScore" currentKey={sortKey} direction={sortDir} onSort={handleSort} className="px-4 py-3 text-center" />
                <SortableHeader label={t('reportsList.recommendation')} sortKey="recommendation" currentKey={sortKey} direction={sortDir} onSort={handleSort} className="px-4 py-3 text-center" />
                <th className="px-4 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredReports.map((report, i) => {
                const rec = recommendation[report.recommendation]
                const resolvedPhoto = getPhoto({ id: report.playerId, image: report.image })
                return (
                  <tr
                    key={report.playerId}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/players/${report.playerId}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${report.playerId}`) } }}
                    className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={report.playerName} size={40} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(report.playerId)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} />
                        <div>
                          <p className="font-semibold text-on-surface">{report.playerName}</p>
                          <p className="text-[0.625rem] text-on-surface-variant font-data">
                            {report.nationality} | {t('reportsList.score')} {report.fitScore}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-on-surface">
                      <ClubDisplay club={report.club} isNationalTeam={report.isNationalTeam} />
                    </td>
                    <td className="px-4 py-4 text-center font-data text-on-surface-variant">{report.position}</td>
                    <td className="px-4 py-4 text-center font-data">{formatAge(report.birth_date)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-primary font-data font-semibold">{report.fitScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.className}`}>
                        {rec.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={FileText}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/players/${report.playerId}`)
                          }}
                        >
                          {t('common.report')}
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: report.playerId, name: report.playerName })
                          }}
                          className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={t('reportsList.removePlayer')}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
        {/* No search results */}
        {filteredReports.length === 0 && searchQuery.trim() !== '' && (
          <div className="text-center py-12">
            <p className="text-sm text-on-surface-variant">{t('reportsList.noSearchResults', 'No players match your search.')}</p>
          </div>
        )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('reportsList.removePlayer')}
        message={t('reportsList.removeConfirm', { name: deleteTarget?.name ?? 'this player' })}
        confirmLabel={t('reportsList.removeBtn')}
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

type SortKey = 'name' | 'age' | 'position' | 'fitScore' | 'recommendation'

function SortableHeader({ label, sortKey, currentKey, direction, onSort, className }: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  direction: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = sortKey === currentKey
  return (
    <th
      className={`${className ?? ''} cursor-pointer select-none hover:text-on-surface transition-colors`}
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          direction === 'asc' ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />
        ) : (
          <span className="w-3" />
        )}
      </span>
    </th>
  )
}
