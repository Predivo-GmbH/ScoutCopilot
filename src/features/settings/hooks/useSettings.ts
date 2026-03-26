import { useState } from 'react'

export type SettingsTab = 'profile' | 'organization' | 'credentials' | 'billing' | 'preferences'

interface ProfileData {
  fullName: string
  email: string
  role: string
}

interface OrgData {
  name: string
  country: string
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Alex Mercer',
    email: 'alex.mercer@scoutcopilot.pro',
    role: 'Technical Director',
  })

  const [org, setOrg] = useState<OrgData>({
    name: 'FC Nordhavn Academy',
    country: 'Denmark',
  })

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

  function togglePreference(key: keyof Preferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return {
    activeTab,
    setActiveTab,
    profile,
    updateProfile,
    org,
    updateOrg,
    credentials,
    preferences,
    togglePreference,
  }
}
