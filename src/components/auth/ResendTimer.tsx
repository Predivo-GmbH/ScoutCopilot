import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ResendTimerProps {
  onResend: () => Promise<void>
  cooldownSeconds?: number
}

export default function ResendTimer({ onResend, cooldownSeconds = 60 }: ResendTimerProps) {
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(cooldownSeconds)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const handleResend = useCallback(async () => {
    setSending(true)
    try {
      await onResend()
      setSeconds(cooldownSeconds)
    } finally {
      setSending(false)
    }
  }, [onResend, cooldownSeconds])

  if (seconds > 0) {
    return (
      <p className="text-center text-sm text-on-surface-variant">
        {t('auth.resendTimer.resendIn', { seconds })}
      </p>
    )
  }

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className="mx-auto block text-sm font-medium text-primary-light transition-colors hover:text-primary disabled:opacity-50"
    >
      {sending ? t('auth.resendTimer.sending') : t('auth.resendTimer.resendCode')}
    </button>
  )
}
