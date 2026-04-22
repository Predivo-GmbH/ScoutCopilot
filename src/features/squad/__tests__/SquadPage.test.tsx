/**
 * SquadPage (F-040) — Unit Tests
 * Tests rendering with mocked hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../hooks/useSquad', () => ({
  useSquad: vi.fn(() => ({
    squads: [],
    isLoading: false,
    selectedSquad: null,
    selectSquad: vi.fn(),
    clearSelection: vi.fn(),
    createSquad: vi.fn(),
    deleteSquad: vi.fn(),
    removePlayer: vi.fn(),
    assignToSlot: vi.fn(),
    removeFromSlot: vi.fn(),
    updateFormation: vi.fn(),
    updatePlayerBirthDate: vi.fn(),
    updatePlayerPosition: vi.fn(),
  })),
}))

vi.mock('../hooks/useGapAnalysis', () => ({
  useGapAnalysis: vi.fn(() => ({
    gaps: [],
    isLoading: false,
  })),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
    storage: { from: vi.fn(() => ({ getPublicUrl: vi.fn() })) },
  },
}))

vi.mock('../components/FormationPitch', () => ({
  FormationPitch: () => <div data-testid="formation-pitch">Pitch</div>,
  FormationSelector: () => <div data-testid="formation-selector">Selector</div>,
}))

vi.mock('../components/GapAnalysisSection', () => ({
  GapAnalysisSection: () => <div>Gap Analysis</div>,
}))

vi.mock('../components/SquadTable', () => ({
  SquadTable: () => <div>Squad Table</div>,
}))

vi.mock('../components/SquadCard', () => ({
  SquadCard: () => <div>Squad Card</div>,
}))

import { SquadPage } from '../SquadPage'

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

describe('F-040: SquadPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<SquadPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders heading', () => {
    const { container } = render(<SquadPage />, { wrapper: createWrapper() })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBe(1)
  })

  it('renders create squad button', () => {
    const { container } = render(<SquadPage />, { wrapper: createWrapper() })
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
