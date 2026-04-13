// ScoutCopilot — Mock data type definitions

export interface DashboardStatItem {
  value: number | string
  label: string
  change: number // percentage change (positive = up)
  period: string
  badge?: string // e.g. "3 ALERTS"
}

export interface DashboardStats {
  totalSearches: number
  reportsGenerated: number
  playersTracked: number
  apiCallsThisMonth: number
  items: DashboardStatItem[]
}

export interface RecentSearch {
  id: string
  query: string
  resultCount: number
  timestamp: string
  status: 'complete' | 'processing' | 'failed'
}

export interface WatchlistAlert {
  id: string
  playerId: string
  playerName: string
  club: string
  changeKey: string
  changeParams: Record<string, string>
  changeType: 'positive' | 'warning' | 'neutral'
  timeAgo: string
  imageUrl?: string
}

export interface MockPlayer {
  id: string
  name: string
  age: number
  birth_date?: string
  nationality: string
  position: string
  club: string
  league: string
  fitScore: number
  stats: Record<string, number>
  image?: string
  /** Where the photo came from: 'sportsdb' (real), 'api-football' (real), 'stitch' (AI-generated), or undefined */
  photoSource?: 'sportsdb' | 'api-football' | 'stitch'
}

export interface MockPlayerReport {
  playerId: string
  playerName: string
  age: number
  birth_date?: string
  nationality: string
  position: string
  club: string
  league: string
  image?: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  styleOfPlay: string
  recommendation: 'sign' | 'monitor' | 'pass'
  fitScore: number
  seasonStats: Record<string, number | string>
  radarData: { label: string; value: number; average: number }[]
  similarPlayers: { playerId?: string; name: string; club: string; age: number; birth_date?: string; similarity: number; image?: string; photo_url?: string }[]
  transferHistory: { club: string; date: string; fee: string }[]
  contractInfo: { value: string; until: string; wage: string; agent: string }
}

export interface MockWatchlist {
  id: string
  name: string
  description: string
  playerCount: number
  lastUpdated: string
  alertCount: number
  category?: 'transfer' | 'youth' | 'position'
  players: MockWatchlistPlayer[]
}

export interface MockWatchlistPlayer {
  id: string
  name: string
  club: string
  position: string
  age: number
  birth_date?: string
  nationality: string
  image?: string
  keyMetric: { value: string; label: string }
  alertStatus: 'stable' | 'price_change' | 'injury' | 'form_change'
  addedDate: string
  scoutScore: number
}

export interface MockComparisonPlayer {
  id: string
  name: string
  club: string
  position: string
  age: number
  birth_date?: string
  nationality: string
  image: string
  metrics: Record<string, number>
  radarData: { label: string; value: number }[]
}

export type SquadPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST'

export interface SquadPlayer {
  id: string
  name: string
  age: number
  birth_date?: string
  nationality: string
  position: SquadPosition
  altPositions?: SquadPosition[]
  shirtNumber: number
  contractUntil: string
  weeklyWage: string
  marketValue: string
  status: 'fit' | 'injured' | 'suspended' | 'on_loan'
  image?: string
  stats: Record<string, number>
  radarData: { label: string; value: number; average: number }[]
  overallRating: number
}

export interface PositionGap {
  position: SquadPosition
  positionLabel: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  reasons: string[]
  currentPlayers: SquadPlayer[]
  depth: number
  avgAge: number
  avgRating: number
  searchQuery: string
}

export interface MockSquad {
  id: string
  name: string
  club: string
  season: string
  description: string
  formation: FormationType
  playerCount: number
  lastUpdated: string
  players: SquadPlayer[]
}

export interface FormationSlot {
  position: SquadPosition
  label: string
  x: number
  y: number
}

export type FormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1'
