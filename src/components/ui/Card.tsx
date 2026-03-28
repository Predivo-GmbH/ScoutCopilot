import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ header, footer, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface-container-low border border-outline-variant rounded-md',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-outline-variant">
          {header}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-outline-variant">
          {footer}
        </div>
      )}
    </div>
  )
)

Card.displayName = 'Card'

export { Card }
export type { CardProps }
