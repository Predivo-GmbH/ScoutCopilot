import { supabase } from './supabase'
import type { DataProvider } from '../types/database'

// ── Credential Types ──────────────────────────────────────────────

export interface CredentialSummary {
  id: string
  provider: DataProvider
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Credential Management ─────────────────────────────────────────

/**
 * List organization's API credentials (masked — no secrets returned).
 */
export async function getCredentials(): Promise<CredentialSummary[]> {
  const { data, error } = await supabase.functions.invoke('credentials', {
    method: 'GET',
  })
  if (error) throw new Error(error.message ?? 'Failed to fetch credentials')
  return (data as { credentials: CredentialSummary[] }).credentials
}

/**
 * Add or replace an API credential for a data provider.
 * The edge function validates credentials before saving.
 */
export async function saveCredential(
  provider: DataProvider,
  username: string,
  password: string
): Promise<{ message: string; credential: CredentialSummary }> {
  const { data, error } = await supabase.functions.invoke('credentials', {
    method: 'POST',
    body: { provider, username, password },
  })
  if (error) throw new Error(error.message ?? 'Failed to save credential')
  return data as { message: string; credential: CredentialSummary }
}

/**
 * Update an existing credential (change keys or toggle active state).
 */
export async function updateCredential(
  id: string,
  updates: {
    username?: string
    password?: string
    is_active?: boolean
  }
): Promise<{ message: string; credential: CredentialSummary }> {
  const { data, error } = await supabase.functions.invoke('credentials', {
    method: 'PUT',
    body: { id, ...updates },
  })
  if (error) throw new Error(error.message ?? 'Failed to update credential')
  return data as { message: string; credential: CredentialSummary }
}

/**
 * Delete an API credential.
 */
export async function deleteCredential(
  id: string
): Promise<{ message: string }> {
  const { data, error } = await supabase.functions.invoke('credentials', {
    method: 'DELETE',
    body: { id },
  })
  if (error) throw new Error(error.message ?? 'Failed to delete credential')
  return data as { message: string }
}

// ── Search History ────────────────────────────────────────────────

/**
 * Fetch recent search queries for the current organization.
 */
export async function getSearchHistory(limit = 20) {
  const { data, error } = await supabase
    .from('search_queries')
    .select('id, query_text, parsed_parameters, result_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetch results for a specific search query.
 */
export async function getSearchResults(searchQueryId: string) {
  const { data, error } = await supabase
    .from('search_results')
    .select('*')
    .eq('search_query_id', searchQueryId)
    .order('rank', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// ── Report History ────────────────────────────────────────────────

/**
 * Fetch saved scouting reports for the current organization.
 */
export async function getReports(limit = 20) {
  const { data, error } = await supabase
    .from('player_reports')
    .select('id, player_external_id, player_name, source_provider, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetch a specific scouting report with full data.
 */
export async function getReport(reportId: string) {
  const { data, error } = await supabase
    .from('player_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Comparison History ────────────────────────────────────────────

/**
 * Fetch saved comparisons for the current organization.
 */
export async function getComparisons(limit = 20) {
  const { data, error } = await supabase
    .from('player_comparisons')
    .select('id, title, player_ids, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetch a specific comparison with full data.
 */
export async function getComparison(comparisonId: string) {
  const { data, error } = await supabase
    .from('player_comparisons')
    .select('*')
    .eq('id', comparisonId)
    .single()

  if (error) throw new Error(error.message)
  return data
}
