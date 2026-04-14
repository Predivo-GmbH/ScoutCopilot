import { useState, useCallback, useRef } from 'react'
import { supabase } from './supabase'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadResult {
  url: string | null
  error: string | null
}

/**
 * Hook for uploading a custom photo for a player.
 * Stores the image in Supabase Storage (player-photos bucket)
 * and updates the appropriate DB table:
 *   - apifb-* → squad_players.player_data.image
 *   - sb-open-* → sb_players.photo_url
 */
export function usePlayerPhotoUpload() {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const upload = useCallback(async (playerId: string, file: File): Promise<UploadResult> => {
    if (file.size > MAX_FILE_SIZE) {
      return { url: null, error: 'File too large (max 2 MB)' }
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { url: null, error: 'Only JPEG, PNG, and WebP allowed' }
    }

    setUploading(true)
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const storagePath = `${playerId}/photo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(storagePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('player-photos')
        .getPublicUrl(storagePath)

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      // Persist to the correct table
      if (playerId.startsWith('apifb-')) {
        // Get current player_data, merge in new image
        const { data: row } = await supabase
          .from('squad_players')
          .select('player_data')
          .eq('player_external_id', playerId)
          .limit(1)
          .maybeSingle()

        const pd = (row?.player_data ?? {}) as Record<string, unknown>
        await supabase
          .from('squad_players')
          .update({ player_data: { ...pd, image: publicUrl } })
          .eq('player_external_id', playerId)
      } else if (playerId.startsWith('sb-open-')) {
        const numericId = parseInt(playerId.replace('sb-open-', ''), 10)
        if (!isNaN(numericId)) {
          await (supabase
            .from('sb_players' as never)
            .update({ photo_url: publicUrl } as never)
            .eq('player_id', numericId) as unknown as Promise<unknown>)
        }
      }

      return { url: publicUrl, error: null }
    } catch (err) {
      return { url: null, error: (err as Error).message || 'Upload failed' }
    } finally {
      setUploading(false)
    }
  }, [])

  return { upload, uploading, inputRef }
}
