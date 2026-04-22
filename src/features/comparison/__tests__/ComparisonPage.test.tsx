/**
 * ComparisonPage (F-033) — Unit Tests
 * Tests rendering with mocked hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../hooks/useComparison', () => ({
  useComparison: vi.fn(() => ({
    players: [],
    selectedPlayers: [],
    selectedIds: [],
    availablePlayers: [],
    tacticalContext: '',
    setTacticalContext: vi.fn(),
    isLoading: false,
    generated: false,
    verdict: null,
    addPlayer: vi.fn(),
    removePlayer: vi.fn(),
    generateComparison: vi.fn(),
    reset: vi.fn(),
    stepIndex: 0,
    metrics: [],
    dimensions: [],
  })),
  useRecentComparisons: vi.fn(() => ({ data: [], isLoading: false })),
  useDeleteComparison: vi.fn(() => vi.fn()),
  useDeleteAllComparisons: vi.fn(() => vi.fn()),
}))

vi.mock('../../../hooks/useSubscription', () => ({
  useSubscription: vi.fn(() => ({
    limits: { maxComparisons: 3 },
  })),
}))

vi.mock('../components/ComparisonTable', () => ({
  ComparisonTable: () => <div data-testid="comparison-table">Table</div>,
}))

vi.mock('../components/PlayerSelector', () => ({
  PlayerSelector: () => <div data-testid="player-selector">Selector</div>,
}))

import { ComparisonPage } from '../ComparisonPage'

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

describe('F-033: ComparisonPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<ComparisonPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders heading', () => {
    const { container } = render(<ComparisonPage />, { wrapper: createWrapper() })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBe(1)
  })

  it('renders player selector', () => {
    render(<ComparisonPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('player-selector')).toBeDefined()
  })
})
