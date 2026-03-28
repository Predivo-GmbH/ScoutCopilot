import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface ScrollableTabBarProps {
  tabs: { key: string; label: string }[]
  activeKey: string
  onTabChange: (key: string) => void
  className?: string
}

export function ScrollableTabBar({
  tabs,
  activeKey,
  onTabChange,
  className,
}: ScrollableTabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showFade, setShowFade] = useState(false)

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowFade(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    // Delay initial check to ensure layout is complete
    const timer = requestAnimationFrame(() => checkOverflow())
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkOverflow, { passive: true })
    window.addEventListener('resize', checkOverflow)
    return () => {
      cancelAnimationFrame(timer)
      el.removeEventListener('scroll', checkOverflow)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [checkOverflow])

  return (
    <div className={cn('relative border-b border-outline-variant', className)}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap min-h-[44px] -mb-px border-b-2 transition-colors duration-150 ease-out cursor-pointer shrink-0',
                isActive
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
              )}
              style={{ scrollSnapAlign: 'start' }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right-edge fade gradient */}
      {showFade && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-surface, #1c1b1f))',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export type { ScrollableTabBarProps }
