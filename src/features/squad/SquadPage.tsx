import { useState } from 'react'
import { Users, Heart, AlertTriangle } from 'lucide-react'
import type { FormationType } from '../../lib/mock-data'
import { useSquad } from './hooks/useSquad'
import { useGapAnalysis } from './hooks/useGapAnalysis'
import { FormationPitch, FormationSelector } from './components/FormationPitch'
import { GapAnalysisSection } from './components/GapAnalysisSection'
import { SquadTable } from './components/SquadTable'

export function SquadPage() {
  const { players, isLoading } = useSquad()
  const gaps = useGapAnalysis(players)
  const [formation, setFormation] = useState<FormationType>('4-3-3')

  const totalPlayers = players.length
  const avgAge = totalPlayers > 0 ? (players.reduce((s, p) => s + p.age, 0) / totalPlayers).toFixed(1) : '0'
  const injuredCount = players.filter((p) => p.status === 'injured').length
  const onLoanCount = players.filter((p) => p.status === 'on_loan').length

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="h-8 w-48 bg-surface-container-high rounded-sm animate-pulse" />
        <div className="h-64 bg-surface-container-high rounded-md animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-container-high rounded-md animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">My Squad</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your roster and identify positional gaps.</p>
        </div>
        <FormationSelector value={formation} onChange={setFormation} />
      </div>

      {/* Squad Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Squad Size" value={String(totalPlayers)} />
        <StatCard icon={Users} label="Avg Age" value={avgAge} />
        <StatCard icon={AlertTriangle} label="Injured" value={String(injuredCount)} variant={injuredCount > 0 ? 'warning' : 'default'} />
        <StatCard icon={Heart} label="On Loan" value={String(onLoanCount)} variant={onLoanCount > 0 ? 'info' : 'default'} />
      </div>

      {/* Formation Pitch */}
      <FormationPitch formation={formation} players={players} />

      {/* Gap Analysis */}
      <GapAnalysisSection gaps={gaps} />

      {/* Full Squad Table */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface mb-4">Full Roster</h3>
        <SquadTable players={players} />
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, variant = 'default' }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: string
  variant?: 'default' | 'warning' | 'info'
}) {
  const iconColor = variant === 'warning' ? 'text-amber-500' : variant === 'info' ? 'text-tertiary' : 'text-primary'
  return (
    <div className="bg-surface-container border border-outline-variant rounded-md px-4 py-3 flex items-center gap-3">
      <Icon size={18} strokeWidth={1.5} className={iconColor} />
      <div>
        <p className="font-data text-lg font-bold text-on-surface">{value}</p>
        <p className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">{label}</p>
      </div>
    </div>
  )
}
