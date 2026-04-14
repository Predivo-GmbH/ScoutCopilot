import { useState, useCallback } from 'react'
import { calculateAge } from '../../../lib/ageUtils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/useAuth'
import type { MockSquad, SquadPlayer, FormationType, SquadPosition } from '../../../lib/mock-data'

const SQUADS_KEY = ['squads'] as const

// ── Helpers ──────────────────────────────────────────────────────────────

/** Derive a season string like "2025/26" from today's date */
function currentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  // Football season convention: Aug–Jul → if month >= 7 (Aug), season = year/(year+1)
  const startYear = now.getMonth() >= 7 ? year : year - 1
  return `${startYear}/${String(startYear + 1).slice(2)}`
}

function mapPlayerRow(row: {
  player_external_id: string
  player_name: string
  player_data: Record<string, unknown> | null
  position_key: string | null
}): SquadPlayer {
  const d = (row.player_data ?? {}) as Record<string, unknown>
  // position_key stores either a plain position code (legacy) or a slot key like 'GK-0', 'CB-1'
  // A slot key contains a dash followed by a digit — detect it so we don't use it as a position value
  const isSlotKey = row.position_key ? /^[A-Z]+-\d+$/.test(row.position_key) : false
  const lineupSlot = isSlotKey ? (row.position_key ?? undefined) : undefined
  return {
    id: row.player_external_id,
    name: row.player_name,
    age: calculateAge(d.birth_date as string) ?? (d.age as number) ?? 0,
    birth_date: (d.birth_date as string) ?? undefined,
    nationality: (d.nationality as string) ?? '',
    position: ((d.position ?? (!isSlotKey ? row.position_key : null) ?? 'CM') as SquadPlayer['position']),
    altPositions: (d.altPositions as SquadPlayer['altPositions']) ?? undefined,
    shirtNumber: (d.shirtNumber as number) ?? 0,
    contractUntil: (d.contractUntil as string) ?? '',
    weeklyWage: (d.weeklyWage as string) ?? '',
    marketValue: (d.marketValue as string) ?? '',
    status: (d.status as SquadPlayer['status']) ?? 'fit',
    image: (d.image as string) ?? undefined,
    stats: (d.stats as Record<string, number>) ?? {},
    radarData: (d.radarData as SquadPlayer['radarData']) ?? [],
    overallRating: (d.overallRating as number) ?? 0,
    lineupSlot,
  }
}

/** Map API-Football / sb_players position strings to SquadPosition codes */
const POSITION_MAP: Record<string, SquadPosition> = {
  'Goalkeeper': 'GK',
  'Centre-Back': 'CB',
  'Center Back': 'CB',
  'Left-Back': 'LB',
  'Left Back': 'LB',
  'Right-Back': 'RB',
  'Right Back': 'RB',
  'Defensive Midfield': 'CDM',
  'Defensive Midfielder': 'CDM',
  'Central Midfield': 'CM',
  'Central Midfielder': 'CM',
  'Attacking Midfield': 'CAM',
  'Attacking Midfielder': 'CAM',
  'Left Winger': 'LW',
  'Left Midfield': 'LW',
  'Right Winger': 'RW',
  'Right Midfield': 'RW',
  'Centre-Forward': 'ST',
  'Center Forward': 'ST',
  'Attacker': 'ST',
  'Second Striker': 'ST',
}

/** Valid short position codes that can pass through directly */
const VALID_POSITIONS = new Set<string>(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])

