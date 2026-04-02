/**
 * delete-account — Cascade delete all user data + auth user.
 *
 * POST /delete-account
 * Body: { lang?: "en" | "de" } (uses authenticated user's JWT)
 */

import { handleCors } from '../_shared/cors.ts'
import { sendEmail, accountDeletedEmail, normalizeEmailLang } from '../_shared/email.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { checkRateLimit } from '../_shared/rate-limiter.ts'

Deno.serve(async (req) => {
  const { corsHeaders, preflightResponse } = handleCors(req)
  if (preflightResponse) return preflightResponse

  try {
    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit: 3 requests/minute per user
    const { allowed, retryAfterMs } = checkRateLimit(user.id, 3 / 60, 3)
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      )
    }

    // Determine language: prefer explicit body param, then user_metadata, then default 'en'
    let bodyLang: string | undefined
    try {
      const body = await req.json()
      bodyLang = body?.lang
    } catch {
      // No body or invalid JSON — that's fine
    }
    const lang = normalizeEmailLang(bodyLang ?? user.user_metadata?.language)

    // Use service role to delete the user (admin action)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get user's organization memberships
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const orgId = profile?.organization_id

    if (orgId) {
      // Delete data in FK-safe order
      // 1. Watchlist players (FK → watchlists → organizations)
      const { data: watchlists } = await supabaseAdmin
        .from('watchlists')
        .select('id')
        .eq('organization_id', orgId)

      const watchlistIds = watchlists?.map((w: { id: string }) => w.id) ?? []
      if (watchlistIds.length > 0) {
        await supabaseAdmin
          .from('watchlist_players')
          .delete()
          .in('watchlist_id', watchlistIds)
      }

      // 2. Watchlists
      await supabaseAdmin
        .from('watchlists')
        .delete()
        .eq('organization_id', orgId)

      // 3. Player comparisons
      await supabaseAdmin
        .from('player_comparisons')
        .delete()
        .eq('organization_id', orgId)

      // 4. Player reports
      await supabaseAdmin
        .from('player_reports')
        .delete()
        .eq('organization_id', orgId)

      // 5. Search results (FK → search_queries)
      const { data: queries } = await supabaseAdmin
        .from('search_queries')
        .select('id')
        .eq('organization_id', orgId)

      const queryIds = queries?.map((q: { id: string }) => q.id) ?? []
      if (queryIds.length > 0) {
        await supabaseAdmin
          .from('search_results')
          .delete()
          .in('query_id', queryIds)
      }

      // 6. Search queries
      await supabaseAdmin
        .from('search_queries')
        .delete()
        .eq('organization_id', orgId)

      // 7. API credentials
      await supabaseAdmin
        .from('api_credentials')
        .delete()
        .eq('organization_id', orgId)

      // 8. Usage tracking
      await supabaseAdmin
        .from('usage_tracking')
        .delete()
        .eq('organization_id', orgId)
    }

    // 9. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // 10. Delete organization only if user is the sole member
    if (orgId) {
      const { count: remainingMembers } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)

      if (remainingMembers === 0) {
        await supabaseAdmin
          .from('organizations')
          .delete()
          .eq('id', orgId)
      }
    }

    // Capture user info for confirmation email before deleting auth user
    const userEmail = user.email
    const userName = user.user_metadata?.full_name ?? 'there'

    // 11. Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete account. Please try again or contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send account deleted confirmation email (best-effort)
    if (userEmail) {
      try {
        const template = accountDeletedEmail(userName, lang)
        await sendEmail({ to: userEmail, ...template })
      } catch (emailErr) {
        console.error('Failed to send account deletion email:', emailErr)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
