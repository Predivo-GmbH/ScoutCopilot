import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import { AuthGuard, AuthOnlyGuard } from './features/auth/AuthGuard'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { OnboardingPage } from './features/auth/OnboardingPage'
import { PricingPage } from './features/pricing/PricingPage'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SearchPage } from './features/search/SearchPage'
import { ReportPage } from './features/report/ReportPage'
import { ComparisonPage } from './features/comparison/ComparisonPage'
import { WatchlistsPage } from './features/watchlists/WatchlistsPage'
import { SettingsPage } from './features/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (no shell, no auth) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Onboarding: needs auth but no org check */}
            <Route element={<AuthOnlyGuard />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* Protected app routes (auth + org required) */}
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/report/:id?" element={<ReportPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/watchlists" element={<WatchlistsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