function mapPosition(rawPosition: string | null | undefined): SquadPosition {
  if (!rawPosition || rawPosition === 'Unknown') return 'CM'
  // Already a valid short code? Pass through.
  if (VALID_POSITIONS.has(rawPosition)) return rawPosition as SquadPosition
  return POSITION_MAP[rawPosition] ?? 'CM'
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useSquad() {
  const queryClient = useQueryClient()
  const { profile, organization } = useAuth()
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null)

  // ── Fetch all squads + players ───────────────────────────────────────

  const { data: squads = [], isLoading } = useQuery<MockSquad[]>({
    queryKey: [...SQUADS_KEY, profile?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: rows, error } = await supabase
        .from('squads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!rows || rows.length === 0) return []

      // Fetch all squad_players in a single query
      const squadIds = rows.map((r) => r.id)
      const { data: playerRows, error: playersError } = await supabase
        .from('squad_players')
        .select('*')
        .in('squad_id', squadIds)

      if (playersError) throw playersError

      // Group players by squad_id
      const playersBySquad = new Map<string, SquadPlayer[]>()
      for (const p of playerRows ?? []) {
        const mapped = mapPlayerRow(p as {
          player_external_id: string
          player_name: string
          player_data: Record<string, unknown> | null
          position_key: string | null
        })
        const list = playersBySquad.get(p.squad_id)
        if (list) {
          list.push(mapped)
        } else {
          playersBySquad.set(p.squad_id, [mapped])
        }
      }

      const clubName = organization?.name ?? ''
      const season = currentSeason()

      return rows.map((row) => {
        const players = playersBySquad.get(row.id) ?? []
        return {
          id: row.id,
          name: row.name,
          club: clubName,
          season,
          description: row.description ?? '',
          formation: (row.formation ?? '4-3-3') as FormationType,
          playerCount: players.length,
          lastUpdated: row.updated_at ?? row.created_at,
          players,
        } satisfies MockSquad
      })
    },
    enabled: !!profile?.id,
    staleTime: 30_000,
  })

  const selectedSquad = squads.find((s) => s.id === selectedSquadId) ?? null

  // ── Create squad ─────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const orgId = profile?.organization_id
      if (!orgId) throw new Error('No organization')

      const { data, error } = await supabase
        .from('squads')
        .insert({ name, description, user_id: user.id, organization_id: orgId })
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const createSquad = useCallback(
    async (name: string, description: string): Promise<string> => {
      return createMutation.mutateAsync({ name, description })
    },
    [createMutation],
  )

  // ── Delete squad ─────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (squadId: string) => {
      const { error } = await supabase
        .from('squads')
        .delete()
        .eq('id', squadId)

      if (error) throw error
    },
    onSuccess: () => {
      setSelectedSquadId(null)
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const deleteSquad = useCallback(
    (squadId: string) => {
      deleteMutation.mutate(squadId)
    },
    [deleteMutation],
  )

  // ── Add player to squad ──────────────────────────────────────────────

  const addPlayerMutation = useMutation({
    mutationFn: async ({ squadId, player, positionKey }: {
      squadId: string
      player: SquadPlayer
      positionKey?: string
    }) => {
      // Normalize player ID to include sb-open- prefix for consistency
      const normalizedId = player.id.startsWith('sb-open-') ? player.id : `sb-open-${player.id}`

      const { error } = await supabase
        .from('squad_players')
        .insert({
          squad_id: squadId,
          player_external_id: normalizedId,
          player_name: player.name,
          position_key: positionKey ?? player.position,
          player_data: {
            age: player.age,
            birth_date: player.birth_date,
            nationality: player.nationality,
            position: player.position,
            altPositions: player.altPositions,
            shirtNumber: player.shirtNumber,
            contractUntil: player.contractUntil,
            weeklyWage: player.weeklyWage,
            marketValue: player.marketValue,
            status: player.status,
            image: player.image,
            stats: player.stats,
            radarData: player.radarData,
            overallRating: player.overallRating,
          },
        })

      if (error) throw error

      // Background: generate AI rating if player has stats but no rating
      if (player.overallRating === 0 && player.stats && Object.values(player.stats).some((v) => typeof v === 'number' && v > 0)) {
        const playerDataBase = {
          age: player.age,
          birth_date: player.birth_date,
          nationality: player.nationality,
          position: player.position,
          altPositions: player.altPositions,
          shirtNumber: player.shirtNumber,
          contractUntil: player.contractUntil,
          weeklyWage: player.weeklyWage,
          marketValue: player.marketValue,
          status: player.status,
          image: player.image,
          stats: player.stats,
          radarData: player.radarData,
        }

        // Race the edge function against a 30s timeout
        const ratePromise = supabase.functions
          .invoke('rate-player', {
            body: {
              players: [{
                player_external_id: normalizedId,
                player_name: player.name,
                position: player.position,
                stats: player.stats,
              }],
            },
          })

        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Rating timeout') }), 30_000),
        )

        Promise.race([ratePromise, timeoutPromise])
          .then(({ data, error: fnError }) => {
            const rating = data?.ratings?.[0]
            if (!fnError && rating && rating.rating > 0) {
              // Update the squad_player row with the AI rating
              return supabase
                .from('squad_players')
                .update({
                  player_data: { ...playerDataBase, overallRating: rating.rating, ratingReasoning: rating.reasoning },
                })
                .eq('squad_id', squadId)
                .eq('player_external_id', normalizedId)
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
                })
            }
            // Timeout or no valid rating — clear "Rating..." by writing overallRating: 0
            return supabase
              .from('squad_players')
              .update({
                player_data: { ...playerDataBase, overallRating: 0 },
              })
              .eq('squad_id', squadId)
              .eq('player_external_id', normalizedId)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
              })
          })
          .catch(() => {
            // Final fallback — write rating 0 so UI shows "N/A" instead of "Rating..."
            supabase
              .from('squad_players')
              .update({
                player_data: { ...playerDataBase, overallRating: 0 },
              })
              .eq('squad_id', squadId)
              .eq('player_external_id', normalizedId)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
              })
          })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const addPlayer = useCallback(
    (squadId: string, player: SquadPlayer, positionKey?: string) => {
      addPlayerMutation.mutate({ squadId, player, positionKey })
    },
    [addPlayerMutation],
  )

  // ── Import team players (bulk — from API-Football squad) ─────────────

  interface ApiSquadPlayer {
    id: number
    name: string
    age: number
    number: number | null
    position: string       // Mapped position code (GK, CB, CM, ST)
    positionRaw: string    // Original API-Football string
    photo: string
  }

  const importTeamMutation = useMutation({
    mutationFn: async ({
      squadId,
      players,
      teamName,
      existingPlayerIds,
    }: {
      squadId: string
      players: ApiSquadPlayer[]
      teamName: string
      existingPlayerIds: Set<string>
    }): Promise<{ imported: number; skipped: number }> => {
      if (!players || players.length === 0) return { imported: 0, skipped: 0 }

      // Filter out players already in the squad
      const toInsert = players.filter((p) => {
        const normalizedId = `apifb-${p.id}`
        return !existingPlayerIds.has(normalizedId)
      })

      const skipped = players.length - toInsert.length

      if (toInsert.length === 0) return { imported: 0, skipped }

      // Batch insert all new players
      const rows = toInsert.map((p) => {
        const position = mapPosition(p.position)
        return {
          squad_id: squadId,
          player_external_id: `apifb-${p.id}`,
          player_name: p.name,
          position_key: position,
          player_data: {
            age: p.age,
            nationality: '',
            position,
            image: p.photo,
            shirtNumber: p.number ?? 0,
            contractUntil: '',
            weeklyWage: '',
            marketValue: '',
            status: 'fit' as const,
            stats: {},
            radarData: [],
            overallRating: 0,
            importedFrom: teamName,
            provider: 'api-football',
          },
        }
      })

      const { error } = await supabase.from('squad_players').insert(rows)
      if (error) throw error

      return { imported: toInsert.length, skipped }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const importTeamPlayers = useCallback(
    (squadId: string, players: ApiSquadPlayer[], teamName: string, existingPlayerIds: Set<string>) => {
      return importTeamMutation.mutateAsync({ squadId, players, teamName, existingPlayerIds })
    },
    [importTeamMutation],
  )

  // ── Remove player from squad ─────────────────────────────────────────

  const removePlayerMutation = useMutation({
    mutationFn: async ({ squadId, playerId }: { squadId: string; playerId: string }) => {
      const { error } = await supabase
        .from('squad_players')
        .delete()
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const removePlayer = useCallback(
    (squadId: string, playerId: string) => {
      removePlayerMutation.mutate({ squadId, playerId })
    },
    [removePlayerMutation],
  )

  // ── Assign player to lineup slot ─────────────────────────────────────

  const assignToSlotMutation = useMutation({
    mutationFn: async ({ squadId, playerId, slotKey }: { squadId: string; playerId: string; slotKey: string }) => {
      // First, clear any other player already occupying this slot
      const { error: clearError } = await supabase
        .from('squad_players')
        .update({ position_key: null })
        .eq('squad_id', squadId)
        .eq('position_key', slotKey)

      if (clearError) throw clearError

      // Assign this player to the slot
      const { error } = await supabase
        .from('squad_players')
        .update({ position_key: slotKey })
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const assignToSlot = useCallback(
    (squadId: string, playerId: string, slotKey: string) => {
      assignToSlotMutation.mutate({ squadId, playerId, slotKey })
    },
    [assignToSlotMutation],
  )

  // ── Remove player from lineup slot ───────────────────────────────────

  const removeFromSlotMutation = useMutation({
    mutationFn: async ({ squadId, playerId }: { squadId: string; playerId: string }) => {
      const { error } = await supabase
        .from('squad_players')
        .update({ position_key: null })
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const removeFromSlot = useCallback(
    (squadId: string, playerId: string) => {
      removeFromSlotMutation.mutate({ squadId, playerId })
    },
    [removeFromSlotMutation],
  )

  // ── Update player birth date ────────────────────────────────────────

  const updateBirthDateMutation = useMutation({
    mutationFn: async ({ squadId, playerId, birthDate }: { squadId: string; playerId: string; birthDate: string }) => {
      // First fetch current player_data to merge
      const { data: row, error: fetchError } = await supabase
        .from('squad_players')
        .select('player_data')
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)
        .single()

      if (fetchError) throw fetchError

      const currentData = (row?.player_data ?? {}) as Record<string, unknown>
      const { error } = await supabase
        .from('squad_players')
        .update({ player_data: { ...currentData, birth_date: birthDate } })
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const updatePlayerBirthDate = useCallback(
    (squadId: string, playerId: string, birthDate: string) => {
      updateBirthDateMutation.mutate({ squadId, playerId, birthDate })
    },
    [updateBirthDateMutation],
  )

  // ── Update player position ─────────────────────────────────────────

  const updatePositionMutation = useMutation({
    mutationFn: async ({ squadId, playerId, position }: { squadId: string; playerId: string; position: SquadPosition }) => {
      // Fetch current player_data to merge
      const { data: row, error: fetchError } = await supabase
        .from('squad_players')
        .select('player_data')
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)
        .single()

      if (fetchError) throw fetchError

      const currentData = (row?.player_data ?? {}) as Record<string, unknown>
      const { error } = await supabase
        .from('squad_players')
        .update({
          position_key: position,
          player_data: { ...currentData, position },
        })
        .eq('squad_id', squadId)
        .eq('player_external_id', playerId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const updatePlayerPosition = useCallback(
    (squadId: string, playerId: string, position: SquadPosition) => {
      updatePositionMutation.mutate({ squadId, playerId, position })
    },
    [updatePositionMutation],
  )

  // ── Update formation ─────────────────────────────────────────────────

  const updateFormationMutation = useMutation({
    mutationFn: async ({ squadId, formation }: { squadId: string; formation: FormationType }) => {
      const { error } = await supabase
        .from('squads')
        .update({ formation })
        .eq('id', squadId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SQUADS_KEY })
    },
  })

  const updateFormation = useCallback(
    (squadId: string, formation: FormationType) => {
      updateFormationMutation.mutate({ squadId, formation })
    },
    [updateFormationMutation],
  )

  // ── Public API ───────────────────────────────────────────────────────

  return {
    squads,
    isLoading,
    selectedSquad,
    selectSquad: setSelectedSquadId,
    clearSelection: () => setSelectedSquadId(null),
    createSquad,
    deleteSquad,
    addPlayer,
    importTeamPlayers,
    removePlayer,
    assignToSlot,
    removeFromSlot,
    updateFormation,
    updatePlayerBirthDate,
    updatePlayerPosition,
  }
}
