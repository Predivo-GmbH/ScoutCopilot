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

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  attacking_weight: 75,
  defending_weight: 50,
  passing_weight: 60,
  physical_weight: 40,
}

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

  const [credentials] = useState<Credential[]>([
    { provider: 'wyscout', connected: true, maskedKey: '•••••••••••42A9' },
    { provider: 'statsbomb', connected: true, maskedKey: '•••••••••••K9L2' },
  ])

  const [preferences, setPreferences] = useState<Preferences>({
    emailAlerts: true,
    watchlistTriggers: true,
    weeklyDigest: false,
    transferUpdates: true,
  })

  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS)
  const [scoringWeightsSaveStatus, setScoringWeightsSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

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
        .update({ scoring_weights: scoringWeights })
        .eq('id', user.id)
      if (error) throw error
      setScoringWeightsSaveStatus('saved')
      setTimeout(() => setScoringWeightsSaveStatus('idle'), 2000)
    } catch {
      setScoringWeightsSaveStatus('error')
      setTimeout(() => setScoringWeightsSaveStatus('idle'), 3000)
    }
  }, [user, scoringWeights])

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

  const maxSeats = authOrg?.max_seats ?? 1

  return {
    activeTab,
    setActiveTab,
    profile,
    updateProfile,
    saveProfile,
    org,
    updateOrg,
    saveOrg,
    saveStatus,
    credentials,
    preferences,
    togglePreference,
    orgMembers,
    membersLoading,
    maxSeats,
    scoringWeights,
    updateScoringWeight,
    saveScoringWeights,
    scoringWeightsSaveStatus,
  }
}
