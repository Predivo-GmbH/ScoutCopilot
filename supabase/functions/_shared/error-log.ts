/**
 * Shared error logging helper for critical-path failures.
 *
 * Added 2026-08-20 with the error_log table. Before this, every caught error in this
 * product went to console.error and vanished, so nothing could tell a broken user journey
 * from a quiet week. Read by the UX Scout
 * (production-monitor/scripts/ux-scout.mjs), which separates failures that hit an
 * AUTHENTICATED user from anonymous probes.
 *
 * Never throws. A logging failure must never break the request it is describing.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { describeError } from './describe-error.ts'

/**
 * Log a critical-path error to the database.
 *
 * @param context ids and booleans ONLY. Never an email, name, token, card detail or any
 *   free text a user typed. The point is to attribute a failure to a caller
 *   (`user_id`, `has_auth`, which required field was missing), not to store their data.
 */
export async function logError(
  functionName: string,
  operation: string,
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  // Always console.error as the fallback, so a DB outage still leaves a trace.
  console.error(`[${functionName}] ${operation}:`, error)

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = (Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    if (!url || !key) return

    const client = createClient(url, key)
    await client.from('error_log').insert({
      function_name: functionName,
      operation,
      // describeError, not String(): a supabase-js failure is a PostgrestError - a plain
      // object, not an Error - and String() wrote "[object Object]" into this column, losing
      // the only text that could explain the failure (proven on ChannelMover, 2026-08-28/29:
      // a kill-switch read that silently skipped a tick of live customer email was
      // undiagnosable for four days until this was fixed there).
      error_message: describeError(error),
      // Pass the OBJECT, not a string. `context` is jsonb; JSON.stringify here would
      // double-encode it into the jsonb STRING "{}" and make context->>'user_id'
      // permanently null. That defect shipped in all five older copies of this helper and
      // was only caught on 2026-08-20 (ReplyFlow 3e353c6).
      context: context ?? {},
    })
  } catch {
    // DB logging itself failed. The console.error above is the last resort.
  }
}
