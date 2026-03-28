import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useAuth } from './useAuth'

/**
 * Handles OTP deep links from emails.
 * URL: /auth/verify?token=123456&email=user@example.com&type=signup|login
 * Automatically verifies the OTP and redirects.
 */
export function AuthVerifyPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyOtp, hasCompletedProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'signup'

  useEffect(() => {
    if (!token || !email) {
      navigate('/login')
      return
    }

    // Capture narrowed values so the closure doesn't need non-null assertions
    const verifiedEmail = email
    const verifiedToken = token

    async function verify() {
      try {
        await verifyOtp(verifiedEmail, verifiedToken)
        if (type === 'signup' && !hasCompletedProfile()) {
          navigate('/signup?verified=true')
        } else {
          navigate('/dashboard')
        }
      } catch {
        setError(t('auth.verify.expired', 'This code has expired or is invalid. Please request a new one.'))
      }
    }

    verify()
  }, [token, email, type, navigate, verifyOtp, hasCompletedProfile, t])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Helmet><meta name="robots" content="noindex" /></Helmet>
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-error-container/20">
            <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-on-surface-variant">{error}</p>
          <a
            href={type === 'signup' ? '/signup' : '/login'}
            className="mt-4 inline-block text-sm font-medium text-primary-light hover:underline"
          >
            {type === 'signup' ? t('auth.verify.tryAgain', 'Try signing up again') : t('auth.verify.goToLogin', 'Go to login')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-md border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-on-surface-variant">{t('auth.verify.verifying', 'Verifying your code...')}</p>
      </div>
    </div>
  )
}
