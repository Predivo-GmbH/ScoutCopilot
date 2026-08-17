/**
 * AuthCallbackPage (F-014) — Unit Tests
 * Supabase auth redirect handler (magic link, OAuth, recovery). Reads the session
 * and routes the user onward based on hash type / new-user state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'

const navigate = vi.fn()
const getSession = vi.fn()

vi.mock('../../../components/shared/LocalizedLink', () => ({
  useLocalizedNavigate: vi.fn(() => navigate),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: { auth: { getSession: () => getSession() } },
}))

import { AuthCallbackPage } from '../AuthCallbackPage'

function renderPage() {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthCallbackPage />
        </I18nextProvider>
      </HelmetProvider>
    </BrowserRouter>
  )
}

describe('F-014: AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.location.hash = ''
  })

  it('renders a processing spinner', () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null })
    const { container } = renderPage()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('redirects to login when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null })
    renderPage()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'))
  })

  it('redirects to login on session error', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: { message: 'boom' } })
    renderPage()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'))
  })

  it('routes an existing user to the dashboard', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { user_metadata: { full_name: 'Jane Scout' } } } },
      error: null,
    })
    renderPage()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('routes a brand-new user to signup to finish their profile', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { user_metadata: {} } } },
      error: null,
    })
    renderPage()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/signup'))
  })

  it('routes recovery links to reset-password', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null })
    window.location.hash = '#type=recovery&access_token=abc'
    renderPage()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/reset-password'))
  })
})
