import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ScrollableTabBar } from '../../components/ui/ScrollableTabBar'
import { useSettings, type SettingsTab } from './hooks/useSettings'
import { ProfileSettings } from './components/ProfileSettings'
import { OrgSettings } from './components/OrgSettings'
import { CredentialSettings } from './components/CredentialSettings'
import { BillingSettings } from './components/BillingSettings'
import { PasswordSettings } from './components/PasswordSettings'
import { LanguageSelector } from '../../components/shared/LanguageSelector'
import { DeleteAccountSettings } from './components/DeleteAccountSettings'
import { AiMethodologySettings } from './components/AiMethodologySettings'

const settingsTabs: { key: SettingsTab; labelKey: string }[] = [
  { key: 'profile', labelKey: 'settings.tabs.account' },
  { key: 'credentials', labelKey: 'settings.tabs.apiKeys' },
  { key: 'organization', labelKey: 'settings.tabs.teamManagement' },
  { key: 'preferences', labelKey: 'settings.tabs.notifications' },
  { key: 'billing', labelKey: 'settings.tabs.billing' },
  { key: 'aiMethodology', labelKey: 'settings.tabs.aiInsights' },
]

export function SettingsPage() {
  const { t } = useTranslation()
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
    orgMembers,
    membersLoading,
    maxSeats,
    scoringWeights,
    updateScoringWeight,
    saveScoringWeights,
    scoringWeightsSaveStatus,
    changeEmail,
    emailChangeStatus,
    originalEmail,
  } = useSettings()
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Mobile horizontal tabs */}
      <div className="md:hidden">
        <ScrollableTabBar
          tabs={settingsTabs.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
          activeKey={activeTab}
          onTabChange={(key) => setActiveTab(key as SettingsTab)}
        />
      </div>

      {/* Desktop sub-sidebar */}
      <nav className="hidden md:block w-56 p-6 space-y-2 border-r border-outline-variant">
        <p className="text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest mb-4">{t('settings.heading')}</p>
        {settingsTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left rounded-md transition-colors min-h-[44px] ${
              activeTab === tab.key
                ? 'font-semibold bg-surface-container text-primary'
                : 'text-on-surface-variant hover:bg-surface-container/50'
            }`}
          >
            <span>{t(tab.labelKey)}</span>
            {activeTab === tab.key && <ChevronRight size={14} strokeWidth={1.5} />}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {activeTab === 'profile' && (
            <>
              <ProfileSettings profile={profile} originalEmail={originalEmail} onUpdate={updateProfile} onSave={saveProfile} saveStatus={saveStatus} onChangeEmail={changeEmail} emailChangeStatus={emailChangeStatus} />
              <PasswordSettings />
              <OrgSettings org={org} onUpdate={updateOrg} onSave={saveOrg} saveStatus={saveStatus} />
              <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
                <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.language.heading')}</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-on-surface-variant mb-4">{t('settings.language.description')}</p>
                  <LanguageSelector variant="inline" />
                </div>
              </section>
              <DeleteAccountSettings />
            </>
          )}

          {activeTab === 'credentials' && (
            <CredentialSettings credentials={credentials} />
          )}

          {activeTab === 'organization' && (
            <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.team.heading')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <p className="text-sm text-on-surface-variant">{t('settings.team.seatsUsed', { used: orgMembers.length, total: maxSeats })}</p>
                  <Button variant="secondary" size="sm">{t('settings.team.inviteMember')}</Button>
                </div>
                {membersLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-14 bg-surface-container-high rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orgMembers.map((member) => (
                      <TeamMember
                        key={member.id}
                        name={member.fullName || t('settings.team.unnamed')}
                        email={member.email}
                        role={member.role}
                      />
                    ))}
                    {orgMembers.length === 0 && (
                      <p className="text-sm text-on-surface-variant py-2">{t('settings.team.noMembers', 'No team members found.')}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'preferences' && (
            <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.notifications.heading')}</h2>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <ToggleRow
                  title={t('settings.notifications.emailAlerts')}
                  description={t('settings.notifications.emailAlertsSub')}
                  enabled={preferences.emailAlerts}
                  onToggle={() => togglePreference('emailAlerts')}
                />
                <ToggleRow
                  title={t('settings.notifications.watchlistTriggers')}
                  description={t('settings.notifications.watchlistTriggersSub')}
                  enabled={preferences.watchlistTriggers}
                  onToggle={() => togglePreference('watchlistTriggers')}
                />
                <ToggleRow
                  title={t('settings.notifications.weeklyDigest')}
                  description={t('settings.notifications.weeklyDigestSub')}
                  enabled={preferences.weeklyDigest}
                  onToggle={() => togglePreference('weeklyDigest')}
                />
                <ToggleRow
                  title={t('settings.notifications.transferUpdates')}
                  description={t('settings.notifications.transferUpdatesSub')}
                  enabled={preferences.transferUpdates}
                  onToggle={() => togglePreference('transferUpdates')}
                />
              </div>
            </section>
          )}

          {activeTab === 'billing' && (
            <BillingSettings />
          )}

          {activeTab === 'aiMethodology' && (
            <AiMethodologySettings
              scoringWeights={scoringWeights}
              onUpdateWeight={updateScoringWeight}
              onSaveWeights={saveScoringWeights}
              weightsSaveStatus={scoringWeightsSaveStatus}
            />
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
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">{name}</p>
          <p className="text-[0.625rem] text-on-surface-variant truncate">{email}</p>
        </div>
      </div>
      <span className="text-[0.625rem] font-data font-medium text-on-surface-variant uppercase shrink-0">{role}</span>
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
    <div className={`flex items-center justify-between gap-3 ${!enabled ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-on-surface">{title}</p>
        <p className="text-[0.625rem] text-on-surface-variant">{description}</p>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        <span className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 ${
          enabled ? 'bg-secondary' : 'bg-surface-container-high'
        }`}>
          <span
            className={`inline-block h-4 w-4 transform rounded-sm bg-on-surface transition-transform ${
              enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
            }`}
          />
        </span>
      </button>
    </div>
  )
}
