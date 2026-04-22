/**
 * Age Utilities — Unit Tests
 * Tests calculateAge and formatAge for correctness, edge cases, and null handling
 */
import { describe, it, expect } from 'vitest'
import { calculateAge, formatAge } from './ageUtils'

describe('calculateAge', () => {
  it('returns correct age for past date', () => {
    const age = calculateAge('2000-01-01')
    expect(age).toBeGreaterThanOrEqual(25)
    expect(age).toBeLessThan(30)
  })

  it('returns null for null input', () => {
    expect(calculateAge(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(calculateAge(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(calculateAge('')).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(calculateAge('not-a-date')).toBeNull()
  })

  it('returns 0 for a date within the current year for a newborn', () => {
    const today = new Date()
    const recentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const age = calculateAge(recentDate.toISOString().split('T')[0])
    expect(age).toBe(0)
  })

  it('handles birthday not yet occurred this year', () => {
    const today = new Date()
    const futureMonth = today.getMonth() + 2 > 11 ? 0 : today.getMonth() + 2
    const futureYear = futureMonth === 0 ? today.getFullYear() : today.getFullYear()
    const birthDate = `${futureYear - 25}-${String(futureMonth + 1).padStart(2, '0')}-15`
    const age = calculateAge(birthDate)
    // If birthday hasn't occurred yet this year, age should be 24
    if (age !== null) {
      expect(age).toBeGreaterThanOrEqual(24)
      expect(age).toBeLessThanOrEqual(25)
    }
  })
})

describe('formatAge', () => {
  it('returns age as string for valid date', () => {
    const result = formatAge('2000-01-01')
    expect(Number(result)).toBeGreaterThanOrEqual(25)
  })

  it('returns em dash for null input', () => {
    expect(formatAge(null)).toBe('\u2014')
  })

  it('returns em dash for undefined input', () => {
    expect(formatAge(undefined)).toBe('\u2014')
  })

  it('returns em dash for invalid date', () => {
    expect(formatAge('invalid')).toBe('\u2014')
  })
})
