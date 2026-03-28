import { useRef, useCallback, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface OtpInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
}

export default function OtpInput({ length = 6, onComplete, disabled }: OtpInputProps) {
  const { t } = useTranslation()
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const focusInput = useCallback((index: number) => {
    const el = inputsRef.current[index]
    if (el) {
      el.focus()
      el.select()
    }
  }, [])

  const getCode = useCallback(() => {
    return inputsRef.current.map((el) => el?.value ?? '').join('')
  }, [])

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1)
      const el = inputsRef.current[index]
      if (el) el.value = digit

      if (digit && index < length - 1) {
        focusInput(index + 1)
      }

      const code = getCode()
      if (code.length === length) {
        onComplete(code)
      }
    },
    [length, onComplete, focusInput, getCode],
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const el = inputsRef.current[index]
        if (el && !el.value && index > 0) {
          e.preventDefault()
          const prev = inputsRef.current[index - 1]
          if (prev) {
            prev.value = ''
            focusInput(index - 1)
          }
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault()
        focusInput(index + 1)
      }
    },
    [length, focusInput],
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      for (let i = 0; i < length; i++) {
        const el = inputsRef.current[i]
        if (el) el.value = pasted[i] ?? ''
      }
      const lastFilled = Math.min(pasted.length, length) - 1
      if (lastFilled >= 0) focusInput(lastFilled)

      if (pasted.length === length) {
        onComplete(pasted)
      }
    },
    [length, onComplete, focusInput],
  )

  return (
    <div className="flex justify-center gap-2.5" role="group" aria-label={t('auth.otp.verificationCode')}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          disabled={disabled}
          autoFocus={i === 0}
          autoComplete="one-time-code"
          aria-label={t('auth.otp.digit', { current: i + 1, total: length })}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="h-14 w-12 rounded-md border-2 border-outline-variant bg-surface-container text-center text-2xl font-bold text-on-surface transition-all focus:border-primary focus:outline-none disabled:opacity-50"
        />
      ))}
    </div>
  )
}
