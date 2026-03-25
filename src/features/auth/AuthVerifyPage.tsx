import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Handles OTP deep links from emails.
 * URL: /auth/verify?token=123456&email=user@example.com&type=signup|login
 * Automatically verifies the OTP and redirects.
 */
export function AuthVerifyPage() {
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

    async function verify() {
      try {
        await verifyOtp(email!, token!)
        if (type === 'signup' && !hasCompletedProfile()) {
          navigate('/signup?verified=true')
        } else {
          navigate('/dashboard')
        }
      } catch {
        setError('This code has expired or is invalid. Please request a new one.')
      }
    }

    verify()
  }, [token, email, type, navigate, verifyOtp, hasCompletedProfile])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
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
            {type === 'signup' ? 'Try signing up again' : 'Go to login'}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-6 w-6 animate-spin rounded-md border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-on-surface-variant">Verifying your code...</p>
      </div>
    </div>
  )
}
