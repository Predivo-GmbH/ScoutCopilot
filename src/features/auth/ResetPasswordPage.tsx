import { useState, useEffect, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { useAuth } from './useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
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
  const { user, isLoading: authLoading, updatePassword, signOut } = useAuth()
  const navigate = useLocalizedNavigate()

  // Skip once `done` is set: a successful reset intentionally signs the user
  // out, which nulls `user` — without this guard that sign-out would bounce
  // them back to /forgot-password instead of showing the success screen.
  useEffect(() => {
    if (authLoading) return
    if (!user && !done) {
      navigate('/forgot-password')
    }
  }, [user, authLoading, done, navigate])

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
      await signOut()
      setDone(true)
    } catch (err) {
      setError(t(friendlyAuthError(err, 'Failed to update password')))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <Helmet>
          <title>{t('auth.reset.passwordUpdated')} — ScoutCopilot</title>
          <meta name="robots" content="noindex" />
        </Helmet>
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
            className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-dark min-h-[44px] inline-flex items-center"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Helmet>
        <title>{t('auth.reset.chooseNewPassword')} — ScoutCopilot</title>
        <meta name="robots" content="noindex" />
      </Helmet>
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
          <Input
            id="new-password"
            label={t('auth.reset.newPassword')}
            type="password"
            required
            autoComplete="new-password"
            autoFocus
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.reset.minChars')}
          />
          <PasswordStrength password={password} />
        </div>
        <Input
          id="confirm-password"
          label={t('auth.reset.confirmPassword')}
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('auth.reset.confirmYourPassword')}
        />
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          className="w-full"
        >
          {loading ? t('auth.reset.updating') : t('auth.reset.updatePassword')}
        </Button>
      </form>
    </AuthLayout>
  )
}
