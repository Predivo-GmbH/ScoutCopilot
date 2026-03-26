import { ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useSettings, type SettingsTab } from './hooks/useSettings'
import { ProfileSettings } from './components/ProfileSettings'
import { OrgSettings } from './components/OrgSettings'
import { CredentialSettings } from './components/CredentialSettings'
import { BillingSettings } from './components/BillingSettings'
import { PasswordSettings } from './components/PasswordSettings'

const settingsTabs: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: 'Account' },
  { key: 'credentials', label: 'API Keys' },
  { key: 'organization', label: 'Team Management' },
  { key: 'preferences', label: 'Notifications' },
  { key: 'billing', label: 'Billing & Subscription' },
]

export function SettingsPage() {
  const {
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
  } = useSettings()
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sub-Sidebar */}
      <nav className="w-56 p-6 space-y-2 border-r border-outline-variant">
        <p className="text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest mb-4">System Settings</p>
        {settingsTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-md transition-colors ${
              activeTab === tab.key
                ? 'font-semibold bg-surface-container text-primary'
                : 'text-on-surface-variant hover:bg-surface-container/50'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && <ChevronRight size={14} strokeWidth={1.5} />}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {activeTab === 'profile' && (
            <>
              <ProfileSettings profile={profile} onUpdate={updateProfile} onSave={saveProfile} saveStatus={saveStatus} />
              <PasswordSettings />
              <OrgSettings org={org} onUpdate={updateOrg} onSave={saveOrg} saveStatus={saveStatus} />
            </>
          )}

          {activeTab === 'credentials' && (
            <CredentialSettings credentials={credentials} />
          )}

          {activeTab === 'organization' && (
            <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Team Management</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-on-surface-variant">2 of 3 seats used</p>
                  <Button variant="secondary" size="sm">Invite Member</Button>
                </div>
                <div className="space-y-2">
                  <TeamMember name="Alex Mercer" email="alex.mercer@scoutcopilot.pro" role="Owner" />
                  <TeamMember name="James Wilson" email="j.wilson@nordhavn-fc.dk" role="Scout" />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'preferences' && (
            <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Notification Preferences</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <ToggleRow
                  title="Email alerts"
                  description="Instant reports to primary email"
                  enabled={preferences.emailAlerts}
                  onToggle={() => togglePreference('emailAlerts')}
                />
                <ToggleRow
                  title="Watchlist triggers"
                  description="Status changes for followed players"
                  enabled={preferences.watchlistTriggers}
                  onToggle={() => togglePreference('watchlistTriggers')}
                />
                <ToggleRow
                  title="Weekly digest"
                  description="Summarized scouting activities"
                  enabled={preferences.weeklyDigest}
                  onToggle={() => togglePreference('weeklyDigest')}
                />
                <ToggleRow
                  title="Transfer window updates"
                  description="Live market news for targets"
                  enabled={preferences.transferUpdates}
                  onToggle={() => togglePreference('transferUpdates')}
                />
              </div>
            </section>
          )}

          {activeTab === 'billing' && (
            <BillingSettings />
          )}

        </div>
      </div>
    </div>
  )
}

function TeamMember({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-md border border-outline-variant">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-surface-container-highest flex items-center justify-center text-xs font-semibold text-on-surface-variant">
          {name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{name}</p>
          <p className="text-[0.625rem] text-on-surface-variant">{email}</p>
        </div>
      </div>
      <span className="text-[0.625rem] font-data font-medium text-on-surface-variant uppercase">{role}</span>
    </div>
  )
}

function ToggleRow({ title, description, enabled, onToggle }: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className={`flex items-center justify-between ${!enabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-xs font-semibold text-on-surface">{title}</p>
        <p className="text-[0.625rem] text-on-surface-variant">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-md transition-colors ${
          enabled ? 'bg-secondary' : 'bg-surface-container-high'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-sm bg-on-surface transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  )
}
