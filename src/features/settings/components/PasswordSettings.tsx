import { useState, type FormEvent } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { getPasswordScore } from '../../../components/auth/password-utils'
import PasswordStrength from '../../../components/auth/PasswordStrength'

export function PasswordSettings() {
  const { updatePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (getPasswordScore(newPassword) < 3) {
      setError('Please choose a stronger password')
      return
    }

    setLoading(true)
    try {
      await updatePassword(newPassword)
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant flex items-center gap-2">
        <Lock size={16} strokeWidth={1.5} className="text-on-surface-variant" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div role="alert" className="rounded-md bg-error-container/20 border border-error/30 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-secondary/10 border border-secondary/30 px-4 py-3 text-sm text-secondary">
            Password updated successfully.
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="new-password" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(null); setSuccess(false) }}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Min. 8 characters"
            />
            <PasswordStrength password={newPassword} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setSuccess(false) }}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Repeat password"
            />
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  )
}
