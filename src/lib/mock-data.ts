// ScoutCopilot — Mock data for development
// All data is realistic but fictional for demo purposes

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
  playerName: string
  club: string
  change: string
  changeType: 'positive' | 'warning' | 'neutral'
  timeAgo: string
  imageUrl?: string
}

export interface MockPlayer {
  id: string
  name: string
  age: number
  nationality: string
  position: string
  club: string
  league: string
  fitScore: number
  stats: Record<string, number>
  image?: string
}

export interface MockPlayerReport {
  playerId: string
  playerName: string
  age: number
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
  similarPlayers: { name: string; club: string; age: number; similarity: number; image?: string }[]
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
  players: MockWatchlistPlayer[]
}

export interface MockWatchlistPlayer {
  id: string
  name: string
  club: string
  position: string
  age: number
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
  nationality: string
  metrics: Record<string, number>
  radarData: { label: string; value: number }[]
}

// ─── Dashboard ───────────────────────────────────────────────

export const dashboardStats: DashboardStats = {
  totalSearches: 12847,
  reportsGenerated: 156,
  playersTracked: 24,
  apiCallsThisMonth: 0,
  items: [
    { value: 12847, label: 'Players Analyzed', change: 18, period: 'vs last month' },
    { value: 24, label: 'Active Watchlists', change: 0, period: '', badge: '3 ALERTS' },
    { value: 156, label: 'Reports Generated', change: 0, period: 'this week', badge: '+12 THIS WEEK' },
    { value: '0.6s', label: 'Avg Query Time', change: 0, period: '' },
  ],
}

export const recentSearches: RecentSearch[] = [
  { id: '1', query: 'Left-backs under 23, >75% crossing accuracy', resultCount: 142, timestamp: '2026-03-26T10:14:00Z', status: 'complete' },
  { id: '2', query: 'U19 Strikers with xG/90 > 0.45 in Eredivisie', resultCount: 28, timestamp: '2026-03-26T09:38:00Z', status: 'complete' },
  { id: '3', query: 'Defensive Midfielders with Progressive Passes > 8', resultCount: 315, timestamp: '2026-03-25T17:45:00Z', status: 'complete' },
  { id: '4', query: 'Serie A Wingers: Dribble success rate > 60%', resultCount: 32, timestamp: '2026-03-25T15:20:00Z', status: 'complete' },
  { id: '5', query: 'Top 5 Leagues: Ball Recoveries (Final Third)', resultCount: 97, timestamp: '2026-03-25T12:00:00Z', status: 'complete' },
  { id: '6', query: 'Defensive Midfielders with >10 recoveries vs Top 6', resultCount: 0, timestamp: '2026-03-25T09:45:00Z', status: 'processing' },
  { id: '7', query: 'Ligue 1 fullbacks with >3 progressive carries/90', resultCount: 34, timestamp: '2026-03-21T10:15:00Z', status: 'complete' },
  { id: '8', query: 'Bundesliga goalkeepers, save % top quartile', resultCount: 8, timestamp: '2026-03-20T15:00:00Z', status: 'complete' },
  { id: '9', query: 'Championship strikers, non-penalty xG >0.3', resultCount: 19, timestamp: '2026-03-20T09:45:00Z', status: 'complete' },
  { id: '10', query: 'La Liga midfielders, key passes >2.5/90', resultCount: 41, timestamp: '2026-03-19T14:30:00Z', status: 'complete' },
]

export const watchlistAlerts: WatchlistAlert[] = [
  { id: '1', playerName: 'Luca Marchetti', club: 'AC Stellare', change: 'Progressive Carries +15%', changeType: 'positive', timeAgo: '2m ago', imageUrl: '/avatars/player-13.png' },
  { id: '2', playerName: 'K. Papadopoulos', club: 'Olympique Azur', change: 'Injury Status: Doubtful', changeType: 'warning', timeAgo: '14m ago', imageUrl: '/avatars/player-14.png' },
  { id: '3', playerName: 'Ousmane Diallo', club: 'Inter Azzurra', change: 'xG Chain Threshold Reached', changeType: 'positive', timeAgo: '1h ago', imageUrl: '/avatars/player-15.png' },
  { id: '4', playerName: 'Lars Henriksen', club: 'Northgate United', change: 'Key Passes Peak Performance', changeType: 'positive', timeAgo: '3h ago', imageUrl: '/avatars/player-16.png' },
]

// ─── Player Search Results ───────────────────────────────────

