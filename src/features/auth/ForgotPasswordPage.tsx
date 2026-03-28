import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import AuthLayout from '../../components/auth/AuthLayout'
import { friendlyAuthError } from '../../lib/utils'

type Step = 'form' | 'sent'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
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
      setError(t(friendlyAuthError(err, 'Failed to send reset email')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Helmet>
        <title>{t('auth.forgot.heading')} — ScoutCopilot</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {step === 'form' && (
        <div>
          <h1 className="text-center text-2xl font-bold text-on-surface">
            {t('auth.forgot.heading')}
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            {t('auth.forgot.description')}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <Input
              id="reset-email"
              label={t('auth.emailLabel')}
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scout@club.com"
            />
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? t('auth.forgot.sending') : t('auth.forgot.sendResetLink')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            <Link to="/login" className="font-medium text-primary-light hover:underline">
              {t('auth.forgot.backToSignIn')}
            </Link>
          </p>
        </div>
      )}

      {step === 'sent' && (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
            <Mail className="h-7 w-7 text-primary-light" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-on-surface">{t('auth.forgot.checkEmail')}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t('auth.forgot.resetLinkSentTo')}{' '}
            <span className="font-medium text-on-surface">{email}</span>. {t('auth.forgot.clickLink')}
          </p>
          <p className="mt-4 text-xs text-on-surface-variant">
            {t('auth.forgot.didntReceive')}{' '}
            <button
              onClick={() => setStep('form')}
              className="font-medium text-primary-light hover:underline"
            >
              {t('auth.forgot.tryAgain')}
            </button>
            .
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block text-sm font-medium text-primary-light hover:underline"
          >
            {t('auth.forgot.backToSignIn')}
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}
