import { User, Check, Loader2 } from 'lucide-react'

interface ProfileSettingsProps {
  profile: { fullName: string; email: string; role: string }
  onUpdate: (updates: Record<string, string>) => void
  onSave?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function ProfileSettings({ profile, onUpdate, onSave, saveStatus = 'idle' }: ProfileSettingsProps) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-md overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">User Profile</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-md bg-surface-container-highest flex items-center justify-center">
              <User size={32} strokeWidth={1.5} className="text-on-surface-variant" />
            </div>
            <span className="text-[0.625rem] font-data uppercase tracking-wider text-on-surface-variant">Update Avatar</span>
          </div>
          {/* Form */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              label="Full Name"
              value={profile.fullName}
              onChange={(v) => onUpdate({ fullName: v })}
            />
            <FormField
              label="Email Address"
              value={profile.email}
              onChange={() => {}}
              type="email"
              readOnly
            />
            <div className="col-span-2">
              <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">Role</label>
              <select
                value={profile.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option>Scout</option>
                <option>Head of Recruitment</option>
                <option>Technical Director</option>
                <option>Analyst</option>
              </select>
            </div>
            {onSave && (
              <div className="col-span-2 flex items-center gap-3 pt-2">
                <button
                  onClick={onSave}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Saving...</span>
                  ) : saveStatus === 'saved' ? (
                    <span className="flex items-center gap-2"><Check size={14} /> Saved</span>
                  ) : 'Save Profile'}
                </button>
                {saveStatus === 'error' && (
                  <span className="text-xs text-error">Failed to save. Please try again.</span>
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
  return (
    <div>
      <label className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  )
}
