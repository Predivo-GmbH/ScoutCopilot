import { useState, useCallback } from 'react'
import { X } from 'lucide-react'

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
}

function PhotoLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-md cursor-pointer"
      onClick={onClose}
      onKeyDown={handleKey}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
        aria-label="Close"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg animate-[fadeIn_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      />
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

export function PlayerAvatar({ name, size = 36, className = '', imageUrl, clickable = false }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!imageUrl || imgError) {
    return (
      <div className={className}>
        <SilhouetteFallback name={name} size={size} />
      </div>
    )
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={`rounded-md shrink-0 object-cover ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onError={() => setImgError(true)}
        onClick={clickable ? () => setLightboxOpen(true) : undefined}
      />
      {clickable && lightboxOpen && (
        <PhotoLightbox src={imageUrl} alt={name} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}
