import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FormationType, SquadPlayer } from '../../../lib/mock-data'
import { formations } from '../../../lib/mock-data'

interface FormationPitchProps {
  formation: FormationType
  players: SquadPlayer[]
}

export function FormationPitch({ formation, players }: FormationPitchProps) {
  const { t } = useTranslation()
  const slots = formations[formation]
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Map positions to best-rated available player
  const assigned = new Set<string>()
  const slotPlayers = slots.map((slot) => {
    const candidates = players
      .filter((p) => p.position === slot.position && p.status !== 'on_loan' && !assigned.has(p.id))
      .sort((a, b) => b.overallRating - a.overallRating)
    const pick = candidates[0] ?? null
    if (pick) assigned.add(pick.id)
    return { slot, player: pick }
  })

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: '55%' }}>
        {/* Pitch background */}
        <div className="absolute inset-0 bg-emerald-900/20 dark:bg-emerald-900/30 overflow-hidden">
          {/* Pitch markings */}
          <div className="absolute inset-[4%] border border-emerald-600/30 rounded-sm" />
          <div className="absolute left-1/2 top-[4%] bottom-[4%] w-px bg-emerald-600/30" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-600/30 rounded-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-600/30 rounded-full" />
          {/* Goal areas */}
          <div className="absolute left-[30%] right-[30%] bottom-[4%] h-[12%] border-t border-l border-r border-emerald-600/30" />
          <div className="absolute left-[30%] right-[30%] top-[4%] h-[12%] border-b border-l border-r border-emerald-600/30" />
        </div>

        {/* Player dots */}
        {slotPlayers.map(({ slot, player }, i) => {
          const isEmpty = !player
          const isInjured = player?.status === 'injured'
          const isHovered = player && hoveredId === player.id

          return (
            <div
              key={`${slot.position}-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
              style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
              onMouseEnter={() => player && setHoveredId(player.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform ${
                  isEmpty
                    ? 'bg-error/20 border-error/40 text-error'
                    : isInjured
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                    : 'bg-secondary/20 border-secondary/40 text-secondary'
                } ${isHovered ? 'scale-125' : ''}`}
              >
                {player ? player.shirtNumber : '?'}
              </div>
              <span className={`text-[0.5625rem] font-data font-semibold tracking-tight text-center leading-tight max-w-[5rem] truncate ${
                isEmpty ? 'text-error' : 'text-on-surface'
              }`}>
                {player ? player.name.split(' ').pop() : slot.label}
              </span>
              {isHovered && player && (
                <div className="absolute -top-12 bg-surface-container-low border border-outline-variant rounded-md px-2 py-1 shadow-lg whitespace-nowrap z-20">
                  <p className="text-[0.625rem] font-semibold text-on-surface">{player.name}</p>
                  <p className="text-[0.5rem] text-on-surface-variant">{slot.label} | {t('squad.rating')}: {player.overallRating}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FormationSelector({ value, onChange }: { value: FormationType; onChange: (f: FormationType) => void }) {
  const { t } = useTranslation()
  const options: FormationType[] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1']
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FormationType)}
      aria-label={t('squad.formation')}
      className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 text-xs font-data text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none"
    >
      {options.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  )
}
