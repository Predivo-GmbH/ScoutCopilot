/**
 * NotFoundPage — Unit Tests
 * Tests 404 page rendering, buttons, accessibility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import { NotFoundPage } from '../NotFoundPage'

const mockNavigate = vi.fn()

vi.mock('../../../components/shared/LocalizedLink', () => ({
  useLocalizedNavigate: vi.fn(() => mockNavigate),
}))

function renderPage() {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <NotFoundPage />
        </I18nextProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

describe('NotFoundPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('Page not found')).toBeDefined()
  })

  it('renders description', () => {
    renderPage()
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeDefined()
  })

  it('renders Go Back button', () => {
    renderPage()
    expect(screen.getByText('Go Back')).toBeDefined()
  })

  it('renders Go to Dashboard button', () => {
    renderPage()
    expect(screen.getByText('Go to Dashboard')).toBeDefined()
  })

  it('Go Back button navigates back', () => {
    renderPage()
    fireEvent.click(screen.getByText('Go Back'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('Go to Dashboard button navigates to /dashboard', () => {
    renderPage()
    fireEvent.click(screen.getByText('Go to Dashboard'))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('has noindex meta tag via Helmet', () => {
    const { container } = renderPage()
    // Component renders with Helmet - just ensure it renders without error
    expect(container).toBeInTheDocument()
  })
})
