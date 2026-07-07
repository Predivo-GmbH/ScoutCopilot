/**
 * SignupPage (F-011) — Unit Tests
 * Tests rendering, step 1 (email), links, form elements
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'
import { SignupPage } from '../SignupPage'

// Registrations are closed in prod (waitlist). Test the preserved free-trial
// form by mocking the flag open — the form comes back when REGISTRATIONS_OPEN=true.
vi.mock('../../waitlist/config', () => ({ REGISTRATIONS_OPEN: true }))

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    completeProfile: vi.fn(),
    hasCompletedProfile: vi.fn(() => false),
  })),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/auth/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../components/auth/OtpInput', () => ({
  default: () => <input data-testid="otp-input" />,
}))

vi.mock('../../../components/auth/ResendTimer', () => ({
  default: () => <div>Resend</div>,
}))

vi.mock('../../../components/auth/PasswordStrength', () => ({
  default: () => <div data-testid="password-strength" />,
}))

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

describe('F-011: SignupPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading for step 1', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Start your free trial')).toBeDefined()
  })

  it('renders subheading with trial info', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    expect(screen.getByText(/14 days free/i)).toBeDefined()
  })

  it('renders email input with type email', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('scout@club.com')
    expect(emailInput.getAttribute('type')).toBe('email')
  })

  it('renders continue button', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined()
  })

  it('renders terms of service link', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    const link = screen.getByText('Terms of Service')
    expect(link.closest('a')?.getAttribute('href')).toContain('terms')
  })

  it('renders privacy policy link', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    const link = screen.getByText('Privacy Policy')
    expect(link.closest('a')?.getAttribute('href')).toContain('privacy')
  })

  it('renders sign in link for existing users', () => {
    render(<SignupPage />, { wrapper: createWrapper() })
    const link = screen.getByText('Sign In')
    expect(link.closest('a')?.getAttribute('href')).toContain('login')
  })

  it('renders progress indicator (3 dots)', () => {
    const { container } = render(<SignupPage />, { wrapper: createWrapper() })
    // 3 progress dots
    const dots = container.querySelectorAll('[class*="h-1.5"][class*="w-8"]')
    expect(dots.length).toBe(3)
  })
})
