import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

/** Minimal player shape needed for photo fetching */
export interface PhotoFetchablePlayer {
  id: string
  image?: string
}

/** Result of the generate-photo edge function for a single player */
interface PhotoResult {
  player_id: number
  status: string
  photo_url?: string
  birth_date?: string | null
}

/**
 * Derives a photo source label from a photo URL.
 * Shared utility used across the app.
 */
export function derivePhotoSource(photoUrl: string | undefined): 'sportsdb' | 'api-football' | 'stitch' | undefined {
  if (!photoUrl) return undefined
  if (photoUrl.includes('thesportsdb.com')) return 'sportsdb'
  if (photoUrl.includes('api-sports.io')) return 'api-football'
  return 'stitch'
}

/**
 * Extracts the numeric player ID from an sb-open- prefixed string.
 * Returns NaN for non-sb-open IDs.
 */
function extractNumericId(playerId: string): number {
  if (!playerId.startsWith('sb-open-')) return NaN
  return parseInt(playerId.replace('sb-open-', ''), 10)
}

/**
 * Shared hook for on-demand player photo fetching.
 *
 * Given a list of players, identifies which ones lack a photo and have an
 * sb-open-{id} identifier, then calls the generate-photo edge function in
 * the background. Returns:
 *   - photoMap: Map<playerId, photoUrl> for resolved photos
 *   - loadingIds: Set<playerId> currently being fetched
 *   - getPhoto(player): returns the best available photo URL for a player
 *
 * Deduplicates: each player ID is only fetched once per hook instance.
 */
export function usePlayerPhotoFetch(players: PhotoFetchablePlayer[]) {
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  // Track which player IDs have already been requested to avoid duplicate calls
  const requestedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!players || players.length === 0) return

    const needsPhoto = players.filter((p) => {
      if (p.image) return false
      const numericId = extractNumericId(p.id)
      if (isNaN(numericId)) return false
      // Skip if already requested or already resolved
      if (requestedRef.current.has(p.id)) return false
      if (photoMap.has(p.id)) return false
      return true
    })

    if (needsPhoto.length === 0) return

    // Mark as requested immediately to prevent duplicate calls
    for (const p of needsPhoto) {
      requestedRef.current.add(p.id)
    }

    const playerIds = needsPhoto
      .map((p) => extractNumericId(p.id))
      .filter((id) => !isNaN(id))

    if (playerIds.length === 0) return

    // Mark as loading
    setLoadingIds((prev) => {
      const next = new Set(prev)
      for (const p of needsPhoto) next.add(p.id)
      return next
    })

    supabase.functions
      .invoke('generate-photo', { body: { player_ids: playerIds } })
      .then(({ data: photoData }) => {
        if (!photoData?.results) return

        const newPhotos = new Map<string, string>()
        for (const result of photoData.results as PhotoResult[]) {
          if (result.photo_url) {
            const playerId = `sb-open-${result.player_id}`
            newPhotos.set(playerId, result.photo_url)
          }
        }

        if (newPhotos.size > 0) {
          setPhotoMap((prev) => {
            const merged = new Map(prev)
            for (const [k, v] of newPhotos) merged.set(k, v)
            return merged
          })
        }
      })
      .catch(() => {
        // Non-blocking: photos will appear on next visit
      })
      .finally(() => {
        setLoadingIds((prev) => {
          const next = new Set(prev)
          for (const p of needsPhoto) next.delete(p.id)
          return next
        })
      })
  }, [players, photoMap])

  /**
   * Returns the best available photo URL for a player:
   * fetched photo from photoMap, or the player's existing image.
   */
  const getPhoto = useCallback(
    (player: PhotoFetchablePlayer): string | undefined => {
      return photoMap.get(player.id) ?? player.image
    },
    [photoMap],
  )

  return { photoMap, loadingIds, getPhoto }
}
