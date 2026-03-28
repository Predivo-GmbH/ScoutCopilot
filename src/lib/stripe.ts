import type { SubscriptionTier } from '../types/database'
import { supabase } from './supabase'

// Stripe price ID mapping — loaded from env vars (VITE_STRIPE_PRICE_{TIER}_{INTERVAL})
// Falls back to empty string so checkout will fail visibly instead of silently using wrong IDs
export const PRICE_IDS: Record<SubscriptionTier, { month: string; year: string }> = {
  scout: {
    month: import.meta.env.VITE_STRIPE_PRICE_SCOUT_MONTH ?? '',
    year: import.meta.env.VITE_STRIPE_PRICE_SCOUT_YEAR ?? '',
  },
  pro: {
    month: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTH ?? '',
    year: import.meta.env.VITE_STRIPE_PRICE_PRO_YEAR ?? '',
  },
  club: {
    month: import.meta.env.VITE_STRIPE_PRICE_CLUB_MONTH ?? '',
    year: import.meta.env.VITE_STRIPE_PRICE_CLUB_YEAR ?? '',
  },
}

export type BillingInterval = 'month' | 'year'

export const TIER_PRICES: Record<SubscriptionTier, { month: string; year: string }> = {
  scout: { month: 'X', year: 'X' },
  pro: { month: 'Y', year: 'Y' },
  club: { month: 'Z', year: 'Z' },
}

export const TIER_ANNUAL_TOTAL: Record<SubscriptionTier, string> = {
  scout: 'X',
  pro: 'Y',
  club: 'Z',
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  scout: 'Scout',
  pro: 'Pro',
  club: 'Club',
}

export interface TierLimits {
  maxSeats: number
  maxReports: number | null // null = unlimited
  maxShortlists: number | null
  maxComparisons: number
  maxLeagues: number | null
  hasTacticalFit: boolean
  hasTrajectory: boolean
  hasPdfExport: boolean
  hasWatchlists: boolean
  hasCustomModels: boolean
  hasApiAccess: boolean
  hasBulkOps: boolean
  hasCustomMetrics: boolean
  dataRetentionMonths: number
  dataSources: number
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  scout: {
    maxSeats: 1,
    maxReports: 10,
    maxShortlists: 25,
    maxComparisons: 3,
    maxLeagues: 1,
    hasTacticalFit: false,
    hasTrajectory: false,
    hasPdfExport: false,
    hasWatchlists: false,
    hasCustomModels: false,
    hasApiAccess: false,
    hasBulkOps: false,
    hasCustomMetrics: false,
    dataRetentionMonths: 3,
    dataSources: 1,
  },
  pro: {
    maxSeats: 3,
    maxReports: null,
    maxShortlists: null,
    maxComparisons: 10,
    maxLeagues: null,
    hasTacticalFit: true,
    hasTrajectory: true,
    hasPdfExport: true,
    hasWatchlists: true,
    hasCustomModels: false,
    hasApiAccess: false,
    hasBulkOps: false,
    hasCustomMetrics: false,
    dataRetentionMonths: 6,
    dataSources: 2,
  },
  club: {
    maxSeats: 10,
    maxReports: null,
    maxShortlists: null,
    maxComparisons: 10,
    maxLeagues: null,
    hasTacticalFit: true,
    hasTrajectory: true,
    hasPdfExport: true,
    hasWatchlists: true,
    hasCustomModels: true,
    hasApiAccess: true,
    hasBulkOps: true,
    hasCustomMetrics: true,
    dataRetentionMonths: 24,
    dataSources: 2,
  },
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier]
}

export async function createCheckoutSession(
  tier: SubscriptionTier,
  interval: BillingInterval
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('checkout', {
    body: { tier, interval },
  })

  if (error) throw new Error(error.message || 'Failed to create checkout session')
  return data.url
}

export async function openBillingPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('billing-portal', {
    body: {},
  })

  if (error) throw new Error(error.message || 'Failed to open billing portal')
  return data.url
}
