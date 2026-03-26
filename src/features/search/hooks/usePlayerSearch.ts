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

export function usePlayerSearch() {
  const [params, setParams] = useState<SearchParams>({
    query: '',
    position: 'All Positions',
    ageRange: 'All Ages',
    league: 'All Leagues',
    foot: 'Either Foot',
  })
  const [hasSearched, setHasSearched] = useState(true)

  const { data, isLoading, refetch } = useQuery<MockPlayer[]>({
    queryKey: ['player-search', params],
    queryFn: async () => {
      // TODO: Replace with real API call via src/lib/api.ts
      await new Promise((r) => setTimeout(r, 600))
      // Simple client-side filtering for demo
      let results = [...searchResults]
      if (params.league !== 'All Leagues') {
        results = results.filter((p) => p.league === params.league)
      }
      if (params.position !== 'All Positions') {
        results = results.filter((p) =>
          p.position.toLowerCase().includes(params.position.split(' ')[0].toLowerCase())
        )
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
