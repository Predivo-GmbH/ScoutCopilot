import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { Profile, Organization } from '../../types/database'
import { AuthContext } from './auth-context-value'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  organization: Organization | null
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  /** Traditional email+password sign in. captchaToken is a Cloudflare Turnstile token,
   *  required once CAPTCHA is enabled in Auth settings (no-op before that). */
  signInWithPassword: (email: string, password: string, captchaToken?: string) => Promise<void>
  /** Send OTP code for signup (creates user if not exists). captchaToken as above. */
  sendOtp: (email: string, captchaToken?: string) => Promise<void>
  /** Send OTP code for login only (does NOT create user). captchaToken as above. */
  sendLoginOtp: (email: string, captchaToken?: string) => Promise<void>
  /** Verify an OTP code — returns whether user is new (needs profile setup) */
  verifyOtp: (email: string, token: string) => Promise<{ isNewUser: boolean }>
  /** Check if current user has a completed profile (full_name set) */
  hasCompletedProfile: () => boolean
  /** Set password + name on authenticated user (post-OTP signup) */
  completeProfile: (password: string, fullName: string) => Promise<void>
  /** Send password reset email (magic link). captchaToken required once CAPTCHA is
   *  enabled (no-op before). */
  resetPassword: (email: string, captchaToken?: string) => Promise<void>
  /** Update password (used on /reset-password with active session) */
  updatePassword: (password: string) => Promise<void>
  /** Delete the current user's account */
  deleteAccount: () => Promise<void>
  /** Sign out */
  signOut: () => Promise<void>
  /** Refresh profile + organization data from DB */
  refreshProfile: () => Promise<void>
}

// AuthContext is created in ./authContext.ts for Fast Refresh compliance

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

async function fetchOrganization(orgId: string): Promise<Organization | null> {
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const isScreenshotMode = import.meta.env.VITE_SCREENSHOT_MODE === 'true'

  const [state, setState] = useState<AuthState>(isScreenshotMode ? {
    user: { id: 'screenshot-user', email: 'screenshot@test.com' } as User,
    session: {} as Session,
    profile: { id: 'screenshot-user', full_name: 'Screenshot User', organization_id: 'org-1' } as Profile,
    organization: { id: 'org-1', name: 'Demo Club', slug: 'demo-club' } as Organization,
    isLoading: false,
  } : {
    user: null,
    session: null,
    profile: null,
    organization: null,
    isLoading: true,
  })

  const loadUserData = useCallback(async (user: User | null, session: Session | null) => {
    if (!user) {
      setState({ user: null, session: null, profile: null, organization: null, isLoading: false })
      return
    }

    // Set user immediately so AuthGuard sees a loading state (not a redirect to /login)
    setState(prev => ({ ...prev, user, session, isLoading: true }))

    const profile = await fetchProfile(user.id)
    let organization: Organization | null = null
    if (profile?.organization_id) {
      organization = await fetchOrganization(profile.organization_id)
    }

    setState({ user, session, profile, organization, isLoading: false })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    let organization: Organization | null = null
    if (profile?.organization_id) {
      organization = await fetchOrganization(profile.organization_id)
    }
    setState(prev => ({ ...prev, profile, organization }))
  }, [state.user])

  useEffect(() => {
    if (isScreenshotMode) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null, session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUserData(session?.user ?? null, session)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserData, isScreenshotMode])

  // ── Auth methods ──────────────────────────────────────────────────────

  const signInWithPassword = useCallback(async (email: string, password: string, captchaToken?: string) => {
    // captchaToken is threaded through to GoTrue's /token endpoint. It is IGNORED by the
    // server until CAPTCHA is enabled in the project's Auth settings, so passing it (or not)
    // is a no-op today — which is exactly what makes shipping this client change outage-safe.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })
    if (error) throw error
  }, [])

  const sendOtp = useCallback(async (email: string, captchaToken?: string) => {
    const lang = i18n.language || window.location.pathname.split('/')[1] || 'en'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/${lang}/dashboard`,
        ...(captchaToken ? { captchaToken } : {}),
      },
    })
    if (error) throw error
  }, [i18n.language])

  const sendLoginOtp = useCallback(async (email: string, captchaToken?: string) => {
    // shouldCreateUser: false — only sends OTP if account exists
    // Supabase returns 200 regardless (prevents email enumeration)
    //
    // captchaToken guards the /otp endpoint against the abuse this method enabled: anyone
    // could POST here and make ScoutCopilot email a login code to any account holder. It is
    // checked by the server ONLY once CAPTCHA is enabled in Auth settings, so it is a no-op
    // until that switch is flipped (Roger's / a management-authorised session's call).
    const lang = i18n.language || window.location.pathname.split('/')[1] || 'en'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/${lang}/dashboard`,
        ...(captchaToken ? { captchaToken } : {}),
      },
    })
    if (error) throw error
  }, [i18n.language])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
    const isNewUser = !data.user?.user_metadata?.full_name
    return { isNewUser }
  }, [])

  const completeProfile = useCallback(async (password: string, fullName: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName },
    })
    if (error) throw error

    // Send welcome email (best-effort — silent fail in production)
    supabase.functions.invoke('send-welcome', {
      method: 'POST',
      body: { lang: i18n.language },
    }).catch(() => { /* best-effort, no client-side logging */ })
  }, [i18n.language])

  const hasCompletedProfile = useCallback(() => {
    if (!state.user) return false
    return !!state.user.user_metadata?.full_name
  }, [state.user])

  const resetPassword = useCallback(async (email: string, captchaToken?: string) => {
    // captchaToken guards the /recover endpoint (also captcha-protected project-wide);
    // no-op until CAPTCHA is enabled server-side.
    const lang = i18n.language || window.location.pathname.split('/')[1] || 'en'
    const redirectTo = `${window.location.origin}/${lang}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      ...(captchaToken ? { captchaToken } : {}),
    })
    if (error) throw error
  }, [i18n.language])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }, [])

  const deleteAccount = useCallback(async () => {
    const { error: fnError } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
      body: { lang: i18n.language },
    })
    if (fnError) {
      throw new Error(fnError.message || 'Failed to delete account')
    }
    await supabase.auth.signOut()
  }, [i18n.language])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, session: null, profile: null, organization: null, isLoading: false })
  }, [])

  const value = useMemo(() => ({
    ...state,
    signInWithPassword,
    sendOtp,
    sendLoginOtp,
    verifyOtp,
    hasCompletedProfile,
    completeProfile,
    resetPassword,
    updatePassword,
    deleteAccount,
    signOut,
    refreshProfile,
  }), [state, signInWithPassword, sendOtp, sendLoginOtp, verifyOtp, hasCompletedProfile, completeProfile, resetPassword, updatePassword, deleteAccount, signOut, refreshProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
