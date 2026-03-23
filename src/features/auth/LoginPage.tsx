import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, KeyRound } from 'lucide-react'
import { useAuth } from './AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

type AuthMode = 'otp' | 'password'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, verifyOtp, signInWithPassword, signInWithProvider } = useAuth()

  const [mode, setMode] = useState<AuthMode>('otp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOtpSend(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signIn(email)
    if (error) {
      setError(error)
    } else {
      setOtpSent(true)
    }
    setLoading(false)
  }

  async function handleOtpVerify(e: FormEvent) {
    e.preventDefault()
    if (!otpToken.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await verifyOtp(email, otpToken)
    if (error) {
      setError(error)
    } else {
      navigate('/dashboard', { replace: true })
    }
    setLoading(false)
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithPassword(email, password)
    if (error) {
      setError(error)
    } else {
      navigate('/dashboard', { replace: true })
    }
    setLoading(false)
  }

  async function handleSSO(provider: 'google' | 'azure') {
    setError(null)
    const { error } = await signInWithProvider(provider)
    if (error) setError(error)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[480px] flex flex-col items-center">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">ScoutCopilot</h1>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant mt-1">
            AI-Powered Football Scouting
          </p>
        </div>

        <Card className="w-full">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant -mx-6 -mt-6 mb-6">
            <div className="flex-1 py-3 text-center text-sm font-semibold text-on-surface border-b-2 border-primary cursor-default">
              Sign In
            </div>
            <Link
              to="/signup"
              className="flex-1 py-3 text-center text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMode('otp'); setError(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'otp'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <KeyRound size={14} strokeWidth={1.5} />
              OTP Code
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setOtpSent(false); setError(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'password'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Lock size={14} strokeWidth={1.5} />
              Password
            </button>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-error-container/20 border border-error/30">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          {/* OTP flow */}
          {mode === 'otp' && !otpSent && (
            <form onSubmit={handleOtpSend} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="scout@club.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} leftIcon={Mail} className="w-full">
                Send OTP Code
              </Button>
            </form>
          )}

          {mode === 'otp' && otpSent && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <p className="text-xs text-on-surface-variant mb-2">
                Enter the 6-digit code sent to <span className="text-on-surface font-medium">{email}</span>
              </p>
              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otpToken}
                onChange={e => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Verify Code
              </Button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtpToken(''); setError(null) }}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Password flow */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="scout@club.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} leftIcon={Lock} className="w-full">
                Sign In
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-6 gap-4">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">
              or continue with
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          {/* SSO */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => handleSSO('google')}>
              Google
            </Button>
            <Button variant="secondary" onClick={() => handleSSO('azure')}>
              Microsoft
            </Button>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-center text-on-surface-variant mt-6 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="text-on-surface font-medium hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-on-surface font-medium hover:underline">Privacy Policy</a>
          </p>
        </Card>
      </main>
    </div>
  )
}
