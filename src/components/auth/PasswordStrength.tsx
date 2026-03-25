import { getPasswordScore } from './password-utils'

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const score = getPasswordScore(password)
  const colors = ['bg-error', 'bg-error', 'bg-tertiary', 'bg-primary', 'bg-primary', 'bg-secondary']
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Good', 'Strong']

  return (
    <div className="mt-2 space-y-2" role="status" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-md transition-colors ${
              i < score ? colors[score] : 'bg-outline-variant'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">
        Password strength:{' '}
        <span
          className={`font-medium ${
            score <= 1
              ? 'text-error'
              : score <= 2
                ? 'text-tertiary'
                : score <= 4
                  ? 'text-primary-light'
                  : 'text-secondary'
          }`}
        >
          {labels[score]}
        </span>
      </p>
    </div>
  )
}
