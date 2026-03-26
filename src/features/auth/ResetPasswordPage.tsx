import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordStrength from '../../components/auth/PasswordStrength'
import { getPasswordScore } from '../../components/auth/password-utils'
import { friendlyAuthError } from '../../lib/utils'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { user, isLoading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()

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
      setError(t('auth.reset.passwordsNoMatch'))
      return
    }
    if (getPasswordScore(password) < 3) {
      setError(t('auth.reset.weakPassword'))
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
            {t('auth.reset.passwordUpdated')}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t('auth.reset.passwordResetSuccess')}
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-2xl font-bold text-on-surface">
        {t('auth.reset.chooseNewPassword')}
      </h1>
      <p className="mt-2 text-center text-sm text-on-surface-variant">
        {t('auth.reset.enterNewPassword')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-on-surface-variant">
            {t('auth.reset.newPassword')}
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
            placeholder={t('auth.reset.minChars')}
          />
          <PasswordStrength password={password} />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-on-surface-variant">
            {t('auth.reset.confirmPassword')}
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
            placeholder={t('auth.reset.confirmYourPassword')}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? t('auth.reset.updating') : t('auth.reset.updatePassword')}
        </button>
      </form>
    </AuthLayout>
  )
}
