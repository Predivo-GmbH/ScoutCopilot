/**
 * WatchlistsPage (F-050) — Unit Tests
 * Tests rendering with mocked hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../hooks/useWatchlists', () => ({
  useWatchlists: vi.fn(() => ({
    lists: [],
    isLoading: false,
    filter: 'all',
    setFilter: vi.fn(),
    selectedWatchlist: null,
    selectWatchlist: vi.fn(),
    clearSelection: vi.fn(),
    removePlayerFromWatchlist: vi.fn(),
    deleteWatchlist: vi.fn(),
  })),
}))

vi.mock('../../../lib/useWatchlistActions', () => ({
  useWatchlistActions: vi.fn(() => ({
    createWatchlist: vi.fn(),
    updateWatchlist: vi.fn(),
  })),
}))

vi.mock('../components/WatchlistCard', () => ({
  WatchlistCard: () => <div data-testid="watchlist-card">Card</div>,
}))

vi.mock('../components/WatchlistDetail', () => ({
  WatchlistDetail: () => <div>Detail</div>,
}))

vi.mock('../../../components/ui/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}))

import { WatchlistsPage } from '../WatchlistsPage'

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

describe('F-050: WatchlistsPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<WatchlistsPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders heading', () => {
    const { container } = render(<WatchlistsPage />, { wrapper: createWrapper() })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBe(1)
  })

  it('renders create watchlist button', () => {
    const { container } = render(<WatchlistsPage />, { wrapper: createWrapper() })
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
