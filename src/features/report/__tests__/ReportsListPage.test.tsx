/**
 * ReportsListPage (F-032) — Unit Tests
 * Tests rendering with mocked data
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}))

vi.mock('../../../lib/usePlayerPhotoFetch', () => ({
  usePlayerPhotoFetch: vi.fn(() => ({
    getPhoto: vi.fn(() => null),
    loadingIds: new Set(),
  })),
  derivePhotoSource: vi.fn(),
}))

vi.mock('../../../components/shared/PlayerAvatar', () => ({
  PlayerAvatar: ({ playerName }: { playerName?: string }) => <div>Avatar: {playerName}</div>,
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

import { ReportsListPage } from '../ReportsListPage'

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

describe('F-032: ReportsListPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders without errors', () => {
    const { container } = render(<ReportsListPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders heading', () => {
    const { container } = render(<ReportsListPage />, { wrapper: createWrapper() })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBe(1)
  })

  it('renders with proper structure', () => {
    const { container } = render(<ReportsListPage />, { wrapper: createWrapper() })
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
  })
})
