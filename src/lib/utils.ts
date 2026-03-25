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

/** Map Supabase auth errors to user-friendly messages */
export function friendlyAuthError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  if (msg.includes('email rate limit exceeded'))
    return 'Too many emails sent. Please wait a few minutes before trying again.'
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('invalid login credentials'))
    return 'Incorrect email or password. Please check your credentials and try again.'
  if (msg.includes('email not confirmed'))
    return 'Your email address has not been verified yet. Please check your inbox.'
  if (msg.includes('user not found') || msg.includes('no user found'))
    return 'No account found with this email address.'
  if (msg.includes('token has expired') || msg.includes('otp expired'))
    return 'Your verification code has expired. Please request a new one.'
  if (msg.includes('invalid') && msg.includes('otp'))
    return 'Invalid verification code. Please check and try again.'
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Connection error. Please check your internet and try again.'
  return err instanceof Error ? err.message : fallback
}
