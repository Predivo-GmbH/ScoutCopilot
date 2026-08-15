/**
 * ReportPage (F-032, detail view) — Unit Tests
 * The AI scouting-report detail screen. Verifies the loading skeleton and the
 * "no report yet → generate" empty state for a known player.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import i18n from '../../../i18n'

type ReportState = { data: unknown; isLoading: boolean; error: unknown }
let reportState: ReportState = { data: undefined, isLoading: true, error: null }
const generateReport = vi.fn()

vi.mock('../hooks/usePlayerReport', () => ({
  usePlayerReport: vi.fn(() => reportState),
}))

vi.mock('../../../lib/useGeneratedReportsHook', () => ({
  useGeneratedReports: vi.fn(() => ({
    generateReport,
    isGenerating: () => false,
    hasReport: () => false,
    generationError: null,
    clearGenerationError: vi.fn(),
  })),
}))

vi.mock('../../../lib/usePlayerPhotoFetch', () => ({
  usePlayerPhotoFetch: vi.fn(() => ({ getPhoto: () => null, loadingIds: new Set() })),
  derivePhotoSource: vi.fn(),
}))

vi.mock('../../../lib/usePlayerPhotoUpload', () => ({
  usePlayerPhotoUpload: vi.fn(() => ({ upload: vi.fn(), uploading: false })),
}))

vi.mock('../../../components/shared/PlayerAvatar', () => ({
  PlayerAvatar: () => <div>Avatar</div>,
}))

vi.mock('../../../components/shared/AddToWatchlistModal', () => ({
  AddToWatchlistModal: () => null,
}))

vi.mock('../../../components/shared/LocalizedLink', () => ({
  useLocalizedNavigate: vi.fn(() => vi.fn()),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: vi.fn(), functions: { invoke: vi.fn() } },
}))

vi.mock('../../../lib/sbPlayersQuery', () => ({ sbPlayersTable: vi.fn() }))

import { ReportPage } from '../ReportPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/en/players/manual-42']}>
        <HelmetProvider>
          <I18nextProvider i18n={i18n}>
            <Routes>
              <Route path="/:lang/players/:id" element={<ReportPage />} />
            </Routes>
          </I18nextProvider>
        </HelmetProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('F-032: ReportPage (detail)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows loading skeletons while the report is fetching', () => {
    reportState = { data: undefined, isLoading: true, error: null }
    const { container } = renderPage()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows the "no report yet" empty state with a Generate Report action', () => {
    reportState = { data: undefined, isLoading: false, error: null }
    renderPage()
    expect(screen.getByRole('button', { name: new RegExp(i18n.t('report.generateReport'), 'i') })).toBeDefined()
  })
})
