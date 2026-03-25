import { Zap } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useComparison } from './hooks/useComparison'
import { ComparisonTable } from './components/ComparisonTable'
import { PlayerSelector } from './components/PlayerSelector'
import { dotColors } from './constants'

export function ComparisonPage() {
  const { players, tacticalContext, setTacticalContext, isLoading } = useComparison()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Compare Players</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Side-by-side statistical comparison with AI analysis.</p>
        </div>
      </div>

      {/* Player Selection */}
      <PlayerSelector
        players={players}
        maxPlayers={4}
        onRemove={() => {}}
      />

      {/* Tactical Context */}
      <div>
        <label className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant block mb-1.5">
          Tactical Context (optional)
        </label>
        <input
          type="text"
          value={tacticalContext}
          onChange={(e) => setTacticalContext(e.target.value)}
          placeholder="e.g., Compare for a 4-3-3 high-press system"
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-96 bg-surface-container-low rounded-md animate-pulse" />
          <div className="h-64 bg-surface-container-low rounded-md animate-pulse" />
        </div>
      ) : players.length >= 2 ? (
        <>
          {/* Radar + AI Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Chart */}
            <div className="lg:col-span-8">
              <Card header={
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant block">Performance Matrix</span>
                    <span className="text-sm font-semibold text-on-surface">Tactical Radar</span>
                  </div>
                  <div className="flex gap-4">
                    {players.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-md ${dotColors[i]}`} />
                        <span className="text-[0.625rem] font-data uppercase text-on-surface-variant">{p.name.split(' ').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }>
                <div className="flex items-center justify-center py-6">
                  <ComparisonRadar players={players} />
                </div>
              </Card>
            </div>

            {/* AI Verdict */}
            <div className="lg:col-span-4">
              <Card header={
                <div className="flex items-center gap-2">
                  <Zap size={14} strokeWidth={1.5} className="text-tertiary" />
                  <span className="text-sm font-semibold uppercase tracking-tight text-on-surface">AI Verdict</span>
                </div>
              }>
                <div className="space-y-4">
                  <p className="text-sm text-on-surface/80 leading-relaxed">
                    Comparison reveals <span className="text-secondary font-semibold">{players[1]?.name}</span> maintains a higher efficiency in transitional phases (+12% progressive carries).
                  </p>
                  <p className="text-sm text-on-surface/80 leading-relaxed">
                    However, <span className="text-primary font-semibold">{players[0]?.name}</span> provides significantly more value in high-intensity defensive actions and direct goal threat from wider zones.
                  </p>
                  <div className="bg-surface-container-high p-4 rounded-md border-l-4 border-tertiary">
                    <span className="text-[0.625rem] font-data text-tertiary font-semibold block mb-1">STRATEGIC FIT</span>
                    <p className="text-xs text-on-surface-variant">
                      For a high-press system (Gegenpressing), {players[0]?.name.split(' ').pop()} shows 88% compatibility vs 72% for {players[1]?.name.split(' ').pop()}.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Comparison Table */}
          <ComparisonTable players={players} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-on-surface-variant">Select at least 2 players to compare.</p>
        </div>
      )}
    </div>
  )
}

// ─── Radar Chart ───────────────────────────────────────────

function ComparisonRadar({ players }: { players: { name: string; radarData: { label: string; value: number }[] }[] }) {
  const size = 340
  const center = size / 2
  const maxRadius = size / 2 - 40
  const sides = players[0]?.radarData.length ?? 6

  const strokeColors = ['#2563EB', '#10B981', '#F59E0B', '#C3C6D7']
  const fillColors = ['rgba(37,99,235,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)', 'rgba(195,198,215,0.1)']

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2
    const radius = (value / 100) * maxRadius
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
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
            stroke="#434655"
            strokeDasharray="4"
            strokeWidth={1}
          />
        ))}
        {/* Axes */}
        {Array.from({ length: sides }).map((_, i) => {
          const p = getPoint(i, 100)
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#434655" strokeWidth={1} />
        })}
        {/* Player polygons */}
        {players.map((player, pi) => {
          const points = player.radarData.map((d, i) => {
            const p = getPoint(i, d.value)
            return `${p.x},${p.y}`
          }).join(' ')
          return (
            <polygon
              key={pi}
              points={points}
              fill={fillColors[pi]}
              stroke={strokeColors[pi]}
              strokeWidth={2}
            />
          )
        })}
        {/* Labels */}
        {players[0]?.radarData.map((d, i) => {
          const p = getPoint(i, 115)
          return (
            <text
              key={d.label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#C3C6D7"
              fontFamily="JetBrains Mono"
              fontSize={10}
            >
              {d.label.toUpperCase()}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
