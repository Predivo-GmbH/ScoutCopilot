import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
  useState,
  useCallback,
} from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ── Primitives ── */

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full border-collapse text-[0.875rem]', className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-surface-container', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&>tr:nth-child(odd)]:bg-surface [&>tr:nth-child(even)]:bg-surface-container-low', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-outline-variant transition-colors duration-[150ms]',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ sortable, sortDirection, onSort, className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-3 py-4 text-left text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant',
        sortable && 'cursor-pointer select-none hover:text-on-surface',
        className
      )}
      onClick={sortable ? onSort : undefined}
      aria-sort={
        sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
            ? 'descending'
            : undefined
      }
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable &&
          (sortDirection === 'asc' ? (
            <ArrowUp size={14} strokeWidth={1.5} />
          ) : sortDirection === 'desc' ? (
            <ArrowDown size={14} strokeWidth={1.5} />
          ) : (
            <ArrowUpDown size={14} strokeWidth={1.5} className="opacity-40" />
          ))}
      </span>
    </th>
  )
)
TableHead.displayName = 'TableHead'

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ numeric, className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-3 py-4 text-on-surface',
        numeric && 'font-data',
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

/* ── Sort hook ── */

type SortDirection = 'asc' | 'desc' | null

function useTableSort<T>(data: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultKey ?? null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const handleSort = useCallback(
    (key: keyof T) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
        if (sortDir === 'desc') setSortKey(null)
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey, sortDir]
  )

  const sorted = sortKey && sortDir
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return { sorted, sortKey, sortDir, handleSort } as const
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  useTableSort,
}
export type { TableHeadProps, TableCellProps, SortDirection }
