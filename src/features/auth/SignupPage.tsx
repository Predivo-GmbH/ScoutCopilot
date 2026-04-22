import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link, useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { useAuth } from './useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import ResendTimer from '../../components/auth/ResendTimer'
import PasswordStrength from '../../components/auth/PasswordStrength'
import { getPasswordScore } from '../../components/auth/password-utils'
import { friendlyAuthError } from '../../lib/utils'

type Step = 'email' | 'verify' | 'profile'

export function SignupPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { sendOtp, verifyOtp, completeProfile, hasCompletedProfile } = useAuth()
  const navigate = useLocalizedNavigate()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      if (hasCompletedProfile()) {
        navigate('/dashboard')
        return
      }
      requestAnimationFrame(() => setStep('profile'))
    }
  }, [searchParams, hasCompletedProfile, navigate])

  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendOtp(email)
      setStep('verify')
    } catch (err) {
      setError(t(friendlyAuthError(err, 'Failed to send verification code')))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(code: string) {
    setError(null)
    setLoading(true)
    try {
      const { isNewUser } = await verifyOtp(email, code)
      if (isNewUser) {
        setStep('profile')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(t(friendlyAuthError(err, 'Invalid verification code')))
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteProfile(e: FormEvent) {
    e.preventDefault()
    if (getPasswordScore(password) < 3) {
      setError(t('auth.signup.weakPassword'))
      return
    }
    setError(null)
    setLoading(true)
    try {
      await completeProfile(password, fullName)
      navigate('/onboarding')
    } catch (err) {
      setError(t(friendlyAuthError(err, 'Failed to create account')))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    await sendOtp(email)
  }

  return (
    <AuthLayout>
      <Helmet>
        <title>{t('auth.signup.heading')} — ScoutCopilot</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Step 1: Email */}
      {step === 'email' && (
        <div>
          <h1 className="text-center text-2xl font-bold text-on-surface">
            {t('auth.signup.heading')}
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            {t('auth.signup.subheading')}
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <div className="h-1.5 w-8 rounded-md bg-primary" />
            <div className="h-1.5 w-8 rounded-md bg-outline-variant" />
            <div className="h-1.5 w-8 rounded-md bg-outline-variant" />
          </div>

          <form onSubmit={handleSendCode} className="mt-8 space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <Input
              id="signup-email"
              label={t('auth.signup.workEmail')}
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signup.emailPlaceholder')}
            />
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? t('auth.sendingCode') : t('common.continue')}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-on-surface-variant">
            {t('auth.signup.termsAgreement')}{' '}
            <Link to="/terms" className="text-primary-light hover:underline">{t('auth.signup.termsOfService')}</Link>
            {' '}{t('common.and')}{' '}
            <Link to="/privacy" className="text-primary-light hover:underline">{t('auth.signup.privacyPolicy')}</Link>.
          </p>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary-light hover:underline">
              {t('common.signIn')}
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Verify OTP */}
      {step === 'verify' && (
        <div>
          <h1 className="text-center text-2xl font-bold text-on-surface">
            {t('auth.signup.checkEmail')}
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            {t('auth.signup.codeSentTo')}{' '}
            <span className="font-medium text-on-surface">{email}</span>
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <div className="h-1.5 w-8 rounded-md bg-primary" />
            <div className="h-1.5 w-8 rounded-md bg-primary" />
            <div className="h-1.5 w-8 rounded-md bg-outline-variant" />
          </div>

          <div className="mt-8 space-y-5">
            {error && (
              <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <OtpInput onComplete={handleVerify} disabled={loading} />
            {loading && (
              <p className="text-center text-sm text-on-surface-variant">{t('auth.verifying')}</p>
            )}
            <ResendTimer onResend={handleResend} />
          </div>

          <button
            onClick={() => { setStep('email'); setError(null) }}
            className="mt-6 block w-full text-center text-sm font-medium text-on-surface-variant hover:text-on-surface min-h-[44px]"
          >
            {t('auth.useDifferentEmail')}
          </button>
        </div>
      )}

      {/* Step 3: Complete Profile */}
      {step === 'profile' && (
        <div>
          <h1 className="text-center text-2xl font-bold text-on-surface">
            {t('auth.signup.completeAccount')}
          </h1>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            {t('auth.signup.completeAccountSub')}
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <div className="h-1.5 w-8 rounded-md bg-primary" />
            <div className="h-1.5 w-8 rounded-md bg-primary" />
            <div className="h-1.5 w-8 rounded-md bg-primary" />
          </div>

          <form onSubmit={handleCompleteProfile} className="mt-8 space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <Input
              id="signup-name"
              label={t('auth.signup.fullName')}
              type="text"
              required
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.signup.fullNamePlaceholder')}
            />
            <div>
              <Input
                id="signup-password"
                label={t('auth.passwordLabel')}
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.signup.minChars')}
              />
              <PasswordStrength password={password} />
            </div>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createAccount')}
            </Button>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}
