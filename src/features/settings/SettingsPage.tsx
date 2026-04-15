import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Loader2, Clock } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ScrollableTabBar } from '../../components/ui/ScrollableTabBar'
import { useSettings, type SettingsTab, type PendingInvitation, type OrgMember } from './hooks/useSettings'
import { ProfileSettings } from './components/ProfileSettings'
import { OrgSettings } from './components/OrgSettings'
import { CredentialSettings } from './components/CredentialSettings'
import { BillingSettings } from './components/BillingSettings'
import { PasswordSettings } from './components/PasswordSettings'
import { LanguageSelector } from '../../components/shared/LanguageSelector'
import { DeleteAccountSettings } from './components/DeleteAccountSettings'
import { AiMethodologySettings } from './components/AiMethodologySettings'
import { PlayerDatabaseSettings } from './components/PlayerDatabaseSettings'
import { supabase } from '../../lib/supabase'

const settingsTabs: { key: SettingsTab; labelKey: string }[] = [
  { key: 'profile', labelKey: 'settings.tabs.account' },
  { key: 'credentials', labelKey: 'settings.tabs.apiKeys' },
  { key: 'organization', labelKey: 'settings.tabs.teamManagement' },
  { key: 'preferences', labelKey: 'settings.tabs.notifications' },
  { key: 'billing', labelKey: 'settings.tabs.billing' },
  { key: 'aiMethodology', labelKey: 'settings.tabs.aiInsights' },
  { key: 'playerDatabase', labelKey: 'settings.tabs.playerDatabase' },
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
    credentialsLoading,
    preferences,
    togglePreference,
    savePreferences,
    preferencesSaveStatus,
    orgMembers,
    membersLoading,
    pendingInvitations,
    maxSeats,
    scoringWeights,
    updateScoringWeight,
    saveScoringWeights,
    scoringWeightsSaveStatus,
    changeEmail,
    emailChangeStatus,
    originalEmail,
    avatarUrl,
    uploadAvatar,
    avatarUploadStatus,
    avatarError,
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
              <ProfileSettings profile={profile} originalEmail={originalEmail} onUpdate={updateProfile} onSave={saveProfile} saveStatus={saveStatus} onChangeEmail={changeEmail} emailChangeStatus={emailChangeStatus} avatarUrl={avatarUrl} onAvatarUpload={uploadAvatar} avatarUploadStatus={avatarUploadStatus} avatarError={avatarError} />
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
            <CredentialSettings credentials={credentials} loading={credentialsLoading} />
          )}

          {activeTab === 'organization' && (
            <OrganizationTab
              orgMembers={orgMembers}
              membersLoading={membersLoading}
              pendingInvitations={pendingInvitations}
              maxSeats={maxSeats}
            />
          )}

          {activeTab === 'preferences' && (
            <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.notifications.heading')}</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={savePreferences}
                    disabled={preferencesSaveStatus === 'saving'}
                    className="px-4 py-2 rounded-sm text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  >
                    {preferencesSaveStatus === 'saving' ? t('common.saving') : preferencesSaveStatus === 'saved' ? t('common.saved') : t('settings.notifications.savePreferences')}
                  </button>
                  {preferencesSaveStatus === 'error' && (
                    <span className="text-xs text-error">{t('common.failedToSave')}</span>
                  )}
                </div>
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

          {activeTab === 'playerDatabase' && (
            <PlayerDatabaseSettings />
          )}

        </div>
      </div>
    </div>
  )
}

function OrganizationTab({ orgMembers, membersLoading, pendingInvitations, maxSeats }: {
  orgMembers: OrgMember[]
  membersLoading: boolean
  pendingInvitations: PendingInvitation[]
  maxSeats: number
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('scout')
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSendInvite() {
    if (!inviteEmail.trim()) return
    setInviteStatus('sending')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const { data: inviteData, error } = await supabase.functions.invoke('invite-member', {
        body: { email: inviteEmail.trim().toLowerCase(), role: inviteRole },
      })
      if (error) throw new Error(error.message ?? 'Failed to send invitation')
      if (inviteData?.error) throw new Error(inviteData.error)
      setInviteStatus('sent')
      queryClient.invalidateQueries({ queryKey: ['settings', 'pending-invitations'] })
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteEmail('')
        setInviteRole('scout')
        setInviteStatus('idle')
      }, 1500)
    } catch {
      setInviteStatus('error')
      setTimeout(() => setInviteStatus('idle'), 3000)
    }
  }

  return (
    <>
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.team.heading')}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <p className="text-sm text-on-surface-variant">{t('settings.team.seatsUsed', { used: orgMembers.length, total: maxSeats })}</p>
            <Button variant="secondary" size="sm" onClick={() => setShowInviteModal(true)}>{t('settings.team.inviteMember')}</Button>
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
                <p className="text-sm text-on-surface-variant py-2">{t('settings.team.noMembers')}</p>
              )}
            </div>
          )}
          {pendingInvitations.length > 0 && (
            <div className="pt-4 border-t border-outline-variant space-y-2">
              <p className="text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest">{t('settings.team.pending')}</p>
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-md border border-outline-variant opacity-70">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-on-surface-variant shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface truncate">{inv.email}</p>
                      <p className="text-[0.625rem] text-on-surface-variant uppercase">{inv.role}</p>
                    </div>
                  </div>
                  <span className="text-[0.5625rem] font-medium text-on-surface-variant uppercase">{t('settings.team.pending')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Invite Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={t('settings.team.inviteTitle')}
        footer={
          <>
            {inviteStatus === 'error' && (
              <span className="text-xs text-error mr-auto">{t('settings.team.inviteError')}</span>
            )}
            <button
              onClick={handleSendInvite}
              disabled={inviteStatus === 'sending' || !inviteEmail.includes('@')}
              className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-2"
            >
              {inviteStatus === 'sending' ? (
                <><Loader2 size={14} className="animate-spin" /> {t('settings.team.sending')}</>
              ) : inviteStatus === 'sent' ? (
                t('settings.team.inviteSent')
              ) : (
                t('settings.team.sendInvite')
              )}
            </button>
          </>
        }
      >
        <p className="text-xs text-on-surface-variant mb-4">{t('settings.team.inviteDescription')}</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="invite-email" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">{t('settings.team.emailLabel')}</label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('settings.team.emailPlaceholder')}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">{t('settings.team.roleLabel')}</label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none min-h-[44px]"
            >
              <option value="scout">{t('settings.team.roleScout')}</option>
              <option value="head_of_recruitment">{t('settings.team.roleHeadOfRecruitment')}</option>
              <option value="technical_director">{t('settings.team.roleTechnicalDirector')}</option>
              <option value="analyst">{t('settings.team.roleAnalyst')}</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
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
