import { supabase } from './supabase'

export async function fetchWithAuth(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`
  }
  return fetch(path, { ...options, headers })
}
