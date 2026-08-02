import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Current user's id from the JWT claims. With the project's ES256 (asymmetric)
 * auth keys, getClaims() verifies the token locally — no /auth/v1/user network
 * round-trip like getUser() — and falls back to getUser() when local
 * verification isn't possible, so it is always at least as safe. Returns null
 * when there is no authenticated user.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getClaims()
  return (data?.claims?.sub as string | undefined) ?? null
}
