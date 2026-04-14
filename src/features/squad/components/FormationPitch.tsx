import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, UserMinus, ArrowLeftRight } from 'lucide-react'
import type { FormationType, SquadPlayer } from '../../../lib/mock-data'
import { formations } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'

// ── Slot key helpers ──────────────────────────────────────────────────────

/** Derive the canonical slot key for a formation slot at index i */
function slotKey(position: string, index: number): string {
  return `${position}-${index}`
}

// ── Types ─────────────────────────────────────────────────────────────────

interface FormationPitchProps {
  formation: FormationType
  players: SquadPlayer[]
  squadId?: string
  onAssignSlot?: (squadId: string, playerId: string, slotKey: string) => void
  onRemoveFromSlot?: (squadId: string, playerId: string) => void
}

// ── Slot menu (occupied slot actions) ────────────────────────────────────

interface SlotMenuProps {
  player: SquadPlayer
  slotLabel: string
  onMoveToBench: () => void
  onSwap: () => void
  onClose: () => void
}

function SlotMenu({ player, slotLabel, onMoveToBench, onSwap, onClose }: SlotMenuProps) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use setTimeout to avoid the click that opened the menu from immediately closing it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={t('squad.slotActions', 'Slot actions')}
      className="absolute z-30 top-full mt-1 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant rounded-md shadow-lg min-w-[140px] py-1 overflow-hidden"
    >
      <p className="px-3 py-1.5 text-[0.5rem] uppercase tracking-widest text-on-surface-variant font-medium border-b border-outline-variant mb-1">
        {slotLabel} — {player.name.split(' ').pop()}
      </p>
      <button
        role="menuitem"
        onClick={onMoveToBench}
        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
      >
        <UserMinus size={13} strokeWidth={1.5} className="shrink-0 text-on-surface-variant" />
        {t('squad.moveToBench', 'Move to Bench')}
      </button>
      <button
        role="menuitem"
        onClick={onSwap}
        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-high transition-colors min-h-[44px]"
      >
        <ArrowLeftRight size={13} strokeWidth={1.5} className="shrink-0 text-on-surface-variant" />
        {t('squad.swapPlayer', 'Swap Player')}
      </button>
    </div>
  )
}

// ── Player picker modal ───────────────────────────────────────────────────

interface PlayerPickerProps {
  title: string
  players: SquadPlayer[]
  getPhoto: (p: SquadPlayer) => string | undefined
  loadingIds: Set<string>
  onSelect: (player: SquadPlayer) => void
  onClose: () => void
}

