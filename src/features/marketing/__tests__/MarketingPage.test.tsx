/**
 * MarketingPage (F-006) — Unit Tests
 * Data-driven SEO use-case / guide pages. Renders content from pages.ts,
 * redirects to language root when the slug is unknown.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'

const openWaitlist = vi.fn()

vi.mock('../../waitlist/useWaitlist', () => ({
  useWaitlist: vi.fn(() => ({ openWaitlist })),
}))

vi.mock('../../../components/layout/PublicNav', () => ({
  PublicNav: () => <nav>Nav</nav>,
}))

vi.mock('../../../components/layout/PublicFooter', () => ({
  PublicFooter: () => <footer>Footer</footer>,
}))

import { MarketingPage } from '../MarketingPage'

function renderAt(path: string, section: 'for' | 'guides') {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:lang/for/:slug" element={<MarketingPage section={section} />} />
          <Route path="/:lang/guides/:slug" element={<MarketingPage section={section} />} />
          <Route path="/:lang" element={<div>Landing Root</div>} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('F-006: MarketingPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders a known use-case page (for/academies) with its h1', () => {
    renderAt('/en/for/academies', 'for')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/academies/i)
  })

  it('renders a known guide page (guides/player-comparison)', () => {
    renderAt('/en/guides/player-comparison', 'guides')
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })

  it('renders section subheadings from page data', () => {
    renderAt('/en/for/academies', 'for')
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0)
  })

  it('renders the trial CTA and wires it to the waitlist', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderAt('/en/for/academies', 'for')
    const cta = screen.getByRole('button', { name: /start free trial/i })
    await user.click(cta)
    expect(openWaitlist).toHaveBeenCalledWith('marketing')
  })

  it('redirects unknown slugs to the language root', () => {
    renderAt('/en/for/does-not-exist', 'for')
    expect(screen.getByText('Landing Root')).toBeDefined()
  })
})
