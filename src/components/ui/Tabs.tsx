import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
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
  return (
    <div
      role="tablist"
      className={cn(
        'flex border-b border-outline-variant gap-1',
        className
      )}
    >
      {children}
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

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActiveTab(id)}
      className={cn(
        'px-4 py-2.5 text-[0.875rem] font-medium -mb-px border-b-2 transition-colors duration-[150ms] ease-out cursor-pointer',
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
