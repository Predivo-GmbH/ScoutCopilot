type ClassInput = string | boolean | null | undefined

/** Merge class names, filtering out falsy values */
export function cn(...classes: ClassInput[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format a number with locale-aware separators */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Map Supabase auth errors to i18n translation keys.
 * Returns a key like "errors.tooManyEmails" that the caller translates via t().
 * If no match is found, returns the raw error message or the fallback.
 */
export function friendlyAuthError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  if (msg.includes('email rate limit exceeded'))
    return 'errors.tooManyEmails'
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'errors.tooManyAttempts'
  if (msg.includes('invalid login credentials'))
    return 'errors.incorrectCredentials'
  if (msg.includes('email not confirmed'))
    return 'errors.emailNotVerified'
  if (msg.includes('user not found') || msg.includes('no user found'))
    return 'errors.noAccount'
  if (msg.includes('token has expired') || msg.includes('otp expired'))
    return 'errors.codeExpired'
  if (msg.includes('invalid') && msg.includes('otp'))
    return 'errors.invalidCode'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'errors.connectionError'
  return err instanceof Error ? err.message : fallback
}
