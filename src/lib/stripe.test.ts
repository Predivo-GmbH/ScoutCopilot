/**
 * Stripe Utilities — Unit Tests
 * Tests tier prices, limits, labels, and getTierLimits
 */
import { describe, it, expect } from 'vitest'
import { TIER_PRICES, TIER_LABELS, TIER_LIMITS, TIER_ANNUAL_TOTAL, getTierLimits } from './stripe'

describe('Stripe tier configuration', () => {
  describe('TIER_PRICES', () => {
    it('has scout tier pricing', () => {
      expect(TIER_PRICES.scout).toBeDefined()
      expect(TIER_PRICES.scout.month).toBeDefined()
      expect(TIER_PRICES.scout.year).toBeDefined()
    })

    it('has pro tier pricing', () => {
      expect(TIER_PRICES.pro).toBeDefined()
      expect(TIER_PRICES.pro.month).toBeDefined()
      expect(TIER_PRICES.pro.year).toBeDefined()
    })

    it('has club tier pricing', () => {
      expect(TIER_PRICES.club).toBeDefined()
      expect(TIER_PRICES.club.month).toBeDefined()
      expect(TIER_PRICES.club.year).toBeDefined()
    })
  })

  describe('TIER_LABELS', () => {
    it('has all three tiers', () => {
      expect(TIER_LABELS.scout).toBe('Scout')
      expect(TIER_LABELS.pro).toBe('Pro')
      expect(TIER_LABELS.club).toBe('Club')
    })
  })

  describe('TIER_ANNUAL_TOTAL', () => {
    it('has annual totals for all tiers', () => {
      expect(TIER_ANNUAL_TOTAL.scout).toBeDefined()
      expect(TIER_ANNUAL_TOTAL.pro).toBeDefined()
      expect(TIER_ANNUAL_TOTAL.club).toBeDefined()
    })
  })

  describe('TIER_LIMITS', () => {
    it('scout tier has limited features', () => {
      const limits = TIER_LIMITS.scout
      expect(limits.maxSeats).toBe(1)
      expect(limits.maxReports).toBe(10)
      expect(limits.hasTacticalFit).toBe(false)
      expect(limits.hasApiAccess).toBe(false)
      expect(limits.hasPdfExport).toBe(false)
    })

    it('pro tier has more features than scout', () => {
      const limits = TIER_LIMITS.pro
      expect(limits.maxSeats).toBe(3)
      expect(limits.maxReports).toBeNull() // unlimited
      expect(limits.hasTacticalFit).toBe(true)
      expect(limits.hasPdfExport).toBe(true)
      expect(limits.hasWatchlists).toBe(true)
    })

    it('club tier has all features', () => {
      const limits = TIER_LIMITS.club
      expect(limits.maxSeats).toBe(10)
      expect(limits.maxReports).toBeNull()
      expect(limits.hasCustomModels).toBe(true)
      expect(limits.hasApiAccess).toBe(true)
      expect(limits.hasBulkOps).toBe(true)
      expect(limits.hasCustomMetrics).toBe(true)
    })

    it('data retention increases with tier', () => {
      expect(TIER_LIMITS.scout.dataRetentionMonths).toBeLessThan(TIER_LIMITS.pro.dataRetentionMonths)
      expect(TIER_LIMITS.pro.dataRetentionMonths).toBeLessThan(TIER_LIMITS.club.dataRetentionMonths)
    })
  })

  describe('getTierLimits', () => {
    it('returns scout limits', () => {
      expect(getTierLimits('scout')).toEqual(TIER_LIMITS.scout)
    })

    it('returns pro limits', () => {
      expect(getTierLimits('pro')).toEqual(TIER_LIMITS.pro)
    })

    it('returns club limits', () => {
      expect(getTierLimits('club')).toEqual(TIER_LIMITS.club)
    })
  })
})
