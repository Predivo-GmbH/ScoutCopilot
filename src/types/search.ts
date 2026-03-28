// CQ-004: Renamed to avoid collision with database.ts SearchQuery/SearchResult (DB row types).
// These are the API/domain-layer types used when wiring to real endpoints.

/** Domain-layer search query (distinct from DB row type SearchQuery in database.ts) */
export interface PlayerSearchQuery {
  natural_language?: string
  filters?: PlayerSearchFilters
}

export interface PlayerSearchFilters {
  position?: string
  age_min?: number
  age_max?: number
  league?: string
  nationality?: string
  min_market_value?: number
  max_market_value?: number
}

/** Domain-layer search result (distinct from DB row type SearchResult in database.ts) */
export interface PlayerSearchResult {
  player_id: string
  name: string
  position: string
  club: string
  age: number
  relevance_score: number
  match_reasons: string[]
}
