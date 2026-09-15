/**
 * auth-captcha-token.test.tsx — proves the client half of the sign-in bot-protection fix.
 *
 * THE VULNERABILITY: ScoutCopilot's production Supabase project (`rlcsuqwqzoqjykdiqjye`) accepts
 * a tokenless, unauthenticated POST to /auth/v1/recover (HTTP 200) and a tokenless POST to
 * /auth/v1/otp reaches the user-lookup (422 otp_disabled) rather than being refused — measured
 * live 2026-09-14. security_captcha_enabled is false project-wide, so anyone on the internet who
 * knows a customer's email can make ScoutCopilot email them a password-reset link or login code,
 * unlimited, from the Postmark sending reputation the whole fleet shares.
 *
 * The fix threads a Cloudflare Turnstile captchaToken through every captcha-protected GoTrue
 * endpoint reachable from an ordinary visitor's browser: signInWithPassword (/token), sendOtp
 * (/otp signup), sendLoginOtp (/otp login), resetPassword (/recover). Enabling CAPTCHA in Supabase
 * Auth is PROJECT-WIDE, so all four must carry the token or the server-side enable would lock real
 * users out.
 *
 * This suite asserts each method forwards the token into the exact Supabase options field the SDK
 * sends to GoTrue as options.captchaToken. It does NOT prove server enforcement — that is a
 * Supabase Auth-settings switch (Roger's / a management-authorised session's call, separate from
 * this PR) and is proven live by supabase/functions/_shared/signin-captcha.prod.test.mjs once
 * flipped. This proves the wiring is correct and ready, and that omitting the token is a clean
 * no-op — which is what makes shipping this change outage-safe before that switch moves.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

// Full auth mock with spies for every method under test (overrides the global setup.ts mock,
// which only stubs a subset). vi.hoisted, not a plain const: vi.mock's factory is hoisted above
// any top-level binding it closes over, so a plain `const auth = {...}` here would throw
// "ReferenceError: Cannot access 'auth' before initialization" (see ReplyFlow's
// auth-captcha-token.test.tsx, which hit exactly this and documents the fix). vi.hoisted runs in
// the same hoisted phase as vi.mock, so the spies exist by the time the factory needs them.
const auth = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
  signInWithOtp: vi.fn().mockResolvedValue({ data: null, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
}))
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth,
    from: vi.fn(),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}))

import { AuthProvider } from '../features/auth/AuthContext'
import { useAuth } from '../features/auth/useAuth'

const TOKEN = 'turnstile-token-abc123'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>{children}</AuthProvider>
    </I18nextProvider>
  )
}

async function mountAuth() {
  const { result } = renderHook(() => useAuth(), { wrapper })
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  return result
}

beforeEach(() => {
  Object.values(auth).forEach((f) => 'mockClear' in f && f.mockClear())
})

describe('auth methods forward the Turnstile captchaToken to Supabase', () => {
  it('sendLoginOtp passes captchaToken (the endpoint the incident abused)', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.sendLoginOtp('user@example.com', TOKEN) })
    expect(auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        options: expect.objectContaining({ shouldCreateUser: false, captchaToken: TOKEN }),
      }),
    )
  })

  it('sendOtp (signup) passes captchaToken', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.sendOtp('new@example.com', TOKEN) })
    expect(auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        options: expect.objectContaining({ shouldCreateUser: true, captchaToken: TOKEN }),
      }),
    )
  })

  it('signInWithPassword passes captchaToken', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.signInWithPassword('user@example.com', 'pw', TOKEN) })
    expect(auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        password: 'pw',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      }),
    )
  })

  it('resetPassword passes captchaToken alongside redirectTo', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.resetPassword('user@example.com', TOKEN) })
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ captchaToken: TOKEN }),
    )
  })

  it('omits captchaToken cleanly when none is supplied (outage-safe no-op before server enable)', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.sendLoginOtp('user@example.com') })
    const arg = auth.signInWithOtp.mock.calls[0][0]
    expect('captchaToken' in arg.options).toBe(false)
  })

  it('signInWithPassword omits captchaToken from options entirely when absent (undefined options object)', async () => {
    const result = await mountAuth()
    await act(async () => { await result.current.signInWithPassword('user@example.com', 'pw') })
    const arg = auth.signInWithPassword.mock.calls[0][0]
    expect(arg.options).toBeUndefined()
  })
})
