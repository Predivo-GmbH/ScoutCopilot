/**
 * ResetPasswordPage (F-013) — Unit Tests
 * Tests rendering with mocked authenticated user
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'
import { ResetPasswordPage } from '../ResetPasswordPage'

const mockNavigate = vi.fn()

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user' },
    isLoading: false,
    updatePassword: vi.fn(),
  })),
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode } & Record<string, unknown>) => <a href={to} {...props}>{children}</a>,
  useLocalizedNavigate: vi.fn(() => mockNavigate),
}))

vi.mock('../../../components/auth/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('F-013: ResetPasswordPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading when user is authenticated', () => {
    render(<ResetPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Choose a new password')).toBeDefined()
  })

  it('renders new password input', () => {
    const { container } = render(<ResetPasswordPage />, { wrapper: createWrapper() })
    const pwInputs = container.querySelectorAll('input[type="password"]')
    expect(pwInputs.length).toBe(2) // new + confirm
  })

  it('renders confirm password input', () => {
    render(<ResetPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeDefined()
  })

  it('renders update password button', () => {
    render(<ResetPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByRole('button', { name: /update password/i })).toBeDefined()
  })

  it('renders password strength indicator', () => {
    render(<ResetPasswordPage />, { wrapper: createWrapper() })
    expect(screen.getByTestId('password-strength')).toBeDefined()
  })
})
