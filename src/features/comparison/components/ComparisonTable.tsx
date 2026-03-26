import { useTranslation } from 'react-i18next'
import type { MockComparisonPlayer } from '../../../lib/mock-data'

interface ComparisonTableProps {
  players: MockComparisonPlayer[]
}

export function ComparisonTable({ players }: ComparisonTableProps) {
  const { t } = useTranslation()

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
      <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
        <span className="text-sm font-semibold uppercase tracking-tight text-on-surface">{t('comparison.detailedMetrics')}</span>
        <span className="font-data text-[0.625rem] text-on-surface-variant uppercase">{t('comparison.currentSeason')}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-high">
              <th className="px-6 py-3 text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant">{t('comparison.metric')}</th>
              {players.map((p) => (
                <th key={p.id} className="px-6 py-3 text-[0.625rem] font-medium uppercase tracking-widest text-on-surface-variant text-right">
                  {p.name.split(' ').pop()}
                </th>
              ))}
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
                  <td className="px-6 py-3 text-xs font-medium text-on-surface-variant uppercase">{metric}</td>
                  {players.map((p) => (
                    <td
                      key={p.id}
                      className={`px-6 py-3 font-data text-sm text-right ${
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
    </div>
  )
}
