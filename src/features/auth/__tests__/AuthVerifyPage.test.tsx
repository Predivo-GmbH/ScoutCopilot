/**
 * AuthVerifyPage (F-015) — Unit Tests
 * Handles OTP deep links from emails: verifies the token and redirects, or
 * shows an expired/invalid message on failure.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'

const navigate = vi.fn()
const verifyOtp = vi.fn()
const hasCompletedProfile = vi.fn()

vi.mock('../../../components/shared/LocalizedLink', () => ({
  useLocalizedNavigate: vi.fn(() => navigate),
}))

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({ verifyOtp, hasCompletedProfile })),
}))

import { AuthVerifyPage } from '../AuthVerifyPage'

function renderAt(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/auth/verify${search}`]}>
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <AuthVerifyPage />
        </I18nextProvider>
      </HelmetProvider>
    </MemoryRouter>
  )
}

describe('F-015: AuthVerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hasCompletedProfile.mockReturnValue(true)
  })

  it('redirects to login when token or email is missing', async () => {
    renderAt('?type=login')
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'))
    expect(verifyOtp).not.toHaveBeenCalled()
  })

  it('verifies the OTP and redirects an existing user to the dashboard', async () => {
    verifyOtp.mockResolvedValue(undefined)
    renderAt('?token=123456&email=user%40club.com&type=login')
    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith('user@club.com', '123456'))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('sends a new signup with an incomplete profile back to signup', async () => {
    verifyOtp.mockResolvedValue(undefined)
    hasCompletedProfile.mockReturnValue(false)
    renderAt('?token=123456&email=new%40club.com&type=signup')
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/signup?verified=true'))
  })

  it('shows an expired/invalid message when verification fails', async () => {
    verifyOtp.mockRejectedValue(new Error('invalid'))
    renderAt('?token=000000&email=user%40club.com&type=login')
    await waitFor(() =>
      expect(screen.getByText(/expired or is invalid/i)).toBeDefined()
    )
  })

  it('shows a verifying spinner while in progress', () => {
    verifyOtp.mockReturnValue(new Promise(() => {}))
    const { container } = renderAt('?token=123456&email=user%40club.com&type=login')
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })
})
