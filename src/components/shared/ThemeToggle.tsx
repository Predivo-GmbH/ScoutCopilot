import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './useTheme'

const CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const LABELS = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
} as const

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const Icon = ICONS[theme]

  function cycle() {
    const idx = CYCLE.indexOf(theme)
    setTheme(CYCLE[(idx + 1) % CYCLE.length])
  }

  return (
    <button
      onClick={cycle}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className={`flex items-center gap-3 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-[var(--duration-normal)] ${className ?? ''}`}
    >
      <Icon size={20} strokeWidth={1.5} className="shrink-0" />
      {showLabel && <span className="text-sm whitespace-nowrap">{LABELS[theme]}</span>}
    </button>
  )
}
