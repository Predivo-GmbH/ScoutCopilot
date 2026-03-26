import { Sun, Moon } from 'lucide-react'
import { useTheme } from './useTheme'

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  function toggle() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const Icon = resolvedTheme === 'dark' ? Moon : Sun
  const label = resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex items-center gap-3 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-[var(--duration-normal)] ${className ?? ''}`}
    >
      <Icon size={20} strokeWidth={1.5} className="shrink-0" />
      {showLabel && <span className="text-sm whitespace-nowrap">{label}</span>}
    </button>
  )
}
