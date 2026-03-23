export interface SearchQuery {
  natural_language?: string
  filters?: SearchFilters
}

export interface SearchFilters {
  position?: string
  age_min?: number
  age_max?: number
  league?: string
  nationality?: string
  min_market_value?: number
  max_market_value?: number
}

export interface SearchResult {
  player_id: string
  name: string
  position: string
  club: string
  age: number
  relevance_score: number
  match_reasons: string[]
}
