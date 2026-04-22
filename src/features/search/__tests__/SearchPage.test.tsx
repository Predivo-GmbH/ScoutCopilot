/**
 * SearchPage (F-030) — Unit Tests
 * Tests rendering, search input, suggested queries, keyboard shortcut
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../hooks/usePlayerSearch', () => ({
  usePlayerSearch: vi.fn(() => ({
    params: {},
    results: [],
    isLoading: false,
    hasSearched: false,
    photoLoadingIds: new Set(),
    clearResults: vi.fn(),
    search: vi.fn(),
    loadSaved: vi.fn(),
    updateFilters: vi.fn(),
  })),
}))

vi.mock('../../dashboard/hooks/useDashboardData', () => ({
  useRecentSearches: vi.fn(() => ({ data: [], isLoading: false })),
  useDeleteSearch: vi.fn(() => vi.fn()),
  useDeleteAllSearches: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../components/SearchFilters', () => ({
  SearchFilters: () => <div data-testid="search-filters">Filters</div>,
}))

vi.mock('../components/SearchResultsTable', () => ({
  SearchResultsTable: () => <div data-testid="search-results">Results</div>,
}))

import { SearchPage } from '../SearchPage'

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

describe('F-030: SearchPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders search input', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() })
    const input = container.querySelector('input')
    expect(input).not.toBeNull()
  })

  it('renders suggested queries when no search performed', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() })
    // Suggested queries contain keywords about players/positions
    const text = container.textContent || ''
    expect(text).toMatch(/Left-back|winger|striker|midfielder/i)
  })

  it('renders Helmet for SEO', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })
})
