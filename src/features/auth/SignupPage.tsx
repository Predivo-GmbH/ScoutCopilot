import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
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
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      if (hasCompletedProfile()) {
        navigate('/dashboard')
        return
      }
      setStep('profile')
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
      setError(friendlyAuthError(err, 'Failed to send verification code'))
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
      setError(friendlyAuthError(err, 'Invalid verification code'))
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
      setError(friendlyAuthError(err, 'Failed to create account'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    await sendOtp(email)
  }

  return (
    <AuthLayout>
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
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-on-surface-variant">
                {t('auth.signup.workEmail')}
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                placeholder={t('auth.signup.emailPlaceholder')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? t('auth.sendingCode') : t('common.continue')}
            </button>
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
            className="mt-6 block w-full text-center text-sm font-medium text-on-surface-variant hover:text-on-surface"
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
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-on-surface-variant">
                {t('auth.signup.fullName')}
              </label>
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                placeholder={t('auth.signup.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-on-surface-variant">
                {t('auth.passwordLabel')}
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                placeholder={t('auth.signup.minChars')}
              />
              <PasswordStrength password={password} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createAccount')}
            </button>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}
