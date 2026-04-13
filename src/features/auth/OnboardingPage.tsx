import { useState } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
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
import { saveCredential } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { Logo } from '../../components/shared/Logo'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const STEPS = ['welcome', 'connectData', 'preferences', 'ready'] as const

const STEP_ICONS = {
  welcome: PartyPopper,
  connectData: Database,
  preferences: Settings2,
  ready: Rocket,
} as const

const STEP_LABEL_KEYS: Record<string, string> = {
  welcome: 'auth.onboarding.steps.welcome',
  connectData: 'auth.onboarding.steps.connectData',
  preferences: 'auth.onboarding.steps.preferences',
  ready: 'auth.onboarding.steps.ready',
}

const LEAGUE_KEYS = [
  'auth.onboarding.leagues.premierLeague',
  'auth.onboarding.leagues.laLiga',
  'auth.onboarding.leagues.serieA',
  'auth.onboarding.leagues.bundesliga',
  'auth.onboarding.leagues.ligue1',
  'auth.onboarding.leagues.eredivisie',
  'auth.onboarding.leagues.primeiraLiga',
  'auth.onboarding.leagues.championship',
  'auth.onboarding.leagues.zweiteBundesliga',
  'auth.onboarding.leagues.serieB',
  'auth.onboarding.leagues.belgianProLeague',
  'auth.onboarding.leagues.superLig',
]

const POSITION_KEYS = [
  'auth.onboarding.positions.goalkeeper',
  'auth.onboarding.positions.centreBack',
  'auth.onboarding.positions.fullBack',
  'auth.onboarding.positions.defensiveMidfielder',
  'auth.onboarding.positions.centralMidfielder',
  'auth.onboarding.positions.attackingMidfielder',
  'auth.onboarding.positions.winger',
  'auth.onboarding.positions.striker',
]

export function OnboardingPage() {
  const navigate = useLocalizedNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { t } = useTranslation()

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
    // Save credentials if any were entered (best-effort, don't block navigation)
    const credentialPromises: Promise<unknown>[] = []
    if (wyscoutUser && wyscoutPass) {
      credentialPromises.push(
        saveCredential('wyscout', wyscoutUser, wyscoutPass).catch(() => { /* best-effort */ })
      )
    }
    if (statsbombUser && statsbombPass) {
      credentialPromises.push(
        saveCredential('statsbomb', statsbombUser, statsbombPass).catch(() => { /* best-effort */ })
      )
    }

    // Save league/position preferences to the user's scoring_weights (or a preferences field)
    if (user && (selectedLeagues.length > 0 || selectedPositions.length > 0)) {
      credentialPromises.push(
        Promise.resolve(
          supabase
            .from('profiles')
            .update({
              scoring_weights: {
                preferred_leagues: selectedLeagues,
                preferred_positions: selectedPositions,
              } as unknown as Record<string, number>,
            })
            .eq('id', user.id)
        ).then(() => { /* saved */ })
         .catch(() => { /* best-effort */ })
      )
    }

    await Promise.all(credentialPromises)
    await refreshProfile()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      {/* Top stepper */}
      <header className="w-full border-b border-outline-variant/20 bg-background">
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Logo size="md" />
          <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto">
            {STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step]
              const isActive = i === stepIndex
              const isDone = i < stepIndex
              return (
                <div
                  key={step}
                  className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider transition-colors shrink-0 ${
                    isDone
                      ? 'text-secondary'
                      : isActive
                        ? 'text-on-surface'
                        : 'text-on-surface-variant/70'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{t(STEP_LABEL_KEYS[step])}</span>
                </div>
              )
            })}
          </nav>
          <div className="w-12 sm:w-24 shrink-0" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[640px]">
          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <Card className="text-center">
              <PartyPopper size={40} strokeWidth={1.5} className="mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-semibold text-on-surface mb-2">
                {t('auth.onboarding.welcome')}{profile?.full_name ? `, ${profile.full_name}` : ''}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                {t('auth.onboarding.welcomeSub')}
              </p>
            </Card>
          )}

          {/* Step 2: Connect Data */}
          {currentStep === 'connectData' && (
            <Card>
              <h2 className="text-xl font-semibold text-on-surface mb-1">{t('auth.onboarding.connectDataSource')}</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {t('auth.onboarding.connectDataSourceSub')}
              </p>

              <div className="space-y-6">
                {/* Wyscout */}
                <div className="p-4 rounded-md border border-outline-variant/40 bg-surface-container space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md">
                      <Database size={18} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface">{t('auth.onboarding.wyscout')}</h3>
                      <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">
                        {t('auth.onboarding.wyscoutSub')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label={t('auth.onboarding.username')}
                      placeholder={t('auth.onboarding.apiUsername')}
                      value={wyscoutUser}
                      onChange={e => setWyscoutUser(e.target.value)}
                    />
                    <Input
                      label={t('auth.passwordLabel')}
                      type="password"
                      placeholder={t('auth.onboarding.apiPassword')}
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
                      <h3 className="text-sm font-semibold text-on-surface">{t('auth.onboarding.statsbomb')}</h3>
                      <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant">
                        {t('auth.onboarding.statsbombSub')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label={t('auth.onboarding.username')}
                      placeholder={t('auth.onboarding.apiUsername')}
                      value={statsbombUser}
                      onChange={e => setStatsbombUser(e.target.value)}
                    />
                    <Input
                      label={t('auth.passwordLabel')}
                      type="password"
                      placeholder={t('auth.onboarding.apiPassword')}
                      value={statsbombPass}
                      onChange={e => setStatsbombPass(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 'preferences' && (
            <Card>
              <h2 className="text-xl font-semibold text-on-surface mb-1">{t('auth.onboarding.setPreferences')}</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {t('auth.onboarding.setPreferencesSub')}
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-3">
                    {t('auth.onboarding.defaultLeagues')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {LEAGUE_KEYS.map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleItem(selectedLeagues, key, setSelectedLeagues)}
                        className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-[44px] ${
                          selectedLeagues.includes(key)
                            ? 'bg-primary/20 border-primary text-on-surface'
                            : 'bg-transparent border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-3">
                    {t('auth.onboarding.preferredPositions')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {POSITION_KEYS.map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleItem(selectedPositions, key, setSelectedPositions)}
                        className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-[44px] ${
                          selectedPositions.includes(key)
                            ? 'bg-primary/20 border-primary text-on-surface'
                            : 'bg-transparent border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Ready */}
          {currentStep === 'ready' && (
            <Card className="text-center">
              <Rocket size={40} strokeWidth={1.5} className="mx-auto text-secondary mb-4" />
              <h1 className="text-2xl font-semibold text-on-surface mb-2">{t('auth.onboarding.allSet')}</h1>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
                {t('auth.onboarding.allSetSub')}
              </p>
              <Button onClick={finish} leftIcon={Rocket} size="lg">
                {t('auth.onboarding.goToDashboard')}
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
                    ? 'bg-secondary'
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
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4 sm:px-6 py-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {stepIndex > 0 && (
              <Button variant="ghost" leftIcon={ArrowLeft} onClick={back} className="min-h-[44px]">
                {t('common.back')}
              </Button>
            )}
            {currentStep === 'connectData' && (
              <Button variant="ghost" leftIcon={SkipForward} onClick={next} className="min-h-[44px]">
                {t('auth.onboarding.skipForNow')}
              </Button>
            )}
          </div>
          <div>
            {currentStep !== 'ready' && (
              <Button rightIcon={ArrowRight} onClick={next} className="min-h-[44px]">
                {t('common.continue')}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
