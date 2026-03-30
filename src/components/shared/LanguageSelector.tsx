import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
] as const

interface LanguageSelectorProps {
  className?: string
  /** Render as a full dropdown (default) or inline buttons */
  variant?: 'dropdown' | 'inline'
}

export function LanguageSelector({ className = '', variant = 'dropdown' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})

  function toggleDropdown() {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 144
      let left = rect.right - dropdownWidth
      if (left < 8) left = 8
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - 8 - dropdownWidth
      }
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 4, left, width: dropdownWidth })
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  function changeLanguage(code: string) {
    const rest = location.pathname.replace(/^\/(en|de)/, '') || '/'
    navigate(`/${code}${rest === '/' ? '' : rest}${location.search}`)
    setOpen(false)
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = ref.current?.querySelectorAll<HTMLElement>('[role="option"]')
      if (!items?.length) return
      const currentIndex = Array.from(items).findIndex((el) => el === document.activeElement)
      const nextIndex = e.key === 'ArrowDown'
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length
      items[nextIndex].focus()
    }
  }, [open])

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors min-h-[44px] ${
              i18n.language === lang.code
                ? 'bg-primary text-on-primary font-medium'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center justify-center gap-1.5 p-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors min-w-[44px] min-h-[44px]"
        aria-label={current.label}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={18} strokeWidth={1.5} />
        <span className="text-xs font-medium hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div role="listbox" aria-label={t('common.language')} style={dropdownStyle} className="bg-surface-container-low border border-outline-variant rounded-md shadow-lg overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={i18n.language === lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors min-h-[44px] ${
                i18n.language === lang.code
                  ? 'bg-surface-container text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="font-semibold">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
