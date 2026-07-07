import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import { WaitlistProvider } from './features/waitlist/WaitlistProvider'
import { AuthGuard, AuthOnlyGuard } from './features/auth/AuthGuard'
import { AppShell } from './components/layout/AppShell'
import { LanguageRootLayout } from './components/layout/LanguageRootLayout'
import { GeneratedReportsProvider } from './lib/useGeneratedReports'
import { WatchlistProvider } from './lib/WatchlistContext'
// Public content/SEO pages are eager-imported (not lazy). Under slow chunk loads
// React 19's Suspense reveal misbehaves on these routes — rendering detached from
// context providers (crashing PublicNav's useTheme) or double-mounting the route
// (duplicate footer/landmarks). Eager import renders them synchronously inside the
// provider tree. Safe now that i18n's default language (en) loads synchronously.
// Authenticated app pages below stay lazy (heavy, gated).
import { LandingPage } from './features/landing/LandingPage'
import { PricingPage } from './features/pricing/PricingPage'
import { PrivacyPage } from './features/legal/PrivacyPage'
import { TermsPage } from './features/legal/TermsPage'
import { ImprintPage } from './features/legal/ImprintPage'
import { MarketingPage } from './features/marketing/MarketingPage'
// SignupPage is eager too: while registration is paused it renders the waitlist
// (a public page), so it must avoid the lazy-reveal bug like the others.
import { SignupPage } from './features/auth/SignupPage'

const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const AuthVerifyPage = lazy(() => import('./features/auth/AuthVerifyPage').then(m => ({ default: m.AuthVerifyPage })))
const AuthCallbackPage = lazy(() => import('./features/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))
const OnboardingPage = lazy(() => import('./features/auth/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AlertsPage = lazy(() => import('./features/dashboard/AlertsPage').then(m => ({ default: m.AlertsPage })))
const SearchPage = lazy(() => import('./features/search/SearchPage').then(m => ({ default: m.SearchPage })))
const SearchHistoryPage = lazy(() => import('./features/search/SearchHistoryPage').then(m => ({ default: m.SearchHistoryPage })))
const PlayersListPage = lazy(() => import('./features/report/ReportsListPage').then(m => ({ default: m.ReportsListPage })))
const PlayerDetailPage = lazy(() => import('./features/report/ReportPage').then(m => ({ default: m.ReportPage })))
const ComparisonPage = lazy(() => import('./features/comparison/ComparisonPage').then(m => ({ default: m.ComparisonPage })))
const WatchlistsPage = lazy(() => import('./features/watchlists/WatchlistsPage').then(m => ({ default: m.WatchlistsPage })))
const SquadPage = lazy(() => import('./features/squad/SquadPage').then(m => ({ default: m.SquadPage })))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

const NotFoundPage = lazy(() => import('./features/errors/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GeneratedReportsProvider>
      <WatchlistProvider>
      <AuthProvider>
        <BrowserRouter>
          <WaitlistProvider>
          <Suspense fallback={null}>
          <Routes>
            {/* Bare root → default language */}
            <Route path="/" element={<Navigate to="/en" replace />} />

            {/* Auth callbacks — must stay at root (Supabase redirect URLs) */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/verify" element={<AuthVerifyPage />} />

            {/* All routes under /:lang */}
            <Route path="/:lang" element={<LanguageRootLayout />}>
              {/* Public routes (no shell, no auth) */}
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="imprint" element={<ImprintPage />} />
              <Route path="for/:slug" element={<MarketingPage section="for" />} />
              <Route path="guides/:slug" element={<MarketingPage section="guides" />} />

              {/* Onboarding: needs auth but no org check */}
              <Route element={<AuthOnlyGuard />}>
                <Route path="onboarding" element={<OnboardingPage />} />
              </Route>

              {/* Protected app routes (auth + org required) */}
              <Route element={<AuthGuard />}>
                <Route element={<AppShell />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="search-history" element={<SearchHistoryPage />} />
                  <Route path="players" element={<PlayersListPage />} />
                  <Route path="players/:id" element={<PlayerDetailPage />} />
                  <Route path="compare" element={<ComparisonPage />} />
                  <Route path="watchlists" element={<WatchlistsPage />} />
                  <Route path="squad" element={<SquadPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* 404 fallback within lang */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </Suspense>
          </WaitlistProvider>
        </BrowserRouter>
      </AuthProvider>
      </WatchlistProvider>
      </GeneratedReportsProvider>
    </QueryClientProvider>
  )
}
