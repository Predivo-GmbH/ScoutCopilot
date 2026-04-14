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
 * Extracts the numeric player ID from a prefixed string.
 * Supports sb-open-{id}, apifb-{id}, and bare numeric IDs.
 * Returns NaN for unrecognised formats.
 */
function extractNumericId(playerId: string): number {
  if (playerId.startsWith('sb-open-')) {
    return parseInt(playerId.replace('sb-open-', ''), 10)
  }
  if (playerId.startsWith('apifb-')) {
    return parseInt(playerId.replace('apifb-', ''), 10)
  }
  // Handle bare numeric IDs (e.g. "5545" from squad insertions)
  const parsed = parseInt(playerId, 10)
  return String(parsed) === playerId ? parsed : NaN
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
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set())
  // Track which player IDs have already been requested to avoid duplicate calls
  const requestedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!players || players.length === 0) return

    const needsPhoto = players.filter((p) => {
      const numericId = extractNumericId(p.id)
      if (isNaN(numericId)) return false
      if (requestedRef.current.has(p.id)) return false
      if (photoMap.has(p.id)) return false
      // Has image and not broken → skip
      if (p.image && !brokenUrls.has(p.id)) return false
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

    // Build reverse lookup: numeric ID → original player ID string
    // so we can map generate-photo results back to the correct key
    const numericToOriginalId = new Map<number, string>()
    for (const p of needsPhoto) {
      const numId = extractNumericId(p.id)
      if (!isNaN(numId)) {
        numericToOriginalId.set(numId, p.id)
      }
    }

    supabase.functions
      .invoke('generate-photo', { body: { player_ids: playerIds } })
      .then(({ data: photoData }) => {
        if (!photoData?.results) return

        const newPhotos = new Map<string, string>()
        for (const result of photoData.results as PhotoResult[]) {
          if (result.photo_url) {
            // Use the original player ID (could be "sb-open-123" or bare "123")
            const playerId = numericToOriginalId.get(result.player_id) ?? `sb-open-${result.player_id}`
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
  }, [players, photoMap, brokenUrls])

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

  /**
   * Report that a player's image URL is broken/stale so it can be re-fetched.
   */
  const reportBrokenUrl = useCallback((playerId: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(playerId)) return prev
      const next = new Set(prev)
      next.add(playerId)
      return next
    })
    // Clear from requested so it can be re-fetched
    requestedRef.current.delete(playerId)
    // Clear any stale photoMap entry
    setPhotoMap((prev) => {
      if (!prev.has(playerId)) return prev
      const next = new Map(prev)
      next.delete(playerId)
      return next
    })
  }, [])

  return { photoMap, loadingIds, getPhoto, reportBrokenUrl }
}
