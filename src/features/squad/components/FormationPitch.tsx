import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { FormationType, SquadPlayer } from '../../../lib/mock-data'
import { formations } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'

interface FormationPitchProps {
  formation: FormationType
  players: SquadPlayer[]
}

export function FormationPitch({ formation, players }: FormationPitchProps) {
  const { t } = useTranslation()
  const slots = formations[formation]
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Photo fetching (same pattern as SquadTable)
  const photoFetchPlayers = useMemo(
    () => players.filter(p => p).map((p) => ({ id: p.id, image: p.image })),
    [players],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(photoFetchPlayers)

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
        <div className="absolute inset-0 bg-pitch/20 overflow-hidden">
          {/* Pitch markings */}
          <div className="absolute inset-[4%] border border-pitch-line/30 rounded-sm" />
          <div className="absolute left-1/2 top-[4%] bottom-[4%] w-px bg-pitch-line/30" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-pitch-line/30 rounded-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pitch-line/30 rounded-full" />
          {/* Goal areas */}
          <div className="absolute left-[30%] right-[30%] bottom-[4%] h-[12%] border-t border-l border-r border-pitch-line/30" />
          <div className="absolute left-[30%] right-[30%] top-[4%] h-[12%] border-b border-l border-r border-pitch-line/30" />
        </div>

        {/* Player dots — remap raw 0-100% coords into a safe 8%-92% band so edge players aren't clipped */}
        {slotPlayers.map(({ slot, player }, i) => {
          const isEmpty = !player
          const isInjured = player?.status === 'injured'
          const isHovered = player && hoveredId === player.id
          // Map slot.x from 0-100 into 8-92 range to keep dots + labels inside the container
          const safeX = 8 + (slot.x / 100) * 84
          const safeY = 4 + (slot.y / 100) * 92

          return (
            <div
              key={`${slot.position}-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 sm:gap-1 z-10"
              style={{ left: `${safeX}%`, bottom: `${safeY}%` }}
              onMouseEnter={() => player && setHoveredId(player.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => player && setHoveredId(hoveredId === player.id ? null : player.id)}
            >
              {player ? (
                <div className={`relative ${isHovered ? 'scale-125' : ''} transition-transform`}>
                  <span className="sm:hidden">
                    <PlayerAvatar
                      name={player.name}
                      size={28}
                      imageUrl={getPhoto(player)}
                      clickable
                      loading={loadingIds.has(player.id)}
                      aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                    />
                  </span>
                  <span className="hidden sm:inline-flex">
                    <PlayerAvatar
                      name={player.name}
                      size={36}
                      imageUrl={getPhoto(player)}
                      clickable
                      loading={loadingIds.has(player.id)}
                      aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                    />
                  </span>
                  {/* Status indicator dot */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-container ${
                    isInjured ? 'bg-warning' : 'bg-secondary'
                  }`} />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[0.625rem] sm:text-xs font-bold border-2 bg-error/20 border-error/40 text-error">
                  ?
                </div>
              )}
              <span className={`text-[0.5rem] sm:text-[0.5625rem] font-data font-semibold tracking-tight text-center leading-tight max-w-[3.5rem] sm:max-w-[5rem] truncate ${
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
      className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 text-base md:text-xs font-data text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none min-h-[44px]"
    >
      {options.map((f) => <option key={f} value={f}>{f}</option>)}
    </select>
  )
}
