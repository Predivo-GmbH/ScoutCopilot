import { Button } from '../../../components/ui/Button'

export function BillingSettings() {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Billing & Subscription</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md border border-outline-variant">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-on-surface">Pro Plan</h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[0.625rem] font-semibold rounded-sm uppercase">Active</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">$299/mo billed monthly &middot; Renews April 23, 2026</p>
          </div>
          <Button variant="secondary" size="sm">Manage Subscription</Button>
        </div>

        {/* Usage */}
        <div>
          <h4 className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium mb-3">Current Usage</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageStat label="API Calls" used={3842} limit="Unlimited" />
            <UsageStat label="Reports" used={156} limit="Unlimited" />
            <UsageStat label="Searches" used={1247} limit="Unlimited" />
            <UsageStat label="Seats" used={2} limit="3" />
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
          <h4 className="text-sm font-semibold text-on-surface mb-1">Need more seats or custom AI models?</h4>
          <p className="text-xs text-on-surface-variant mb-3">Upgrade to Club plan for 10 seats, custom models, and API access.</p>
          <Button variant="primary" size="sm">Upgrade to Club ($599/mo)</Button>
        </div>
      </div>
    </section>
  )
}

function UsageStat({ label, used, limit }: { label: string; used: number; limit: string }) {
  return (
    <div className="p-3 bg-surface-container-low rounded-md border border-outline-variant">
      <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium mb-1">{label}</p>
      <p className="text-lg font-data font-semibold text-on-surface">{used.toLocaleString()}</p>
      <p className="text-[0.625rem] text-on-surface-variant">of {limit}</p>
    </div>
  )
}