export const searchResults: MockPlayer[] = [
  { id: 'p1', name: 'Marco Lindström', age: 25, nationality: 'Sweden', position: 'LB, LWB', club: 'FC Nordhavn', league: 'Bundesliga', fitScore: 94, stats: { 'xG/90': 0.12, 'Succ. Dribbles': 3.41, 'Prog. Carries': 8.2, 'Pass %': 89.2 }, image: '/avatars/player-1.png' },
  { id: 'p2', name: 'Enzo Valenti', age: 23, nationality: 'Italy', position: 'LB, LM', club: 'Crescent Athletic', league: 'Premier League', fitScore: 88, stats: { 'xG/90': 0.08, 'Succ. Dribbles': 2.18, 'Prog. Carries': 6.7, 'Pass %': 85.1 }, image: '/avatars/player-2.png' },
  { id: 'p3', name: 'Dani Cortez', age: 22, nationality: 'Spain', position: 'LB, RB', club: 'Atlético Ronda', league: 'La Liga', fitScore: 76, stats: { 'xG/90': 0.05, 'Succ. Dribbles': 1.94, 'Prog. Carries': 7.1, 'Pass %': 87.6 }, image: '/avatars/player-3.png' },
  { id: 'p4', name: 'Tiago Noronha', age: 24, nationality: 'Portugal', position: 'LB', club: 'AS Lumière', league: 'Ligue 1', fitScore: 82, stats: { 'xG/90': 0.03, 'Succ. Dribbles': 2.88, 'Prog. Carries': 7.9, 'Pass %': 84.3 }, image: '/avatars/player-4.png' },
  { id: 'p5', name: 'Rémi Blanchard', age: 23, nationality: 'France', position: 'LB, LM', club: 'Olympique Azur', league: 'Ligue 1', fitScore: 54, stats: { 'xG/90': 0.01, 'Succ. Dribbles': 1.12, 'Prog. Carries': 4.3, 'Pass %': 81.0 }, image: '/avatars/player-5.png' },
  { id: 'p6', name: 'Bálint Varga', age: 22, nationality: 'Hungary', position: 'LB', club: 'Southport City', league: 'Premier League', fitScore: 79, stats: { 'xG/90': 0.04, 'Succ. Dribbles': 1.76, 'Prog. Carries': 5.8, 'Pass %': 82.4 }, image: '/avatars/player-6.png' },
  { id: 'p7', name: 'Samir Benali', age: 23, nationality: 'Algeria', position: 'LB, LWB', club: 'Midland Rovers', league: 'Premier League', fitScore: 85, stats: { 'xG/90': 0.07, 'Succ. Dribbles': 2.34, 'Prog. Carries': 6.2, 'Pass %': 83.7 }, image: '/avatars/player-7.png' },
  { id: 'p8', name: 'Pablo Navarro', age: 23, nationality: 'Spain', position: 'LB', club: 'Sporting Castilla', league: 'La Liga', fitScore: 73, stats: { 'xG/90': 0.06, 'Succ. Dribbles': 1.45, 'Prog. Carries': 5.4, 'Pass %': 86.2 }, image: '/avatars/player-8.png' },
  { id: 'p9', name: 'Stijn de Graaf', age: 24, nationality: 'Netherlands', position: 'LB, LWB', club: 'Harton Villa', league: 'Premier League', fitScore: 81, stats: { 'xG/90': 0.09, 'Succ. Dribbles': 2.01, 'Prog. Carries': 6.9, 'Pass %': 84.8 }, image: '/avatars/player-9.png' },
  { id: 'p10', name: 'Mateo Rivas', age: 19, nationality: 'Argentina', position: 'LB', club: 'Miami Coast FC', league: 'MLS', fitScore: 62, stats: { 'xG/90': 0.02, 'Succ. Dribbles': 1.1, 'Prog. Carries': 3.8, 'Pass %': 80.5 }, image: '/avatars/player-10.png' },
  { id: 'p11', name: 'Adrien Morel', age: 28, nationality: 'France', position: 'LB, LWB', club: 'AC Stellare', league: 'Serie A', fitScore: 91, stats: { 'xG/90': 0.14, 'Succ. Dribbles': 2.67, 'Prog. Carries': 7.5, 'Pass %': 85.9 }, image: '/avatars/player-11.png' },
  { id: 'p12', name: 'Emre Demir', age: 25, nationality: 'Turkey', position: 'LB, RB', club: 'Coastal FC', league: 'Premier League', fitScore: 77, stats: { 'xG/90': 0.05, 'Succ. Dribbles': 1.89, 'Prog. Carries': 5.6, 'Pass %': 87.1 }, image: '/avatars/player-12.png' },
]

// ─── Player Report (Marco Lindström) ─────────────────────────

