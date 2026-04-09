import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../../lib/supabase'
import type { UserRole } from '../../../types/database'

export interface OrgMember {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export interface PendingInvitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  expires_at: string
}

export type SettingsTab = 'profile' | 'organization' | 'credentials' | 'billing' | 'preferences' | 'aiMethodology'

interface ProfileData {
  fullName: string
  email: string
  role: UserRole | ''
}

interface OrgData {
  name: string
}

interface Credential {
  provider: 'wyscout' | 'statsbomb'
  connected: boolean
  maskedKey: string
}

interface ApiCredential {
  id: string
  provider: 'wyscout' | 'statsbomb'
  is_active: boolean
  created_at: string
  updated_at: string
}

const SUPPORTED_PROVIDERS: Array<'wyscout' | 'statsbomb'> = ['wyscout', 'statsbomb']

interface Preferences {
  emailAlerts: boolean
  watchlistTriggers: boolean
  weeklyDigest: boolean
  transferUpdates: boolean
}

export interface ScoringWeights {
  attacking_weight: number
  defending_weight: number
  passing_weight: number
  physical_weight: number
}

const DEFAULT_PREFERENCES: Preferences = {
  emailAlerts: true,
  watchlistTriggers: true,
  weeklyDigest: false,
  transferUpdates: true,
}

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  attacking_weight: 75,
  defending_weight: 50,
  passing_weight: 60,
  physical_weight: 40,
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function useSettings() {
  const { user, profile: authProfile, organization: authOrg, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    role: '',
  })

  const [org, setOrg] = useState<OrgData>({
    name: '',
  })

  // Sync from auth context when it loads
  useEffect(() => {
    setProfile({
      fullName: authProfile?.full_name ?? '',
      email: user?.email ?? '',
      role: authProfile?.role ?? '',
    })
  }, [authProfile, user])

  useEffect(() => {
    setOrg({
      name: authOrg?.name ?? '',
    })
  }, [authOrg])

  // Fetch real credentials from the edge function
  const { data: credentials = SUPPORTED_PROVIDERS.map((p) => ({ provider: p, connected: false, maskedKey: '' })), isLoading: credentialsLoading } = useQuery<Credential[]>({
    queryKey: ['settings', 'credentials', authOrg?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ credentials: ApiCredential[] }>('credentials', {
        method: 'GET',
      })

      if (error) throw new Error(error.message ?? 'Failed to fetch credentials')

      const apiCredentials = data?.credentials ?? []
      // Build a Credential entry for each supported provider
      return SUPPORTED_PROVIDERS.map((provider) => {
        const match = apiCredentials.find((c) => c.provider === provider && c.is_active)
        return {
          provider,
          connected: !!match,
          maskedKey: match ? `••••••••${match.id.slice(-4).toUpperCase()}` : '',
        }
      })
    },
    enabled: !!authOrg?.id,
    staleTime: 60_000,
  })

  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [preferencesSaveStatus, setPreferencesSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS)
  const [scoringWeightsSaveStatus, setScoringWeightsSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [avatarError, setAvatarError] = useState<string | null>(null)

  // Sync avatar URL from auth profile
  useEffect(() => {
    setAvatarUrl(authProfile?.avatar_url ?? null)
  }, [authProfile])

  // Load notification preferences from profiles table
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.notification_preferences && Object.keys(data.notification_preferences as object).length > 0) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...(data.notification_preferences as Partial<Preferences>) })
        }
      })
  }, [user])

  // Load scoring weights from profiles table
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('scoring_weights')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.scoring_weights) {
          setScoringWeights({ ...DEFAULT_SCORING_WEIGHTS, ...(data.scoring_weights as Partial<ScoringWeights>) })
        }
      })
  }, [user])

  function updateProfile(updates: Partial<ProfileData>) {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  function updateOrg(updates: Partial<OrgData>) {
    setOrg((prev) => ({ ...prev, ...updates }))
  }

  const uploadAvatar = useCallback(async (file: File): Promise<{ error: string | null }> => {
    if (!user) return { error: 'settings.profile.avatarUploadError' }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      return { error: 'settings.profile.avatarTooLarge' }
    }

    // Validate file type
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return { error: 'settings.profile.avatarInvalidType' }
    }

    setAvatarUploadStatus('uploading')
    setAvatarError(null)

    try {
      // Determine file extension from MIME type
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      }
      const ext = extMap[file.type] ?? 'webp'
      const storagePath = `${user.id}/avatar.${ext}`

      // Upload to storage (upsert to overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath)

      // Append cache-buster to force browser refresh
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      // Update profiles.avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setAvatarUploadStatus('idle')
      await refreshProfile()
      return { error: null }
    } catch {
      setAvatarUploadStatus('error')
      setAvatarError('settings.profile.avatarUploadError')
      setTimeout(() => {
        setAvatarUploadStatus('idle')
        setAvatarError(null)
      }, 3000)
      return { error: 'settings.profile.avatarUploadError' }
    }
  }, [user, refreshProfile])

  const saveProfile = useCallback(async () => {
    if (!user) return
    setSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.fullName, ...(profile.role ? { role: profile.role } : {}) })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [user, profile.fullName, profile.role, refreshProfile])

  const changeEmail = useCallback(async () => {
    if (!user || profile.email === user.email) return
    setEmailChangeStatus('saving')
    try {
      const { error } = await supabase.auth.updateUser({ email: profile.email })
      if (error) throw error
      setEmailChangeStatus('sent')
      setTimeout(() => setEmailChangeStatus('idle'), 5000)
    } catch {
      setEmailChangeStatus('error')
      setTimeout(() => setEmailChangeStatus('idle'), 3000)
    }
  }, [user, profile.email])

  const saveOrg = useCallback(async () => {
    if (!user) return
    setSaveStatus('saving')
    try {
      if (authOrg?.id) {
        const { error } = await supabase
          .from('organizations')
          .update({ name: org.name })
          .eq('id', authOrg.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('organizations')
          .insert({ name: org.name })
          .select('id')
          .single()
        if (error) throw error
        // Link org to profile
        await supabase
          .from('profiles')
          .update({ organization_id: data.id })
          .eq('id', user.id)
      }
      await refreshProfile()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [user, authOrg, org.name, refreshProfile])

  function togglePreference(key: keyof Preferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function updateScoringWeight(key: keyof ScoringWeights, value: number) {
    setScoringWeights((prev) => ({ ...prev, [key]: value }))
  }

  const saveScoringWeights = useCallback(async () => {
    if (!user) return
    setScoringWeightsSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ scoring_weights: scoringWeights as unknown as Record<string, number> })
        .eq('id', user.id)
      if (error) throw error
      setScoringWeightsSaveStatus('saved')
      setTimeout(() => setScoringWeightsSaveStatus('idle'), 2000)
    } catch {
      setScoringWeightsSaveStatus('error')
      setTimeout(() => setScoringWeightsSaveStatus('idle'), 3000)
    }
  }, [user, scoringWeights])

  const savePreferences = useCallback(async () => {
    if (!user) return
    setPreferencesSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences as unknown as Record<string, boolean> })
        .eq('id', user.id)
      if (error) throw error
      setPreferencesSaveStatus('saved')
      setTimeout(() => setPreferencesSaveStatus('idle'), 2000)
    } catch {
      setPreferencesSaveStatus('error')
      setTimeout(() => setPreferencesSaveStatus('idle'), 3000)
    }
  }, [user, preferences])

  // Fetch real org members from profiles table
  const { data: orgMembers = [], isLoading: membersLoading } = useQuery<OrgMember[]>({
    queryKey: ['settings', 'org-members', authOrg?.id],
    queryFn: async () => {
      if (!authOrg?.id) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('organization_id', authOrg.id)
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)

      // We need emails from auth.users but can't query that client-side.
      // Use the current user's email for their own row, leave others blank.
      return (data ?? []).map((row) => ({
        id: row.id,
        fullName: row.full_name ?? '',
        email: row.id === user?.id ? (user?.email ?? '') : '',
        role: row.role ?? 'scout',
      }))
    },
    enabled: !!authOrg?.id,
    staleTime: 60_000,
  })

  // Fetch pending invitations for this org
  const { data: pendingInvitations = [], isLoading: invitationsLoading } = useQuery<PendingInvitation[]>({
    queryKey: ['settings', 'pending-invitations', authOrg?.id],
    queryFn: async () => {
      if (!authOrg?.id) return []
      const { data, error } = await supabase
        .from('team_invitations')
        .select('id, email, role, status, created_at, expires_at')
        .eq('organization_id', authOrg.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!authOrg?.id,
    staleTime: 30_000,
  })

  const maxSeats = authOrg?.max_seats ?? 1

  return {
    activeTab,
    setActiveTab,
    profile,
    updateProfile,
    saveProfile,
    changeEmail,
    emailChangeStatus,
    originalEmail: user?.email ?? '',
    org,
    updateOrg,
    saveOrg,
    saveStatus,
    credentials,
    credentialsLoading,
    preferences,
    togglePreference,
    savePreferences,
    preferencesSaveStatus,
    orgMembers,
    membersLoading,
    pendingInvitations,
    invitationsLoading,
    maxSeats,
    scoringWeights,
    updateScoringWeight,
    saveScoringWeights,
    scoringWeightsSaveStatus,
    avatarUrl,
    avatarUploadStatus,
    avatarError,
    uploadAvatar,
  }
}
