import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PartyPopper,
  Database,
  Settings2,
  Rocket,
  ArrowLeft,
  ArrowRight,
  SkipForward,
} from 'lucide-react'
import { useAuth } from './useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const STEPS = ['Welcome', 'Connect Data', 'Preferences', 'Ready'] as const

const STEP_ICONS = {
  Welcome: PartyPopper,
  'Connect Data': Database,
  Preferences: Settings2,
  Ready: Rocket,
} as const

const LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Eredivisie',
  'Primeira Liga',
  'Championship',
  '2. Bundesliga',
  'Serie B',
  'Belgian Pro League',
  'Super Lig',
]

const POSITIONS = [
  'Goalkeeper',
  'Centre-Back',
  'Full-Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger',
  'Striker',
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()

  const [stepIndex, setStepIndex] = useState(0)
  const currentStep = STEPS[stepIndex]

  // Connect data state
  const [wyscoutUser, setWyscoutUser] = useState('')
  const [wyscoutPass, setWyscoutPass] = useState('')
  const [statsbombUser, setStatsbombUser] = useState('')
  const [statsbombPass, setStatsbombPass] = useState('')

  // Preferences state
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1)
  }

  function back() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  async function finish() {
    await refreshProfile()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top stepper */}
      <header className="w-full border-b border-outline-variant/20 bg-background">
        <div className="flex justify-between items-center max-w-3xl mx-auto px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-primary">ScoutCopilot</span>
          <nav className="flex items-center gap-6">
            {STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step]
              const isActive = i === stepIndex
              const isDone = i < stepIndex
              return (
                <div
                  key={step}
                  className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDone
                      ? 'text-emerald-400'
                      : isActive
                        ? 'text-on-surface'
                        : 'text-on-surface-variant/50'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{step}</span>
                </div>
              )
            })}
          </nav>
          <div className="w-24" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[640px]">
          {/* Step 1: Welcome */}
          {currentStep === 'Welcome' && (
            <Card className="text-center">
              <PartyPopper size={40} strokeWidth={1.5} className="mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-semibold text-on-surface mb-2">
                Welcome to ScoutCopilot{profile?.full_name ? `, ${profile.full_name}` : ''}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Let's get you set up in a few quick steps. Connect your scouting data source
                and configure your preferences to start finding players faster.
              </p>
            </Card>
          )}

          {/* Step 2: Connect Data */}
          {currentStep === 'Connect Data' && (
            <Card>
              <h2 className="text-xl font-semibold text-on-surface mb-1">Connect Your Data Source</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Link your Wyscout or StatsBomb API credentials. You can skip this and add them later in Settings.
              </p>

              <div className="space-y-6">
                {/* Wyscout */}
                <div className="p-4 rounded-md border border-outline-variant/40 bg-surface-container space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md">
                      <Database size={18} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">Wyscout</h3>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                        Official API Integration
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Username"
                      placeholder="API username"
                      value={wyscoutUser}
                      onChange={e => setWyscoutUser(e.target.value)}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="API password"
                      value={wyscoutPass}
                      onChange={e => setWyscoutPass(e.target.value)}
                    />
                  </div>
                </div>

                {/* StatsBomb */}
                <div className="p-4 rounded-md border border-outline-variant/40 bg-surface-container space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md">
                      <Database size={18} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">StatsBomb</h3>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                        Event Data Sync
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Username"
                      placeholder="API username"
                      value={statsbombUser}
                      onChange={e => setStatsbombUser(e.target.value)}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="API password"
                      value={statsbombPass}
                      onChange={e => setStatsbombPass(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 'Preferences' && (
            <Card>
              <h2 className="text-xl font-semibold text-on-surface mb-1">Set Your Preferences</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Choose default leagues and positions to personalize your scouting experience.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-3">
                    Default Leagues
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {LEAGUES.map(league => (
                      <button
                        key={league}
                        type="button"
                        onClick={() => toggleItem(selectedLeagues, league, setSelectedLeagues)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                          selectedLeagues.includes(league)
                            ? 'bg-primary/20 border-primary text-on-surface'
                            : 'bg-transparent border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {league}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-3">
                    Preferred Positions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => toggleItem(selectedPositions, pos, setSelectedPositions)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                          selectedPositions.includes(pos)
                            ? 'bg-primary/20 border-primary text-on-surface'
                            : 'bg-transparent border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Ready */}
          {currentStep === 'Ready' && (
            <Card className="text-center">
              <Rocket size={40} strokeWidth={1.5} className="mx-auto text-emerald-400 mb-4" />
              <h1 className="text-2xl font-semibold text-on-surface mb-2">You're All Set!</h1>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
                Your ScoutCopilot workspace is ready. Start searching for players using natural language
                or explore the dashboard.
              </p>
              <Button onClick={finish} leftIcon={Rocket} size="lg">
                Go to Dashboard
              </Button>
            </Card>
          )}

          {/* Step progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-md transition-colors ${
                  i < stepIndex
                    ? 'bg-emerald-400'
                    : i === stepIndex
                      ? 'bg-primary'
                      : 'bg-outline-variant/40'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="w-full border-t border-outline-variant/20 bg-background">
        <div className="flex justify-between items-center max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {stepIndex > 0 && (
              <Button variant="ghost" leftIcon={ArrowLeft} onClick={back}>
                Back
              </Button>
            )}
            {currentStep === 'Connect Data' && (
              <Button variant="ghost" leftIcon={SkipForward} onClick={next}>
                Skip for now
              </Button>
            )}
          </div>
          <div>
            {currentStep !== 'Ready' && (
              <Button rightIcon={ArrowRight} onClick={next}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
