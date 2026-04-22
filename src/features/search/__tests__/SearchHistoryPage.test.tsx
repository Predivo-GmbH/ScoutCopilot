/**
 * SearchHistoryPage (F-031) — Unit Tests
 * Tests rendering with mocked data
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../../dashboard/hooks/useDashboardData', () => ({
  useRecentSearches: vi.fn(() => ({
    data: [
      { id: 's1', query: 'Wingers under 23', created_at: new Date().toISOString(), status: 'complete', result_count: 15, search_params: {} },
    ],
    isLoading: false,
  })),
  useDeleteSearch: vi.fn(() => vi.fn()),
  useDeleteAllSearches: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

import { SearchHistoryPage } from '../SearchHistoryPage'

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

describe('F-031: SearchHistoryPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<SearchHistoryPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders search history entries', () => {
    render(<SearchHistoryPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Wingers under 23')).toBeDefined()
  })

  it('renders heading', () => {
    const { container } = render(<SearchHistoryPage />, { wrapper: createWrapper() })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBe(1)
  })
})
