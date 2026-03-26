import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, GitCompareArrows, Loader2, ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useComparison } from './hooks/useComparison'
import { ComparisonTable } from './components/ComparisonTable'
import { PlayerSelector } from './components/PlayerSelector'
import { dotColors } from './constants'

const GENERATE_STEPS = [
  'Fetching player data...',
  'Computing statistical overlays...',
  'Running tactical fit analysis...',
  'Generating AI verdict...',
]

export function ComparisonPage() {
  const { t } = useTranslation()
  const {
    players,
    selectedPlayers,
    selectedIds,
    availablePlayers,
    tacticalContext,
    setTacticalContext,
    isLoading,
    generated,
    addPlayer,
    removePlayer,
    generate,
  } = useComparison()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('comparison.heading')}</h1>
          <p className="text-on-surface-variant mt-1 text-sm">{t('comparison.subheading')}</p>
        </div>
      </div>

      {/* Player Selection */}
      <PlayerSelector
        selectedPlayers={selectedPlayers}
        availablePlayers={availablePlayers}
        maxPlayers={4}
        onAdd={addPlayer}
        onRemove={removePlayer}
      />

      {/* Tactical Context */}
      <div>
        <label className="text-[0.625rem] uppercase tracking-widest font-medium text-on-surface-variant block mb-1.5">
          {t('comparison.tacticalContext')}
        </label>
        <input
          type="text"
          value={tacticalContext}
          onChange={(e) => setTacticalContext(e.target.value)}
          placeholder={t('comparison.tacticalPlaceholder')}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Generate Button */}
      {selectedIds.length >= 2 && !generated && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            rightIcon={ArrowRight}
            onClick={generate}
            className="px-10"
          >
            {t('comparison.generateComparison')}
          </Button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <GeneratingAnimation />
      ) : generated && players.length >= 2 ? (
        <>
          {/* Radar + AI Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Chart */}
            <div className="lg:col-span-8">
              <Card header={
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant block">{t('comparison.performanceMatrix')}</span>
                    <span className="text-sm font-semibold text-on-surface">{t('comparison.tacticalRadar')}</span>
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
                  <span className="text-sm font-semibold uppercase tracking-tight text-on-surface">{t('comparison.aiVerdict')}</span>
                </div>
              }>
                <div className="space-y-4">
                  <p className="text-sm text-on-surface/80 leading-relaxed">
                    Comparison reveals <span className="text-secondary font-semibold">{players[1]?.name}</span> maintains a higher efficiency in transitional phases (+12% progressive carries).
                  </p>
                  <p className="text-sm text-on-surface/80 leading-relaxed">
                    However, <span className="text-primary font-semibold">{players[0]?.name}</span> provides significantly more value in high-intensity defensive actions and direct goal threat from wider zones.
                  </p>
                  {tacticalContext && (
                    <div className="bg-surface-container-high p-4 rounded-md border-l-4 border-tertiary">
                      <span className="text-[0.625rem] font-data text-tertiary font-semibold block mb-1">{t('comparison.strategicFit')}</span>
                      <p className="text-xs text-on-surface-variant">
                        For the specified tactical context, {players[0]?.name.split(' ').pop()} shows 88% compatibility vs 72% for {players[1]?.name.split(' ').pop()}.
                      </p>
                    </div>
                  )}
                  {!tacticalContext && (
                    <div className="bg-surface-container-high p-4 rounded-md border-l-4 border-tertiary">
                      <span className="text-[0.625rem] font-data text-tertiary font-semibold block mb-1">{t('comparison.strategicFit')}</span>
                      <p className="text-xs text-on-surface-variant">
                        For a high-press system (Gegenpressing), {players[0]?.name.split(' ').pop()} shows 88% compatibility vs 72% for {players[1]?.name.split(' ').pop()}.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Comparison Table */}
          <ComparisonTable players={players} />
        </>
      ) : !generated ? (
        <EmptyState playerCount={selectedIds.length} totalAvailable={selectedPlayers.length + availablePlayers.length} />
      ) : null}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState({ playerCount, totalAvailable }: { playerCount: number; totalAvailable: number }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
        <GitCompareArrows size={32} strokeWidth={1.5} className="text-on-surface-variant" />
      </div>
      {totalAvailable === 0 && playerCount === 0 ? (
        <>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('comparison.noScoutedPlayers')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {t('comparison.noScoutedPlayersSub')}
          </p>
        </>
      ) : playerCount === 0 ? (
        <>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('comparison.addPlayersToCompare')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {t('comparison.addPlayersSub')}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('comparison.addOneMore')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {t('comparison.addOneMoreSub')}
          </p>
        </>
      )}
    </div>
  )
}

// ─── Generating Animation ───────────────────────────────────

function GeneratingAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = GENERATE_STEPS.map((_, i) =>
      i > 0 ? setTimeout(() => setStep(i), i * 500) : null,
    )
    return () => timers.forEach((t) => t && clearTimeout(t))
  }, [])

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Loader2 size={32} strokeWidth={1.5} className="animate-spin text-primary mb-6" />
        <div className="space-y-3 w-full max-w-xs">
          {GENERATE_STEPS.map((label, i) => (
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

// ─── Radar Chart ───────────────────────────────────────────

function ComparisonRadar({ players }: { players: { name: string; radarData: { label: string; value: number }[] }[] }) {
  const size = 340
  const center = size / 2
  const maxRadius = size / 2 - 40
  const sides = players[0]?.radarData.length ?? 6

  const strokeColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)', 'var(--color-on-surface-variant)']
  const fillColors = ['color-mix(in srgb, var(--color-primary) 15%, transparent)', 'color-mix(in srgb, var(--color-secondary) 15%, transparent)', 'color-mix(in srgb, var(--color-tertiary) 15%, transparent)', 'color-mix(in srgb, var(--color-on-surface-variant) 10%, transparent)']

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
            stroke="var(--color-outline-variant)"
            strokeDasharray="4"
            strokeWidth={1}
          />
        ))}
        {/* Axes */}
        {Array.from({ length: sides }).map((_, i) => {
          const p = getPoint(i, 100)
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="var(--color-outline-variant)" strokeWidth={1} />
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
              fill="var(--color-on-surface-variant)"
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
