import { useMemo } from 'react'
import type { SquadPlayer, SquadPosition, PositionGap } from '../../../lib/mock-data'
import { positionLabels } from '../../../lib/mock-data'

const ALL_POSITIONS: SquadPosition[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST']

const POSITION_SEARCH_MAP: Record<SquadPosition, string> = {
  GK: 'Goalkeepers',
  CB: 'Centre-backs',
  LB: 'Left-backs',
  RB: 'Right-backs',
  CDM: 'Defensive midfielders',
  CM: 'Central midfielders',
  CAM: 'Attacking midfielders',
  LW: 'Left wingers',
  RW: 'Right wingers',
  ST: 'Strikers',
}

function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

function analyzePosition(position: SquadPosition, players: SquadPlayer[]): PositionGap {
  const available = players.filter((p) => p.status !== 'on_loan')
  const depth = available.length
  const reasons: string[] = []

  // Depth score (weight 40%)
  let depthScore: number
  if (depth === 0) { depthScore = 0; reasons.push('No players available at this position') }
  else if (depth === 1) { depthScore = 20; reasons.push('Only 1 player available — no backup') }
  else if (depth === 2) { depthScore = 60 }
  else { depthScore = 100 }

  // Age risk score (weight 25%) — based on best-rated (starter)
  let ageScore = 100
  if (available.length > 0) {
    const starter = available.reduce((a, b) => a.overallRating > b.overallRating ? a : b)
    if (starter.age >= 33) { ageScore = 0; reasons.push(`Starter ${starter.name} (${starter.age}) approaching retirement`) }
    else if (starter.age >= 30) { ageScore = 40; reasons.push(`Starter ${starter.name} (${starter.age}) is aging`) }
    else if (starter.age >= 27) { ageScore = 70 }
  }

  // Performance score (weight 20%)
  const avgRating = available.length > 0 ? Math.round(available.reduce((s, p) => s + p.overallRating, 0) / available.length) : 0
  const perfScore = avgRating
  if (avgRating > 0 && avgRating < 65) {
    reasons.push(`Below-average squad rating (${avgRating}/100)`)
  }

  // Contract risk score (weight 15%)
  let contractScore = 100
  if (available.length > 0) {
    const starter = available.reduce((a, b) => a.overallRating > b.overallRating ? a : b)
    const months = monthsUntil(starter.contractUntil)
    if (months <= 12) { contractScore = 20; reasons.push(`${starter.name}'s contract expires in ${months} months`) }
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

  const avgAge = available.length > 0 ? Math.round(available.reduce((s, p) => s + p.age, 0) / available.length * 10) / 10 : 0
  const searchTerm = POSITION_SEARCH_MAP[position]
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
  return useMemo(() => {
    if (players.length === 0) return []

    const grouped: Record<SquadPosition, SquadPlayer[]> = {} as Record<SquadPosition, SquadPlayer[]>
    for (const pos of ALL_POSITIONS) grouped[pos] = []
    for (const p of players) {
      grouped[p.position].push(p)
    }

    const gaps = ALL_POSITIONS.map((pos) => analyzePosition(pos, grouped[pos]))
    // Sort: critical first, then high, medium, low
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    gaps.sort((a, b) => order[a.priority] - order[b.priority])

    return gaps
  }, [players])
}
