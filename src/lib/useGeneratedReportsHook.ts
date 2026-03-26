import { useContext } from 'react'
import { GeneratedReportsContext, type GeneratedReportsContextValue } from './GeneratedReportsContext'

export function useGeneratedReports(): GeneratedReportsContextValue {
  const ctx = useContext(GeneratedReportsContext)
  if (!ctx) throw new Error('useGeneratedReports must be used within GeneratedReportsProvider')
  return ctx
}
