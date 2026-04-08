import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { GeneratedReportsContext } from './GeneratedReportsContext'
import { supabase } from './supabase'

export function GeneratedReportsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [reportIds, setReportIds] = useState<string[]>([])
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())

  // Load existing report IDs from DB on mount
  useEffect(() => {
    async function loadReports() {
      const { data } = await supabase
        .from('player_reports')
        .select('player_external_id')
      if (data) {
        setReportIds(data.map((r) => r.player_external_id))
      }
    }
    loadReports()
  }, [])

  const generateReport = useCallback(async (id: string, explicitName?: string) => {
    if (reportIds.includes(id) || generatingIds.has(id)) return
    setGeneratingIds((prev) => new Set(prev).add(id))
    try {
      // Use explicit name if provided (e.g. from similar players), otherwise look up from cache
      let playerName = explicitName ?? 'Unknown'
      if (playerName === 'Unknown') {
        const cachedSearches = queryClient.getQueriesData<Array<{ id: string; name: string }>>({ queryKey: ['player-search'] })
        for (const [, results] of cachedSearches) {
          const found = results?.find((p) => p.id === id)
          if (found) { playerName = found.name; break }
        }
      }

      const { error } = await supabase.functions.invoke('report', {
        body: { player_external_id: id, player_name: playerName },
      })

      if (error) throw error

      setReportIds((prev) => [...prev, id])
      // Invalidate player report and reports list queries
      queryClient.invalidateQueries({ queryKey: ['player-report', id] })
      queryClient.invalidateQueries({ queryKey: ['player-reports'] })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Report generation failed:', err)
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [reportIds, generatingIds, queryClient])

  const removeReport = useCallback((id: string) => {
    setReportIds((prev) => prev.filter((rid) => rid !== id))
  }, [])

  const isGenerating = useCallback((id: string) => generatingIds.has(id), [generatingIds])
  const hasReport = useCallback((id: string) => reportIds.includes(id), [reportIds])

  return (
    <GeneratedReportsContext.Provider value={{ generatedReportIds: reportIds, generateReport, removeReport, isGenerating, hasReport }}>
      {children}
    </GeneratedReportsContext.Provider>
  )
}

