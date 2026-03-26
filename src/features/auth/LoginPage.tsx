import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import ResendTimer from '../../components/auth/ResendTimer'
import { friendlyAuthError } from '../../lib/utils'

type Tab = 'password' | 'code'
type CodeStep = 'email' | 'verify'

export function LoginPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('password')
  const [codeStep, setCodeStep] = useState<CodeStep>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signInWithPassword, sendLoginOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithPassword(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyAuthError(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendLoginOtp(email)
      setCodeStep('verify')
    } catch (err) {
      setError(friendlyAuthError(err, 'Failed to send login code'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(code: string) {
    setError(null)
    setLoading(true)
    try {
      await verifyOtp(email, code)
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyAuthError(err, 'Invalid verification code'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    await sendLoginOtp(email)
  }

  function switchTab(t: Tab) {
    setTab(t)
    setError(null)
    setCodeStep('email')
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-2xl font-bold text-on-surface">
        {t('auth.signInTo')}
      </h1>

      {/* Tabs */}
      <div className="mt-6 flex rounded-md border border-outline-variant bg-surface-container-low p-1">
        <button
          onClick={() => switchTab('password')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'password'
              ? 'bg-surface-container-high text-on-surface'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {t('auth.passwordTab')}
        </button>
        <button
          onClick={() => switchTab('code')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'code'
              ? 'bg-surface-container-high text-on-surface'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {t('auth.emailCodeTab')}
        </button>
      </div>

      {/* Password Tab */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          {error && (
            <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-on-surface-variant">
              {t('auth.emailLabel')}
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              placeholder="scout@club.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-medium text-on-surface-variant">
                {t('auth.passwordLabel')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary-light hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              placeholder={t('auth.passwordLabel')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? t('auth.signingIn') : t('common.signIn')}
          </button>
        </form>
      )}

      {/* Email Code Tab — Step 1: Email */}
      {tab === 'code' && codeStep === 'email' && (
        <form onSubmit={handleSendCode} className="mt-6 space-y-4">
          {error && (
            <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          <p className="text-center text-sm text-on-surface-variant">
            {t('auth.sendCodeDescription')}
          </p>
          <div>
            <label htmlFor="code-email" className="block text-sm font-medium text-on-surface-variant">
              {t('auth.emailLabel')}
            </label>
            <input
              id="code-email"
              type="email"
              required
              autoComplete="email"
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
            {loading ? t('auth.sendingCode') : t('auth.sendSignInCode')}
          </button>
        </form>
      )}

      {/* Email Code Tab — Step 2: Verify */}
      {tab === 'code' && codeStep === 'verify' && (
        <div className="mt-6 space-y-5">
          <p className="text-center text-sm text-on-surface-variant">
            {t('auth.enterCodeSentTo')}{' '}
            <span className="font-medium text-on-surface">{email}</span>
          </p>
          {error && (
            <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          <OtpInput onComplete={handleVerifyCode} disabled={loading} />
          {loading && <p className="text-center text-sm text-on-surface-variant">{t('auth.verifying')}</p>}
          <ResendTimer onResend={handleResend} />
          <p className="text-center text-xs text-on-surface-variant">
            {t('auth.didntReceiveCode')}{' '}
            <Link to="/signup" className="text-primary-light hover:underline">{t('common.signUp')}</Link>.
          </p>
          <button
            onClick={() => { setCodeStep('email'); setError(null) }}
            className="block w-full text-center text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            {t('auth.useDifferentEmail')}
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        {t('auth.dontHaveAccount')}{' '}
        <Link to="/signup" className="font-medium text-primary-light hover:underline">
          {t('auth.startFreeTrial')}
        </Link>
      </p>
    </AuthLayout>
  )
}
