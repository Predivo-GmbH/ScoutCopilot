import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session, Provider } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Profile, Organization } from '../../types/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  organization: Organization | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, orgName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithProvider: (provider: Provider) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

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
  const [state, setState] = useState<AuthState>({
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null, session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUserData(session?.user ?? null, session)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserData])

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    return { error: error?.message ?? null }
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    return { error: error?.message ?? null }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    _orgName?: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, session: null, profile: null, organization: null, isLoading: false })
  }, [])

  const signInWithProvider = useCallback(async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { error: error?.message ?? null }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        verifyOtp,
        signInWithPassword,
        signUp,
        signOut,
        signInWithProvider,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
