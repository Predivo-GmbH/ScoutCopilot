/**
 * send-welcome — Sends a branded welcome email after profile completion.
 *
 * POST /send-welcome
 * Body: { lang?: "en" | "de" } (uses authenticated user's info)
 */

import { handleCors } from '../_shared/cors.ts'
import { sendEmail, welcomeEmail, newUserNotificationEmail, normalizeEmailLang } from '../_shared/email.ts'
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL or SUPABASE_ANON_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user?.email) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit: 5 requests/minute per user
    const { allowed, retryAfterMs } = checkRateLimit(user.id, 5 / 60, 5)
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

    const userName = user.user_metadata?.full_name ?? 'there'
    const template = welcomeEmail(userName, lang)

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    })

    // Notify admin of new registration (best-effort, don't fail the response)
    const notification = newUserNotificationEmail(userName, user.email)
    sendEmail({
      to: 'roger@mueller.ro',
      subject: notification.subject,
      html: notification.html,
    }).catch((err) => console.error('Admin notification failed:', err))

    return new Response(
      JSON.stringify({ sent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-welcome error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
