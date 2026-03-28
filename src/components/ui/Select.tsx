import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[0.8125rem] font-medium tracking-[0.02em] text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-11 min-h-[44px] w-full appearance-none px-3 pr-9 bg-surface-container border rounded-md text-base md:text-[0.875rem] text-on-surface',
              'transition-colors duration-[150ms] ease-out',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-error' : 'border-outline-variant',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            strokeWidth={1.5}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} role="alert" className="text-[0.75rem] text-error">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[0.75rem] text-on-surface-variant">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps, SelectOption }