export const marcoLindstromReport: MockPlayerReport = {
  playerId: 'p1',
  playerName: 'Marco Lindström',
  age: 25,
  nationality: 'Sweden',
  position: 'LB / LWB',
  club: 'FC Nordhavn',
  league: 'Bundesliga',
  image: '/avatars/player-1.png',
  summary: 'Lindström continues to be one of the most dynamic full-backs in European football. His ability to transition from defense to attack at high speed is elite-level. While his tactical positioning has improved significantly, he remains most effective when allowed to overlap and drive into the final third. His progressive carrying numbers rank in the 97th percentile among all European full-backs.',
  strengths: [
    'Elite recovery speed and acceleration',
    'Ball progression and carrying ability',
    'One-on-one defending in wide areas',
    'Crossing accuracy from deep positions',
    'Press resistance under pressure',
  ],
  weaknesses: [
    'Aerial duels (height disadvantage)',
    'Final third decision-making under pressure',
    'Positional discipline when caught high',
  ],
  styleOfPlay: 'An explosive, attacking full-back who functions as a secondary winger in possession phases. Lindström creates width and stretches opposition defensive lines through pace and direct running. In defensive transitions, his recovery speed compensates for his high starting position. Best deployed in systems that encourage full-back overlaps with inside-cutting wingers.',
  recommendation: 'monitor',
  fitScore: 94,
  seasonStats: {
    Appearances: 28,
    Goals: 1,
    Assists: 4,
    Minutes: 2140,
    'Pass Accuracy': '89.2%',
    'Tackles Won': 34,
    'Interceptions': 18,
    'Prog. Carries/90': 8.2,
    'Key Passes/90': 1.4,
    'Aerial Duels Won': '42%',
  },
  radarData: [
    { label: 'Speed', value: 95, average: 68 },
    { label: 'Passing', value: 78, average: 72 },
    { label: 'Dribbling', value: 82, average: 58 },
    { label: 'Physical', value: 71, average: 70 },
    { label: 'Defending', value: 68, average: 74 },
    { label: 'Crossing', value: 74, average: 65 },
  ],
  similarPlayers: [
    { name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 94, image: '/avatars/player-4.png' },
    { name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 91, image: '/avatars/player-3.png' },
    { name: 'Enzo Valenti', club: 'Crescent Athletic', age: 23, similarity: 88, image: '/avatars/player-2.png' },
  ],
  transferHistory: [
    { club: 'FC Nordhavn', date: 'Jan 2023', fee: '€10.00m' },
    { club: 'IFK Malmköping', date: 'Youth', fee: 'Academy' },
  ],
  contractInfo: {
    value: '€70.00m',
    until: 'June 30, 2027',
    wage: '€175k/week',
    agent: 'Nordic Sports Group',
  },
}

// ─── Comparison Data ─────────────────────────────────────────

export const comparisonPlayers: MockComparisonPlayer[] = [
  {
    id: 'cp1',
    name: 'Kwame Asante',
    club: 'Northgate United',
    position: 'LW / CF',
    age: 28,
    nationality: 'Ghana',
    metrics: { 'Goals/90': 0.68, 'Assists/90': 0.12, 'Pass %': 81.4, 'Tackles/90': 1.2, 'Interceptions/90': 0.3, 'xG/90': 0.62, 'Key Passes/90': 1.8, 'Aerial Won %': 48.2, 'Dribbles/90': 3.1, 'Prog. Carries/90': 5.4 },
    radarData: [
      { label: 'Shooting', value: 85 },
      { label: 'Passing', value: 68 },
      { label: 'Dribbling', value: 78 },
      { label: 'Physical', value: 82 },
      { label: 'Defending', value: 45 },
      { label: 'Speed', value: 90 },
    ],
  },
  {
    id: 'cp2',
    name: 'Gonçalo Pinto',
    club: 'AC Stellare',
    position: 'LW / CF',
    age: 27,
    nationality: 'Portugal',
    metrics: { 'Goals/90': 0.45, 'Assists/90': 0.34, 'Pass %': 76.8, 'Tackles/90': 0.4, 'Interceptions/90': 0.6, 'xG/90': 0.48, 'Key Passes/90': 2.4, 'Aerial Won %': 31.5, 'Dribbles/90': 4.2, 'Prog. Carries/90': 7.1 },
    radarData: [
      { label: 'Shooting', value: 72 },
      { label: 'Passing', value: 74 },
      { label: 'Dribbling', value: 92 },
      { label: 'Physical', value: 76 },
      { label: 'Defending', value: 30 },
      { label: 'Speed', value: 88 },
    ],
  },
]

// ─── Watchlists ──────────────────────────────────────────────

