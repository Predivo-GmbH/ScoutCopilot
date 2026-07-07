import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import { WaitlistProvider } from './features/waitlist/WaitlistProvider'
import { AuthGuard, AuthOnlyGuard } from './features/auth/AuthGuard'
import { AppShell } from './components/layout/AppShell'
import { LanguageRootLayout } from './components/layout/LanguageRootLayout'
import { GeneratedReportsProvider } from './lib/useGeneratedReports'
import { WatchlistProvider } from './lib/WatchlistContext'
// ALL routes are eager-imported (no React.lazy). React 19.2's lazy + Suspense
// reveal is broken on slow chunk loads (staging / real networks): the revealed
// route renders DETACHED from its context providers → "useAuth/useTheme must be
// used within Provider" → the app error boundary ("Something went wrong"). It only
// reproduces once the Suspense fallback actually paints (slow load), NEVER on
// instant localhost — which is why it kept slipping past local testing. The heavy
// vendors (jspdf/html2canvas) are dynamically imported inside the PDF-export
// handler, so eager routes do NOT pull them into the initial bundle. If code-
// splitting is reintroduced, EVERY route must be E2E-tested on staging, not just
// localhost.
import { LandingPage } from './features/landing/LandingPage'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { AuthVerifyPage } from './features/auth/AuthVerifyPage'
import { AuthCallbackPage } from './features/auth/AuthCallbackPage'
import { OnboardingPage } from './features/auth/OnboardingPage'
import { PricingPage } from './features/pricing/PricingPage'
import { PrivacyPage } from './features/legal/PrivacyPage'
import { TermsPage } from './features/legal/TermsPage'
import { ImprintPage } from './features/legal/ImprintPage'
import { MarketingPage } from './features/marketing/MarketingPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { AlertsPage } from './features/dashboard/AlertsPage'
import { SearchPage } from './features/search/SearchPage'
import { SearchHistoryPage } from './features/search/SearchHistoryPage'
import { ReportsListPage as PlayersListPage } from './features/report/ReportsListPage'
import { ReportPage as PlayerDetailPage } from './features/report/ReportPage'
import { ComparisonPage } from './features/comparison/ComparisonPage'
import { WatchlistsPage } from './features/watchlists/WatchlistsPage'
import { SquadPage } from './features/squad/SquadPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { NotFoundPage } from './features/errors/NotFoundPage'

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
          </WaitlistProvider>
        </BrowserRouter>
      </AuthProvider>
      </WatchlistProvider>
      </GeneratedReportsProvider>
    </QueryClientProvider>
  )
}
