import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from './useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordStrength from '../../components/auth/PasswordStrength'
import { getPasswordScore } from '../../components/auth/password-utils'
import { friendlyAuthError } from '../../lib/utils'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { user, isLoading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()

  // If there's no session (e.g. user navigated here directly), redirect
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/forgot-password')
    }
  }, [user, authLoading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (getPasswordScore(password) < 3) {
      setError('Please choose a stronger password')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(friendlyAuthError(err, 'Failed to update password'))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-secondary/10">
            <CheckCircle className="h-7 w-7 text-secondary" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-on-surface">
            Password updated
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-2xl font-bold text-on-surface">
        Choose a new password
      </h1>
      <p className="mt-2 text-center text-sm text-on-surface-variant">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-on-surface-variant">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            autoFocus
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="Min. 8 characters"
          />
          <PasswordStrength password={password} />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-on-surface-variant">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="Confirm your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  )
}
