/**
 * OnboardingPage (F-016) — Unit Tests
 * First-run stepper: welcome → connect data → preferences → ready.
 * Advances through steps and finishes to the dashboard.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'

const navigate = vi.fn()
const refreshProfile = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../components/shared/LocalizedLink', () => ({
  useLocalizedNavigate: vi.fn(() => navigate),
}))

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1' },
    profile: { full_name: 'Jane Scout' },
    refreshProfile,
  })),
}))

vi.mock('../../../lib/api', () => ({ saveCredential: vi.fn().mockResolvedValue(undefined) }))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })),
    })),
  },
}))

vi.mock('../../../components/shared/Logo', () => ({ Logo: () => <div>Logo</div> }))

import { OnboardingPage } from '../OnboardingPage'

function renderPage() {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <OnboardingPage />
        </I18nextProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

describe('F-016: OnboardingPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('opens on the welcome step and greets the user by name', () => {
    renderPage()
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toContain('Jane Scout')
  })

  it('renders the 4-step stepper', () => {
    renderPage()
    expect(screen.getByText(i18n.t('auth.onboarding.steps.welcome'))).toBeDefined()
    expect(screen.getByText(i18n.t('auth.onboarding.steps.ready'))).toBeDefined()
  })

  it('advances to the connect-data step when Continue is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: new RegExp(i18n.t('common.continue'), 'i') }))
    expect(screen.getByText(i18n.t('auth.onboarding.connectDataSource'))).toBeDefined()
  })

  it('reaches the ready step and finishes to the dashboard', async () => {
    const user = userEvent.setup()
    renderPage()
    const continueRe = new RegExp(i18n.t('common.continue'), 'i')
    // welcome → connectData → preferences → ready
    await user.click(screen.getByRole('button', { name: continueRe }))
    await user.click(screen.getByRole('button', { name: continueRe }))
    await user.click(screen.getByRole('button', { name: continueRe }))
    await user.click(screen.getByRole('button', { name: new RegExp(i18n.t('auth.onboarding.goToDashboard'), 'i') }))
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })
})
