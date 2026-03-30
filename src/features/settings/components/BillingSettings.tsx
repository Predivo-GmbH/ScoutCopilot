import { useState } from 'react'
import { useLocalizedNavigate } from '../../../components/shared/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { CreditCard, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { useSubscription } from '../../../hooks/useSubscription'
import { TIER_PRICES, TIER_LABELS, openBillingPortal } from '../../../lib/stripe'

export function BillingSettings() {
  const { t } = useTranslation()
  const { tier, limits, usage, isLoading } = useSubscription()
  const navigate = useLocalizedNavigate()
  const [portalLoading, setPortalLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const price = TIER_PRICES[tier]
  const tierLabel = TIER_LABELS[tier]

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const url = await openBillingPortal()
      try {
        const parsed = new URL(url)
        if (parsed.hostname === 'billing.stripe.com' || parsed.hostname === 'checkout.stripe.com') {
          window.location.href = url
        } else {
          window.location.reload()
        }
      } catch {
        window.location.reload()
      }
    } catch {
      // If no subscription, redirect to pricing
      navigate('/pricing')
    } finally {
      setPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.billing.heading')}</h2>
        </div>
        <div className="p-6" role="status" aria-live="polite">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-surface-container-low rounded-md" />
            <div className="h-16 bg-surface-container-low rounded-md" />
          </div>
          <span className="sr-only">{t('common.loading', 'Loading...')}</span>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">{t('settings.billing.heading')}</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface-container-low rounded-md border border-outline-variant">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-on-surface">{tierLabel} {t('settings.billing.plan')}</h3>
              <Badge variant="primary">{t('common.active')}</Badge>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              <span className="font-mono">${price.month}</span>{t('settings.billing.billedMonthly')}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={CreditCard}
            loading={portalLoading}
            onClick={handleManageBilling}
          >
            {t('settings.billing.manageBilling')}
          </Button>
        </div>

        {/* Usage */}
        <div>
          <h4 className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium mb-3">{t('settings.billing.currentUsage')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageStat label={t('settings.billing.apiCalls')} used={usage.apiCalls} limit={t('common.unlimited')} />
            <UsageStat
              label={t('settings.billing.reports')}
              used={usage.reportsGenerated}
              limit={limits.maxReports !== null ? String(limits.maxReports) : t('common.unlimited')}
              warn={limits.maxReports !== null && usage.reportsGenerated >= limits.maxReports * 0.8}
            />
            <UsageStat label={t('settings.billing.searches')} used={usage.searchesCount} limit={t('common.unlimited')} />
            <UsageStat label={t('settings.billing.seats')} used={1} limit={String(limits.maxSeats)} />
          </div>
        </div>

        {/* Upgrade CTA (only show if not on Club) */}
        {tier !== 'club' && (
          <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
            <h4 className="text-sm font-semibold text-on-surface mb-1">
              {tier === 'scout' ? t('settings.billing.unlockUnlimited') : t('settings.billing.needMoreSeats')}
            </h4>
            <p className="text-xs text-on-surface-variant mb-3">
              {tier === 'scout'
                ? t('settings.billing.upgradeToProSub')
                : t('settings.billing.upgradeToClubSub')}
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/pricing')}>
              {tier === 'scout' ? t('settings.billing.upgradeTo', { tier: 'Pro' }) : t('settings.billing.upgradeTo', { tier: 'Club' })}
            </Button>
          </div>
        )}

        {/* Cancel */}
        <div className="border-t border-outline-variant/30 pt-6">
          {!showCancelConfirm ? (
            <button
              className="text-xs text-on-surface-variant hover:text-error transition-colors min-h-[44px] inline-flex items-center"
              onClick={() => setShowCancelConfirm(true)}
            >
              {t('settings.billing.cancelSubscription')}
            </button>
          ) : (
            <div className="p-4 bg-error-container/10 border border-error/20 rounded-md">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} strokeWidth={1.5} className="text-error mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-on-surface mb-1">{t('settings.billing.cancelConfirm')}</p>
                  <p className="text-xs text-on-surface-variant mb-3">
                    {t('settings.billing.cancelDescription', { tier: tierLabel })}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      leftIcon={ExternalLink}
                      onClick={handleManageBilling}
                      loading={portalLoading}
                      className="w-full sm:w-auto"
                    >
                      {t('settings.billing.cancelInStripe')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)} className="w-full sm:w-auto">
                      {t('settings.billing.keepSubscription')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function UsageStat({ label, used, limit, warn }: { label: string; used: number; limit: string; warn?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className={`p-3 bg-surface-container-low rounded-md border ${warn ? 'border-warning/30' : 'border-outline-variant'}`}>
      <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium mb-1">{label}</p>
      <p className="text-lg font-mono font-semibold text-on-surface">{used.toLocaleString()}</p>
      <p className="text-[0.625rem] text-on-surface-variant">{t('settings.billing.ofLimit', { limit })}</p>
    </div>
  )
}
