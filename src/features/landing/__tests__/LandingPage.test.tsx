/**
 * LandingPage (F-001) — Unit Tests
 * Tests rendering, structure, sections
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/layout/PublicNav', () => ({
  PublicNav: () => <nav data-testid="public-nav">Nav</nav>,
}))

vi.mock('../../../components/layout/PublicFooter', () => ({
  PublicFooter: () => <footer data-testid="public-footer">Footer</footer>,
}))

vi.mock('../../../components/shared/FaqItem', () => ({
  FaqItem: ({ question }: { question: string }) => <div data-testid="faq-item">{question}</div>,
}))

vi.mock('../../waitlist/useWaitlist', () => ({
  useWaitlist: () => ({ openWaitlist: vi.fn() }),
}))

import { LandingPage } from '../LandingPage'

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

describe('F-001: LandingPage', () => {
  it('renders without errors', () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders main element', () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() })
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('renders h1 heading', () => {
    render(<LandingPage />, { wrapper: createWrapper() })
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renders navigation', () => {
    render(<LandingPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('public-nav')).toBeDefined()
  })

  it('renders footer', () => {
    render(<LandingPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('public-footer')).toBeDefined()
  })

  it('renders CTA buttons', () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() })
    const buttons = container.querySelectorAll('button, a[href]')
    expect(buttons.length).toBeGreaterThan(2)
  })
})
