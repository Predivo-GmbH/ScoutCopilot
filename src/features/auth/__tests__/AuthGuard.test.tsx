/**
 * AuthGuard (F-016/F-020) — Unit Tests
 * Tests authentication guard logic: loading, redirect, outlet rendering
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

const mockUseAuth = vi.fn()

vi.mock('../useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Import after mock
import { AuthGuard, AuthOnlyGuard } from '../AuthGuard'

const createWrapper = (initialRoute: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <HelmetProvider>
            <I18nextProvider i18n={i18n}>
              <Routes>
                <Route path="/:lang/dashboard" element={<AuthGuard />}>
                  <Route index element={<div>Dashboard Content</div>} />
                </Route>
                <Route path="/:lang/onboarding" element={<AuthOnlyGuard />}>
                  <Route index element={<div>Onboarding Content</div>} />
                </Route>
                <Route path="/:lang/login" element={<div>Login Page</div>} />
              </Routes>
            </I18nextProvider>
          </HelmetProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('AuthGuard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows loading skeleton when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, organization: null, isLoading: true })
    render(<div />, { wrapper: createWrapper('/en/dashboard') })
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('redirects to login when no user', () => {
    mockUseAuth.mockReturnValue({ user: null, organization: null, isLoading: false })
    render(<div />, { wrapper: createWrapper('/en/dashboard') })
    expect(screen.getByText('Login Page')).toBeDefined()
  })

  it('redirects to onboarding when user has no organization', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, organization: null, isLoading: false })
    render(<div />, { wrapper: createWrapper('/en/dashboard') })
    expect(screen.getByText('Onboarding Content')).toBeDefined()
  })

  it('renders outlet when user has organization', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, organization: { id: 'o1' }, isLoading: false })
    render(<div />, { wrapper: createWrapper('/en/dashboard') })
    expect(screen.getByText('Dashboard Content')).toBeDefined()
  })
})

describe('AuthOnlyGuard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows loading skeleton when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true })
    render(<div />, { wrapper: createWrapper('/en/onboarding') })
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('redirects to login when no user', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<div />, { wrapper: createWrapper('/en/onboarding') })
    expect(screen.getByText('Login Page')).toBeDefined()
  })

  it('renders outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, isLoading: false })
    render(<div />, { wrapper: createWrapper('/en/onboarding') })
    expect(screen.getByText('Onboarding Content')).toBeDefined()
  })
})
