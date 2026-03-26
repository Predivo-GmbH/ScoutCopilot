import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  Star,
  GitCompareArrows,
  FileDown,
  CircleDot,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { AddToWatchlistModal } from '../../components/shared/AddToWatchlistModal'
import { usePlayerReport } from './hooks/usePlayerReport'
import { exportPlayerPdf } from '../../lib/exportPdf'
import type { MockWatchlistPlayer } from '../../lib/mock-data'

export function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading } = usePlayerReport(id)
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)

  if (!id) return <Navigate to="/players" replace />

  if (isLoading || !report) {
    return (
      <div className="p-6 space-y-6">
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

  const recommendation = {
    sign: { label: 'RECOMMEND SIGN', color: 'text-secondary bg-secondary/10 border-secondary/20' },
    monitor: { label: 'MONITOR', color: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
    pass: { label: 'PASS', color: 'text-error bg-error/10 border-error/20' },
  }
  const rec = recommendation[report.recommendation]

  return (
    <div className="p-6 space-y-6">
      {/* Player Header */}
      <div className="bg-surface-container rounded-md p-6 border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6">
          <PlayerAvatar name={report.playerName} size={80} imageUrl={report.image} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-on-surface uppercase">{report.playerName}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-on-surface-variant">{report.club}</span>
              <span className="w-1 h-1 rounded-md bg-outline-variant" />
              {report.position.split(' / ').map((pos) => (
                <span key={pos} className="text-[0.625rem] font-data bg-surface-container-highest text-on-surface px-2 py-0.5 rounded-sm">
                  {pos}
                </span>
              ))}
              <span className="w-1 h-1 rounded-md bg-outline-variant" />
              <span className="text-sm text-on-surface-variant">Age: {report.age}</span>
              <span className="w-1 h-1 rounded-md bg-outline-variant" />
              <span className="text-sm text-on-surface-variant">{report.nationality}</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.color}`}>
                {rec.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" leftIcon={Star} onClick={() => setWatchlistModalOpen(true)}>Add to Watchlist</Button>
          <Button variant="secondary" size="sm" leftIcon={GitCompareArrows} onClick={() => navigate(`/compare?add=${report.playerId}`)}>Compare</Button>
          <Button variant="primary" size="sm" leftIcon={FileDown} onClick={() => exportPlayerPdf(report)}>Export PDF</Button>
        </div>
      </div>

      <AddToWatchlistModal
        open={watchlistModalOpen}
        player={reportToWatchlistPlayer(report)}
        onClose={() => setWatchlistModalOpen(false)}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Left Column (60%) */}
        <div className="md:col-span-6 space-y-6">
          {/* Radar Chart */}
          <Card header={<SectionLabel>Performance Profile</SectionLabel>}>
            <div className="flex justify-center py-4">
              <RadarChart data={report.radarData} />
            </div>
          </Card>

          {/* Season Statistics */}
          <Card header={<SectionLabel>Season Statistics</SectionLabel>}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card header={<SectionLabel>Transfer History</SectionLabel>}>
              <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                {report.transferHistory.map((t, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-md border-4 border-surface-container ${i === 0 ? 'bg-primary' : 'bg-outline-variant'}`} />
                    <div className="text-sm font-semibold text-on-surface">{t.club}</div>
                    <div className="text-[0.625rem] text-on-surface-variant">{t.date} &middot; {t.fee}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<SectionLabel>Contract Overview</SectionLabel>}>
              <div className="grid grid-cols-2 gap-y-6">
                {Object.entries(report.contractInfo).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[0.625rem] text-on-surface-variant uppercase tracking-wider mb-1">{key}</div>
                    <div className={`text-sm font-semibold ${key === 'value' || key === 'wage' ? 'font-data' : ''} text-on-surface`}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="md:col-span-4 space-y-6">
          {/* AI Summary */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <CircleDot size={14} strokeWidth={1.5} className="text-primary" />
                <SectionLabel>Scout Assessment</SectionLabel>
              </div>
            }
          >
            <p className="text-sm leading-relaxed text-on-surface/80">{report.summary}</p>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card header={<SectionLabel>Strengths & Weaknesses</SectionLabel>}>
            <div className="space-y-6">
              <div>
                <h4 className="text-[0.625rem] uppercase tracking-widest text-secondary font-medium mb-3">Strengths</h4>
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
                <h4 className="text-[0.625rem] uppercase tracking-widest text-tertiary font-medium mb-3">Weaknesses</h4>
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
          <Card header={<SectionLabel>Style of Play</SectionLabel>}>
            <p className="text-sm leading-relaxed text-on-surface/80">{report.styleOfPlay}</p>
          </Card>

          {/* Similar Players */}
          <Card header={<SectionLabel>Similar Profiles</SectionLabel>}>
            <div className="space-y-3">
              {report.similarPlayers.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-md hover:bg-surface-container-high transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/players/${p.playerId}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${p.playerId}`); } }}
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={p.name} size={40} imageUrl={p.image} />
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{p.name}</div>
                      <div className="text-[0.625rem] text-on-surface-variant">{p.club} &middot; {p.age}y</div>
                    </div>
                  </div>
                  <div className="font-data text-sm text-primary font-semibold">{p.similarity}%</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────

function reportToWatchlistPlayer(r: { playerId: string; playerName: string; club: string; position: string; age: number; nationality: string; image?: string; fitScore: number }): MockWatchlistPlayer {
  return {
    id: r.playerId,
    name: r.playerName,
    club: r.club,
    position: r.position,
    age: r.age,
    nationality: r.nationality,
    image: r.image,
    keyMetric: { value: String(r.fitScore), label: 'Fit Score' },
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
    <div className="relative" style={{ width: size, height: size }}>
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
