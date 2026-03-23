export interface Player {
  id: string
  name: string
  age: number
  nationality: string
  position: string
  club: string
  league: string
  market_value?: number
  contract_end?: string
  image_url?: string
}

export interface PlayerStats {
  player_id: string
  season: string
  matches_played: number
  goals: number
  assists: number
  minutes_played: number
  attributes: Record<string, number>
}

export interface PlayerReport {
  id: string
  player_id: string
  created_at: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: 'sign' | 'monitor' | 'pass'
  fit_score: number
  ai_analysis?: string
}
