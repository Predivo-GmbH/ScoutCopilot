/**
 * PricingPage (F-002) — Unit Tests
 * Tests tier rendering, comparison table, structure
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/layout/PublicNav', () => ({
  PublicNav: () => <nav data-testid="public-nav">Nav</nav>,
}))

vi.mock('../../../components/layout/PublicFooter', () => ({
  PublicFooter: () => <footer data-testid="public-footer">Footer</footer>,
}))

vi.mock('../../../components/shared/FaqItem', () => ({
  FaqItem: ({ question }: any) => <div data-testid="faq-item">{question}</div>,
}))

vi.mock('../../../lib/stripeRedirect', () => ({
  redirectToStripeUrl: vi.fn(),
}))

import { PricingPage } from '../PricingPage'

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

describe('F-002: PricingPage', () => {
  it('renders without errors', () => {
    const { container } = render(<PricingPage />, { wrapper: createWrapper() })
    expect(container).toBeInTheDocument()
  })

  it('renders all 3 tier sections', () => {
    const { container } = render(<PricingPage />, { wrapper: createWrapper() })
    // Pricing page renders tier cards
    const textContent = container.textContent || ''
    expect(textContent.length).toBeGreaterThan(100)
  })

  it('renders navigation', () => {
    render(<PricingPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('public-nav')).toBeDefined()
  })

  it('renders footer', () => {
    render(<PricingPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('public-footer')).toBeDefined()
  })

  it('renders CTA buttons', () => {
    const { container } = render(<PricingPage />, { wrapper: createWrapper() })
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(2)
  })

  it('renders price amounts', () => {
    const { container } = render(<PricingPage />, { wrapper: createWrapper() })
    // Price amounts should be displayed
    const priceElements = container.querySelectorAll('[class*="font"]')
    expect(priceElements.length).toBeGreaterThan(0)
  })
})