function PlayerPicker({ title, players, getPhoto, loadingIds, onSelect, onClose }: PlayerPickerProps) {
  const { t } = useTranslation()

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60"
      onClick={onClose}
    >
      <div
        className="bg-surface-container border border-outline-variant rounded-md w-full max-w-sm mx-4 p-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            className="text-on-surface-variant hover:text-on-surface min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Player list */}
        {players.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">
            {t('squad.noEligiblePlayers', 'No available players')}
          </p>
        ) : (
          <ul className="overflow-y-auto divide-y divide-outline-variant/40 flex-1" role="listbox">
            {players.map((player) => (
              <li key={player.id} role="option" aria-selected={false}>
                <button
                  onClick={() => onSelect(player)}
                  className="flex items-center gap-3 w-full text-left px-2 py-2.5 hover:bg-surface-container-high transition-colors min-h-[44px] rounded-md"
                >
                  <PlayerAvatar
                    name={player.name}
                    size={32}
                    imageUrl={getPhoto(player)}
                    loading={loadingIds.has(player.id)}
                    aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate">{player.name}</p>
                    <p className="text-[0.625rem] text-on-surface-variant">{player.position}</p>
                  </div>
                  {player.overallRating > 0 && (
                    <span className="text-[0.625rem] font-data font-bold text-primary shrink-0">
                      {player.overallRating}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export function FormationPitch({ formation, players, squadId, onAssignSlot, onRemoveFromSlot }: FormationPitchProps) {
  const { t } = useTranslation()
  const slots = formations[formation]
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openSlotMenu, setOpenSlotMenu] = useState<string | null>(null) // slot key of the open context menu
  const [pickerMode, setPickerMode] = useState<{ slotKey: string; slotLabel: string } | null>(null)
  // Slot refs removed — SlotMenu is rendered as a child of each slot div

  const isInteractive = !!squadId && !!onAssignSlot && !!onRemoveFromSlot

  // Photo fetching (same pattern as SquadTable)
  const photoFetchPlayers = useMemo(
    () => players.filter(p => p).map((p) => ({ id: p.id, image: p.image })),
    [players],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(photoFetchPlayers)

  // ── Determine manual vs auto assignment ──────────────────────────────

  // Check if any player has a lineupSlot set — if so, use manual mode
  const hasManualAssignments = useMemo(
    () => players.some(p => p.lineupSlot != null),
    [players],
  )

  // Build slot → player map from manual assignments
  const manualSlotMap = useMemo(() => {
    const map = new Map<string, SquadPlayer>()
    for (const player of players) {
      if (player.lineupSlot) {
        map.set(player.lineupSlot, player)
      }
    }
    return map
  }, [players])

  // Auto-assign: match position + highest rating (existing logic)
  const autoSlotPlayers = useMemo(() => {
    const assigned = new Set<string>()
    return slots.map((slot, i) => {
      const key = slotKey(slot.position, i)
      const candidates = players
        .filter((p) => p.position === slot.position && p.status !== 'on_loan' && !assigned.has(p.id))
        .sort((a, b) => b.overallRating - a.overallRating)
      const pick = candidates[0] ?? null
      if (pick) assigned.add(pick.id)
      return { slot, player: pick, key }
    })
  }, [slots, players])

  // Final slot array — manual takes priority, falls back to auto
  const slotPlayers = useMemo(() => {
    if (hasManualAssignments) {
      return slots.map((slot, i) => {
        const key = slotKey(slot.position, i)
        return { slot, player: manualSlotMap.get(key) ?? null, key }
      })
    }
    return autoSlotPlayers
  }, [hasManualAssignments, slots, manualSlotMap, autoSlotPlayers])

  // Bench players: not in any slot
  const pitchPlayerIds = useMemo(() => {
    return new Set(slotPlayers.filter(sp => sp.player).map(sp => sp.player!.id))
  }, [slotPlayers])

  const benchPlayers = useMemo(() => {
    return players.filter(p => !pitchPlayerIds.has(p.id) && p.status !== 'on_loan')
  }, [players, pitchPlayerIds])

  // Players available for picker (bench players, sorted by rating desc)
  const pickerPlayers = useMemo(() => {
    return [...benchPlayers].sort((a, b) => b.overallRating - a.overallRating)
  }, [benchPlayers])

  // ── Handlers ─────────────────────────────────────────────────────────

  function handleSlotClick(key: string, player: SquadPlayer | null) {
    if (!isInteractive) return
    if (player) {
      // Toggle slot menu
      setOpenSlotMenu(prev => prev === key ? null : key)
      setPickerMode(null)
    } else {
      // Open player picker
      const slotEntry = slotPlayers.find(sp => sp.key === key)
      setPickerMode({ slotKey: key, slotLabel: slotEntry?.slot.label ?? key })
      setOpenSlotMenu(null)
    }
  }

  function handleMoveToBench(playerId: string) {
    if (!squadId || !onRemoveFromSlot) return
    onRemoveFromSlot(squadId, playerId)
    setOpenSlotMenu(null)
  }

  function handleSwap(key: string, slotLabel: string) {
    // Open picker in swap mode — picking a player assigns them to this slot
    setPickerMode({ slotKey: key, slotLabel })
    setOpenSlotMenu(null)
  }

  function handlePickPlayer(player: SquadPlayer) {
    if (!squadId || !onAssignSlot || !pickerMode) return
    onAssignSlot(squadId, player.id, pickerMode.slotKey)
    setPickerMode(null)
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <>
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

          {/* Player dots */}
          {slotPlayers.map(({ slot, player, key }, i) => {
            const isEmpty = !player
            const isInjured = player?.status === 'injured'
            const isHovered = player && hoveredId === player.id
            const isMenuOpen = openSlotMenu === key
            const safeX = 8 + (slot.x / 100) * 84
            const safeY = 4 + (slot.y / 100) * 92

            return (
              <div
                key={`${slot.position}-${i}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 sm:gap-1 z-10 ${
                  isInteractive ? 'cursor-pointer select-none' : ''
                }`}
                style={{ left: `${safeX}%`, bottom: `${safeY}%` }}
                onMouseEnter={() => player && setHoveredId(player.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSlotClick(key, player)}
              >
                {player ? (
                  <div className={`relative transition-transform ${isInteractive ? 'hover:scale-110 active:scale-95' : ''} ${isMenuOpen ? 'ring-2 ring-primary rounded-full' : ''}`}>
                    <span className="sm:hidden">
                      <PlayerAvatar
                        name={player.name}
                        size={28}
                        imageUrl={getPhoto(player)}
                        loading={loadingIds.has(player.id)}
                        aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                      />
                    </span>
                    <span className="hidden sm:inline-flex">
                      <PlayerAvatar
                        name={player.name}
                        size={36}
                        imageUrl={getPhoto(player)}
                        loading={loadingIds.has(player.id)}
                        aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                      />
                    </span>
                    {/* Status indicator dot */}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-container ${
                      isInjured ? 'bg-warning' : 'bg-secondary'
                    }`} />
                    {/* Slot context menu */}
                    {isMenuOpen && isInteractive && (
                      <SlotMenu
                        player={player}
                        slotLabel={slot.label}
                        onMoveToBench={() => handleMoveToBench(player.id)}
                        onSwap={() => handleSwap(key, slot.label)}
                        onClose={() => setOpenSlotMenu(null)}
                      />
                    )}
                  </div>
                ) : (
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[0.625rem] sm:text-xs font-bold border-2 transition-colors ${
                    isInteractive
                      ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                      : 'bg-error/20 border-error/40 text-error'
                  }`}>
                    {isInteractive ? '+' : '?'}
                  </div>
                )}
                <span className={`text-[0.5rem] sm:text-[0.5625rem] font-data font-semibold tracking-tight text-center leading-tight max-w-[3.5rem] sm:max-w-[5rem] truncate ${
                  isEmpty ? (isInteractive ? 'text-primary/70' : 'text-error') : 'text-on-surface'
                }`}>
                  {player ? player.name.split(' ').pop() : slot.label}
                </span>
                {isHovered && player && !isMenuOpen && (
                  <div className="absolute -top-12 bg-surface-container-low border border-outline-variant rounded-md px-2 py-1 shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    <p className="text-[0.625rem] font-semibold text-on-surface">{player.name}</p>
                    <p className="text-[0.5rem] text-on-surface-variant">{slot.label} | {t('squad.rating')}: {player.overallRating}</p>
                    {isInteractive && (
                      <p className="text-[0.5rem] text-on-surface-variant/70 mt-0.5">{t('squad.clickToManage', 'Click to manage')}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bench strip */}
        {isInteractive && benchPlayers.length > 0 && (
          <div className="border-t border-outline-variant px-3 py-2">
            <p className="text-[0.5rem] uppercase tracking-widest text-on-surface-variant font-medium mb-2">
              {t('squad.bench', 'Bench')} ({benchPlayers.length})
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {benchPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col items-center gap-1 shrink-0 min-w-[3rem]"
                  title={player.name}
                >
                  <div className="relative">
                    <PlayerAvatar
                      name={player.name}
                      size={32}
                      imageUrl={getPhoto(player)}
                      loading={loadingIds.has(player.id)}
                      aiGenerated={!!getPhoto(player) && derivePhotoSource(getPhoto(player)) === 'stitch'}
                    />
                    {player.status === 'injured' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-container bg-warning" />
                    )}
                  </div>
                  <span className="text-[0.5rem] font-data font-medium text-on-surface-variant text-center leading-tight max-w-[3rem] truncate">
                    {player.name.split(' ').pop()}
                  </span>
                  <span className="text-[0.5rem] font-data text-on-surface-variant/60 leading-none">
                    {player.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player picker modal */}
      {pickerMode && (
        <PlayerPicker
          title={t('squad.assignToSlot', 'Assign to {{slot}}', { slot: pickerMode.slotLabel })}
          players={pickerPlayers}
          getPhoto={(p) => getPhoto(p) ?? undefined}
          loadingIds={loadingIds}
          onSelect={handlePickPlayer}
          onClose={() => setPickerMode(null)}
        />
      )}
    </>
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
