/**
 * Shared SMTP email module for ScoutCopilot transactional emails.
 * Uses Metanet's native SMTP service via Deno's smtp client.
 *
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

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

// ─── Layout ──────────────────────────────────────────────────────────────────

const APP_URL = Deno.env.get('APP_URL') ?? 'https://scoutcopilot.com'

/** Wraps email body in a consistent branded layout */
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ScoutCopilot</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background:#0B1326;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ScoutCopilot</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                &copy; ${new Date().getFullYear()} ScoutCopilot &middot;
                <a href="${APP_URL}/privacy" style="color:#71717a;">Privacy</a> &middot;
                <a href="${APP_URL}/terms" style="color:#71717a;">Terms</a>
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">
                You're receiving this because you have a ScoutCopilot account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Styled CTA button */
function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#2563EB;border-radius:6px;">
      <a href="${href}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

// ─── Templates ───────────────────────────────────────────────────────────────

/** Welcome email — sent after profile completion */
export function welcomeEmail(userName: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: `Welcome to ScoutCopilot, ${firstName}!`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0B1326;">Welcome aboard, ${firstName}!</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Your 14-day free trial is now active. Here's how to get started:
      </p>
      <ol style="margin:0 0 12px;padding-left:20px;font-size:15px;color:#3f3f46;line-height:1.8;">
        <li>Connect your Wyscout or StatsBomb API credentials</li>
        <li>Search for players using natural language</li>
        <li>Generate AI-powered scouting reports</li>
      </ol>
      <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
        No credit card required during your trial.
      </p>
      ${button('Go to Dashboard', `${APP_URL}/dashboard`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Need help? Just reply to this email — we read every message.
      </p>
    `),
  }
}

/** Trial ending soon */
export function trialEndingEmail(
  userName: string,
  daysLeft: number,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: `Your ScoutCopilot trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0B1326;">Your trial is ending soon, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Your free trial expires in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.
        Upgrade now to keep scouting with AI-powered intelligence.
      </p>
      ${button('Choose a Plan', `${APP_URL}/settings?tab=billing`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        Not ready? No worries — your data stays safe and you can upgrade anytime.
      </p>
    `),
  }
}

/** Payment failed */
export function paymentFailedEmail(userName: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: 'Action required: Payment failed for ScoutCopilot',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0B1326;">Payment issue, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        We couldn't process your latest payment for ScoutCopilot. This is usually caused by an expired card or insufficient funds.
      </p>
      ${button('Update Payment Method', `${APP_URL}/settings?tab=billing`)}
      <p style="margin:0;font-size:13px;color:#71717a;">
        If you believe this is an error, please reply to this email and we'll help.
      </p>
    `),
  }
}

/** Plan changed */
export function planChangedEmail(
  userName: string,
  newPlan: string,
  isUpgrade: boolean,
): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  const planDisplay = newPlan.charAt(0).toUpperCase() + newPlan.slice(1)
  const verb = isUpgrade ? 'upgraded' : 'changed'
  return {
    subject: `Your ScoutCopilot plan has been ${verb} to ${planDisplay}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0B1326;">Plan ${verb}, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Your ScoutCopilot subscription has been ${verb} to the <strong>${planDisplay}</strong> plan.
        ${isUpgrade ? 'Your new limits are now active.' : 'The change takes effect at the end of your current billing period.'}
      </p>
      ${button('View Account', `${APP_URL}/settings?tab=billing`)}
    `),
  }
}

/** Account deleted confirmation */
export function accountDeletedEmail(userName: string): { subject: string; html: string } {
  const firstName = userName.split(' ')[0]
  return {
    subject: 'Your ScoutCopilot account has been deleted',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0B1326;">Account deleted, ${firstName}</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Your ScoutCopilot account and all associated data have been permanently deleted as requested.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6;">
        If this was a mistake or you'd like to come back, you're welcome to sign up again anytime.
      </p>
      <p style="margin:0;font-size:13px;color:#71717a;">
        We're sorry to see you go. If you have feedback, reply to this email — we'd love to hear how we can improve.
      </p>
    `),
  }
}
