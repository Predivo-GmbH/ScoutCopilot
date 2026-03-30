import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link, useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { useAuth } from './useAuth'
import { Button } from '../../components/ui/Button'
import { ScrollableTabBar } from '../../components/ui/ScrollableTabBar'
import { Input } from '../../components/ui/Input'
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
  const navigate = useLocalizedNavigate()

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithPassword(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(t(friendlyAuthError(err, 'Login failed')))
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
      setError(t(friendlyAuthError(err, 'Failed to send login code')))
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
      setError(t(friendlyAuthError(err, 'Invalid verification code')))
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
      <Helmet>
        <title>{t('auth.signInTo')} — ScoutCopilot</title>
        <meta name="robots" content="noindex" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-center text-2xl font-bold text-on-surface">
        {t('auth.signInTo')}
      </h1>

      {/* Tabs */}
      <ScrollableTabBar
        tabs={[
          { key: 'password', label: t('auth.passwordTab') },
          { key: 'code', label: t('auth.emailCodeTab') },
        ]}
        activeKey={tab}
        onTabChange={(key) => switchTab(key as Tab)}
        className="mt-6"
      />

      {/* Password Tab */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          {error && (
            <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          <Input
            id="login-email"
            label={t('auth.emailLabel')}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scout@club.com"
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-[0.8125rem] font-medium tracking-[0.02em] text-on-surface-variant">
                {t('auth.passwordLabel')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary-light hover:underline min-h-[44px] inline-flex items-center"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordLabel')}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            {loading ? t('auth.signingIn') : t('common.signIn')}
          </Button>
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
          <Input
            id="code-email"
            label={t('auth.emailLabel')}
            type="email"
            required
            autoComplete="email"
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
            {loading ? t('auth.sendingCode') : t('auth.sendSignInCode')}
          </Button>
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
            className="block w-full text-center text-sm font-medium text-on-surface-variant hover:text-on-surface min-h-[44px]"
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
