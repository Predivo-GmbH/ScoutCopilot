import { useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
      }}
    >
      <div className="bg-surface-container rounded-md border border-outline-variant shadow-lg w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          {variant === 'destructive' && (
            <div className="w-10 h-10 rounded-md bg-error/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} strokeWidth={1.5} className="text-error" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            <p className="text-sm text-on-surface-variant mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
