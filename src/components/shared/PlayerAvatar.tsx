import { useState, useCallback, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const JERSEY_COLORS = [
  ['#1e3a5f', '#142a47'], // navy
  ['#c8102e', '#9a0c23'], // red
  ['#003153', '#00213a'], // dark blue
  ['#6c1d45', '#4e1533'], // maroon
  ['#274e37', '#1a3526'], // green
  ['#ee7623', '#c5601b'], // orange
  ['#0057b8', '#003d82'], // royal blue
  ['#fdb913', '#d49a0f'], // gold
  ['#7b1fa2', '#5c1778'], // purple
  ['#00a651', '#007a3d'], // bright green
  ['#1b365d', '#122442'], // dark navy
  ['#d50032', '#a30027'], // bright red
  ['#005daa', '#004580'], // medium blue
  ['#8b0000', '#660000'], // dark red
  ['#2d572c', '#1f3d1e'], // forest green
  ['#003087', '#002060'], // deep blue
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface PlayerAvatarProps {
  name: string
  size?: number
  className?: string
  imageUrl?: string
  /** Allow clicking the image to open a fullscreen lightbox */
  clickable?: boolean
  /** Show a loading/generating animation instead of the silhouette */
  loading?: boolean
  /** Mark this image as AI-generated (shows badge) */
  aiGenerated?: boolean
}

function PhotoLightbox({ src, alt, aiGenerated, onClose }: { src: string; alt: string; aiGenerated?: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Fix #17: Global Escape listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Fix #16: Auto-focus close button + focus trap
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Trap focus between close button and image container
      e.preventDefault()
      closeRef.current?.focus()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-md cursor-pointer"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
        aria-label={t('common.close')}
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      <div className="relative">
        <img
          src={src}
          alt={alt}
          width={600}
          height={600}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg animate-[fadeIn_200ms_ease-out]"
          onClick={(e) => e.stopPropagation()}
        />
        {aiGenerated && (
          <span className="absolute bottom-3 right-3 px-2 py-1 text-[0.625rem] font-bold uppercase tracking-wider bg-tertiary/90 text-on-tertiary rounded-sm backdrop-blur-sm">
            {t('player.aiGenerated')}
          </span>
        )}
      </div>
    </div>
  )
}

function LoadingAvatar({ name, size }: { name: string; size: number }) {
  const { t } = useTranslation()
  const colorIndex = hashName(name) % JERSEY_COLORS.length
  const [bg] = JERSEY_COLORS[colorIndex]

  return (
    <div
      className="relative rounded-md shrink-0 overflow-hidden group"
      style={{ width: size, height: size }}
      title={t('player.photoLoading')}
      role="status"
      aria-live="polite"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="rounded-md"
        aria-label={name}
      >
        <rect width="120" height="120" rx="12" fill={bg} />
      </svg>
      {/* Pulsing ring animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 rounded-full border-2 border-on-surface/40 border-t-primary animate-spin" />
      </div>
      {/* Tooltip on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-surface/80 rounded-md">
        <span className="text-[0.5rem] leading-tight text-center text-on-surface px-1 font-medium">
          {t('player.photoLoadingShort')}
        </span>
      </div>
      <span className="sr-only">{t('player.photoLoading')}</span>
    </div>
  )
}

function SilhouetteFallback({ name, size }: { name: string; size: number }) {
  const colorIndex = hashName(name) % JERSEY_COLORS.length
  const [bg, silhouette] = JERSEY_COLORS[colorIndex]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="rounded-md shrink-0"
      aria-label={name}
    >
      <rect width="120" height="120" rx="12" fill={bg} />
      <ellipse cx="60" cy="118" rx="46" ry="34" fill={silhouette} />
      <rect x="50" y="62" width="20" height="14" rx="4" fill={silhouette} />
      <circle cx="60" cy="46" r="22" fill={silhouette} />
      <path d="M48 88 L60 96 L72 88" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function AiBadge({ size }: { size: number }) {
  const { t } = useTranslation()
  // Scale badge relative to avatar size
  const badgeSize = Math.max(14, Math.round(size * 0.3))
  const fontSize = Math.max(7, Math.round(size * 0.15))

  return (
    <span
      className="absolute bottom-0 right-0 flex items-center justify-center bg-tertiary text-on-tertiary font-bold uppercase tracking-wider rounded-tl-sm rounded-br-md leading-none"
      style={{ width: badgeSize, height: badgeSize, fontSize }}
      title={t('player.aiGeneratedTooltip')}
      aria-label={t('player.aiGeneratedTooltip')}
    >
      AI
    </span>
  )
}

export function PlayerAvatar({
  name,
  size = 36,
  className = '',
  imageUrl,
  clickable = false,
  loading = false,
  aiGenerated = false,
}: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Fix #18: Return focus to trigger on close
  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Loading state: show spinner animation
  if (loading && (!imageUrl || imgError)) {
    return (
      <div className={className}>
        <LoadingAvatar name={name} size={size} />
      </div>
    )
  }

  // No image: show silhouette fallback
  if (!imageUrl || imgError) {
    return (
      <div className={className}>
        <SilhouetteFallback name={name} size={size} />
      </div>
    )
  }

  return (
    <>
      <div className={`relative inline-block shrink-0 ${className}`}>
        {clickable ? (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="appearance-none border-0 p-0 bg-transparent cursor-pointer rounded-md hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={name}
          >
            <img
              src={imageUrl}
              alt={name}
              width={size}
              height={size}
              loading="lazy"
              className="rounded-md shrink-0 object-cover"
              onError={() => setImgError(true)}
            />
          </button>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            width={size}
            height={size}
            loading="lazy"
            className="rounded-md shrink-0 object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {aiGenerated && <AiBadge size={size} />}
      </div>
      {clickable && lightboxOpen && (
        <PhotoLightbox src={imageUrl} alt={name} aiGenerated={aiGenerated} onClose={handleLightboxClose} />
      )}
    </>
  )
}
