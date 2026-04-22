/**
 * ForgotPasswordPage (F-012) — Unit Tests
 * Tests rendering, form elements, links
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'
import { ForgotPasswordPage } from '../ForgotPasswordPage'

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    resetPassword: vi.fn(),
  })),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../../../components/auth/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('F-012: ForgotPasswordPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading', () => {
    render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Reset your password')).toBeDefined()
  })

  it('renders description text', () => {
    render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByText(/enter your email/i)).toBeDefined()
  })

  it('renders email input with type email', () => {
    render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    const emailInput = screen.getByPlaceholderText('scout@club.com')
    expect(emailInput.getAttribute('type')).toBe('email')
  })

  it('renders submit button with correct text', () => {
    render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDefined()
  })

  it('renders back to sign in link', () => {
    render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    const link = screen.getByText(/back to sign in/i)
    expect(link.closest('a')?.getAttribute('href')).toContain('login')
  })

  it('does not show error initially', () => {
    const { container } = render(<ForgotPasswordPage />, { wrapper: createWrapper() })
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })
})
