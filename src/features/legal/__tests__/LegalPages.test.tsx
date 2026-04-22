/**
 * Legal Pages (F-003, F-004, F-005) — Unit Tests
 * Tests Privacy, Terms, Imprint page rendering
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/layout/PublicNav', () => ({
  PublicNav: () => <nav>Nav</nav>,
}))

vi.mock('../../../components/layout/PublicFooter', () => ({
  PublicFooter: () => <footer>Footer</footer>,
}))

import { PrivacyPage } from '../PrivacyPage'
import { TermsPage } from '../TermsPage'
import { ImprintPage } from '../ImprintPage'

function renderPage(Component: React.FC) {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <Component />
        </I18nextProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

describe('F-003: PrivacyPage', () => {
  it('renders without errors', () => {
    const { container } = renderPage(PrivacyPage)
    expect(container).toBeInTheDocument()
  })

  it('renders main element', () => {
    const { container } = renderPage(PrivacyPage)
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('renders h1 heading', () => {
    renderPage(PrivacyPage)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renders h2 subheadings', () => {
    renderPage(PrivacyPage)
    const h2s = screen.getAllByRole('heading', { level: 2 })
    expect(h2s.length).toBeGreaterThan(0)
  })
})

describe('F-004: TermsPage', () => {
  it('renders without errors', () => {
    const { container } = renderPage(TermsPage)
    expect(container).toBeInTheDocument()
  })

  it('renders main element', () => {
    const { container } = renderPage(TermsPage)
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('renders h1 heading', () => {
    renderPage(TermsPage)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThan(0)
  })
})

describe('F-005: ImprintPage', () => {
  it('renders without errors', () => {
    const { container } = renderPage(ImprintPage)
    expect(container).toBeInTheDocument()
  })

  it('renders main element', () => {
    const { container } = renderPage(ImprintPage)
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('renders h1 heading', () => {
    renderPage(ImprintPage)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('contains company content', () => {
    const { container } = renderPage(ImprintPage)
    const textContent = container.textContent || ''
    expect(textContent.length).toBeGreaterThan(50)
  })
})
