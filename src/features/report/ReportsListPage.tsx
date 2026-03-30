import { useState } from 'react'
import { useLocalizedNavigate } from '../../components/shared/LocalizedLink'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, FileText, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PlayerAvatar } from '../../components/shared/PlayerAvatar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { playerReports } from '../../lib/mock-data'
import { useGeneratedReports } from '../../lib/useGeneratedReportsHook'

export function ReportsListPage() {
  const { t } = useTranslation()
  const navigate = useLocalizedNavigate()

  const recommendation = {
    sign: { label: t('reportsList.badgeSign'), className: 'text-secondary bg-secondary/10 border-secondary/20' },
    monitor: { label: t('reportsList.badgeMonitor'), className: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
    pass: { label: t('reportsList.badgePass'), className: 'text-error bg-error/10 border-error/20' },
  }
  const { generatedReportIds, removeReport } = useGeneratedReports()
  const reports = Object.values(playerReports).filter((r) => generatedReportIds.includes(r.playerId))
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  function handleDelete() {
    if (!deleteTarget) return
    removeReport(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">{t('reportsList.heading')}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('reportsList.scoutedCount', { count: reports.length })}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mb-4">
            <SearchIcon size={32} strokeWidth={1.5} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">{t('reportsList.noPlayersYet')}</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {t('reportsList.noPlayersSub')}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            {t('reportsList.startSearch')}
          </button>
        </div>
      ) : (
        <>
        {/* Mobile card layout */}
        <div className="block sm:hidden space-y-3">
          {reports.map((report) => {
            const rec = recommendation[report.recommendation]
            return (
              <div
                key={report.playerId}
                onClick={() => navigate(`/players/${report.playerId}`)}
                className="bg-surface-container rounded-md border border-outline-variant p-4 space-y-3 cursor-pointer active:bg-surface-container-high transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={report.playerName} size={40} imageUrl={report.image} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate">{report.playerName}</p>
                    <p className="text-[0.625rem] text-on-surface-variant font-data">
                      {report.nationality} | {report.club}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border shrink-0 ${rec.className}`}>
                    {rec.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('common.position')}</p>
                    <p className="font-data text-sm text-on-surface-variant">{report.position}</p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('common.age')}</p>
                    <p className="font-data text-sm">{report.age}</p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-on-surface-variant uppercase">{t('reportsList.fitScore')}</p>
                    <p className="text-primary font-data font-semibold text-sm">{report.fitScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-outline-variant">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={FileText}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/players/${report.playerId}`)
                    }}
                  >
                    {t('common.report')}
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget({ id: report.playerId, name: report.playerName })
                    }}
                    className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={t('reportsList.removePlayer')}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table layout */}
        <div className="hidden sm:block bg-surface-container rounded-md overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[0.625rem] font-medium text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <th className="px-6 py-3">{t('common.player')}</th>
                <th className="px-4 py-3 text-center">{t('common.club')}</th>
                <th className="px-4 py-3 text-center">{t('common.position')}</th>
                <th className="px-4 py-3 text-center">{t('common.age')}</th>
                <th className="px-4 py-3 text-center">{t('reportsList.fitScore')}</th>
                <th className="px-4 py-3 text-center">{t('reportsList.recommendation')}</th>
                <th className="px-4 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reports.map((report, i) => {
                const rec = recommendation[report.recommendation]
                return (
                  <tr
                    key={report.playerId}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/players/${report.playerId}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/players/${report.playerId}`) } }}
                    className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={report.playerName} size={40} imageUrl={report.image} />
                        <div>
                          <p className="font-semibold text-on-surface">{report.playerName}</p>
                          <p className="text-[0.625rem] text-on-surface-variant font-data">
                            {report.nationality} | {t('reportsList.score')} {report.fitScore}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 bg-surface-container-low rounded-sm text-[0.625rem] font-semibold text-on-surface-variant uppercase">
                        {report.club}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-data text-on-surface-variant">{report.position}</td>
                    <td className="px-4 py-4 text-center font-data">{report.age}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-primary font-data font-semibold">{report.fitScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[0.625rem] font-data font-medium uppercase border ${rec.className}`}>
                        {rec.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={FileText}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/players/${report.playerId}`)
                          }}
                        >
                          {t('common.report')}
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: report.playerId, name: report.playerName })
                          }}
                          className="p-1 text-error hover:bg-error/10 rounded-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={t('reportsList.removePlayer')}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('reportsList.removePlayer')}
        message={t('reportsList.removeConfirm', { name: deleteTarget?.name ?? 'this player' })}
        confirmLabel={t('reportsList.removeBtn')}
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
