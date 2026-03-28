import { type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <Icon
        size={40}
        strokeWidth={1.5}
        className="text-on-surface-variant/70 mb-4"
      />
      <h3 className="text-[1.125rem] font-semibold text-on-surface mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[0.875rem] text-on-surface-variant max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
