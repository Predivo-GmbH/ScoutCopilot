import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

type SkeletonVariant = 'text' | 'paragraph' | 'card' | 'avatar' | 'table-row'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  lines?: number
}

const base = 'bg-surface-container-high animate-pulse rounded-md'

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', lines = 3, className, ...props }, ref) => {
    switch (variant) {
      case 'text':
        return (
          <div
            ref={ref}
            className={cn(base, 'h-4 w-full', className)}
            {...props}
          />
        )

      case 'paragraph':
        return (
          <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  base,
                  'h-4',
                  i === lines - 1 ? 'w-3/4' : 'w-full'
                )}
              />
            ))}
          </div>
        )

      case 'card':
        return (
          <div
            ref={ref}
            className={cn(
              'border border-outline-variant rounded-md p-6 space-y-4',
              className
            )}
            {...props}
          >
            <div className={cn(base, 'h-4 w-1/3')} />
            <div className={cn(base, 'h-8 w-1/2')} />
            <div className="space-y-2">
              <div className={cn(base, 'h-3 w-full')} />
              <div className={cn(base, 'h-3 w-5/6')} />
            </div>
          </div>
        )

      case 'avatar':
        return (
          <div
            ref={ref}
            className={cn(base, 'h-10 w-10 rounded-md', className)}
            {...props}
          />
        )

      case 'table-row':
        return (
          <div
            ref={ref}
            className={cn('flex items-center gap-3 py-4 px-3', className)}
            {...props}
          >
            <div className={cn(base, 'h-4 w-24')} />
            <div className={cn(base, 'h-4 w-32')} />
            <div className={cn(base, 'h-4 w-16')} />
            <div className={cn(base, 'h-4 w-20')} />
          </div>
        )

      default:
        return null
    }
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
export type { SkeletonProps, SkeletonVariant }
