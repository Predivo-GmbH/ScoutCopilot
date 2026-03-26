import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PasswordGate } from './components/shared/PasswordGate'
import { AuthProvider } from './features/auth/AuthContext'
import { AuthGuard, AuthOnlyGuard } from './features/auth/AuthGuard'
import { AppShell } from './components/layout/AppShell'
import { GeneratedReportsProvider } from './lib/useGeneratedReports'

const LandingPage = lazy(() => import('./features/landing/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./features/auth/SignupPage').then(m => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const AuthVerifyPage = lazy(() => import('./features/auth/AuthVerifyPage').then(m => ({ default: m.AuthVerifyPage })))
const AuthCallbackPage = lazy(() => import('./features/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))
const OnboardingPage = lazy(() => import('./features/auth/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const SearchPage = lazy(() => import('./features/search/SearchPage').then(m => ({ default: m.SearchPage })))
const PlayersListPage = lazy(() => import('./features/report/ReportsListPage').then(m => ({ default: m.ReportsListPage })))
const PlayerDetailPage = lazy(() => import('./features/report/ReportPage').then(m => ({ default: m.ReportPage })))
const ComparisonPage = lazy(() => import('./features/comparison/ComparisonPage').then(m => ({ default: m.ComparisonPage })))
const WatchlistsPage = lazy(() => import('./features/watchlists/WatchlistsPage').then(m => ({ default: m.WatchlistsPage })))
const SquadPage = lazy(() => import('./features/squad/SquadPage').then(m => ({ default: m.SquadPage })))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))
const PricingPage = lazy(() => import('./features/pricing/PricingPage').then(m => ({ default: m.PricingPage })))
const PrivacyPage = lazy(() => import('./features/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./features/legal/TermsPage').then(m => ({ default: m.TermsPage })))
const ImprintPage = lazy(() => import('./features/legal/ImprintPage').then(m => ({ default: m.ImprintPage })))

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
    <PasswordGate>
    <QueryClientProvider client={queryClient}>
      <GeneratedReportsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-md animate-spin" /></div>}>
          <Routes>
            {/* Public routes (no shell, no auth) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/verify" element={<AuthVerifyPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/imprint" element={<ImprintPage />} />

            {/* Onboarding: needs auth but no org check */}
            <Route element={<AuthOnlyGuard />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* Protected app routes (auth + org required) */}
            <Route element={<AuthGuard />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/players" element={<PlayersListPage />} />
                <Route path="/players/:id" element={<PlayerDetailPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/watchlists" element={<WatchlistsPage />} />
                <Route path="/squad" element={<SquadPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </GeneratedReportsProvider>
    </QueryClientProvider>
    </PasswordGate>
  )
}
