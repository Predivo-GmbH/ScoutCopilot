import { useState, useMemo, useCallback } from 'react'
import { useParams, useLocation, Navigate } from 'react-router-dom'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Star,
  GitCompareArrows,
  FileDown,
  CircleDot,
  TrendingUp,
  TrendingDown,
  Zap,
  X,
  FileText,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { AddToWatchlistModal } from '../../components/shared/AddToWatchlistModal'
import { usePlayerReport } from './hooks/usePlayerReport'
import { useGeneratedReports } from '../../lib/useGeneratedReportsHook'
import { supabase } from '../../lib/supabase'
import { formatAge } from '../../lib/ageUtils'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../lib/usePlayerPhotoFetch'
import { usePlayerPhotoUpload } from '../../lib/usePlayerPhotoUpload'
import type { MockWatchlistPlayer, WatchlistAlert } from '../../lib/mock-data'

export function ReportPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useLocalizedNavigate()
  const location = useLocation()
  const { data: report, isLoading, error } = usePlayerReport(id)
  const { generateReport, isGenerating, hasReport, generationError, clearGenerationError } = useGeneratedReports()
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)
  const [showAlertBanner, setShowAlertBanner] = useState(true)
  const alertContext = (location.state as { alert?: WatchlistAlert } | null)?.alert

  // Check if the player exists in sb_players (for sb-open-* IDs without a report)
  const isSbOpen = id?.startsWith('sb-open-') ?? false
  const isApiFb = id?.startsWith('apifb-') ?? false
  const sbNumericId = isSbOpen ? parseInt(id!.replace('sb-open-', ''), 10) : NaN
  const { data: sbPlayerInfo, isLoading: sbPlayerLoading } = useQuery({
    queryKey: ['sb-player-info', id],
    queryFn: async () => {
      const { data } = await (supabase
        .from('sb_players' as never)
        .select('player_name, player_nickname, nationality, primary_position, photo_url, birth_date')
        .eq('player_id', sbNumericId)
        .maybeSingle() as unknown as Promise<{ data: { player_name: string; player_nickname: string | null; nationality: string | null; primary_position: string | null; photo_url: string | null; birth_date: string | null } | null }>)
      return data
    },
    enabled: isSbOpen && !isNaN(sbNumericId) && !report && !isLoading,
    staleTime: 5 * 60 * 1000,
  })

  // For apifb-* players, look up info from squad_players table
  const { data: apiFbPlayerInfo, isLoading: apiFbPlayerLoading } = useQuery({
    queryKey: ['apifb-player-info', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('squad_players')
        .select('player_name, position_key, player_data')
        .eq('player_external_id', id!)
        .limit(1)
        .maybeSingle()
      if (!data) return null
      const pd = (data.player_data ?? {}) as Record<string, unknown>
      return {
        player_name: data.player_name as string,
        player_nickname: null as string | null,
        nationality: (pd.nationality as string) || null,
        primary_position: (data.position_key as string) || (pd.position as string) || null,
        photo_url: (pd.image as string) || null,
        birth_date: null as string | null,
        age: (pd.age as number) || null,
      }
    },
    enabled: isApiFb && !report && !isLoading,
    staleTime: 5 * 60 * 1000,
  })

  // Unified player info — sb-open or apifb
  const playerInfo = sbPlayerInfo ?? apiFbPlayerInfo
  const playerInfoLoading = sbPlayerLoading || apiFbPlayerLoading

  // Player name from navigation state (used as display fallback, NOT for auto-generation)
  const similarPlayerName = (location.state as { playerName?: string } | null)?.playerName

  // On-demand photo fetching for main player
  const mainPhotoPlayers = useMemo(
    () => id ? [{ id, image: report?.image }] : [],
    [id, report?.image],
  )
  const { getPhoto: getMainPhoto, loadingIds: mainLoadingIds } = usePlayerPhotoFetch(mainPhotoPlayers)

  // Photo upload
  const { upload: uploadPlayerPhoto, uploading: playerPhotoUploading } = usePlayerPhotoUpload()
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const handleUploadPhoto = useCallback(async (file: File) => {
    if (!id) return
    const result = await uploadPlayerPhoto(id, file)
    if (result.url) setUploadedPhotoUrl(result.url)
  }, [id, uploadPlayerPhoto])

  // On-demand photo fetching for similar players without images
  const similarPhotoPlayers = useMemo(
    () => (report?.similarPlayers ?? []).map((sp) => ({
      id: sp.playerId ?? '',
      image: sp.image,
    })).filter((p) => p.id),
    [report?.similarPlayers],
  )
  const { getPhoto: getSimilarPhoto, loadingIds: similarLoadingIds } = usePlayerPhotoFetch(similarPhotoPlayers)

  if (!id) return <Navigate to="/players" replace />

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="h-32 bg-surface-container-low rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
          <div className="md:col-span-6 space-y-6">
            <div className="h-64 bg-surface-container-low rounded-md animate-pulse" />
            <div className="h-48 bg-surface-container-low rounded-md animate-pulse" />
          </div>
          <div className="md:col-span-4 space-y-6">
            <div className="h-48 bg-surface-container-low rounded-md animate-pulse" />
            <div className="h-64 bg-surface-container-low rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    const generating = isGenerating(id)
    // Determine if the player exists: for sb-open-* IDs, check sbPlayerInfo
    const playerExists = (isSbOpen || isApiFb) ? playerInfo !== null && playerInfo !== undefined : true
    const playerNotFound = (isSbOpen || isApiFb) && !playerInfoLoading && !playerExists && !generating
    // Resolve player display name from state or player info query
    const playerDisplayName = similarPlayerName || (playerInfo ? (playerInfo.player_nickname || playerInfo.player_name) : null)

    return (
      <div className="p-4 sm:p-6">
        {/* Generation error banner */}
        {generationError && (
          <div className="mb-6 rounded-md p-4 border bg-error/10 border-error/30 flex items-center gap-3">
            <AlertTriangle size={16} strokeWidth={1.5} className="text-error shrink-0" />
            <p className="text-sm text-error flex-1">{generationError}</p>
            <button onClick={clearGenerationError} aria-label={t('common.dismiss')} className="text-error hover:text-on-surface transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Player info card when player exists but has no report yet */}
        {!playerNotFound && !generating && playerInfo && (
          <div className="bg-surface-container rounded-md p-4 sm:p-6 border border-outline-variant mb-6 flex items-center gap-4 sm:gap-6">
            <PlayerAvatar name={playerDisplayName ?? ''} size={64} imageUrl={uploadedPhotoUrl ?? playerInfo.photo_url ?? undefined} onUploadPhoto={handleUploadPhoto} uploadingPhoto={playerPhotoUploading} />
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-on-surface uppercase">{playerDisplayName}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {playerInfo.primary_position && (
                  <span className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-2 py-0.5 rounded-sm">
                    {playerInfo.primary_position}
                  </span>
                )}
                {playerInfo.nationality && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-sm text-on-surface-variant">{playerInfo.nationality}</span>
                  </>
                )}
                {playerInfo.birth_date && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-sm text-on-surface-variant">{t('common.age')}: {formatAge(playerInfo.birth_date)}</span>
                  </>
                )}
                {'age' in playerInfo && (playerInfo as { age?: number | null }).age && !playerInfo.birth_date && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-sm text-on-surface-variant">{t('common.age')}: {(playerInfo as { age: number }).age}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            {generating ? (
              <Loader2 size={32} strokeWidth={1.5} className="text-primary animate-spin" />
            ) : playerNotFound ? (
              <AlertTriangle size={32} strokeWidth={1.5} className="text-error" />
            ) : (
              <FileText size={32} strokeWidth={1.5} className="text-on-surface-variant" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            {generating ? t('report.generating') : playerNotFound ? t('report.playerNotFound', 'Player not found') : t('report.noReportYet')}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {generating ? t('report.generatingDesc') : playerNotFound ? t('report.playerNotFoundDesc', 'This player ID does not exist in the database.') : t('report.noReportDesc')}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>
              {t('common.back')}
            </Button>
            {!generating && !hasReport(id) && !playerNotFound && (
              <Button variant="primary" size="sm" leftIcon={FileText} onClick={() => generateReport(id, playerDisplayName ?? undefined)}>
                {t('report.generateReport')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const recommendation = {
    sign: { label: t('report.recommendSign'), color: 'text-secondary bg-secondary/10 border-secondary/20' },
    monitor: { label: t('report.monitor'), color: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
    pass: { label: t('report.pass'), color: 'text-error bg-error/10 border-error/20' },
  }
  const rec = recommendation[report.recommendation]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Alert Context Banner */}
      {alertContext && showAlertBanner && (
        <div className={`rounded-md p-4 border flex items-center gap-3 ${
          alertContext.changeType === 'warning'
            ? 'bg-warning/10 border-warning/30'
            : alertContext.changeType === 'positive'
            ? 'bg-secondary/10 border-secondary/30'
            : 'bg-surface-container border-outline-variant'
        }`}>
          <Zap size={16} strokeWidth={1.5} className={
            alertContext.changeType === 'warning' ? 'text-warning' :
            alertContext.changeType === 'positive' ? 'text-secondary' : 'text-on-surface-variant'
          } />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">{t('report.watchlistAlert')}</p>
            <p className={`text-sm font-data font-medium ${
              alertContext.changeType === 'warning' ? 'text-warning' :
              alertContext.changeType === 'positive' ? 'text-secondary' : 'text-on-surface'
            }`}>
              {t(alertContext.changeKey, alertContext.changeParams)}
            </p>
            <p className="text-[0.625rem] font-data text-on-surface-variant mt-0.5">{alertContext.timeAgo}</p>
          </div>
          <button onClick={() => setShowAlertBanner(false)} aria-label={t('common.dismiss')} className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Player Header */}
      <div className="bg-surface-container rounded-md p-4 sm:p-6 border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <PlayerAvatar name={report.playerName} size={80} imageUrl={uploadedPhotoUrl ?? getMainPhoto({ id: id!, image: report.image })} clickable loading={mainLoadingIds.has(id!)} aiGenerated={!!getMainPhoto({ id: id!, image: report.image }) && derivePhotoSource(getMainPhoto({ id: id!, image: report.image })) === 'stitch'} onUploadPhoto={handleUploadPhoto} uploadingPhoto={playerPhotoUploading} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-on-surface uppercase">{report.playerName}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-on-surface-variant">{report.club}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              {report.position.split(' / ').map((pos) => (
                <span key={pos} className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-2 py-0.5 rounded-sm">
                  {pos}
                </span>
              ))}
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="text-sm text-on-surface-variant">{t('common.age')}: {formatAge(report.birth_date)}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="text-sm text-on-surface-variant">{report.nationality}</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.color}`}>
                {rec.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Button variant="secondary" size="sm" leftIcon={Star} onClick={() => setWatchlistModalOpen(true)}>{t('report.addToWatchlist')}</Button>
          <Button variant="secondary" size="sm" leftIcon={GitCompareArrows} onClick={() => navigate(`/compare?add=${report.playerId}`)}>{t('report.compare')}</Button>
          <Button variant="primary" size="sm" leftIcon={FileDown} onClick={async () => {
            const { exportPlayerPdf } = await import('../../lib/exportPdf')
            exportPlayerPdf(report)
          }}>{t('report.exportPdf')}</Button>
        </div>
      </div>

      <AddToWatchlistModal
        open={watchlistModalOpen}
        player={reportToWatchlistPlayer(report, t)}
        onClose={() => setWatchlistModalOpen(false)}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Left Column (60%) */}
        <div className="md:col-span-6 space-y-6">
          {/* Radar Chart */}
          <Card header={<SectionLabel>{t('report.performanceProfile')}</SectionLabel>}>
            <div className="flex justify-center py-4">
              <RadarChart data={report.radarData} />
            </div>
          </Card>

          {/* Season Statistics */}
          <Card header={<SectionLabel>{t('report.seasonStats')}</SectionLabel>}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(report.seasonStats).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[0.625rem] text-on-surface-variant uppercase tracking-wider">{key}</span>
                  <span className="text-xl font-data font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Transfer History + Contract */}
          {(report.transferHistory.length > 0 || Object.values(report.contractInfo).some((v) => v !== '-' && v !== '')) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.transferHistory.length > 0 && (
            <Card header={<SectionLabel>{t('report.transferHistory')}</SectionLabel>}>
              <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                {report.transferHistory.map((tr, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-md border-4 border-surface-container ${i === 0 ? 'bg-primary' : 'bg-outline-variant'}`} />
                    <div className="text-sm font-semibold text-on-surface">{tr.club}</div>
                    <div className="text-[0.625rem] text-on-surface-variant">{tr.date} &middot; {tr.fee}</div>
                  </div>
                ))}
              </div>
            </Card>
            )}

            {Object.values(report.contractInfo).some((v) => v !== '-' && v !== '') && (
            <Card header={<SectionLabel>{t('report.contractOverview')}</SectionLabel>}>
              <div className="grid grid-cols-2 gap-y-6">
                {Object.entries(report.contractInfo).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[0.625rem] text-on-surface-variant uppercase tracking-wider mb-1">{key}</div>
                    <div className={`text-sm font-semibold ${key === 'value' || key === 'wage' ? 'font-data' : ''} text-on-surface`}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>
            )}
          </div>
          )}
        </div>

        {/* Right Column (40%) */}
        <div className="md:col-span-4 space-y-6">
          {/* AI Summary */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <CircleDot size={14} strokeWidth={1.5} className="text-primary" />
                <SectionLabel>{t('report.scoutAssessment')}</SectionLabel>
              </div>
            }
          >
            <p className="text-sm leading-relaxed text-on-surface/80">{report.summary}</p>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card header={<SectionLabel>{t('report.strengthsWeaknesses')}</SectionLabel>}>
            <div className="space-y-6">
              <div>
                <h4 className="text-[0.625rem] uppercase tracking-widest text-secondary font-medium mb-3">{t('report.strengths')}</h4>
                <ul className="space-y-2.5">
                  {report.strengths.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-sm text-on-surface">
                      <TrendingUp size={14} strokeWidth={1.5} className="text-secondary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <h4 className="text-[0.625rem] uppercase tracking-widest text-tertiary font-medium mb-3">{t('report.weaknesses')}</h4>
                <ul className="space-y-2.5">
                  {report.weaknesses.map((w) => (
                    <li key={w} className="flex items-center gap-3 text-sm text-on-surface">
                      <TrendingDown size={14} strokeWidth={1.5} className="text-tertiary shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Style of Play */}
          <Card header={<SectionLabel>{t('report.styleOfPlay')}</SectionLabel>}>
            <p className="text-sm leading-relaxed text-on-surface/80">{report.styleOfPlay}</p>
          </Card>

          {/* Similar Players */}
          <Card header={<SectionLabel>{t('report.similarProfiles')}</SectionLabel>}>
            <div className="space-y-3">
              {report.similarPlayers.map((p) => {
                const targetPath = p.playerId ? `/players/${p.playerId}` : undefined
                const handleClick = () => {
                  if (targetPath) {
                    // Navigate to the similar player's report page.
                    // Pass playerName so the report page can auto-generate if no report exists.
                    navigate(targetPath, { state: { playerName: p.name } })
                  }
                }
                const resolvedPhoto = p.playerId
                  ? getSimilarPhoto({ id: p.playerId, image: p.image })
                  : p.image
                const isPhotoLoading = p.playerId ? similarLoadingIds.has(p.playerId) : false
                return (
                  <div
                    key={p.playerId ?? p.name}
                    className={`flex items-center justify-between p-3 bg-surface-container-low rounded-md transition-colors ${targetPath ? 'hover:bg-surface-container-high cursor-pointer' : 'opacity-60'}`}
                    role={targetPath ? 'button' : undefined}
                    tabIndex={targetPath ? 0 : undefined}
                    onClick={handleClick}
                    onKeyDown={(e) => { if (targetPath && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick() } }}
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={p.name} size={40} imageUrl={resolvedPhoto} clickable={!!targetPath} loading={isPhotoLoading} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} />
                      <div>
                        <div className="text-sm font-semibold text-on-surface flex items-center gap-2">
                          {p.name}
                          {p.playerId && hasReport(p.playerId) && (
                            <FileText size={12} strokeWidth={1.5} className="text-secondary" aria-label={t('report.hasReport')} />
                          )}
                        </div>
                        <div className="text-[0.625rem] text-on-surface-variant">{p.club} &middot; {formatAge(p.birth_date) !== '\u2014' ? `${formatAge(p.birth_date)}y` : '\u2014'}</div>
                      </div>
                    </div>
                    <div className="font-data text-sm text-primary font-semibold">{p.similarity}%</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────

function reportToWatchlistPlayer(r: { playerId: string; playerName: string; club: string; position: string; age: number; nationality: string; image?: string; fitScore: number }, t: (key: string) => string): MockWatchlistPlayer {
  return {
    id: r.playerId,
    name: r.playerName,
    club: r.club,
    position: r.position,
    age: r.age,
    nationality: r.nationality,
    image: r.image,
    keyMetric: { value: String(r.fitScore), label: t('common.fitScore') },
    alertStatus: 'stable',
    addedDate: new Date().toISOString().split('T')[0],
    scoutScore: r.fitScore,
  }
}

// ─── Sub-components ────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">
      {children}
    </span>
  )
}

function RadarChart({ data }: { data: { label: string; value: number; average: number }[] }) {
  const size = 256
  const center = size / 2
  const maxRadius = size / 2 - 30
  const sides = data.length

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2
    const radius = (value / 100) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  function polygon(values: number[], className: string) {
    const points = values.map((v, i) => {
      const p = getPoint(i, v)
      return `${p.x},${p.y}`
    }).join(' ')
    return <polygon points={points} className={className} />
  }

  const gridLevels = [25, 50, 75, 100]

  return (
    <div className="w-full max-w-[256px] mx-auto aspect-square relative overflow-hidden">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" aria-hidden="true">
        {/* Grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={Array.from({ length: sides }).map((_, i) => {
              const p = getPoint(i, level)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke="var(--color-outline-variant)"
            strokeOpacity={0.3}
          />
        ))}
        {/* Axes */}
        {data.map((_, i) => {
          const p = getPoint(i, 100)
          return (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="var(--color-outline-variant)" strokeOpacity={0.15} />
          )
        })}
        {/* Average */}
        {polygon(data.map((d) => d.average), 'fill-outline-variant/10 stroke-outline-variant stroke-1')}
        {/* Player */}
        {polygon(data.map((d) => d.value), 'fill-primary/30 stroke-primary stroke-2')}
      </svg>
      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, 115)
        return (
          <span
            key={d.label}
            className="absolute text-[0.625rem] uppercase tracking-tight text-on-surface-variant whitespace-nowrap"
            style={{
              left: `${(p.x / size) * 100}%`,
              top: `${(p.y / size) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {d.label}
          </span>
        )
      })}
    </div>
  )
}
