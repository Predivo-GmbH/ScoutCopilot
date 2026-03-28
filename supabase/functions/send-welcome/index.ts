/**
 * send-welcome — Sends a branded welcome email after profile completion.
 *
 * POST /send-welcome
 * Body: {} (uses authenticated user's info)
 */

import { handleCors } from '../_shared/cors.ts'
import { sendEmail, welcomeEmail } from '../_shared/email.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

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
    if (userError || !user?.email) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userName = user.user_metadata?.full_name ?? 'there'
    const template = welcomeEmail(userName)

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    })

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
