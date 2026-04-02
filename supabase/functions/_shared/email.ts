/**
 * Shared SMTP email module for ScoutCopilot transactional emails.
 * Uses Metanet's native SMTP service via Deno's smtp client.
 *
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// ─── Types ──────────────────────────────────────────────────────────────────

export type EmailLang = 'en' | 'de'

// ─── Config ──────────────────────────────────────────────────────────────────

interface SmtpConfig {
  hostname: string
  port: number
  username: string
  password: string
  from: string
}

function getSmtpConfig(): SmtpConfig {
  const hostname = Deno.env.get('SMTP_HOST')
  const port = Deno.env.get('SMTP_PORT')
  const username = Deno.env.get('SMTP_USER')
  const password = Deno.env.get('SMTP_PASS')
  const from = Deno.env.get('SMTP_FROM') ?? 'ScoutCopilot <noreply@scoutcopilot.com>'

  if (!hostname || !port || !username || !password) {
    throw new Error('Missing SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)')
  }

  return { hostname, port: parseInt(port, 10), username, password, from }
}

// ─── Send ────────────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const config = getSmtpConfig()

  const client = new SMTPClient({
    connection: {
      hostname: config.hostname,
      port: config.port,
      tls: true,
      auth: {
        username: config.username,
        password: config.password,
      },
    },
  })

  try {
    await client.send({
      from: config.from,
      to: options.to,
      subject: options.subject,
      content: options.text ?? options.subject,
      html: options.html,
    })
  } finally {
    await client.close()
  }
}

// ─── HTML Escaping ──────────────────────────────────────────────────────────

/** Escape user-provided strings to prevent HTML injection in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Language Helper ────────────────────────────────────────────────────────

/** Normalize a language string to a supported EmailLang. */
export function normalizeEmailLang(lang?: string | null): EmailLang {
  if (lang && lang.toLowerCase().startsWith('de')) return 'de'
  return 'en'
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const APP_URL = Deno.env.get('APP_URL') ?? 'https://scoutcopilot.com'

/** Wraps email body in a consistent branded layout — matches the OTP verification email design */
function layout(body: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ScoutCopilot</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!--[if mso | IE]><table role="presentation" width="100%" bgcolor="#f4f4f5"><tr><td align="center"><![endif]-->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480" style="max-width:480px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#2563EB;letter-spacing:-0.02em;vertical-align:middle;">ScoutCopilot</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:36px 32px;" bgcolor="#ffffff">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#a1a1aa;line-height:1.5;">&copy; ${new Date().getFullYear()} Predivo GmbH &middot; Bahnhofstrasse 55 &middot; 6403 K&uuml;ssnacht am Rigi</p>
              <p style="margin:8px 0 0;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;font-size:12px;"><a href="https://scoutcopilot.com" style="color:#2563EB;text-decoration:none;">scoutcopilot.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso | IE]></td></tr></table><![endif]-->
</body>
</html>`
}

/** Styled CTA button — centered, matches OTP verification email */
function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 0;">
  <tr>
    <td align="center" bgcolor="#2563EB" style="background-color:#2563EB;border-radius:8px;mso-padding-alt:14px 40px;">
      <a href="${href}" target="_blank" style="display:inline-block;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;padding:14px 40px;mso-line-height-rule:exactly;line-height:normal;"><!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->${text}<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]--></a>
    </td>
  </tr>
</table>`
}

// ─── Shared inline styles (avoids duplication) ──────────────────────────────

const S = {
  h1: 'margin:0 0 8px;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:22px;font-weight:700;color:#18181b;text-align:center;',
  p: 'margin:0 0 24px;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:15px;color:#71717a;line-height:1.6;text-align:center;',
  pNoMargin: 'margin:0 0 0;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:15px;color:#71717a;line-height:1.6;text-align:center;',
  pSpaced: 'margin:0 0 16px;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:15px;color:#71717a;line-height:1.6;text-align:center;',
  hint: 'margin:16px 0 0;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:13px;color:#a1a1aa;text-align:center;',
  hintNoMargin: 'margin:0;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:13px;color:#a1a1aa;text-align:center;',
  ol: 'margin:0 0 16px;padding-left:20px;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:15px;color:#71717a;line-height:1.8;',
  strong: 'color:#18181b;',
} as const

// ─── Templates ───────────────────────────────────────────────────────────────

