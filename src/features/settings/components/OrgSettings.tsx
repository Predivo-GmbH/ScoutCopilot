import { Check, Loader2 } from 'lucide-react'

interface OrgSettingsProps {
  org: { name: string; country: string }
  onUpdate: (updates: Record<string, string>) => void
  onSave?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function OrgSettings({ org, onUpdate, onSave, saveStatus = 'idle' }: OrgSettingsProps) {
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
      {onSave && (
        <div className="px-6 py-4 border-t border-outline-variant flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Saving...</span>
            ) : saveStatus === 'saved' ? (
              <span className="flex items-center gap-2"><Check size={14} /> Saved</span>
            ) : 'Save Organization'}
          </button>
          {saveStatus === 'error' && (
            <span className="text-xs text-error">Failed to save. Please try again.</span>
          )}
        </div>
      )}
    </section>
  )
}
