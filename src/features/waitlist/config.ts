/**
 * Master switch for public self-service registration.
 *
 * While `false` (pre-launch): every sign-up CTA opens the waitlist modal and the
 * /signup route shows the waitlist instead of the signup form. To REOPEN free
 * trials, flip this to `true` — the /signup form is preserved and comes back —
 * and re-point the CTAs (nav / landing / pricing / marketing) back to /signup.
 *
 * Typed as boolean (not the literal `false`) so both branches stay reachable and
 * TypeScript doesn't flag the preserved signup form as dead code.
 */
export const REGISTRATIONS_OPEN: boolean = false
