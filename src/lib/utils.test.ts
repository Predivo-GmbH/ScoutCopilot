import { describe, it, expect } from 'vitest'
import { cn, formatNumber, clamp, friendlyAuthError } from './utils'

// ── cn ──────────────────────────────────────────────────────────────

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns empty string when all falsy', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })
})

// ── formatNumber ────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats integer with no decimals by default', () => {
    const result = formatNumber(1234)
    // de-CH uses apostrophe or thin space as thousands separator
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('formats with specified decimal places', () => {
    const result = formatNumber(3.14159, 2)
    expect(result).toContain('3')
    expect(result).toContain('14')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

// ── clamp ───────────────────────────────────────────────────────────

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min when below', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max when above', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles value equal to min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('handles value equal to max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

// ── friendlyAuthError ───────────────────────────────────────────────

describe('friendlyAuthError', () => {
  const fallback = 'Something went wrong'

  it('maps "email rate limit exceeded"', () => {
    const err = new Error('Email rate limit exceeded')
    expect(friendlyAuthError(err, fallback)).toBe('errors.tooManyEmails')
  })

  it('maps "rate limit"', () => {
    const err = new Error('Rate limit reached for this endpoint')
    expect(friendlyAuthError(err, fallback)).toBe('errors.tooManyAttempts')
  })

  it('maps "too many requests"', () => {
    const err = new Error('Too many requests')
    expect(friendlyAuthError(err, fallback)).toBe('errors.tooManyAttempts')
  })

  it('maps "invalid login credentials"', () => {
    const err = new Error('Invalid login credentials')
    expect(friendlyAuthError(err, fallback)).toBe('errors.incorrectCredentials')
  })

  it('maps "email not confirmed"', () => {
    const err = new Error('Email not confirmed')
    expect(friendlyAuthError(err, fallback)).toBe('errors.emailNotVerified')
  })

  it('maps "user not found"', () => {
    const err = new Error('User not found')
    expect(friendlyAuthError(err, fallback)).toBe('errors.noAccount')
  })

  it('maps "no user found"', () => {
    const err = new Error('No user found with this email')
    expect(friendlyAuthError(err, fallback)).toBe('errors.noAccount')
  })

  it('maps "token has expired"', () => {
    const err = new Error('Token has expired or is invalid')
    expect(friendlyAuthError(err, fallback)).toBe('errors.codeExpired')
  })

  it('maps "otp expired"', () => {
    const err = new Error('OTP expired')
    expect(friendlyAuthError(err, fallback)).toBe('errors.codeExpired')
  })

  it('maps "invalid otp"', () => {
    const err = new Error('Invalid OTP provided')
    expect(friendlyAuthError(err, fallback)).toBe('errors.invalidCode')
  })

  it('maps "signups not allowed"', () => {
    const err = new Error('Signups not allowed for this instance')
    expect(friendlyAuthError(err, fallback)).toBe('errors.noAccount')
  })

  it('maps "network" errors', () => {
    const err = new Error('Network error occurred')
    expect(friendlyAuthError(err, fallback)).toBe('errors.connectionError')
  })

  it('maps "fetch" errors', () => {
    const err = new Error('Failed to fetch')
    expect(friendlyAuthError(err, fallback)).toBe('errors.connectionError')
  })

  it('returns raw message for unknown Error', () => {
    const err = new Error('Some unknown error')
    expect(friendlyAuthError(err, fallback)).toBe('Some unknown error')
  })

  it('returns fallback for non-Error input', () => {
    expect(friendlyAuthError('string-error', fallback)).toBe(fallback)
    expect(friendlyAuthError(null, fallback)).toBe(fallback)
    expect(friendlyAuthError(undefined, fallback)).toBe(fallback)
    expect(friendlyAuthError(42, fallback)).toBe(fallback)
  })

  it('is case-insensitive', () => {
    const err = new Error('EMAIL RATE LIMIT EXCEEDED')
    expect(friendlyAuthError(err, fallback)).toBe('errors.tooManyEmails')
  })
})
