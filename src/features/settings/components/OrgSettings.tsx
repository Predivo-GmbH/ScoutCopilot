interface OrgSettingsProps {
  org: { name: string; country: string }
  onUpdate: (updates: Record<string, string>) => void
}

export function OrgSettings({ org, onUpdate }: OrgSettingsProps) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Organization Details</h2>
      </div>
      <div className="p-6 grid grid-cols-2 gap-6">
        <div>
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
            Club / Organization
          </label>
          <input
            type="text"
            value={org.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
            Country
          </label>
          <input
            type="text"
            value={org.country}
            onChange={(e) => onUpdate({ country: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
    </section>
  )
}
