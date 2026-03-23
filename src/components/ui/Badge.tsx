import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-surface-container-high text-on-surface',
  primary:
    'bg-primary/15 text-primary-light',
  secondary:
    'bg-secondary/15 text-secondary-light',
  tertiary:
    'bg-tertiary/15 text-tertiary-light',
  error:
    'bg-error-container/30 text-error',
  outline:
    'bg-transparent border border-outline-variant text-on-surface-variant',
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-[0.75rem] font-medium uppercase tracking-[0.05em]',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps, BadgeVariant }
