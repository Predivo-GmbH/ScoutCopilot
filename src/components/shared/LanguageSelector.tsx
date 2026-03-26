import { useState, useRef, useEffect } from 'react'
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
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    i18n.changeLanguage(code)
    setOpen(false)
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              i18n.language === lang.code
                ? 'bg-primary text-white font-medium'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {lang.code.toUpperCase()} {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        aria-label={current.label}
      >
        <Globe size={18} strokeWidth={1.5} />
        <span className="text-xs font-medium hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-surface-container-low border border-outline-variant rounded-md shadow-lg overflow-hidden z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors ${
                i18n.language === lang.code
                  ? 'bg-surface-container text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="font-semibold">{lang.code.toUpperCase()}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
