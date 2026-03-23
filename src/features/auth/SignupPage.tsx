import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from './AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp, signInWithProvider } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, orgName || undefined)
    if (error) {
      setError(error)
    } else {
      navigate('/onboarding', { replace: true })
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
            <Link
              to="/login"
              className="flex-1 py-3 text-center text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign In
            </Link>
            <div className="flex-1 py-3 text-center text-sm font-semibold text-on-surface border-b-2 border-primary cursor-default">
              Sign Up
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-error-container/20 border border-error/30">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@organization.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Input
              label="Organization Name"
              type="text"
              placeholder="Your club or agency"
              helperText="Optional — we'll create one from your name if left blank"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
            />
            <Button type="submit" loading={loading} leftIcon={UserPlus} className="w-full">
              Create Account
            </Button>
          </form>

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
            By signing up, you agree to our{' '}
            <a href="#" className="text-on-surface font-medium hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-on-surface font-medium hover:underline">Privacy Policy</a>
          </p>
        </Card>
      </main>
    </div>
  )
}
