import { createContext } from 'react'

export interface GeneratedReportsContextValue {
  generatedReportIds: string[]
  generateReport: (id: string, playerName?: string) => Promise<void>
  removeReport: (id: string) => void
  isGenerating: (id: string) => boolean
  hasReport: (id: string) => boolean
  generationError: string | null
  clearGenerationError: () => void
}

export const GeneratedReportsContext = createContext<GeneratedReportsContextValue | null>(null)
