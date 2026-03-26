import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Search, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useRecentSearches } from '../dashboard/hooks/useDashboardData'

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Yesterday'
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: 'complete' | 'processing' | 'failed' }) {
  if (status === 'complete') return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-secondary">
      <CheckCircle2 size={10} strokeWidth={2} /> Complete
    </span>
  )
  if (status === 'processing') return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-tertiary">
      <Loader2 size={10} strokeWidth={2} className="animate-spin" /> Processing
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-data font-medium text-error">
      <XCircle size={10} strokeWidth={2} /> Failed
    </span>
  )
}

export function SearchHistoryPage() {
  const navigate = useNavigate()
  const { data: searches, isLoading } = useRecentSearches()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <Clock size={20} strokeWidth={1.5} className="text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Search History</h1>
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">All your previous searches and their results.</p>
      </div>

      {/* Search List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-low rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {searches?.map((s) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (s.status === 'complete') navigate(`/search?q=${encodeURIComponent(s.query)}&saved=1`) } }}
              onClick={() => { if (s.status === 'complete') navigate(`/search?q=${encodeURIComponent(s.query)}&saved=1`) }}
              className={`bg-surface-container border border-outline-variant rounded-md p-4 transition-colors ${
                s.status === 'complete' ? 'cursor-pointer hover:bg-surface-container-high' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-surface-container-highest flex items-center justify-center shrink-0">
                  <Search size={16} strokeWidth={1.5} className="text-on-surface-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{s.query}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[0.625rem] font-data text-on-surface-variant">{formatDate(s.timestamp)}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <StatusBadge status={s.status} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-data font-bold text-on-surface">{s.resultCount}</p>
                  <p className="text-[0.625rem] font-data text-on-surface-variant">results</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