export const watchlists: MockWatchlist[] = [
  {
    id: 'w1',
    name: 'Left-Back Targets U23',
    description: 'Young fullbacks for summer window recruitment',
    playerCount: 8,
    lastUpdated: '2h ago',
    alertCount: 2,
    players: [
      { id: 'wp1', name: 'Enzo Valenti', club: 'Crescent Athletic', position: 'LB/LM', age: 23, nationality: 'Italy', image: '/avatars/player-2.png', keyMetric: { value: '6.7', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-02-15', scoutScore: 88 },
      { id: 'wp2', name: 'Dani Cortez', club: 'Atlético Ronda', position: 'LB/RB', age: 22, nationality: 'Spain', image: '/avatars/player-3.png', keyMetric: { value: '87.6%', label: 'Pass Accuracy' }, alertStatus: 'form_change', addedDate: '2026-02-18', scoutScore: 76 },
      { id: 'wp3', name: 'Bálint Varga', club: 'Southport City', position: 'LB', age: 22, nationality: 'Hungary', image: '/avatars/player-6.png', keyMetric: { value: '5.8', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-03-01', scoutScore: 79 },
    ],
  },
  {
    id: 'w2',
    name: 'Serie A Strikers',
    description: 'Monitoring top Serie A forwards for potential transfer targets',
    playerCount: 12,
    lastUpdated: '5h ago',
    alertCount: 0,
    players: [
      { id: 'wp4', name: 'Ousmane Diallo', club: 'Inter Azzurra', position: 'CF/LW', age: 28, nationality: 'Senegal', image: '/avatars/player-15.png', keyMetric: { value: '0.68', label: 'npxG/90' }, alertStatus: 'price_change', addedDate: '2025-12-02', scoutScore: 92 },
      { id: 'wp5', name: 'Lars Henriksen', club: 'Northgate United', position: 'CF', age: 25, nationality: 'Denmark', image: '/avatars/player-16.png', keyMetric: { value: '2.45', label: 'Succ. Dribbles' }, alertStatus: 'stable', addedDate: '2025-12-18', scoutScore: 85 },
    ],
  },
  {
    id: 'w3',
    name: 'January Window Shortlist',
    description: 'Priority targets approved by sporting director',
    playerCount: 5,
    lastUpdated: '12m ago',
    alertCount: 3,
    players: [
      { id: 'wp6', name: 'Luca Marchetti', club: 'Lazio Blu', position: 'LB/LWB', age: 26, nationality: 'Italy', image: '/avatars/player-13.png', keyMetric: { value: '8.42', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2025-11-15', scoutScore: 88 },
      { id: 'wp7', name: 'Alessandro Conti', club: 'Inter Azzurra', position: 'LWB', age: 28, nationality: 'Italy', image: '/avatars/player-17.png', keyMetric: { value: '3.12', label: 'Key Passes/90' }, alertStatus: 'injury', addedDate: '2025-12-10', scoutScore: 90 },
      { id: 'wp8', name: 'Nicolás Herrera', club: 'AS Roma Rossa', position: 'RW/AM', age: 23, nationality: 'Argentina', image: '/avatars/player-18.png', keyMetric: { value: '4.18', label: 'SCA/90' }, alertStatus: 'price_change', addedDate: '2026-01-05', scoutScore: 87 },
    ],
  },
  {
    id: 'w4',
    name: 'Youth Academy Targets',
    description: 'U18 prospects from secondary leagues',
    playerCount: 15,
    lastUpdated: '1d ago',
    alertCount: 1,
    players: [],
  },
  {
    id: 'w5',
    name: 'Midfielder Replacements',
    description: 'Potential replacements for departing midfielders',
    playerCount: 6,
    lastUpdated: '3d ago',
    alertCount: 0,
    players: [],
  },
  {
    id: 'w6',
    name: 'Budget Options <€5M',
    description: 'High-value targets within limited transfer budget',
    playerCount: 9,
    lastUpdated: '1w ago',
    alertCount: 4,
    players: [],
  },
]

// ─── Filter Options ──────────────────────────────────────────

export const positionOptions = [
  'All Positions',
  'Goalkeeper',
  'Centre-Back',
  'Full-Back (LB/RB)',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger (LW/RW)',
  'Centre-Forward',
]

export const leagueOptions = [
  'All Leagues',
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'Eredivisie',
  'Primeira Liga',
  'Championship',
  'MLS',
]

export const ageRangeOptions = [
  'All Ages',
  '16 - 19',
  '20 - 23',
  '24 - 27',
  '28 - 31',
  '32+',
]

export const footOptions = [
  'Either Foot',
  'Left',
  'Right',
  'Both',
]
