import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchResults, type MockPlayer } from '../../../lib/mock-data'

interface SearchParams {
  query: string
  position: string
  ageRange: string
  league: string
  foot: string
}

function hashQuery(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function parseAgeFromQuery(q: string): { min?: number; max?: number } {
  const underMatch = q.match(/under\s+(\d+)/i) ?? q.match(/u(\d+)/i)
  if (underMatch) return { max: Number(underMatch[1]) - 1 }
  const overMatch = q.match(/over\s+(\d+)/i)
  if (overMatch) return { min: Number(overMatch[1]) + 1 }
  return {}
}

function parseLeagueFromQuery(q: string): string | null {
  const lower = q.toLowerCase()
  const leagues: [string, string[]][] = [
    ['Premier League', ['premier league', 'epl']],
    ['La Liga', ['la liga']],
    ['Bundesliga', ['bundesliga']],
    ['Serie A', ['serie a']],
    ['Ligue 1', ['ligue 1']],
    ['Eredivisie', ['eredivisie']],
    ['MLS', ['mls']],
    ['Championship', ['championship']],
  ]
  for (const [name, keywords] of leagues) {
    if (keywords.some((k) => lower.includes(k))) return name
  }
  return null
}

function shuffleWithSeed(arr: MockPlayer[], seed: number): MockPlayer[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647
    const j = seed % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function usePlayerSearch() {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    position: 'All Positions',
    ageRange: 'All Ages',
    league: 'All Leagues',
    foot: 'Either Foot',
  })
  const [hasSearched, setHasSearched] = useState(false)

  const { data, isLoading, refetch } = useQuery<MockPlayer[]>({
    queryKey: ['player-search', params],
    queryFn: async () => {
      // TODO: Replace with real API call via src/lib/api.ts
      await new Promise((r) => setTimeout(r, 2500))

      let results = [...searchResults]
      const q = params.query.toLowerCase()

      // Parse query for age constraints
      const age = parseAgeFromQuery(q)
      if (age.max) results = results.filter((p) => p.age <= age.max!)
      if (age.min) results = results.filter((p) => p.age >= age.min!)

      // Parse query for league
      const queryLeague = parseLeagueFromQuery(q)
      if (queryLeague) results = results.filter((p) => p.league === queryLeague)

      // Apply dropdown filters
      if (params.league !== 'All Leagues') {
        results = results.filter((p) => p.league === params.league)
      }
      if (params.position !== 'All Positions') {
        results = results.filter((p) =>
          p.position.toLowerCase().includes(params.position.split(' ')[0].toLowerCase()),
        )
      }

      // Parse query for stat thresholds (e.g., ">75% crossing accuracy", "xG/90 > 0.45")
      const statGtMatch = q.match(/>(\d+(?:\.\d+)?)%?\s*(crossing|pass|dribble)/i)
      if (statGtMatch) {
        const threshold = Number(statGtMatch[1])
        const stat = statGtMatch[2].toLowerCase()
        if (stat.includes('crossing') || stat.includes('pass')) {
          results = results.filter((p) => p.stats['Pass %'] >= threshold)
        } else if (stat.includes('dribble')) {
          results = results.filter((p) => p.stats['Succ. Dribbles'] >= threshold / 100 * 5)
        }
      }

      // Parse for progressive carries/passes threshold
      const progMatch = q.match(/progressive\s+(?:carries|passes|passers?).*?>?\s*(\d+)/i)
        ?? q.match(/>(\d+)\s*progressive/i)
      if (progMatch) {
        const threshold = Number(progMatch[1])
        results = results.filter((p) => p.stats['Prog. Carries'] >= threshold)
      }

      // Shuffle results deterministically based on query so different queries show different order
      const seed = hashQuery(params.query || 'default')
      results = shuffleWithSeed(results, seed)

      // If query mentions "top" or specific count, vary result size
      const topMatch = q.match(/top\s+(\d+)/i)
      if (topMatch) {
        results = results.slice(0, Math.min(Number(topMatch[1]), results.length))
      }

      return results
    },
    enabled: hasSearched,
  })

  function search(newParams?: Partial<SearchParams>) {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }))
    }
    setHasSearched(true)
    refetch()
  }

  function updateFilters(updates: Partial<SearchParams>) {
    setParams((prev) => ({ ...prev, ...updates }))
  }

  return {
    params,
    results: data ?? [],
    isLoading,
    hasSearched,
    search,
    updateFilters,
  }
}
