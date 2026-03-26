import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ComparisonContextValue {
  pendingPlayerIds: string[]
  addPendingPlayer: (id: string) => void
  clearPending: () => void
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [pendingPlayerIds, setPendingPlayerIds] = useState<string[]>([])

  const addPendingPlayer = useCallback((id: string) => {
    setPendingPlayerIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const clearPending = useCallback(() => {
    setPendingPlayerIds([])
  }, [])

  return (
    <ComparisonContext.Provider value={{ pendingPlayerIds, addPendingPlayer, clearPending }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparisonContext() {
  const ctx = useContext(ComparisonContext)
  if (!ctx) throw new Error('useComparisonContext must be used within ComparisonProvider')
  return ctx
}
