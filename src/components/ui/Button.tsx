import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-dark active:bg-primary-dark disabled:opacity-50',
  secondary:
    'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest disabled:opacity-50',
  ghost:
    'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:bg-surface-container-high disabled:opacity-50',
  destructive:
    'bg-error-container text-error hover:opacity-90 active:opacity-80 disabled:opacity-50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 min-h-[44px] px-3 text-[0.8125rem] gap-1.5',
  md: 'h-10 min-h-[44px] px-4 text-[0.875rem] gap-2',
  lg: 'h-12 min-h-[44px] px-6 text-[0.9375rem] gap-2',
}

const iconSizes: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const iconSize = iconSizes[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-[150ms] ease-out cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
          variantStyles[variant],
          sizeStyles[size],
          (disabled || loading) && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSize} strokeWidth={1.5} className="animate-spin" />
        ) : LeftIcon ? (
          <LeftIcon size={iconSize} strokeWidth={1.5} />
        ) : null}
        {children}
        {!loading && RightIcon && (
          <RightIcon size={iconSize} strokeWidth={1.5} />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
