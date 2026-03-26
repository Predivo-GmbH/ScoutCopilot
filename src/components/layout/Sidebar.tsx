import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  FileText,
  GitCompareArrows,
  Star,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { Logo } from '../shared/Logo'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/report', label: 'Reports', icon: FileText },
  { path: '/compare', label: 'Compare', icon: GitCompareArrows },
  { path: '/watchlists', label: 'Watchlists', icon: Star },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-outline-variant bg-surface-container-low"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)',
        transition: 'width var(--duration-slow) ease-in-out',
      }}
    >
      {/* Logo area */}
      <div className="flex flex-col justify-center h-16 border-b border-outline-variant px-4">
        <Logo size="lg" showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm
                    transition-colors duration-[var(--duration-normal)]
                    ${isActive
                      ? 'bg-surface-container-high text-primary-light border-l-4 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent'
                    }
                  `}
                >
                  <Icon size={20} strokeWidth={1.5} className="shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profile + Collapse toggle */}
      <div className="border-t border-outline-variant p-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center text-[0.625rem] font-semibold text-primary shrink-0">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-on-surface truncate">{profile?.full_name ?? 'Chief Scout'}</span>
              <span className="text-[0.6rem] font-data uppercase tracking-wider text-on-surface-variant truncate">{profile?.role ?? 'Premium Tier'}</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center rounded-md p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-[var(--duration-normal)]"
        >
          {collapsed ? <ChevronsRight size={20} strokeWidth={1.5} /> : <ChevronsLeft size={20} strokeWidth={1.5} />}
        </button>
      </div>
    </aside>
  )
}
