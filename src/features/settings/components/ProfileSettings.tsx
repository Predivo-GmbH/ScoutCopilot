import { User } from 'lucide-react'

interface ProfileSettingsProps {
  profile: { fullName: string; email: string; role: string }
  onUpdate: (updates: Record<string, string>) => void
}

export function ProfileSettings({ profile, onUpdate }: ProfileSettingsProps) {
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
              onChange={(v) => onUpdate({ email: v })}
              type="email"
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
          </div>
        </div>
      </div>
    </section>
  )
}

function FormField({ label, value, onChange, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
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
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm font-data text-on-surface focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  )
}
