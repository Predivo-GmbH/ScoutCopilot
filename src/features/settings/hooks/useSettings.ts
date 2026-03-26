import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../../lib/supabase'

export type SettingsTab = 'profile' | 'organization' | 'credentials' | 'billing' | 'preferences'

interface ProfileData {
  fullName: string
  email: string
  role: string
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
        .update({ full_name: profile.fullName, role: profile.role })
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
  }
}
