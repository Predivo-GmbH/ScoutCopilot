import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from './useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import { friendlyAuthError } from '../../lib/utils'

type Step = 'form' | 'sent'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setStep('sent')
    } catch (err) {
      setError(friendlyAuthError(err, 'Failed to send reset email'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {step === 'form' && (
        <div>
          <h1 className="text-center text-2xl font-bold text-on-surface">
            Reset your password
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-on-surface-variant">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                placeholder="scout@club.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            <Link to="/login" className="font-medium text-primary-light hover:underline">
              &larr; Back to sign in
            </Link>
          </p>
        </div>
      )}

      {step === 'sent' && (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
            <Mail className="h-7 w-7 text-primary-light" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-on-surface">Check your email</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            We sent a password reset link to{' '}
            <span className="font-medium text-on-surface">{email}</span>. Click the link in the
            email to choose a new password.
          </p>
          <p className="mt-4 text-xs text-on-surface-variant">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setStep('form')}
              className="font-medium text-primary-light hover:underline"
            >
              try again
            </button>
            .
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block text-sm font-medium text-primary-light hover:underline"
          >
            &larr; Back to sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}
