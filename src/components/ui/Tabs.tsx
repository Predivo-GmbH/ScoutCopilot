import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>')
  return ctx
}

/* ── Root ── */

interface TabsProps {
  defaultTab: string
  className?: string
  children: ReactNode
  onChange?: (tabId: string) => void
}

function Tabs({ defaultTab, className, children, onChange }: TabsProps) {
  const [activeTab, setActive] = useState(defaultTab)

  const setActiveTab = useCallback(
    (id: string) => {
      setActive(id)
      onChange?.(id)
    },
    [onChange]
  )

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

/* ── Tab List ── */

interface TabListProps {
  className?: string
  children: ReactNode
}

function TabList({ className, children }: TabListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showFade, setShowFade] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function checkOverflow() {
      setShowFade(
        el!.scrollWidth > el!.clientWidth &&
          el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 2
      )
    }

    checkOverflow()
    el.addEventListener('scroll', checkOverflow, { passive: true })
    window.addEventListener('resize', checkOverflow)
    return () => {
      el.removeEventListener('scroll', checkOverflow)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [])

  return (
    <div className={cn('relative border-b border-outline-variant', className)}>
      <div
        ref={scrollRef}
        role="tablist"
        className="flex gap-1 overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
      {showFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--color-surface))',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

/* ── Tab Trigger ── */

interface TabTriggerProps {
  id: string
  className?: string
  children: ReactNode
}

function TabTrigger({ id, className, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === id

  function handleKeyDown(e: React.KeyboardEvent) {
    const tablist = e.currentTarget.parentElement
    if (!tablist) return
    const tabs = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'))
    const index = tabs.indexOf(e.currentTarget as HTMLElement)
    let next: HTMLElement | undefined

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      next = tabs[(index + 1) % tabs.length]
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      next = tabs[(index - 1 + tabs.length) % tabs.length]
    } else if (e.key === 'Home') {
      e.preventDefault()
      next = tabs[0]
    } else if (e.key === 'End') {
      e.preventDefault()
      next = tabs[tabs.length - 1]
    }

    if (next) {
      next.focus()
      const nextId = next.id?.replace('tab-', '')
      if (nextId) setActiveTab(nextId)
    }
  }

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(id)}
      onKeyDown={handleKeyDown}
      style={{ scrollSnapAlign: 'start' }}
      className={cn(
        'px-4 py-2.5 text-[0.875rem] font-medium -mb-px border-b-2 transition-colors duration-[150ms] ease-out cursor-pointer whitespace-nowrap min-h-[44px] shrink-0',
        isActive
          ? 'text-primary border-primary'
          : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant',
        className
      )}
    >
      {children}
    </button>
  )
}

/* ── Tab Panel ── */

interface TabPanelProps {
  id: string
  className?: string
  children: ReactNode
}

function TabPanel({ id, className, children }: TabPanelProps) {
  const { activeTab } = useTabsContext()
  if (activeTab !== id) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cn('pt-4', className)}
    >
      {children}
    </div>
  )
}

export { Tabs, TabList, TabTrigger, TabPanel }
export type { TabsProps, TabListProps, TabTriggerProps, TabPanelProps }
