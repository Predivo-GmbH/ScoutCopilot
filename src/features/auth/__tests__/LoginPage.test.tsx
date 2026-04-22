/**
 * LoginPage (F-010) — Unit Tests
 * Tests rendering, tab switching, form elements, links
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'
import { LoginPage } from '../LoginPage'

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    signInWithPassword: vi.fn(),
    sendLoginOtp: vi.fn(),
    verifyOtp: vi.fn(),
  })),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/auth/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-layout">{children}</div>,
}))

vi.mock('../../../components/auth/OtpInput', () => ({
  default: ({ onComplete }: { onComplete: (value: string) => void }) => <input data-testid="otp-input" onChange={(e) => onComplete(e.target.value)} />,
}))

vi.mock('../../../components/auth/ResendTimer', () => ({
  default: () => <div data-testid="resend-timer">Resend</div>,
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

describe('F-010: LoginPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the sign in heading', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })

  it('renders password tab by default', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    // Password tab shows email + password inputs
    expect(screen.getByPlaceholderText('scout@club.com')).toBeDefined()
  })

  it('renders email input with type email', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('scout@club.com')
    expect(emailInput.getAttribute('type')).toBe('email')
  })

  it('renders password input', () => {
    const { container } = render(<LoginPage />, { wrapper: createWrapper() })
    const pwInput = container.querySelector('input[type="password"]')
    expect(pwInput).not.toBeNull()
  })

  it('renders submit button', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn).toBeDefined()
  })

  it('renders forgot password link', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    const link = screen.getByText(/forgot password/i)
    expect(link).toBeDefined()
  })

  it('renders signup link', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    const link = screen.getByText(/start free trial/i)
    expect(link).toBeDefined()
    expect(link.closest('a')?.getAttribute('href')).toContain('signup')
  })

  it('renders tab options', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(2)
  })

  it('shows error alert container role', () => {
    const { container } = render(<LoginPage />, { wrapper: createWrapper() })
    // No error initially
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })
})
