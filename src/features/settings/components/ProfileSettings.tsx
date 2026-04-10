import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Check, Loader2, Mail } from 'lucide-react'

interface ProfileSettingsProps {
  profile: { fullName: string; email: string; role: string }
  originalEmail?: string
  onUpdate: (updates: Record<string, string>) => void
  onSave?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onChangeEmail?: () => void
  emailChangeStatus?: 'idle' | 'saving' | 'sent' | 'error'
  avatarUrl?: string | null
  onAvatarUpload?: (file: File) => Promise<{ error: string | null }>
  avatarUploadStatus?: 'idle' | 'uploading' | 'error'
  avatarError?: string | null
}

export function ProfileSettings({ profile, originalEmail, onUpdate, onSave, saveStatus = 'idle', onChangeEmail, emailChangeStatus = 'idle', avatarUrl, onAvatarUpload, avatarUploadStatus = 'idle', avatarError }: ProfileSettingsProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emailChanged = originalEmail !== undefined && profile.email !== originalEmail && profile.email.includes('@')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onAvatarUpload) return
    await onAvatarUpload(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.profile.heading')}</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploadStatus === 'uploading'}
              className="relative w-20 h-20 rounded-md bg-surface-container-highest flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all disabled:cursor-wait group"
              aria-label={t('settings.profile.updateAvatar')}
            >
              {avatarUploadStatus === 'uploading' ? (
                <Loader2 size={24} className="animate-spin text-on-surface-variant" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} strokeWidth={1.5} className="text-on-surface-variant" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />
            <span className="text-[0.625rem] font-data uppercase tracking-wider text-on-surface-variant">{t('settings.profile.updateAvatar')}</span>
            {avatarError && (
              <p className="text-xs text-error" role="status">{t(avatarError)}</p>
            )}
          </div>
          {/* Form */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              label={t('settings.profile.fullName')}
              value={profile.fullName}
              onChange={(v) => onUpdate({ fullName: v })}
            />
            <div>
              <FormField
                label={t('settings.profile.emailAddress')}
                value={profile.email}
                onChange={(v) => onUpdate({ email: v })}
                type="email"
              />
              {emailChanged && onChangeEmail && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={onChangeEmail}
                    disabled={emailChangeStatus === 'saving'}
                    className="px-3 py-1.5 bg-secondary text-on-secondary rounded-md text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 min-h-[36px] flex items-center gap-1.5"
                  >
                    {emailChangeStatus === 'saving' ? (
                      <><Loader2 size={12} className="animate-spin" /> {t('settings.profile.changingEmail')}</>
                    ) : (
                      <><Mail size={12} /> {t('settings.profile.changeEmail')}</>
                    )}
                  </button>
                </div>
              )}
              {emailChangeStatus === 'sent' && (
                <p className="mt-2 text-xs text-secondary" role="status">{t('settings.profile.emailConfirmationSent')}</p>
              )}
              {emailChangeStatus === 'error' && (
                <p className="mt-2 text-xs text-error" role="status">{t('settings.profile.emailChangeError')}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile-role" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">{t('settings.profile.role')}</label>
              <select
                id="profile-role"
                value={profile.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none min-h-[44px]"
              >
                <option>{t('settings.profile.roles.scout')}</option>
                <option>{t('settings.profile.roles.headOfRecruitment')}</option>
                <option>{t('settings.profile.roles.technicalDirector')}</option>
                <option>{t('settings.profile.roles.analyst')}</option>
              </select>
            </div>
            {onSave && (
              <div className="sm:col-span-2 flex items-center gap-3 pt-2" role="status">
                <button
                  onClick={onSave}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {saveStatus === 'saving' ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {t('common.saving')}</span>
                  ) : saveStatus === 'saved' ? (
                    <span className="flex items-center gap-2"><Check size={14} /> {t('common.saved')}</span>
                  ) : t('settings.profile.saveProfile')}
                </button>
                {saveStatus === 'error' && (
                  <span className="text-xs text-error">{t('common.failedToSave')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FormField({ label, value, onChange, type = 'text', readOnly }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  readOnly?: boolean
}) {
  const inputId = `profile-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div>
      <label htmlFor={inputId} className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px] ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  )
}
