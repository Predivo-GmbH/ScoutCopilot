import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'

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
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="flex items-center gap-2.5 bg-surface-container border border-outline-variant rounded-md px-3 py-1.5">
          <Search size={15} strokeWidth={1.5} className="text-on-surface-variant/50 shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search players, teams, and metrics..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none"
          />
        </div>
      </form>

      <div className="flex items-center gap-1">
        {/* Alerts */}
        <button
          onClick={() => navigate('/watchlists')}
          className="relative p-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          aria-label="Alerts"
        >
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-container transition-colors"
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
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-low border border-outline-variant rounded-md shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2.5 border-b border-outline-variant/30">
                <p className="text-xs font-semibold text-on-surface truncate">{profile?.full_name ?? 'User'}</p>
                <p className="text-[0.625rem] text-on-surface-variant truncate">{profile?.role ?? 'Scout'}</p>
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