/** Welcome email — sent after profile completion */
export function welcomeEmail(userName: string, lang: EmailLang = 'en'): { subject: string; html: string } {
  const safeName = escapeHtml(userName)

  if (lang === 'de') {
    return {
      subject: `Willkommen bei ScoutCopilot, ${safeName}!`,
      html: layout(
`<h1 style="${S.h1}">Willkommen an Bord, ${safeName}!</h1>
<p style="${S.p}">Ihre 14-t&auml;gige kostenlose Testphase ist jetzt aktiv. So starten Sie:</p>
<ol style="${S.ol}">
<li>Verbinden Sie Ihre Wyscout- oder StatsBomb-API-Zugangsdaten</li>
<li>Suchen Sie Spieler mit nat&uuml;rlicher Sprache</li>
<li>Erstellen Sie KI-gest&uuml;tzte Scouting-Berichte</li>
</ol>
<p style="${S.pNoMargin}">Keine Kreditkarte w&auml;hrend der Testphase erforderlich.</p>
${button('Zum Dashboard', `${APP_URL}/dashboard`)}
<p style="${S.hint}">Brauchen Sie Hilfe? Antworten Sie einfach auf diese E-Mail &mdash; wir lesen jede Nachricht.</p>`
      ),
    }
  }

  return {
    subject: `Welcome to ScoutCopilot, ${safeName}!`,
    html: layout(
`<h1 style="${S.h1}">Welcome aboard, ${safeName}!</h1>
<p style="${S.p}">Your 14-day free trial is now active. Here's how to get started:</p>
<ol style="${S.ol}">
<li>Connect your Wyscout or StatsBomb API credentials</li>
<li>Search for players using natural language</li>
<li>Generate AI-powered scouting reports</li>
</ol>
<p style="${S.pNoMargin}">No credit card required during your trial.</p>
${button('Go to Dashboard', `${APP_URL}/dashboard`)}
<p style="${S.hint}">Need help? Just reply to this email &mdash; we read every message.</p>`
    ),
  }
}

/** Trial ending soon */
export function trialEndingEmail(
  userName: string,
  daysLeft: number,
  lang: EmailLang = 'en',
): { subject: string; html: string } {
  const safeName = escapeHtml(userName)

  if (lang === 'de') {
    const dayWord = daysLeft === 1 ? 'Tag' : 'Tagen'
    return {
      subject: `Ihre ScoutCopilot-Testphase endet in ${daysLeft} ${dayWord}`,
      html: layout(
`<h1 style="${S.h1}">Ihre Testphase endet bald</h1>
<p style="${S.p}">Hallo ${safeName}, Ihre kostenlose Testphase l&auml;uft in <strong style="${S.strong}">${daysLeft} ${dayWord}</strong> ab. Upgraden Sie jetzt, um weiterhin mit KI-gest&uuml;tzter Intelligenz zu scouten.</p>
${button('Tarif w\u00e4hlen', `${APP_URL}/settings?tab=billing`)}
<p style="${S.hint}">Noch nicht bereit? Kein Problem &mdash; Ihre Daten bleiben sicher und Sie k&ouml;nnen jederzeit upgraden.</p>`
      ),
    }
  }

  return {
    subject: `Your ScoutCopilot trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    html: layout(
`<h1 style="${S.h1}">Your trial is ending soon</h1>
<p style="${S.p}">Hi ${safeName}, your free trial expires in <strong style="${S.strong}">${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>. Upgrade now to keep scouting with AI-powered intelligence.</p>
${button('Choose a Plan', `${APP_URL}/settings?tab=billing`)}
<p style="${S.hint}">Not ready? No worries &mdash; your data stays safe and you can upgrade anytime.</p>`
    ),
  }
}

/** Payment failed */
export function paymentFailedEmail(userName: string, lang: EmailLang = 'en'): { subject: string; html: string } {
  const safeName = escapeHtml(userName)

  if (lang === 'de') {
    return {
      subject: 'Handlungsbedarf: Zahlung f\u00fcr ScoutCopilot fehlgeschlagen',
      html: layout(
`<h1 style="${S.h1}">Zahlungsproblem</h1>
<p style="${S.p}">Hallo ${safeName}, wir konnten Ihre letzte Zahlung f&uuml;r ScoutCopilot nicht verarbeiten. Dies liegt meist an einer abgelaufenen Karte oder unzureichender Deckung.</p>
${button('Zahlungsmethode aktualisieren', `${APP_URL}/settings?tab=billing`)}
<p style="${S.hint}">Falls Sie glauben, dass es sich um einen Fehler handelt, antworten Sie bitte auf diese E-Mail und wir helfen Ihnen.</p>`
      ),
    }
  }

  return {
    subject: 'Action required: Payment failed for ScoutCopilot',
    html: layout(
`<h1 style="${S.h1}">Payment issue</h1>
<p style="${S.p}">Hi ${safeName}, we couldn't process your latest payment for ScoutCopilot. This is usually caused by an expired card or insufficient funds.</p>
${button('Update Payment Method', `${APP_URL}/settings?tab=billing`)}
<p style="${S.hint}">If you believe this is an error, please reply to this email and we'll help.</p>`
    ),
  }
}

