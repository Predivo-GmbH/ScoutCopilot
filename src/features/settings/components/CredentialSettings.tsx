import { useTranslation } from 'react-i18next'
import { Eye, RefreshCw } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface Credential {
  provider: string
  connected: boolean
  maskedKey: string
}

interface CredentialSettingsProps {
  credentials: Credential[]
}

export function CredentialSettings({ credentials }: CredentialSettingsProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{t('settings.credentials.heading')}</h3>
        <Button variant="secondary" size="sm">{t('settings.credentials.addConnection')}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map((cred) => (
          <div
            key={cred.provider}
            className={`bg-surface-container p-6 rounded-md border border-outline-variant flex flex-col gap-4 ${
              !cred.connected ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-md ${cred.connected ? 'bg-secondary' : 'bg-outline'}`} />
                <span className="text-sm font-semibold text-on-surface capitalize">{cred.provider}</span>
              </div>
              <span className={`text-[0.5625rem] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                cred.connected
                  ? 'bg-secondary/10 text-secondary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {cred.connected ? t('settings.credentials.connected') : t('settings.credentials.notConnected')}
              </span>
            </div>
            {cred.connected ? (
              <div className="bg-surface-container-lowest px-3 py-2 rounded-sm flex items-center justify-between border border-outline-variant">
                <span className="font-data text-xs text-on-surface-variant">{cred.maskedKey}</span>
                <div className="flex gap-1">
                  <button className="text-on-surface-variant hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={t('settings.credentials.revealKey', 'Reveal key')}>
                    <Eye size={14} strokeWidth={1.5} />
                  </button>
                  <button className="text-on-surface-variant hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={t('settings.credentials.refreshKey', 'Refresh key')}>
                    <RefreshCw size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="sm" className="w-full">{t('settings.credentials.connectDataSource')}</Button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
