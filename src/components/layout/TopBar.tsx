import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedNavigate } from '../shared/LocalizedLink'
import { Search, Bell, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { ThemeToggle } from '../shared/ThemeToggle'
import { LanguageSelector } from '../shared/LanguageSelector'

interface TopBarProps {
  onMenuToggle?: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const navigate = useLocalizedNavigate()
  const { t } = useTranslation()
  const { profile, signOut } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)

  const [profileDropdownStyle, setProfileDropdownStyle] = useState<CSSProperties>({})

  function toggleProfileDropdown() {
    const nextOpen = !profileOpen
    setProfileOpen(nextOpen)
    if (nextOpen && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect()
      const dropdownWidth = 192
      let left = rect.right - dropdownWidth
      if (left < 8) left = 8
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - 8 - dropdownWidth
      }
      setProfileDropdownStyle({ position: 'fixed', top: rect.bottom + 4, left, width: dropdownWidth })
    }
  }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
    }
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="h-14 flex items-center gap-2 sm:gap-4 px-2 sm:px-3 md:px-6 border-b border-outline-variant bg-surface-container-low shrink-0 overflow-hidden">
      {/* Mobile hamburger */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('common.toggleMenu')}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden sm:block">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('topbar.searchPlaceholder')}
          aria-label={t('topbar.searchPlaceholder')}
          className="w-full bg-surface-container-low border border-outline-variant rounded-md py-2 pl-10 pr-4 text-base md:text-xs font-data text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:border-primary transition-colors min-h-[44px]"
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Alerts */}
        <button
          onClick={() => navigate('/watchlists')}
          className="relative p-2.5 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('topbar.alerts')}
        >
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle className="p-2" />

        {/* Language selector */}
        <LanguageSelector />

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant/30 mx-1 hidden sm:block" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            ref={profileButtonRef}
            onClick={toggleProfileDropdown}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 p-1 pr-2 rounded-md hover:bg-surface-container transition-colors min-h-[44px]"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-md object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                {initials}
              </div>
            )}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-semibold text-on-surface leading-tight">{profile?.full_name || t('common.user')}</span>
              {profile?.role && <span className="text-[0.625rem] text-on-surface-variant leading-tight">{profile.role}</span>}
            </div>
          </button>

          {profileOpen && (
            <div
              role="menu"
              style={profileDropdownStyle}
              className="bg-surface-container-low border border-outline-variant rounded-md shadow-lg overflow-hidden z-50"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setProfileOpen(false)
                  return
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  const items = e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')
                  const currentIndex = Array.from(items).findIndex((el) => el === document.activeElement)
                  const nextIndex = e.key === 'ArrowDown'
                    ? (currentIndex + 1) % items.length
                    : (currentIndex - 1 + items.length) % items.length
                  items[nextIndex]?.focus()
                }
              }}
            >
              <div className="px-3 py-2.5 border-b border-outline-variant/30">
                <p className="text-xs font-semibold text-on-surface truncate">{profile?.full_name || t('common.user')}</p>
                {profile?.role && <p className="text-[0.625rem] text-on-surface-variant truncate">{profile.role}</p>}
              </div>
              <button
                role="menuitem"
                tabIndex={0}
                onClick={() => { setProfileOpen(false); navigate('/settings') }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors min-h-[44px]"
              >
                <Settings size={14} strokeWidth={1.5} />
                {t('topbar.accountSettings')}
              </button>
              <button
                role="menuitem"
                tabIndex={0}
                onClick={() => { setProfileOpen(false); signOut() }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors min-h-[44px]"
              >
                <LogOut size={14} strokeWidth={1.5} />
                {t('topbar.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
