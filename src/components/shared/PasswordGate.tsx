import { useState, type ReactNode } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const GATE_PASSWORD_HASH =
  '3bd8037a8ed38a35825983767f94e6cf3b18c3deee1601daee71faec0d83565f'
const STORAGE_KEY = 'scoutcopilot-unlocked'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
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
          <img src="/logo.png" alt="" className="h-10 w-10 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-on-surface">ScoutCopilot</h1>
          <p className="text-[0.875rem] text-on-surface-variant mt-1">
            This app is in private beta.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter access code"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            error={error ? 'Incorrect access code.' : undefined}
            autoFocus
          />
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </Card>
    </div>
  )
}
