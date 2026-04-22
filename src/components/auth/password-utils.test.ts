/**
 * Password Utilities — Unit Tests
 * Tests getPasswordScore for all strength levels
 */
import { describe, it, expect } from 'vitest'
import { getPasswordScore } from './password-utils'

describe('getPasswordScore', () => {
  it('returns 0 for empty string', () => {
    expect(getPasswordScore('')).toBe(0)
  })

  it('returns 1 for short lowercase only', () => {
    expect(getPasswordScore('abcdefgh')).toBe(2) // 8+ chars + lowercase
  })

  it('returns 2 for lowercase + uppercase', () => {
    expect(getPasswordScore('Abcdefgh')).toBe(3) // 8+ chars + upper + lower
  })

  it('returns 3 for lowercase + uppercase + number', () => {
    expect(getPasswordScore('Abcdefg1')).toBe(4) // 8+ chars + upper + lower + number
  })

  it('returns 5 for strong password with all criteria', () => {
    expect(getPasswordScore('Abcdefg1!')).toBe(5) // all 5 checks pass
  })

  it('returns 0 for single character', () => {
    expect(getPasswordScore('a')).toBe(1) // only lowercase
  })

  it('handles numbers only', () => {
    expect(getPasswordScore('12345678')).toBe(2) // 8+ chars + number
  })

  it('handles special characters only', () => {
    expect(getPasswordScore('!@#$%^&*')).toBe(2) // 8+ chars + special
  })

  it('returns correct score for 7-character password', () => {
    expect(getPasswordScore('Abcde1!')).toBe(4) // upper + lower + num + special but NOT 8+ chars
  })

  it('scores increase incrementally', () => {
    const s1 = getPasswordScore('a')
    const s2 = getPasswordScore('aB')
    const s3 = getPasswordScore('aB1')
    const s4 = getPasswordScore('aB1!')
    const s5 = getPasswordScore('aB1!efgh')
    expect(s1).toBeLessThan(s2)
    expect(s2).toBeLessThan(s3)
    expect(s3).toBeLessThan(s4)
    expect(s4).toBeLessThan(s5)
  })
})
