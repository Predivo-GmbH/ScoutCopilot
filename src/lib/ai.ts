import { supabase } from './supabase'

/**
 * Calls a Supabase Edge Function that proxies requests to the Claude API.
 * The API key is stored server-side in the edge function, never in the client.
 */
export async function queryAI(prompt: string, context?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('ai-query', {
    body: { prompt, context },
  })
  if (error) throw error
  return data
}
