import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { MockComparisonPlayer } from '../../../lib/mock-data'
import { PlayerAvatar } from '../../../components/shared/PlayerAvatar'
import { usePlayerPhotoFetch, derivePhotoSource } from '../../../lib/usePlayerPhotoFetch'

interface ComparisonTableProps {
  players: MockComparisonPlayer[]
}

export function ComparisonTable({ players }: ComparisonTableProps) {
  const { t } = useTranslation()

  const photoFetchPlayers = useMemo(
    () => players.map((p) => ({ id: p.id, image: p.image })),
    [players],
  )
  const { getPhoto, loadingIds } = usePlayerPhotoFetch(photoFetchPlayers)

  if (players.length < 2) return null

  const metrics = Object.keys(players[0].metrics)

  function getBestForMetric(metric: string): string {
    let bestId = ''
    let bestVal = -Infinity
    for (const p of players) {
      if (p.metrics[metric] > bestVal) {
        bestVal = p.metrics[metric]
        bestId = p.id
      }
    }
    return bestId
  }

  function getWorstForMetric(metric: string): string {
    let worstId = ''
    let worstVal = Infinity
    for (const p of players) {
      if (p.metrics[metric] < worstVal) {
        worstVal = p.metrics[metric]
        worstId = p.id
      }
    }
    return worstId
  }

  return (
    <div className="bg-surface-container rounded-md border border-outline-variant overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex flex-wrap justify-between items-center gap-2 bg-surface-container-low">
        <span className="text-sm font-semibold uppercase tracking-tight text-on-surface">{t('comparison.detailedMetrics')}</span>
        <span className="font-data text-[0.625rem] text-on-surface-variant uppercase">{t('comparison.currentSeason')}</span>
      </div>
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high">
                <th className="px-4 sm:px-6 py-3 text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant sticky left-0 bg-surface-container-high z-10 min-w-[120px]">{t('comparison.metric')}</th>
              {players.map((p) => {
                const resolvedPhoto = getPhoto(p)
                return (
                  <th key={p.id} className="px-4 sm:px-6 py-3 text-center min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <PlayerAvatar name={p.name} size={32} imageUrl={resolvedPhoto} clickable loading={loadingIds.has(p.id)} aiGenerated={!!resolvedPhoto && derivePhotoSource(resolvedPhoto) === 'stitch'} />
                      <span className="text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant">{p.name.split(' ').pop()}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, i) => {
              const bestId = getBestForMetric(metric)
              const worstId = getWorstForMetric(metric)
              return (
                <tr
                  key={metric}
                  className={`${i % 2 === 0 ? 'bg-surface-container' : 'bg-surface-container-low'} hover:bg-surface-container-high transition-colors`}
                >
                  <td className="px-4 sm:px-6 py-3 text-xs font-medium text-on-surface-variant uppercase sticky left-0 bg-inherit z-10">{metric}</td>
                  {players.map((p) => (
                    <td
                      key={p.id}
                      className={`px-4 sm:px-6 py-3 font-data text-sm text-right ${
                        p.id === bestId ? 'text-secondary font-semibold' : p.id === worstId ? 'text-error' : 'text-on-surface'
                      }`}
                    >
                      {p.metrics[metric]}
                    </td>
                  ))}
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-container to-transparent" />
      </div>
    </div>
  )
}
