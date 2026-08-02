import { useQuery } from '@tanstack/react-query'
import { supabase, getCurrentUserId } from '../lib/supabase'
import { getTierLimits, type TierLimits } from '../lib/stripe'
import type { SubscriptionTier } from '../types/database'

interface SubscriptionState {
  tier: SubscriptionTier
  limits: TierLimits
  usage: {
    apiCalls: number
    reportsGenerated: number
    searchesCount: number
  }
  isLoading: boolean
  canAccess: (feature: keyof TierLimits) => boolean
  isOverLimit: (resource: 'reports' | 'searches') => boolean
}

async function fetchSubscription() {
  // Get current user's org
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()

  if (!profile?.organization_id) throw new Error('No organization')

  // Fetch org and usage in parallel
  const [orgResult, usageResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', profile.organization_id)
      .single(),
    supabase
      .from('usage_tracking')
      .select('api_calls_count, reports_generated, searches_count')
      .eq('organization_id', profile.organization_id)
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (orgResult.error) throw orgResult.error

  const tier = orgResult.data.subscription_tier as SubscriptionTier
  const usage = usageResult.data ?? { api_calls_count: 0, reports_generated: 0, searches_count: 0 }

  return {
    tier,
    usage: {
      apiCalls: usage.api_calls_count,
      reportsGenerated: usage.reports_generated,
      searchesCount: usage.searches_count,
    },
  }
}

export function useSubscription(): SubscriptionState {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 60_000,
  })

  const tier = data?.tier ?? 'scout'
  const limits = getTierLimits(tier)
  const usage = data?.usage ?? { apiCalls: 0, reportsGenerated: 0, searchesCount: 0 }

  function canAccess(feature: keyof TierLimits): boolean {
    const value = limits[feature]
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0
    return value !== null
  }

  function isOverLimit(resource: 'reports' | 'searches'): boolean {
    if (resource === 'reports') {
      return limits.maxReports !== null && usage.reportsGenerated >= limits.maxReports
    }
    // searches don't have a limit in the current tier model, but keeping for extensibility
    return false
  }

  return { tier, limits, usage, isLoading, canAccess, isOverLimit }
}
