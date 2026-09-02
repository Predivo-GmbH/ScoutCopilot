import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Logo } from './Logo'

const GATE_PASSWORD_HASH =
  'afcabdf1b639f115dd538544fce010d6b7dade6e1bb8e8163ce8e1fc76e5fb95'
const STORAGE_KEY = 'scoutcopilot-unlocked'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const isScreenshotMode = import.meta.env.VITE_SCREENSHOT_MODE === 'true'
  const [unlocked, setUnlocked] = useState(
    () => isScreenshotMode || sessionStorage.getItem(STORAGE_KEY) === 'true'
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inputHash = await sha256(password)
    if (inputHash === GATE_PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-[0.875rem] text-on-surface-variant mt-1">
            {t('auth.passwordGate.privateBeta')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder={t('auth.passwordGate.enterAccessCode')}
            aria-label={t('auth.passwordGate.enterAccessCode')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            error={error ? t('errors.incorrectAccessCode') : undefined}
            autoFocus
          />
          <Button type="submit" className="w-full">
            {t('auth.passwordGate.enter')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
