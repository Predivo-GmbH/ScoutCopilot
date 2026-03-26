import { useState } from 'react'
import { ArrowLeft, Users, Heart, AlertTriangle } from 'lucide-react'
import type { FormationType, MockSquad } from '../../lib/mock-data'
import { useSquad } from './hooks/useSquad'
import { useGapAnalysis } from './hooks/useGapAnalysis'
import { FormationPitch, FormationSelector } from './components/FormationPitch'
import { GapAnalysisSection } from './components/GapAnalysisSection'
import { SquadTable } from './components/SquadTable'
import { SquadCard } from './components/SquadCard'

export function SquadPage() {
  const { squads, isLoading, selectedSquad, selectSquad, clearSelection } = useSquad()

  if (selectedSquad) {
    return <SquadDetail squad={selectedSquad} onBack={clearSelection} />
  }

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-on-surface">My Squads</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your rosters and identify positional gaps.</p>
      </div>

      {/* Squad Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-surface-container-high rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {squads.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              isSelected={false}
              onClick={() => selectSquad(squad.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SquadDetail({ squad, onBack }: { squad: MockSquad; onBack: () => void }) {
  const gaps = useGapAnalysis(squad.players)
  const [formation, setFormation] = useState<FormationType>(squad.formation)

  const totalPlayers = squad.players.length
  const avgAge = totalPlayers > 0 ? (squad.players.reduce((s, p) => s + p.age, 0) / totalPlayers).toFixed(1) : '0'
  const injuredCount = squad.players.filter((p) => p.status === 'injured').length
  const onLoanCount = squad.players.filter((p) => p.status === 'on_loan').length

  return (
    <div className="p-6 space-y-8 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors mb-3"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            All Squads
          </button>
          <h1 className="text-xl font-bold text-on-surface">{squad.name}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {squad.club} &middot; {squad.season}
          </p>
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
      <FormationPitch formation={formation} players={squad.players} />

      {/* Gap Analysis */}
      <GapAnalysisSection gaps={gaps} />

      {/* Full Squad Table */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface mb-4">Full Roster</h3>
        <SquadTable players={squad.players} />
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
