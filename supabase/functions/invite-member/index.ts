/**
 * invite-member — Creates a team invitation and sends an email to the invitee.
 *
 * POST /invite-member
 * Body: { email: string, role?: string }
 * Auth: required (getAuthContext — must be owner or admin)
 */

import { handleCors } from '../_shared/cors.ts'
import { getAuthContext, getServiceClient, AuthError } from '../_shared/auth.ts'
import { checkRateLimit } from '../_shared/rate-limiter.ts'
import { sendEmail, invitationEmail, normalizeEmailLang } from '../_shared/email.ts'

const VALID_ROLES = ['scout', 'head_of_recruitment', 'technical_director', 'analyst']

Deno.serve(async (req) => {
  const { corsHeaders, preflightResponse } = handleCors(req)
  if (preflightResponse) return preflightResponse

  try {
    // Auth
    const auth = await getAuthContext(req)

    // Only owner/admin can invite
    if (auth.role !== 'owner' && auth.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only organization owners and admins can invite members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit: 5 req/min per org
    const { allowed, retryAfterMs } = checkRateLimit(auth.organizationId, 5 / 60, 5)
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

    // Parse body
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const role = (body.role ?? 'scout').trim().toLowerCase()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = getServiceClient()

    // Check for existing pending invitation to same email in same org
    const { data: existing } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('organization_id', auth.organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'An invitation is already pending for this email address' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if email already belongs to a member in this org
    const { data: existingMember } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', auth.organizationId)

    if (existingMember && existingMember.length > 0) {
      // Look up auth users to check emails — use admin API
      for (const member of existingMember) {
        const { data: { user } } = await supabase.auth.admin.getUserById(member.id)
        if (user?.email?.toLowerCase() === email) {
          return new Response(
            JSON.stringify({ error: 'This email is already a member of your organization' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Get inviter's name for the email
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', auth.userId)
      .single()

    const inviterName = inviterProfile?.full_name ?? 'Your colleague'

    // Get organization name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', auth.organizationId)
      .single()

    const orgName = orgData?.name ?? 'your organization'

    // Create invitation
    const { data: invitation, error: insertError } = await supabase
      .from('team_invitations')
      .insert({
        organization_id: auth.organizationId,
        invited_by: auth.userId,
        email,
        role,
      })
      .select('id, email, role, status, token, expires_at, created_at')
      .single()

    if (insertError) {
      console.error('Failed to create invitation:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine language from inviter's profile
    const { data: { user: inviterUser } } = await supabase.auth.admin.getUserById(auth.userId)
    const lang = normalizeEmailLang(inviterUser?.user_metadata?.language)

    // Send invitation email
    const template = invitationEmail(inviterName, orgName, invitation.token, lang)
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    })

    return new Response(
      JSON.stringify({ invitation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: err.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.error('invite-member error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