/** Plan changed */
export function planChangedEmail(
  userName: string,
  newPlan: string,
  isUpgrade: boolean,
  lang: EmailLang = 'en',
): { subject: string; html: string } {
  const safeName = escapeHtml(userName)
  const planDisplay = escapeHtml(newPlan.charAt(0).toUpperCase() + newPlan.slice(1))

  if (lang === 'de') {
    const verb = isUpgrade ? 'upgegradet' : 'ge&auml;ndert'
    const verbPlain = isUpgrade ? 'upgegradet' : 'ge\u00e4ndert'
    return {
      subject: `Ihr ScoutCopilot-Tarif wurde auf ${planDisplay} ${verbPlain}`,
      html: layout(
`<h1 style="${S.h1}">Tarif ${verb}</h1>
<p style="${S.p}">Hallo ${safeName}, Ihr ScoutCopilot-Abonnement wurde auf den <strong style="${S.strong}">${planDisplay}</strong>-Tarif ${verb}. ${isUpgrade ? 'Ihre neuen Limits sind ab sofort aktiv.' : 'Die &Auml;nderung tritt am Ende Ihres aktuellen Abrechnungszeitraums in Kraft.'}</p>
${button('Konto anzeigen', `${APP_URL}/settings?tab=billing`)}`
      ),
    }
  }

  const verb = isUpgrade ? 'upgraded' : 'changed'
  return {
    subject: `Your ScoutCopilot plan has been ${verb} to ${planDisplay}`,
    html: layout(
`<h1 style="${S.h1}">Plan ${verb}</h1>
<p style="${S.p}">Hi ${safeName}, your ScoutCopilot subscription has been ${verb} to the <strong style="${S.strong}">${planDisplay}</strong> plan. ${isUpgrade ? 'Your new limits are now active.' : 'The change takes effect at the end of your current billing period.'}</p>
${button('View Account', `${APP_URL}/settings?tab=billing`)}`
    ),
  }
}

/** Admin notification — new user registered (always English — admin-facing) */
export function newUserNotificationEmail(userName: string, userEmail: string): { subject: string; html: string } {
  const safeName = escapeHtml(userName)
  const safeEmail = escapeHtml(userEmail)
  const tdLabel = 'padding:4px 12px 4px 0;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:14px;color:#a1a1aa;'
  const tdValue = 'padding:4px 0;font-family:\'Segoe UI\',-apple-system,BlinkMacSystemFont,Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:14px;font-weight:600;color:#18181b;'
  return {
    subject: `New ScoutCopilot signup: ${safeName}`,
    html: layout(
`<h1 style="${S.h1}">New user registered</h1>
<p style="${S.p}">A new user just completed registration on ScoutCopilot:</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
<tr><td style="${tdLabel}">Name</td><td style="${tdValue}">${safeName}</td></tr>
<tr><td style="${tdLabel}">Email</td><td style="${tdValue}">${safeEmail}</td></tr>
<tr><td style="${tdLabel}">Time</td><td style="${tdValue}">${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Zurich' })}</td></tr>
</table>
${button('View Users', `https://supabase.com/dashboard/project/rlcsuqwqzoqjykdiqjye/auth/users`)}`
    ),
  }
}

/** Account deleted confirmation */
export function accountDeletedEmail(userName: string, lang: EmailLang = 'en'): { subject: string; html: string } {
  const safeName = escapeHtml(userName)

  if (lang === 'de') {
    return {
      subject: 'Ihr ScoutCopilot-Konto wurde gel\u00f6scht',
      html: layout(
`<h1 style="${S.h1}">Konto gel&ouml;scht</h1>
<p style="${S.pSpaced}">Hallo ${safeName}, Ihr ScoutCopilot-Konto und alle zugeh&ouml;rigen Daten wurden wie gew&uuml;nscht dauerhaft gel&ouml;scht.</p>
<p style="${S.pSpaced}">Falls dies ein Versehen war oder Sie zur&uuml;ckkommen m&ouml;chten, k&ouml;nnen Sie sich jederzeit erneut registrieren.</p>
<p style="${S.hintNoMargin}">Es tut uns leid, Sie gehen zu sehen. Wenn Sie Feedback haben, antworten Sie auf diese E-Mail &mdash; wir w&uuml;rden gerne erfahren, wie wir uns verbessern k&ouml;nnen.</p>`
      ),
    }
  }

  return {
    subject: 'Your ScoutCopilot account has been deleted',
    html: layout(
`<h1 style="${S.h1}">Account deleted</h1>
<p style="${S.pSpaced}">Hi ${safeName}, your ScoutCopilot account and all associated data have been permanently deleted as requested.</p>
<p style="${S.pSpaced}">If this was a mistake or you'd like to come back, you're welcome to sign up again anytime.</p>
<p style="${S.hintNoMargin}">We're sorry to see you go. If you have feedback, reply to this email &mdash; we'd love to hear how we can improve.</p>`
    ),
  }
}
