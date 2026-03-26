import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { ThemeToggle } from '../shared/ThemeToggle'

export function TopBar() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

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
    <div className="h-14 flex items-center gap-4 px-6 border-b border-outline-variant bg-surface-container-low shrink-0">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for players, matches, or run NL queries..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-md py-2 pl-10 pr-4 text-xs font-data text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-colors"
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Alerts */}
        <button
          onClick={() => navigate('/watchlists')}
          className="relative p-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          aria-label="Alerts"
        >
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle className="p-2" />

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant/30 mx-1" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-md hover:bg-surface-container transition-colors"
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
              <span className="text-xs font-semibold text-on-surface leading-tight">{profile?.full_name || 'User'}</span>
              {profile?.role && <span className="text-[0.625rem] text-on-surface-variant leading-tight">{profile.role}</span>}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-low border border-outline-variant rounded-md shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2.5 border-b border-outline-variant/30">
                <p className="text-xs font-semibold text-on-surface truncate">{profile?.full_name || 'User'}</p>
                {profile?.role && <p className="text-[0.625rem] text-on-surface-variant truncate">{profile.role}</p>}
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/settings') }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <Settings size={14} strokeWidth={1.5} />
                Account Settings
              </button>
              <button
                onClick={() => { setProfileOpen(false); signOut() }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
