/**
 * SettingsPage (F-060 through F-065) — Unit Tests
 * Tests rendering with mocked hooks, tabs
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../hooks/useSettings', () => ({
  useSettings: vi.fn(() => ({
    activeTab: 'profile',
    setActiveTab: vi.fn(),
    profile: { full_name: 'Test User', email: 'test@example.com' },
    updateProfile: vi.fn(),
    saveProfile: vi.fn(),
    org: { name: 'Test Org' },
    updateOrg: vi.fn(),
    saveOrg: vi.fn(),
    saveStatus: 'idle',
    credentials: [],
    credentialsLoading: false,
    preferences: {},
    togglePreference: vi.fn(),
    savePreferences: vi.fn(),
    preferencesSaveStatus: 'idle',
    orgMembers: [],
    membersLoading: false,
    pendingInvitations: [],
    maxSeats: 3,
    scoringWeights: {},
    updateScoringWeight: vi.fn(),
    saveScoringWeights: vi.fn(),
    scoringWeightsSaveStatus: 'idle',
    changeEmail: vi.fn(),
    emailChangeStatus: 'idle',
    originalEmail: 'test@example.com',
    avatarUrl: null,
    uploadAvatar: vi.fn(),
    avatarUploading: false,
  })),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ data: [], error: null })) })),
    auth: { getSession: vi.fn(() => ({ data: { session: null } })) },
  },
}))

vi.mock('../components/ProfileSettings', () => ({
  ProfileSettings: () => <div data-testid="profile-settings">Profile</div>,
}))

vi.mock('../components/OrgSettings', () => ({
  OrgSettings: () => <div data-testid="org-settings">Org</div>,
}))

vi.mock('../components/CredentialSettings', () => ({
  CredentialSettings: () => <div data-testid="credential-settings">Credentials</div>,
}))

vi.mock('../components/BillingSettings', () => ({
  BillingSettings: () => <div data-testid="billing-settings">Billing</div>,
}))

vi.mock('../components/PasswordSettings', () => ({
  PasswordSettings: () => <div data-testid="password-settings">Password</div>,
}))

vi.mock('../../../components/shared/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language</div>,
}))

vi.mock('../components/DeleteAccountSettings', () => ({
  DeleteAccountSettings: () => <div data-testid="delete-account">Delete</div>,
}))

vi.mock('../components/AiMethodologySettings', () => ({
  AiMethodologySettings: () => <div data-testid="ai-methodology">AI</div>,
}))

vi.mock('../components/PlayerDatabaseSettings', () => ({
  PlayerDatabaseSettings: () => <div data-testid="player-database">DB</div>,
}))

import { SettingsPage } from '../SettingsPage'

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HelmetProvider>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          </HelmetProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
}

describe('F-060: SettingsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<SettingsPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders settings navigation sidebar', () => {
    const { container } = render(<SettingsPage />, { wrapper: createWrapper() })
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('renders settings tabs', () => {
    const { container } = render(<SettingsPage />, { wrapper: createWrapper() })
    // Tab bar should render multiple tab options
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(3) // At least several tab buttons
  })

  it('renders profile settings by default', () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('profile-settings')).toBeDefined()
  })
})
