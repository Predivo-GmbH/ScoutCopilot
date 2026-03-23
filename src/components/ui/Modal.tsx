import {
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  children: ReactNode
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, footer, className, children, ...props }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null)

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()

        // Focus trap
        if (e.key === 'Tab' && contentRef.current) {
          const focusable = contentRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      },
      [onClose]
    )

    useEffect(() => {
      if (!open) return
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      // Focus first focusable element
      const timer = setTimeout(() => {
        const el = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        el?.focus()
      }, 50)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        clearTimeout(timer)
      }
    }, [open, handleKeyDown])

    if (!open) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          ref={(node) => {
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          className={cn(
            'w-full max-w-lg mx-4 bg-surface-container border border-outline-variant rounded-lg',
            'animate-in fade-in duration-200',
            className
          )}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h3 className="text-[1.125rem] font-semibold text-on-surface">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-[150ms]"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh] text-on-surface">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
              {footer}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export { Modal }
export type { ModalProps }
