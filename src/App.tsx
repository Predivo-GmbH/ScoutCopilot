import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

// Placeholder pages — will be replaced with real components
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-on-surface">{title}</h1>
      <p className="mt-2 text-on-surface-variant">Coming soon.</p>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no shell) */}
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/signup" element={<PlaceholderPage title="Sign Up" />} />

          {/* App routes (with shell) */}
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="/search" element={<PlaceholderPage title="Player Search" />} />
            <Route path="/report/:id?" element={<PlaceholderPage title="Player Report" />} />
            <Route path="/compare" element={<PlaceholderPage title="Comparison" />} />
            <Route path="/watchlists" element={<PlaceholderPage title="Watchlists" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/onboarding" element={<PlaceholderPage title="Onboarding" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
