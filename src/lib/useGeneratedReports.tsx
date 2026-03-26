import { useState, useCallback, type ReactNode } from 'react'
import { GeneratedReportsContext } from './GeneratedReportsContext'

const PRE_SEEDED = ['p1', 'p2', 'p3']

export function GeneratedReportsProvider({ children }: { children: ReactNode }) {
  const [reportIds, setReportIds] = useState<string[]>(PRE_SEEDED)
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())

  const generateReport = useCallback(async (id: string) => {
    if (reportIds.includes(id) || generatingIds.has(id)) return
    setGeneratingIds((prev) => new Set(prev).add(id))
    await new Promise((r) => setTimeout(r, 2000))
    setGeneratingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setReportIds((prev) => [...prev, id])
  }, [reportIds, generatingIds])

  const isGenerating = useCallback((id: string) => generatingIds.has(id), [generatingIds])
  const hasReport = useCallback((id: string) => reportIds.includes(id), [reportIds])

  return (
    <GeneratedReportsContext.Provider value={{ generatedReportIds: reportIds, generateReport, isGenerating, hasReport }}>
      {children}
    </GeneratedReportsContext.Provider>
  )
}

