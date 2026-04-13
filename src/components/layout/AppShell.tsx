import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Link } from '../shared/LocalizedLink'

export function AppShell() {
  const { t } = useTranslation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const mobileSidebarRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileSidebarOpen) setMobileSidebarOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Focus trap + Escape handler for mobile sidebar
  useEffect(() => {
    if (!mobileSidebarOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false)
        previousFocusRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && mobileSidebarRef.current) {
        const focusable = mobileSidebarRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Auto-focus first focusable element
    setTimeout(() => {
      const focusable = mobileSidebarRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.[0]?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-md">
        {t('common.skipToContent')}
      </a>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div ref={mobileSidebarRef} className="md:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={t('nav.navigationMenu')}>
          <div
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-[var(--sidebar-expanded)]">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div
        className="flex-1 flex flex-col h-screen min-w-0"
        style={{
          marginLeft: 0,
          transition: 'margin-left var(--duration-slow) ease-in-out',
        }}
      >
        {/* Apply desktop margin via a wrapper to avoid SSR mismatch */}
        <style>{`
          @media (min-width: 768px) {
            .app-shell-content {
              margin-left: ${sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)'} !important;
            }
          }
        `}</style>
        <div className="app-shell-content flex-1 flex flex-col h-screen min-w-0" style={{ transition: 'margin-left var(--duration-slow) ease-in-out' }}>
          <TopBar onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main id="main-content" aria-label={t('nav.mainContent')} className="flex-1 overflow-y-auto flex flex-col">
            <div className="mx-auto max-w-[1280px] flex-1">
              <Outlet />
            </div>
            <footer className="mt-auto px-6 py-3 border-t border-outline-variant/10 flex gap-4 text-xs text-on-surface-variant">
              <Link to="/privacy">{t('common.privacy')}</Link>
              <Link to="/terms">{t('common.terms')}</Link>
              <Link to="/imprint">{t('common.imprint')}</Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
