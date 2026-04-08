import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { calculateAge } from '../../../lib/ageUtils'
import type { SquadPlayer, SquadPosition, PositionGap } from '../../../lib/mock-data'
import { positionLabels } from '../../../lib/mock-data'

const ALL_POSITIONS: SquadPosition[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST']

const POSITION_SEARCH_KEY_MAP: Record<SquadPosition, string> = {
  GK: 'gapAnalysis.search.goalkeepers',
  CB: 'gapAnalysis.search.centrebacks',
  LB: 'gapAnalysis.search.leftbacks',
  RB: 'gapAnalysis.search.rightbacks',
  CDM: 'gapAnalysis.search.defensiveMidfielders',
  CM: 'gapAnalysis.search.centralMidfielders',
  CAM: 'gapAnalysis.search.attackingMidfielders',
  LW: 'gapAnalysis.search.leftWingers',
  RW: 'gapAnalysis.search.rightWingers',
  ST: 'gapAnalysis.search.strikers',
}

function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

function analyzePosition(position: SquadPosition, players: SquadPlayer[], t: (key: string, opts?: Record<string, unknown>) => string): PositionGap {
  const available = players.filter((p) => p.status !== 'on_loan')
  const depth = available.length
  const reasons: string[] = []

  // Depth score (weight 40%)
  let depthScore: number
  if (depth === 0) { depthScore = 0; reasons.push(t('gapAnalysis.reasons.noPlayers')) }
  else if (depth === 1) { depthScore = 20; reasons.push(t('gapAnalysis.reasons.onlyOnePlayer')) }
  else if (depth === 2) { depthScore = 60 }
  else { depthScore = 100 }

  // Age risk score (weight 25%) — based on best-rated (starter)
  let ageScore = 100
  if (available.length > 0) {
    const starter = available.reduce((a, b) => a.overallRating > b.overallRating ? a : b)
    const starterAge = calculateAge(starter.birth_date) ?? 0
    if (starterAge >= 33) { ageScore = 0; reasons.push(t('gapAnalysis.reasons.approachingRetirement', { name: starter.name, age: starterAge })) }
    else if (starterAge >= 30) { ageScore = 40; reasons.push(t('gapAnalysis.reasons.aging', { name: starter.name, age: starterAge })) }
    else if (starterAge >= 27) { ageScore = 70 }
  }

  // Performance score (weight 20%)
  const avgRating = available.length > 0 ? Math.round(available.reduce((s, p) => s + p.overallRating, 0) / available.length) : 0
  const perfScore = avgRating
  if (avgRating > 0 && avgRating < 65) {
    reasons.push(t('gapAnalysis.reasons.belowAverage', { rating: avgRating }))
  }

  // Contract risk score (weight 15%)
  let contractScore = 100
  if (available.length > 0) {
    const starter = available.reduce((a, b) => a.overallRating > b.overallRating ? a : b)
    const months = monthsUntil(starter.contractUntil)
    if (months <= 12) { contractScore = 20; reasons.push(t('gapAnalysis.reasons.contractExpiring', { name: starter.name, months })) }
    else if (months <= 24) { contractScore = 60 }

    if (depth === 1 && months <= 12) {
      contractScore = 0
    }
  }

  const totalScore = depthScore * 0.4 + ageScore * 0.25 + perfScore * 0.2 + contractScore * 0.15
  const priority: PositionGap['priority'] =
    totalScore < 35 ? 'critical' :
    totalScore < 55 ? 'high' :
    totalScore < 75 ? 'medium' : 'low'

  const avgAge = available.length > 0 ? Math.round(available.reduce((s, p) => s + (calculateAge(p.birth_date) ?? 0), 0) / available.length * 10) / 10 : 0
  const searchTerm = t(POSITION_SEARCH_KEY_MAP[position])
  const searchQuery = ageScore < 50 ? `${searchTerm} under 27` : `${searchTerm} under 25`

  return {
    position,
    positionLabel: positionLabels[position],
    priority,
    reasons,
    currentPlayers: available,
    depth,
    avgAge,
    avgRating,
    searchQuery,
  }
}

export function useGapAnalysis(players: SquadPlayer[]): PositionGap[] {
  const { t } = useTranslation()
  return useMemo(() => {
    if (players.length === 0) return []

    const grouped: Record<SquadPosition, SquadPlayer[]> = {} as Record<SquadPosition, SquadPlayer[]>
    for (const pos of ALL_POSITIONS) grouped[pos] = []
    for (const p of players) {
      grouped[p.position].push(p)
    }

    const gaps = ALL_POSITIONS.map((pos) => analyzePosition(pos, grouped[pos], t))
    // Sort: critical first, then high, medium, low
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    gaps.sort((a, b) => order[a.priority] - order[b.priority])

    return gaps
  }, [players, t])
}
