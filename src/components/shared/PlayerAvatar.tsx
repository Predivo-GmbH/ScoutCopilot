import { useState } from 'react'

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

export function PlayerAvatar({ name, size = 36, className = '', imageUrl }: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (!imageUrl || imgError) {
    return (
      <div className={className}>
        <SilhouetteFallback name={name} size={size} />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      className={`rounded-md shrink-0 object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  )
}
