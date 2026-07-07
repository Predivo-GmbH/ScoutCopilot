import { useState, type FormEvent } from 'react'
import { Mail, Check, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

interface WaitlistFormProps {
  /** Where the form was opened from — stored with the signup for analytics. */
  source: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'already' | 'error'

/**
 * Registration is paused pre-launch. This captures an email into the `waitlist`
 * table (anon-insert RLS) so we can notify people when free trials reopen.
 * Reused inside the waitlist modal and on the /signup route.
 */
export function WaitlistForm({ source }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError('Please enter a valid email address.')
      return
    }
    setError(null)
    setStatus('submitting')
    const { error: insertError } = await supabase.from('waitlist').insert({ email: value, source })
    if (insertError) {
      // 23505 = unique violation → already on the list; treat as a friendly success.
      if (insertError.code === '23505') {
        setStatus('already')
        return
      }
      setStatus('error')
      setError('Something went wrong on our end. Please try again in a moment.')
      return
    }
    setStatus('success')
  }

  if (status === 'success' || status === 'already') {
    return (
      <div className="py-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Check className="h-6 w-6 text-primary" strokeWidth={2} aria-hidden="true" />
        </div>
        <h3 className="mb-1.5 text-lg font-semibold text-on-surface">You&rsquo;re on the list</h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {status === 'already'
            ? "That email is already on the waitlist — we'll be in touch the moment free trials reopen."
            : "Thanks. We'll email you the moment we reopen free trials."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-5 text-sm leading-relaxed text-on-surface-variant">
        We&rsquo;ve paused new registrations while we onboard our first users. Leave your email
        and we&rsquo;ll let you know the moment free trials reopen — no spam, just the one message.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="you@club.com"
            autoComplete="email"
            aria-label="Email address"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <Button type="submit" size="lg" rightIcon={ArrowRight} loading={status === 'submitting'} className="w-full">
          Notify me when it reopens
        </Button>
      </form>
    </div>
  )
}
