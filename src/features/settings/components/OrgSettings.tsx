import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'

interface OrgSettingsProps {
  org: { name: string }
  onUpdate: (updates: Record<string, string>) => void
  onSave?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function OrgSettings({ org, onUpdate, onSave, saveStatus = 'idle' }: OrgSettingsProps) {
  const { t } = useTranslation()

  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.org.heading')}</h2>
      </div>
      <div className="p-6">
        <div>
          <label htmlFor="org-name" className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
            {t('settings.org.clubOrg')}
          </label>
          <input
            id="org-name"
            type="text"
            value={org.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-base md:text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[44px]"
          />
        </div>
      </div>
      {onSave && (
        <div className="px-6 py-4 border-t border-outline-variant flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {t('common.saving')}</span>
            ) : saveStatus === 'saved' ? (
              <span className="flex items-center gap-2"><Check size={14} /> {t('common.saved')}</span>
            ) : t('settings.org.saveOrg')}
          </button>
          {saveStatus === 'error' && (
            <span className="text-xs text-error">{t('common.failedToSave')}</span>
          )}
        </div>
      )}
    </section>
  )
}
