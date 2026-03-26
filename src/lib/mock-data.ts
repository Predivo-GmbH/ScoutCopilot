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
  similarPlayers: { playerId: string; name: string; club: string; age: number; similarity: number; image?: string }[]
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
  image: string
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

// ─── Player Reports ─────────────────────────────────────────

export const playerReports: Record<string, MockPlayerReport> = {
  p1: {
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
      Appearances: 28, Goals: 1, Assists: 4, Minutes: 2140,
      'Pass Accuracy': '89.2%', 'Tackles Won': 34, Interceptions: 18,
      'Prog. Carries/90': 8.2, 'Key Passes/90': 1.4, 'Aerial Duels Won': '42%',
    },
    radarData: [
      { label: 'Speed', value: 95, average: 68 }, { label: 'Passing', value: 78, average: 72 },
      { label: 'Dribbling', value: 82, average: 58 }, { label: 'Physical', value: 71, average: 70 },
      { label: 'Defending', value: 68, average: 74 }, { label: 'Crossing', value: 74, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p4', name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 94, image: '/avatars/player-4.png' },
      { playerId: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 91, image: '/avatars/player-3.png' },
      { playerId: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', age: 23, similarity: 88, image: '/avatars/player-2.png' },
    ],
    transferHistory: [
      { club: 'FC Nordhavn', date: 'Jan 2023', fee: '€10.00m' },
      { club: 'IFK Malmköping', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€70.00m', until: 'June 30, 2027', wage: '€175k/week', agent: 'Nordic Sports Group' },
  },
  p2: {
    playerId: 'p2',
    playerName: 'Enzo Valenti',
    age: 23,
    nationality: 'Italy',
    position: 'LB / LM',
    club: 'Crescent Athletic',
    league: 'Premier League',
    image: '/avatars/player-2.png',
    summary: 'Valenti is a technically gifted full-back who combines Italian defensive discipline with modern attacking output. His reading of the game allows him to intercept passes in advanced areas and quickly transition into attack. Particularly effective in build-up play, he offers a calm passing option under pressure and consistently finds progressive channels.',
    strengths: [
      'Exceptional passing range from deep',
      'Tactical intelligence and positioning',
      'Composure under high press',
      'Set-piece delivery from the left',
    ],
    weaknesses: [
      'Pace in recovery runs against quick wingers',
      'Physicality in aerial duels',
      'Tendency to drift too central in possession',
    ],
    styleOfPlay: 'A technically refined full-back who operates as an inverted defender in build-up phases. Valenti is most dangerous when he drifts inside to create overloads in central midfield. His vision and weight of pass make him a key creator from deep. Best utilized in possession-heavy systems that demand full-backs to contribute to midfield control.',
    recommendation: 'sign',
    fitScore: 88,
    seasonStats: {
      Appearances: 31, Goals: 0, Assists: 7, Minutes: 2580,
      'Pass Accuracy': '85.1%', 'Tackles Won': 41, Interceptions: 24,
      'Prog. Carries/90': 6.7, 'Key Passes/90': 1.8, 'Aerial Duels Won': '38%',
    },
    radarData: [
      { label: 'Speed', value: 72, average: 68 }, { label: 'Passing', value: 88, average: 72 },
      { label: 'Dribbling', value: 74, average: 58 }, { label: 'Physical', value: 65, average: 70 },
      { label: 'Defending', value: 78, average: 74 }, { label: 'Crossing', value: 80, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p1', name: 'Marco Lindström', club: 'FC Nordhavn', age: 25, similarity: 88, image: '/avatars/player-1.png' },
      { playerId: 'p5', name: 'Rémi Blanchard', club: 'Olympique Azur', age: 23, similarity: 82, image: '/avatars/player-5.png' },
      { playerId: 'p9', name: 'Stijn de Graaf', club: 'Harton Villa', age: 24, similarity: 79, image: '/avatars/player-9.png' },
    ],
    transferHistory: [
      { club: 'Crescent Athletic', date: 'Aug 2024', fee: '€14.50m' },
      { club: 'Genoa CFC Rossoblu', date: 'Jul 2021', fee: '€3.20m' },
      { club: 'Atalanta Youth', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€45.00m', until: 'June 30, 2029', wage: '€95k/week', agent: 'Stellar Group' },
  },
  p3: {
    playerId: 'p3',
    playerName: 'Dani Cortez',
    age: 22,
    nationality: 'Spain',
    position: 'LB / RB',
    club: 'Atlético Ronda',
    league: 'La Liga',
    image: '/avatars/player-3.png',
    summary: 'Cortez is a versatile defender capable of operating on either flank. His tactical awareness belies his age, and his ability to read the game makes him effective in both low-block and high-pressing systems. While his attacking output is modest, his defensive reliability and positional discipline make him a valuable squad asset with significant upside.',
    strengths: [
      'Versatility across both full-back positions',
      'Outstanding positional discipline',
      'Strong in 1v1 defensive situations',
      'Reliable passing under pressure',
    ],
    weaknesses: [
      'Limited attacking threat in final third',
      'Crossing accuracy needs improvement',
      'Can be caught ball-watching on set pieces',
    ],
    styleOfPlay: 'A defensively-minded full-back who prioritizes structure over adventure. Cortez excels at maintaining the back line shape and covering for attacking teammates. His two-footed ability allows seamless switching between flanks. Ideal for managers who want their full-backs to provide width without gambling on overlaps.',
    recommendation: 'monitor',
    fitScore: 76,
    seasonStats: {
      Appearances: 26, Goals: 0, Assists: 2, Minutes: 2080,
      'Pass Accuracy': '87.6%', 'Tackles Won': 48, Interceptions: 31,
      'Prog. Carries/90': 7.1, 'Key Passes/90': 0.8, 'Aerial Duels Won': '52%',
    },
    radarData: [
      { label: 'Speed', value: 74, average: 68 }, { label: 'Passing', value: 80, average: 72 },
      { label: 'Dribbling', value: 62, average: 58 }, { label: 'Physical', value: 76, average: 70 },
      { label: 'Defending', value: 84, average: 74 }, { label: 'Crossing', value: 58, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p6', name: 'Bálint Varga', club: 'Southport City', age: 22, similarity: 90, image: '/avatars/player-6.png' },
      { playerId: 'p12', name: 'Emre Demir', club: 'Coastal FC', age: 25, similarity: 85, image: '/avatars/player-12.png' },
      { playerId: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', age: 23, similarity: 83, image: '/avatars/player-8.png' },
    ],
    transferHistory: [
      { club: 'Atlético Ronda', date: 'Jul 2024', fee: '€8.00m' },
      { club: 'Sevilla B', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€25.00m', until: 'June 30, 2028', wage: '€55k/week', agent: 'Bahía Sports Management' },
  },
  p4: {
    playerId: 'p4',
    playerName: 'Tiago Noronha',
    age: 24,
    nationality: 'Portugal',
    position: 'LB',
    club: 'AS Lumière',
    league: 'Ligue 1',
    image: '/avatars/player-4.png',
    summary: 'Noronha is a dynamic attacking full-back in the Portuguese tradition. His dribbling ability and close control in tight spaces make him exceptionally difficult to press. He consistently beats his man on the outside and delivers dangerous crosses into the box. His defensive work rate has improved markedly this season under a more structured tactical system.',
    strengths: [
      'Outstanding dribbling and ball control',
      'Dangerous crossing from wide areas',
      'Excellent work rate in both phases',
      'Progressive carrying through midfield lines',
    ],
    weaknesses: [
      'Decision-making in the final third',
      'Concentration lapses in defensive transitions',
      'Struggles against physical wingers',
    ],
    styleOfPlay: 'A technical, overlapping full-back who thrives when given license to attack. His dribbling ability allows him to create numerical advantages in wide areas. His delivery from crossing positions is consistently dangerous. Needs a disciplined midfield behind him to cover his advanced positioning.',
    recommendation: 'sign',
    fitScore: 82,
    seasonStats: {
      Appearances: 30, Goals: 2, Assists: 5, Minutes: 2410,
      'Pass Accuracy': '84.3%', 'Tackles Won': 29, Interceptions: 15,
      'Prog. Carries/90': 7.9, 'Key Passes/90': 1.6, 'Aerial Duels Won': '35%',
    },
    radarData: [
      { label: 'Speed', value: 84, average: 68 }, { label: 'Passing', value: 76, average: 72 },
      { label: 'Dribbling', value: 88, average: 58 }, { label: 'Physical', value: 68, average: 70 },
      { label: 'Defending', value: 62, average: 74 }, { label: 'Crossing', value: 82, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p1', name: 'Marco Lindström', club: 'FC Nordhavn', age: 25, similarity: 94, image: '/avatars/player-1.png' },
      { playerId: 'p7', name: 'Samir Benali', club: 'Midland Rovers', age: 23, similarity: 86, image: '/avatars/player-7.png' },
      { playerId: 'p11', name: 'Adrien Morel', club: 'AC Stellare', age: 28, similarity: 81, image: '/avatars/player-11.png' },
    ],
    transferHistory: [
      { club: 'AS Lumière', date: 'Jan 2025', fee: '€12.00m' },
      { club: 'SC Braga B', date: 'Jul 2022', fee: '€2.80m' },
      { club: 'Sporting CP Youth', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€38.00m', until: 'June 30, 2029', wage: '€72k/week', agent: 'Gestifute International' },
  },
  p5: {
    playerId: 'p5',
    playerName: 'Rémi Blanchard',
    age: 23,
    nationality: 'France',
    position: 'LB / LM',
    club: 'Olympique Azur',
    league: 'Ligue 1',
    image: '/avatars/player-5.png',
    summary: 'Blanchard is a developing full-back with significant raw potential but inconsistent performances. His athletic profile is outstanding but his technical and tactical development has lagged. Shows flashes of brilliance in attacking phases but defensive lapses remain too frequent for a top-flight defender. A project player who needs time and coaching.',
    strengths: [
      'Explosive acceleration and top speed',
      'Strong aerial presence for a full-back',
      'Willingness to commit to challenges',
    ],
    weaknesses: [
      'Poor crossing accuracy and final ball',
      'Inconsistent decision-making under pressure',
      'Positional discipline needs significant work',
      'Struggles with quick combination play',
    ],
    styleOfPlay: 'An athletic full-back who relies on physicality and pace rather than technical ability. Blanchard is effective in transition-based systems where his speed can be utilized. His defensive work is committed but often poorly timed. Requires a patient coaching environment to develop his weaker areas.',
    recommendation: 'pass',
    fitScore: 54,
    seasonStats: {
      Appearances: 18, Goals: 0, Assists: 1, Minutes: 1290,
      'Pass Accuracy': '81.0%', 'Tackles Won': 22, Interceptions: 11,
      'Prog. Carries/90': 4.3, 'Key Passes/90': 0.5, 'Aerial Duels Won': '58%',
    },
    radarData: [
      { label: 'Speed', value: 90, average: 68 }, { label: 'Passing', value: 58, average: 72 },
      { label: 'Dribbling', value: 52, average: 58 }, { label: 'Physical', value: 85, average: 70 },
      { label: 'Defending', value: 60, average: 74 }, { label: 'Crossing', value: 45, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', age: 19, similarity: 78, image: '/avatars/player-10.png' },
      { playerId: 'p6', name: 'Bálint Varga', club: 'Southport City', age: 22, similarity: 72, image: '/avatars/player-6.png' },
      { playerId: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', age: 23, similarity: 68, image: '/avatars/player-8.png' },
    ],
    transferHistory: [
      { club: 'Olympique Azur', date: 'Jul 2024', fee: '€4.50m' },
      { club: 'Toulouse FC', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€12.00m', until: 'June 30, 2028', wage: '€28k/week', agent: 'Sport Cover Agency' },
  },
  p6: {
    playerId: 'p6',
    playerName: 'Bálint Varga',
    age: 22,
    nationality: 'Hungary',
    position: 'LB',
    club: 'Southport City',
    league: 'Premier League',
    image: '/avatars/player-6.png',
    summary: 'Varga has adapted impressively to Premier League football since his move from Budapest. A disciplined defender who rarely gets caught out of position, he provides consistent performances without spectacular highs or lows. His steady improvement trajectory and young age make him an interesting prospect for clubs seeking defensive reliability.',
    strengths: [
      'Excellent defensive positioning',
      'Strong in tackles and ground duels',
      'Consistent performance level',
      'Good awareness of space behind him',
    ],
    weaknesses: [
      'Limited creativity in attacking phases',
      'Crossing delivery is predictable',
      'Can be overly cautious with forward passing',
    ],
    styleOfPlay: 'A defensive full-back who prioritizes solidity over flair. Varga is the type of defender who quietly accumulates clean sheets through intelligent positioning rather than heroic last-ditch tackles. His progressive output is modest but his defensive contributions are well above average for his age group.',
    recommendation: 'monitor',
    fitScore: 79,
    seasonStats: {
      Appearances: 24, Goals: 0, Assists: 1, Minutes: 1920,
      'Pass Accuracy': '82.4%', 'Tackles Won': 52, Interceptions: 28,
      'Prog. Carries/90': 5.8, 'Key Passes/90': 0.6, 'Aerial Duels Won': '55%',
    },
    radarData: [
      { label: 'Speed', value: 70, average: 68 }, { label: 'Passing', value: 72, average: 72 },
      { label: 'Dribbling', value: 55, average: 58 }, { label: 'Physical', value: 78, average: 70 },
      { label: 'Defending', value: 82, average: 74 }, { label: 'Crossing', value: 56, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 90, image: '/avatars/player-3.png' },
      { playerId: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', age: 23, similarity: 84, image: '/avatars/player-8.png' },
      { playerId: 'p12', name: 'Emre Demir', club: 'Coastal FC', age: 25, similarity: 80, image: '/avatars/player-12.png' },
    ],
    transferHistory: [
      { club: 'Southport City', date: 'Aug 2025', fee: '€6.50m' },
      { club: 'Ferencváros TC', date: 'Jul 2022', fee: '€1.20m' },
      { club: 'MTK Budapest', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€18.00m', until: 'June 30, 2030', wage: '€42k/week', agent: 'ISM Sport' },
  },
  p7: {
    playerId: 'p7',
    playerName: 'Samir Benali',
    age: 23,
    nationality: 'Algeria',
    position: 'LB / LWB',
    club: 'Midland Rovers',
    league: 'Premier League',
    image: '/avatars/player-7.png',
    summary: 'Benali is a technically accomplished wing-back who has flourished in a back-three system. His ability to beat defenders 1v1 and deliver quality final balls makes him a genuine attacking asset. Defensively, he has shown improvement in awareness and tracking runners, though he remains best suited to systems where he operates as a wing-back rather than a traditional full-back.',
    strengths: [
      'Exceptional 1v1 dribbling ability',
      'Quality crossing from advanced positions',
      'Intelligent movement off the ball',
      'Good link-up play with wide forwards',
    ],
    weaknesses: [
      'Defensive vulnerability in a back-four',
      'Stamina management over 90 minutes',
      'Susceptible to quick counter-attacks',
    ],
    styleOfPlay: 'An attack-minded wing-back who functions as a wide playmaker in the final third. His skill on the ball and crossing ability make him a primary creative outlet from the left flank. He requires a system that provides defensive cover behind him, ideally a back-three or a holding midfielder who can cover the left channel.',
    recommendation: 'sign',
    fitScore: 85,
    seasonStats: {
      Appearances: 27, Goals: 3, Assists: 6, Minutes: 2160,
      'Pass Accuracy': '83.7%', 'Tackles Won': 26, Interceptions: 14,
      'Prog. Carries/90': 6.2, 'Key Passes/90': 2.1, 'Aerial Duels Won': '32%',
    },
    radarData: [
      { label: 'Speed', value: 82, average: 68 }, { label: 'Passing', value: 80, average: 72 },
      { label: 'Dribbling', value: 86, average: 58 }, { label: 'Physical', value: 67, average: 70 },
      { label: 'Defending', value: 58, average: 74 }, { label: 'Crossing', value: 84, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p4', name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 91, image: '/avatars/player-4.png' },
      { playerId: 'p11', name: 'Adrien Morel', club: 'AC Stellare', age: 28, similarity: 85, image: '/avatars/player-11.png' },
      { playerId: 'p1', name: 'Marco Lindström', club: 'FC Nordhavn', age: 25, similarity: 82, image: '/avatars/player-1.png' },
    ],
    transferHistory: [
      { club: 'Midland Rovers', date: 'Jan 2025', fee: '€11.00m' },
      { club: 'USM Alger', date: 'Jul 2021', fee: '€0.80m' },
    ],
    contractInfo: { value: '€32.00m', until: 'June 30, 2029', wage: '€65k/week', agent: 'CAA Stellar' },
  },
  p8: {
    playerId: 'p8',
    playerName: 'Pablo Navarro',
    age: 23,
    nationality: 'Spain',
    position: 'LB',
    club: 'Sporting Castilla',
    league: 'La Liga',
    image: '/avatars/player-8.png',
    summary: 'Navarro is a solid, no-nonsense full-back who embodies the traditional Spanish defensive school. His positioning and reading of the game are mature beyond his years. While he lacks the flair of some modern attacking full-backs, his consistency and reliability make him a dependable option in a well-organized defensive unit.',
    strengths: [
      'Excellent reading of the game',
      'Reliable in defensive duels',
      'Strong communicator on the pitch',
      'Consistent passing accuracy',
    ],
    weaknesses: [
      'Lacks pace against top-level wingers',
      'Limited contribution in the final third',
      'Set-piece positioning could improve',
    ],
    styleOfPlay: 'A classically trained Spanish defender who values positional play above all else. Navarro is effective in possession-based systems where the tempo is controlled. His defensive intelligence allows the centre-backs to push higher, knowing the left flank is well-covered. Not suited to high-intensity transition football.',
    recommendation: 'monitor',
    fitScore: 73,
    seasonStats: {
      Appearances: 25, Goals: 0, Assists: 2, Minutes: 2100,
      'Pass Accuracy': '86.2%', 'Tackles Won': 38, Interceptions: 22,
      'Prog. Carries/90': 5.4, 'Key Passes/90': 0.7, 'Aerial Duels Won': '48%',
    },
    radarData: [
      { label: 'Speed', value: 65, average: 68 }, { label: 'Passing', value: 78, average: 72 },
      { label: 'Dribbling', value: 58, average: 58 }, { label: 'Physical', value: 72, average: 70 },
      { label: 'Defending', value: 80, average: 74 }, { label: 'Crossing', value: 60, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 89, image: '/avatars/player-3.png' },
      { playerId: 'p6', name: 'Bálint Varga', club: 'Southport City', age: 22, similarity: 84, image: '/avatars/player-6.png' },
      { playerId: 'p12', name: 'Emre Demir', club: 'Coastal FC', age: 25, similarity: 78, image: '/avatars/player-12.png' },
    ],
    transferHistory: [
      { club: 'Sporting Castilla', date: 'Jul 2023', fee: '€5.00m' },
      { club: 'Real Sociedad B', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€15.00m', until: 'June 30, 2027', wage: '€38k/week', agent: 'You First Sports' },
  },
  p9: {
    playerId: 'p9',
    playerName: 'Stijn de Graaf',
    age: 24,
    nationality: 'Netherlands',
    position: 'LB / LWB',
    club: 'Harton Villa',
    league: 'Premier League',
    image: '/avatars/player-9.png',
    summary: 'De Graaf brings a distinctly Dutch approach to the full-back role — technically sound, positionally intelligent, and comfortable receiving the ball in tight spaces. His development at the Ajax academy is evident in his spatial awareness and ability to contribute to build-up play. He has become a regular starter in the Premier League and continues to improve.',
    strengths: [
      'Technical quality on the ball',
      'Spatial awareness in build-up play',
      'Progressive passing from deep',
      'Adaptable to multiple formations',
    ],
    weaknesses: [
      'Can be overpowered in physical duels',
      'Defensive heading needs improvement',
      'Occasionally too slow to release the ball',
    ],
    styleOfPlay: 'A modern, possession-oriented full-back schooled in Dutch positional play. De Graaf operates as a deep playmaker when his team has the ball, stepping inside to create triangles with the midfield. His movement and passing intelligence make him valuable in build-up phases, though he needs protection against direct, physical opponents.',
    recommendation: 'monitor',
    fitScore: 81,
    seasonStats: {
      Appearances: 29, Goals: 1, Assists: 4, Minutes: 2320,
      'Pass Accuracy': '84.8%', 'Tackles Won': 32, Interceptions: 20,
      'Prog. Carries/90': 6.9, 'Key Passes/90': 1.3, 'Aerial Duels Won': '40%',
    },
    radarData: [
      { label: 'Speed', value: 75, average: 68 }, { label: 'Passing', value: 84, average: 72 },
      { label: 'Dribbling', value: 78, average: 58 }, { label: 'Physical', value: 64, average: 70 },
      { label: 'Defending', value: 72, average: 74 }, { label: 'Crossing', value: 70, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', age: 23, similarity: 88, image: '/avatars/player-2.png' },
      { playerId: 'p4', name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 82, image: '/avatars/player-4.png' },
      { playerId: 'p11', name: 'Adrien Morel', club: 'AC Stellare', age: 28, similarity: 76, image: '/avatars/player-11.png' },
    ],
    transferHistory: [
      { club: 'Harton Villa', date: 'Aug 2024', fee: '€9.50m' },
      { club: 'AZ Alkmaar', date: 'Jul 2021', fee: '€2.00m' },
      { club: 'Ajax Youth', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€28.00m', until: 'June 30, 2028', wage: '€58k/week', agent: 'SEG Football' },
  },
  p10: {
    playerId: 'p10',
    playerName: 'Mateo Rivas',
    age: 19,
    nationality: 'Argentina',
    position: 'LB',
    club: 'Miami Coast FC',
    league: 'MLS',
    image: '/avatars/player-10.png',
    summary: 'Rivas is a raw but exciting teenage prospect who has broken into the Miami Coast first team. At just 19, his physical and technical development is still ongoing. He shows glimpses of exceptional talent — particularly his ability to carry the ball at speed — but his inconsistency and lack of experience are evident. A long-term prospect who could develop into a top-level full-back with the right pathway.',
    strengths: [
      'Explosive pace and acceleration',
      'Natural talent for carrying the ball',
      'Fearless in 1v1 situations',
    ],
    weaknesses: [
      'Defensive awareness is raw',
      'Inconsistent concentration levels',
      'Passing accuracy below required standard',
      'Needs physical development',
    ],
    styleOfPlay: 'A raw, athletic full-back who plays on instinct rather than structure. Rivas is at his best when driving forward with the ball at pace. His defensive game needs significant coaching but his physical attributes and age suggest a high ceiling. Best suited to a development environment with patient coaching.',
    recommendation: 'monitor',
    fitScore: 62,
    seasonStats: {
      Appearances: 14, Goals: 0, Assists: 0, Minutes: 890,
      'Pass Accuracy': '80.5%', 'Tackles Won': 18, Interceptions: 8,
      'Prog. Carries/90': 3.8, 'Key Passes/90': 0.3, 'Aerial Duels Won': '30%',
    },
    radarData: [
      { label: 'Speed', value: 92, average: 68 }, { label: 'Passing', value: 55, average: 72 },
      { label: 'Dribbling', value: 68, average: 58 }, { label: 'Physical', value: 62, average: 70 },
      { label: 'Defending', value: 48, average: 74 }, { label: 'Crossing', value: 50, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p5', name: 'Rémi Blanchard', club: 'Olympique Azur', age: 23, similarity: 78, image: '/avatars/player-5.png' },
      { playerId: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 65, image: '/avatars/player-3.png' },
      { playerId: 'p6', name: 'Bálint Varga', club: 'Southport City', age: 22, similarity: 60, image: '/avatars/player-6.png' },
    ],
    transferHistory: [
      { club: 'Miami Coast FC', date: 'Mar 2026', fee: '€1.80m' },
      { club: 'River Plate Youth', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€5.00m', until: 'Dec 31, 2028', wage: '€12k/week', agent: 'Footfeel ISM' },
  },
  p11: {
    playerId: 'p11',
    playerName: 'Adrien Morel',
    age: 28,
    nationality: 'France',
    position: 'LB / LWB',
    club: 'AC Stellare',
    league: 'Serie A',
    image: '/avatars/player-11.png',
    summary: 'Morel is a seasoned full-back operating at the peak of his career. His combination of experience, technical quality, and tactical intelligence makes him one of the most complete full-backs in Serie A. He provides consistent high-level performances and is a leader in the dressing room. His age means limited resale value, but his immediate impact would be significant.',
    strengths: [
      'Complete full-back profile — attacks and defends well',
      'Leadership and communication skills',
      'Elite crossing accuracy',
      'Big-game temperament',
      'Fitness and durability',
    ],
    weaknesses: [
      'Age limits long-term value',
      'Declining top speed over long sprints',
      'High wage demands for his age bracket',
    ],
    styleOfPlay: 'A complete, experienced full-back who contributes equally in both phases of play. His positional intelligence means he rarely wastes energy, arriving in the right place at the right time. His crossing accuracy from wide areas is elite — among the top 5% in European football. A plug-and-play signing who would improve most squads immediately.',
    recommendation: 'sign',
    fitScore: 91,
    seasonStats: {
      Appearances: 32, Goals: 2, Assists: 8, Minutes: 2740,
      'Pass Accuracy': '85.9%', 'Tackles Won': 45, Interceptions: 26,
      'Prog. Carries/90': 7.5, 'Key Passes/90': 1.9, 'Aerial Duels Won': '46%',
    },
    radarData: [
      { label: 'Speed', value: 76, average: 68 }, { label: 'Passing', value: 82, average: 72 },
      { label: 'Dribbling', value: 78, average: 58 }, { label: 'Physical', value: 74, average: 70 },
      { label: 'Defending', value: 80, average: 74 }, { label: 'Crossing', value: 88, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p7', name: 'Samir Benali', club: 'Midland Rovers', age: 23, similarity: 85, image: '/avatars/player-7.png' },
      { playerId: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', age: 23, similarity: 82, image: '/avatars/player-2.png' },
      { playerId: 'p9', name: 'Stijn de Graaf', club: 'Harton Villa', age: 24, similarity: 78, image: '/avatars/player-9.png' },
    ],
    transferHistory: [
      { club: 'AC Stellare', date: 'Jul 2022', fee: '€18.00m' },
      { club: 'AS Monaco', date: 'Aug 2018', fee: '€8.50m' },
      { club: 'OGC Nice', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€22.00m', until: 'June 30, 2026', wage: '€120k/week', agent: 'Unique Sports Group' },
  },
  p12: {
    playerId: 'p12',
    playerName: 'Emre Demir',
    age: 25,
    nationality: 'Turkey',
    position: 'LB / RB',
    club: 'Coastal FC',
    league: 'Premier League',
    image: '/avatars/player-12.png',
    summary: 'Demir is a dependable squad full-back who can cover both flanks competently. His Turkish international experience adds valuable big-game composure. While unlikely to be a first-choice at a top-six club, his versatility, professionalism, and steady performances make him a useful squad player. Offers excellent value relative to his transfer cost.',
    strengths: [
      'Versatility across both flanks',
      'International experience and composure',
      'Strong in aerial duels',
      'Reliable passing accuracy',
    ],
    weaknesses: [
      'Limited ceiling as an attacking full-back',
      'Pace is average for the Premier League',
      'Can be caught flat-footed by quick changes of direction',
    ],
    styleOfPlay: 'A versatile, steady full-back who provides reliable performances without taking risks. Demir is the kind of player who maintains a 7/10 consistently — never the best player on the pitch but rarely the worst. His two-footed ability and tactical flexibility make him valuable as a squad depth option across the back line.',
    recommendation: 'monitor',
    fitScore: 77,
    seasonStats: {
      Appearances: 22, Goals: 0, Assists: 3, Minutes: 1760,
      'Pass Accuracy': '87.1%', 'Tackles Won': 35, Interceptions: 19,
      'Prog. Carries/90': 5.6, 'Key Passes/90': 0.9, 'Aerial Duels Won': '54%',
    },
    radarData: [
      { label: 'Speed', value: 68, average: 68 }, { label: 'Passing', value: 76, average: 72 },
      { label: 'Dribbling', value: 60, average: 58 }, { label: 'Physical', value: 75, average: 70 },
      { label: 'Defending', value: 76, average: 74 }, { label: 'Crossing', value: 62, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', age: 22, similarity: 85, image: '/avatars/player-3.png' },
      { playerId: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', age: 23, similarity: 82, image: '/avatars/player-8.png' },
      { playerId: 'p6', name: 'Bálint Varga', club: 'Southport City', age: 22, similarity: 80, image: '/avatars/player-6.png' },
    ],
    transferHistory: [
      { club: 'Coastal FC', date: 'Aug 2024', fee: '€7.00m' },
      { club: 'Galatasaray', date: 'Jul 2020', fee: '€3.50m' },
      { club: 'Bursaspor', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€16.00m', until: 'June 30, 2028', wage: '€48k/week', agent: 'Promoesport' },
  },
  wp4: {
    playerId: 'wp4',
    playerName: 'Ousmane Diallo',
    age: 28,
    nationality: 'Senegal',
    position: 'CF / LW',
    club: 'Inter Azzurra',
    league: 'Serie A',
    image: '/avatars/player-15.png',
    summary: 'Diallo is a clinical finisher with explosive acceleration and intelligent movement in the box. His ability to drift wide and cut inside makes him a dual threat as both a striker and inverted winger. Consistently among the top scorers in Serie A over the past three seasons, his off-the-ball runs are elite-level and he excels at finding pockets of space between centre-backs.',
    strengths: [
      'Elite finishing in the box',
      'Explosive acceleration and pace',
      'Intelligent off-the-ball movement',
      'Press-resistant ball retention',
      'Versatility across the front line',
    ],
    weaknesses: [
      'Aerial presence (limited heading ability)',
      'Defensive contribution in pressing phases',
      'Consistency in big matches away from home',
    ],
    styleOfPlay: 'A mobile, direct forward who thrives on running in behind high defensive lines. Diallo combines raw speed with sharp finishing instincts, making him dangerous in transition. When deployed on the left, he drifts centrally to exploit half-spaces. His movement patterns create overloads and pull defenders out of shape.',
    recommendation: 'sign',
    fitScore: 92,
    seasonStats: {
      Appearances: 30, Goals: 16, Assists: 5, Minutes: 2520,
      'Pass Accuracy': '81.4%', 'Tackles Won': 8, Interceptions: 6,
      'Prog. Carries/90': 4.1, 'Key Passes/90': 1.8, 'Aerial Duels Won': '38%',
    },
    radarData: [
      { label: 'Speed', value: 92, average: 65 }, { label: 'Passing', value: 72, average: 70 },
      { label: 'Dribbling', value: 85, average: 60 }, { label: 'Physical', value: 78, average: 72 },
      { label: 'Defending', value: 32, average: 40 }, { label: 'Crossing', value: 58, average: 55 },
    ],
    similarPlayers: [
      { playerId: 'wp5', name: 'Lars Henriksen', club: 'Northgate United', age: 25, similarity: 88, image: '/avatars/player-16.png' },
      { playerId: 'wp8', name: 'Nicolás Herrera', club: 'AS Roma Rossa', age: 23, similarity: 82, image: '/avatars/player-18.png' },
      { playerId: 'p11', name: 'Kenji Tanaka', club: 'Coastal FC', age: 28, similarity: 79, image: '/avatars/player-11.png' },
    ],
    transferHistory: [
      { club: 'Inter Azzurra', date: 'Jul 2022', fee: '€18.00m' },
      { club: 'FC Dakar', date: 'Jan 2019', fee: '€4.50m' },
      { club: 'Génération Foot', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€45.00m', until: 'June 30, 2027', wage: '€120k/week', agent: 'Stellar Group Africa' },
  },
  wp5: {
    playerId: 'wp5',
    playerName: 'Lars Henriksen',
    age: 25,
    nationality: 'Denmark',
    position: 'CF',
    club: 'Northgate United',
    league: 'Premier League',
    image: '/avatars/player-16.png',
    summary: 'Henriksen is a modern centre-forward who combines physical dominance with technical quality. His hold-up play is among the best in the league, and his ability to bring midfielders into play while also finishing chances makes him a complete striker. Has improved his movement in behind over the past 12 months and is beginning to show consistency at the highest level.',
    strengths: [
      'Elite hold-up play and link-up',
      'Strong aerial presence',
      'Clinical finishing inside the box',
      'Dribbling ability for a striker',
      'Work rate in pressing triggers',
    ],
    weaknesses: [
      'Pace in open-field transitions',
      'Decision-making when isolated on the counter',
      'Left-foot finishing accuracy',
    ],
    styleOfPlay: 'A target striker who excels as a focal point in possession-based systems. Henriksen drops deep to receive, holds defenders off, and plays combination passes before making late runs into the box. His physicality allows him to compete aerially and shield the ball effectively. Best used with pacey wide players who can exploit the space he creates.',
    recommendation: 'monitor',
    fitScore: 85,
    seasonStats: {
      Appearances: 26, Goals: 11, Assists: 7, Minutes: 2210,
      'Pass Accuracy': '78.6%', 'Tackles Won': 12, Interceptions: 4,
      'Prog. Carries/90': 2.8, 'Key Passes/90': 1.2, 'Aerial Duels Won': '68%',
    },
    radarData: [
      { label: 'Speed', value: 62, average: 65 }, { label: 'Passing', value: 74, average: 68 },
      { label: 'Dribbling', value: 78, average: 58 }, { label: 'Physical', value: 88, average: 72 },
      { label: 'Defending', value: 38, average: 40 }, { label: 'Crossing', value: 45, average: 52 },
    ],
    similarPlayers: [
      { playerId: 'wp4', name: 'Ousmane Diallo', club: 'Inter Azzurra', age: 28, similarity: 88, image: '/avatars/player-15.png' },
      { playerId: 'p11', name: 'Kenji Tanaka', club: 'Coastal FC', age: 28, similarity: 83, image: '/avatars/player-11.png' },
      { playerId: 'p12', name: 'Tarık Çelik', club: 'Coastal FC', age: 27, similarity: 78, image: '/avatars/player-12.png' },
    ],
    transferHistory: [
      { club: 'Northgate United', date: 'Aug 2023', fee: '€14.00m' },
      { club: 'FC København', date: 'Jul 2020', fee: '€5.00m' },
      { club: 'Brøndby IF', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€32.00m', until: 'June 30, 2028', wage: '€90k/week', agent: 'Scandinavian Sports Management' },
  },
  wp6: {
    playerId: 'wp6',
    playerName: 'Luca Marchetti',
    age: 26,
    nationality: 'Italy',
    position: 'LB / LWB',
    club: 'Lazio Blu',
    league: 'Serie A',
    image: '/avatars/player-13.png',
    summary: 'Marchetti is an outstanding progressive ball-carrier from left-back, ranking in the 96th percentile for progressive carries among Serie A defenders. His overlapping runs create numerical advantages in the final third and his crossing delivery is consistently dangerous. Defensively solid in one-on-one situations with excellent recovery pace.',
    strengths: [
      'Elite progressive carrying ability',
      'Crossing accuracy from advanced positions',
      'Recovery speed and defensive transitions',
      'Tactical intelligence in positional play',
      'Set piece delivery',
    ],
    weaknesses: [
      'Aerial duels against taller wingers',
      'Tendency to overcommit in attack',
      'Composure under sustained high press',
    ],
    styleOfPlay: 'An attack-minded wing-back who provides width and depth in the final third. Marchetti is at his best when given license to overlap and deliver crosses into the box. His progressive carrying opens up space for midfielders to exploit. Defensively disciplined enough to play in a back four but thrives in a 3-5-2 or 3-4-3 system.',
    recommendation: 'sign',
    fitScore: 88,
    seasonStats: {
      Appearances: 29, Goals: 2, Assists: 8, Minutes: 2465,
      'Pass Accuracy': '86.8%', 'Tackles Won': 42, Interceptions: 22,
      'Prog. Carries/90': 8.4, 'Key Passes/90': 1.9, 'Aerial Duels Won': '45%',
    },
    radarData: [
      { label: 'Speed', value: 88, average: 68 }, { label: 'Passing', value: 82, average: 72 },
      { label: 'Dribbling', value: 79, average: 58 }, { label: 'Physical', value: 74, average: 70 },
      { label: 'Defending', value: 72, average: 74 }, { label: 'Crossing', value: 85, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'p1', name: 'Marco Lindström', club: 'FC Nordhavn', age: 25, similarity: 92, image: '/avatars/player-1.png' },
      { playerId: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', age: 23, similarity: 87, image: '/avatars/player-2.png' },
      { playerId: 'wp7', name: 'Alessandro Conti', club: 'Inter Azzurra', age: 28, similarity: 84, image: '/avatars/player-17.png' },
    ],
    transferHistory: [
      { club: 'Lazio Blu', date: 'Jul 2023', fee: '€12.00m' },
      { club: 'Atalanta', date: 'Jan 2021', fee: '€6.00m' },
      { club: 'Brescia', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€28.00m', until: 'June 30, 2027', wage: '€65k/week', agent: 'GR Sports' },
  },
  wp7: {
    playerId: 'wp7',
    playerName: 'Alessandro Conti',
    age: 28,
    nationality: 'Italy',
    position: 'LWB',
    club: 'Inter Azzurra',
    league: 'Serie A',
    image: '/avatars/player-17.png',
    summary: 'Conti is a veteran wing-back whose tactical intelligence and reading of the game set him apart. His passing range from deep is exceptional and he orchestrates play from the left flank with calm authority. While not the fastest, his positioning and anticipation make him an effective defender. A reliable, high-floor option for any side playing with wing-backs.',
    strengths: [
      'Exceptional passing range and vision',
      'Tactical awareness and positioning',
      'Key pass delivery into the final third',
      'Leadership and communication on the pitch',
      'Consistency across a full season',
    ],
    weaknesses: [
      'Pace against quick wingers',
      'Recovery speed in transition',
      'Injury history (recurring calf issues)',
    ],
    styleOfPlay: 'A cerebral wing-back who controls tempo from the left side. Conti prefers to receive the ball in deeper zones and pick out teammates with precise through-balls rather than bombing forward. His ability to switch play and find runners in behind with diagonal passes makes him a playmaking option from defence.',
    recommendation: 'monitor',
    fitScore: 90,
    seasonStats: {
      Appearances: 22, Goals: 1, Assists: 6, Minutes: 1870,
      'Pass Accuracy': '91.2%', 'Tackles Won': 28, Interceptions: 30,
      'Prog. Carries/90': 5.6, 'Key Passes/90': 3.1, 'Aerial Duels Won': '50%',
    },
    radarData: [
      { label: 'Speed', value: 65, average: 68 }, { label: 'Passing', value: 92, average: 72 },
      { label: 'Dribbling', value: 70, average: 58 }, { label: 'Physical', value: 72, average: 70 },
      { label: 'Defending', value: 78, average: 74 }, { label: 'Crossing', value: 80, average: 65 },
    ],
    similarPlayers: [
      { playerId: 'wp6', name: 'Luca Marchetti', club: 'Lazio Blu', age: 26, similarity: 84, image: '/avatars/player-13.png' },
      { playerId: 'p9', name: 'Stijn de Graaf', club: 'Harton Villa', age: 24, similarity: 81, image: '/avatars/player-9.png' },
      { playerId: 'p7', name: 'Samir Benali', club: 'Midland Rovers', age: 23, similarity: 78, image: '/avatars/player-7.png' },
    ],
    transferHistory: [
      { club: 'Inter Azzurra', date: 'Jul 2021', fee: '€15.00m' },
      { club: 'Fiorentina', date: 'Aug 2018', fee: '€8.00m' },
      { club: 'Empoli', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€22.00m', until: 'June 30, 2026', wage: '€85k/week', agent: 'Base Soccer Agency' },
  },
  wp8: {
    playerId: 'wp8',
    playerName: 'Nicolás Herrera',
    age: 23,
    nationality: 'Argentina',
    position: 'RW / AM',
    club: 'AS Roma Rossa',
    league: 'Serie A',
    image: '/avatars/player-18.png',
    summary: 'Herrera is an electrifying attacking talent who has quickly established himself as one of the most exciting young players in Serie A. His dribbling ability and creativity in the final third are outstanding, and he possesses the rare ability to beat defenders in tight spaces. Still developing his end product, but his shot-creating actions per 90 rank among the top 5% in Italy.',
    strengths: [
      'Exceptional dribbling and close control',
      'Shot-creating actions per 90',
      'Acceleration in tight spaces',
      'Creativity and through-ball delivery',
      'Two-footed finishing ability',
    ],
    weaknesses: [
      'End product consistency (shooting accuracy)',
      'Defensive tracking back',
      'Physical duels against stronger defenders',
    ],
    styleOfPlay: 'A flair-driven winger who cuts inside from the right to create and score. Herrera thrives in one-on-one situations and is most dangerous when given the ball in the half-space with room to drive at defenders. His low centre of gravity and quick feet make him almost impossible to dispossess at full speed. Can also operate as a number 10 in more compact systems.',
    recommendation: 'sign',
    fitScore: 87,
    seasonStats: {
      Appearances: 27, Goals: 8, Assists: 9, Minutes: 2160,
      'Pass Accuracy': '83.1%', 'Tackles Won': 14, Interceptions: 8,
      'Prog. Carries/90': 6.2, 'Key Passes/90': 2.4, 'Aerial Duels Won': '28%',
    },
    radarData: [
      { label: 'Speed', value: 90, average: 68 }, { label: 'Passing', value: 80, average: 70 },
      { label: 'Dribbling', value: 94, average: 60 }, { label: 'Physical', value: 58, average: 68 },
      { label: 'Defending', value: 28, average: 38 }, { label: 'Crossing', value: 72, average: 62 },
    ],
    similarPlayers: [
      { playerId: 'wp4', name: 'Ousmane Diallo', club: 'Inter Azzurra', age: 28, similarity: 82, image: '/avatars/player-15.png' },
      { playerId: 'p4', name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 80, image: '/avatars/player-4.png' },
      { playerId: 'wp11', name: 'Tomás Ferreira', club: 'Vitória Guimarães B', age: 18, similarity: 76, image: '/avatars/player-20.png' },
    ],
    transferHistory: [
      { club: 'AS Roma Rossa', date: 'Jan 2025', fee: '€9.00m' },
      { club: 'Racing Club', date: 'Jul 2022', fee: '€3.00m' },
      { club: 'Argentinos Juniors', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€35.00m', until: 'June 30, 2029', wage: '€55k/week', agent: 'Gestifute South America' },
  },
  wp10: {
    playerId: 'wp10',
    playerName: 'Jakub Nowicki',
    age: 17,
    nationality: 'Poland',
    position: 'CM',
    club: 'Wisła Kraków',
    league: 'Ekstraklasa',
    image: '/avatars/player-19.png',
    summary: 'Nowicki is a prodigiously talented central midfielder who has broken into Wisła Kraków\'s first team at just 17. His vision and passing ability are far beyond his years, and his composure on the ball in tight situations is remarkable for a player of his age. Still physically developing but his technical foundation and football intelligence suggest an extremely high ceiling.',
    strengths: [
      'Exceptional vision and passing range',
      'Composure under pressure',
      'Ball retention in midfield',
      'Progressive passing and carrying',
      'Football intelligence and spatial awareness',
    ],
    weaknesses: [
      'Physical development (still growing)',
      'Defensive intensity and aggression',
      'Stamina over 90 minutes',
    ],
    styleOfPlay: 'A deep-lying playmaker who dictates the tempo of the game from central midfield. Nowicki receives between the lines, turns, and finds forward passes with uncanny regularity. His first touch is immaculate and he uses body feints to create space before threading balls into dangerous areas. Needs a physical partner alongside him to compensate for his developing frame.',
    recommendation: 'monitor',
    fitScore: 71,
    seasonStats: {
      Appearances: 18, Goals: 2, Assists: 4, Minutes: 1120,
      'Pass Accuracy': '90.4%', 'Tackles Won': 16, Interceptions: 14,
      'Prog. Carries/90': 3.2, 'Key Passes/90': 2.8, 'Aerial Duels Won': '32%',
    },
    radarData: [
      { label: 'Speed', value: 58, average: 62 }, { label: 'Passing', value: 88, average: 68 },
      { label: 'Dribbling', value: 76, average: 55 }, { label: 'Physical', value: 48, average: 65 },
      { label: 'Defending', value: 52, average: 60 }, { label: 'Crossing', value: 60, average: 55 },
    ],
    similarPlayers: [
      { playerId: 'wp11', name: 'Tomás Ferreira', club: 'Vitória Guimarães B', age: 18, similarity: 80, image: '/avatars/player-20.png' },
      { playerId: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', age: 19, similarity: 76, image: '/avatars/player-10.png' },
      { playerId: 'p4', name: 'Tiago Noronha', club: 'AS Lumière', age: 24, similarity: 72, image: '/avatars/player-4.png' },
    ],
    transferHistory: [
      { club: 'Wisła Kraków', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€5.00m', until: 'June 30, 2029', wage: '€8k/week', agent: 'Unrepresented' },
  },
  wp11: {
    playerId: 'wp11',
    playerName: 'Tomás Ferreira',
    age: 18,
    nationality: 'Portugal',
    position: 'RW',
    club: 'Vitória Guimarães B',
    league: 'Liga Portugal 2',
    image: '/avatars/player-20.png',
    summary: 'Ferreira is a rapid, direct winger who has caught the attention of several top-flight clubs with his performances for Vitória\'s B team. His ability to beat defenders with pace and skill is already at a high level, and his end product is developing rapidly. At 18, he offers significant upside and could develop into a top-tier wide forward with the right coaching environment.',
    strengths: [
      'Explosive pace and acceleration',
      'One-on-one dribbling success rate',
      'Direct running and ball progression',
      'Confidence and fearlessness on the ball',
      'Improving end product (goals + assists trending up)',
    ],
    weaknesses: [
      'Decision-making in the final third',
      'Defensive awareness and tracking',
      'Consistency across matches',
    ],
    styleOfPlay: 'A touchline-hugging winger who loves to receive the ball in wide areas and take on his full-back directly. Ferreira uses his electric pace to get to the byline and deliver crosses, or cuts inside onto his left foot to shoot. His directness stretches opposition defences and creates space for others. Still learning when to release the ball versus when to carry it.',
    recommendation: 'monitor',
    fitScore: 68,
    seasonStats: {
      Appearances: 22, Goals: 6, Assists: 5, Minutes: 1540,
      'Pass Accuracy': '79.2%', 'Tackles Won': 10, Interceptions: 6,
      'Prog. Carries/90': 5.8, 'Key Passes/90': 1.6, 'Aerial Duels Won': '25%',
    },
    radarData: [
      { label: 'Speed', value: 94, average: 68 }, { label: 'Passing', value: 65, average: 66 },
      { label: 'Dribbling', value: 86, average: 58 }, { label: 'Physical', value: 55, average: 62 },
      { label: 'Defending', value: 25, average: 35 }, { label: 'Crossing', value: 70, average: 58 },
    ],
    similarPlayers: [
      { playerId: 'wp8', name: 'Nicolás Herrera', club: 'AS Roma Rossa', age: 23, similarity: 76, image: '/avatars/player-18.png' },
      { playerId: 'wp10', name: 'Jakub Nowicki', club: 'Wisła Kraków', age: 17, similarity: 72, image: '/avatars/player-19.png' },
      { playerId: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', age: 19, similarity: 70, image: '/avatars/player-10.png' },
    ],
    transferHistory: [
      { club: 'Vitória Guimarães B', date: 'Youth', fee: 'Academy' },
    ],
    contractInfo: { value: '€3.50m', until: 'June 30, 2028', wage: '€5k/week', agent: 'Gestifute' },
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
    image: '/avatars/player-11.png',
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
    image: '/avatars/player-4.png',
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
  {
    id: 'cp3',
    name: 'Marco Lindström',
    club: 'FC Nordhavn',
    position: 'LB / LWB',
    age: 25,
    nationality: 'Sweden',
    image: '/avatars/player-1.png',
    metrics: { 'Goals/90': 0.04, 'Assists/90': 0.17, 'Pass %': 89.2, 'Tackles/90': 2.8, 'Interceptions/90': 1.4, 'xG/90': 0.12, 'Key Passes/90': 1.4, 'Aerial Won %': 42.0, 'Dribbles/90': 3.4, 'Prog. Carries/90': 8.2 },
    radarData: [
      { label: 'Shooting', value: 38 },
      { label: 'Passing', value: 78 },
      { label: 'Dribbling', value: 82 },
      { label: 'Physical', value: 71 },
      { label: 'Defending', value: 68 },
      { label: 'Speed', value: 95 },
    ],
  },
  {
    id: 'cp4',
    name: 'Enzo Valenti',
    club: 'Crescent Athletic',
    position: 'LB / LM',
    age: 23,
    nationality: 'Italy',
    image: '/avatars/player-2.png',
    metrics: { 'Goals/90': 0.04, 'Assists/90': 0.22, 'Pass %': 85.1, 'Tackles/90': 3.1, 'Interceptions/90': 1.6, 'xG/90': 0.08, 'Key Passes/90': 1.6, 'Aerial Won %': 52.4, 'Dribbles/90': 2.2, 'Prog. Carries/90': 6.7 },
    radarData: [
      { label: 'Shooting', value: 32 },
      { label: 'Passing', value: 82 },
      { label: 'Dribbling', value: 68 },
      { label: 'Physical', value: 78 },
      { label: 'Defending', value: 80 },
      { label: 'Speed', value: 82 },
    ],
  },
  {
    id: 'cp5',
    name: 'Dani Cortez',
    club: 'Atlético Ronda',
    position: 'LB / RB',
    age: 22,
    nationality: 'Spain',
    image: '/avatars/player-3.png',
    metrics: { 'Goals/90': 0.02, 'Assists/90': 0.14, 'Pass %': 87.6, 'Tackles/90': 2.6, 'Interceptions/90': 2.1, 'xG/90': 0.05, 'Key Passes/90': 1.1, 'Aerial Won %': 55.8, 'Dribbles/90': 1.9, 'Prog. Carries/90': 7.1 },
    radarData: [
      { label: 'Shooting', value: 28 },
      { label: 'Passing', value: 85 },
      { label: 'Dribbling', value: 64 },
      { label: 'Physical', value: 74 },
      { label: 'Defending', value: 82 },
      { label: 'Speed', value: 78 },
    ],
  },
  {
    id: 'cp6',
    name: 'Ousmane Diallo',
    club: 'Inter Azzurra',
    position: 'CF / LW',
    age: 28,
    nationality: 'Senegal',
    image: '/avatars/player-15.png',
    metrics: { 'Goals/90': 0.57, 'Assists/90': 0.18, 'Pass %': 81.4, 'Tackles/90': 0.6, 'Interceptions/90': 0.2, 'xG/90': 0.52, 'Key Passes/90': 1.4, 'Aerial Won %': 38.0, 'Dribbles/90': 2.8, 'Prog. Carries/90': 4.1 },
    radarData: [
      { label: 'Shooting', value: 88 },
      { label: 'Passing', value: 65 },
      { label: 'Dribbling', value: 82 },
      { label: 'Physical', value: 78 },
      { label: 'Defending', value: 32 },
      { label: 'Speed', value: 92 },
    ],
  },
  {
    id: 'cp7',
    name: 'Samir Benali',
    club: 'Midland Rovers',
    position: 'LB / LWB',
    age: 23,
    nationality: 'Algeria',
    image: '/avatars/player-7.png',
    metrics: { 'Goals/90': 0.03, 'Assists/90': 0.15, 'Pass %': 83.7, 'Tackles/90': 2.4, 'Interceptions/90': 1.2, 'xG/90': 0.07, 'Key Passes/90': 1.3, 'Aerial Won %': 48.6, 'Dribbles/90': 2.3, 'Prog. Carries/90': 6.2 },
    radarData: [
      { label: 'Shooting', value: 30 },
      { label: 'Passing', value: 76 },
      { label: 'Dribbling', value: 72 },
      { label: 'Physical', value: 80 },
      { label: 'Defending', value: 76 },
      { label: 'Speed', value: 84 },
    ],
  },
  {
    id: 'cp8',
    name: 'Nicolás Herrera',
    club: 'AS Roma Rossa',
    position: 'RW / AM',
    age: 23,
    nationality: 'Argentina',
    image: '/avatars/player-18.png',
    metrics: { 'Goals/90': 0.33, 'Assists/90': 0.38, 'Pass %': 83.1, 'Tackles/90': 0.8, 'Interceptions/90': 0.5, 'xG/90': 0.28, 'Key Passes/90': 2.4, 'Aerial Won %': 28.0, 'Dribbles/90': 4.8, 'Prog. Carries/90': 6.2 },
    radarData: [
      { label: 'Shooting', value: 68 },
      { label: 'Passing', value: 80 },
      { label: 'Dribbling', value: 94 },
      { label: 'Physical', value: 58 },
      { label: 'Defending', value: 28 },
      { label: 'Speed', value: 90 },
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
      { id: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', position: 'LB/LM', age: 23, nationality: 'Italy', image: '/avatars/player-2.png', keyMetric: { value: '6.7', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-02-15', scoutScore: 88 },
      { id: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', position: 'LB/RB', age: 22, nationality: 'Spain', image: '/avatars/player-3.png', keyMetric: { value: '87.6%', label: 'Pass Accuracy' }, alertStatus: 'form_change', addedDate: '2026-02-18', scoutScore: 76 },
      { id: 'p6', name: 'Bálint Varga', club: 'Southport City', position: 'LB', age: 22, nationality: 'Hungary', image: '/avatars/player-6.png', keyMetric: { value: '5.8', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-03-01', scoutScore: 79 },
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
    players: [
      { id: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', position: 'LB', age: 19, nationality: 'Argentina', image: '/avatars/player-10.png', keyMetric: { value: '3.8', label: 'Prog. Carries/90' }, alertStatus: 'form_change', addedDate: '2026-03-10', scoutScore: 62 },
      { id: 'wp10', name: 'Jakub Nowicki', club: 'Wisła Kraków', position: 'CM', age: 17, nationality: 'Poland', image: '/avatars/player-19.png', keyMetric: { value: '2.8', label: 'Key Passes/90' }, alertStatus: 'stable', addedDate: '2026-02-28', scoutScore: 71 },
      { id: 'wp11', name: 'Tomás Ferreira', club: 'Vitória Guimarães B', position: 'RW', age: 18, nationality: 'Portugal', image: '/avatars/player-20.png', keyMetric: { value: '4.2', label: 'Succ. Dribbles' }, alertStatus: 'stable', addedDate: '2026-02-20', scoutScore: 68 },
    ],
  },
  {
    id: 'w5',
    name: 'Midfielder Replacements',
    description: 'Potential replacements for departing midfielders',
    playerCount: 6,
    lastUpdated: '3d ago',
    alertCount: 0,
    players: [
      { id: 'p7', name: 'Samir Benali', club: 'Midland Rovers', position: 'LB/LWB', age: 23, nationality: 'Algeria', image: '/avatars/player-7.png', keyMetric: { value: '6.2', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-01-15', scoutScore: 85 },
      { id: 'p9', name: 'Stijn de Graaf', club: 'Harton Villa', position: 'LB/LWB', age: 24, nationality: 'Netherlands', image: '/avatars/player-9.png', keyMetric: { value: '6.9', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-01-20', scoutScore: 81 },
    ],
  },
  {
    id: 'w6',
    name: 'Budget Options <€5M',
    description: 'High-value targets within limited transfer budget',
    playerCount: 9,
    lastUpdated: '1w ago',
    alertCount: 4,
    players: [
      { id: 'p5', name: 'Rémi Blanchard', club: 'Olympique Azur', position: 'LB/LM', age: 23, nationality: 'France', image: '/avatars/player-5.png', keyMetric: { value: '4.3', label: 'Prog. Carries/90' }, alertStatus: 'price_change', addedDate: '2026-02-05', scoutScore: 54 },
      { id: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', position: 'LB', age: 19, nationality: 'Argentina', image: '/avatars/player-10.png', keyMetric: { value: '3.8', label: 'Prog. Carries/90' }, alertStatus: 'price_change', addedDate: '2026-03-01', scoutScore: 62 },
      { id: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', position: 'LB', age: 23, nationality: 'Spain', image: '/avatars/player-8.png', keyMetric: { value: '5.4', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-02-12', scoutScore: 73 },
    ],
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

// ─── Squad Types & Data ────────────────────────────────────────────

export type SquadPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST'

export const positionLabels: Record<SquadPosition, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre-Back',
  LB: 'Left-Back',
  RB: 'Right-Back',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  ST: 'Striker',
}

export interface SquadPlayer {
  id: string
  name: string
  age: number
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

export interface FormationSlot {
  position: SquadPosition
  label: string
  x: number
  y: number
}

export type FormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1'

export const formations: Record<FormationType, FormationSlot[]> = {
  '4-3-3': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'CM', label: 'CM', x: 30, y: 48 },
    { position: 'CDM', label: 'CDM', x: 50, y: 40 },
    { position: 'CM', label: 'CM', x: 70, y: 48 },
    { position: 'LW', label: 'LW', x: 18, y: 72 },
    { position: 'ST', label: 'ST', x: 50, y: 78 },
    { position: 'RW', label: 'RW', x: 82, y: 72 },
  ],
  '4-4-2': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'LW', label: 'LM', x: 15, y: 50 },
    { position: 'CM', label: 'CM', x: 38, y: 48 },
    { position: 'CM', label: 'CM', x: 62, y: 48 },
    { position: 'RW', label: 'RM', x: 85, y: 50 },
    { position: 'ST', label: 'ST', x: 38, y: 78 },
    { position: 'ST', label: 'ST', x: 62, y: 78 },
  ],
  '3-5-2': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'CB', label: 'CB', x: 30, y: 22 },
    { position: 'CB', label: 'CB', x: 50, y: 20 },
    { position: 'CB', label: 'CB', x: 70, y: 22 },
    { position: 'LB', label: 'LWB', x: 12, y: 45 },
    { position: 'CDM', label: 'CDM', x: 50, y: 40 },
    { position: 'CM', label: 'CM', x: 35, y: 52 },
    { position: 'CM', label: 'CM', x: 65, y: 52 },
    { position: 'RB', label: 'RWB', x: 88, y: 45 },
    { position: 'ST', label: 'ST', x: 38, y: 78 },
    { position: 'ST', label: 'ST', x: 62, y: 78 },
  ],
  '4-2-3-1': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'CDM', label: 'CDM', x: 38, y: 42 },
    { position: 'CDM', label: 'CDM', x: 62, y: 42 },
    { position: 'LW', label: 'LAM', x: 22, y: 62 },
    { position: 'CAM', label: 'CAM', x: 50, y: 60 },
    { position: 'RW', label: 'RAM', x: 78, y: 62 },
    { position: 'ST', label: 'ST', x: 50, y: 80 },
  ],
}

const radar = (spd: number, pas: number, dri: number, phy: number, def: number, cro: number) => [
  { label: 'Speed', value: spd, average: 65 },
  { label: 'Passing', value: pas, average: 62 },
  { label: 'Dribbling', value: dri, average: 58 },
  { label: 'Physical', value: phy, average: 66 },
  { label: 'Defending', value: def, average: 60 },
  { label: 'Crossing', value: cro, average: 55 },
]

export const squadPlayers: SquadPlayer[] = [
  // ── Goalkeepers ──
  { id: 'sq1', name: 'Frederik Holm', age: 28, nationality: 'Denmark', position: 'GK', shirtNumber: 1, contractUntil: '2028-06-30', weeklyWage: '€45k', marketValue: '€8.00m', status: 'fit', overallRating: 78, stats: { 'Save %': 74, 'Clean Sheets': 12, 'Pass %': 81, 'xG Prevented': 4.2 }, radarData: radar(45, 68, 30, 80, 20, 25) },
  { id: 'sq2', name: 'Oskar Dahl', age: 21, nationality: 'Denmark', position: 'GK', shirtNumber: 13, contractUntil: '2029-06-30', weeklyWage: '€8k', marketValue: '€1.50m', status: 'fit', overallRating: 62, stats: { 'Save %': 68, 'Clean Sheets': 3, 'Pass %': 75, 'xG Prevented': 1.1 }, radarData: radar(48, 60, 28, 72, 18, 22) },

  // ── Centre-Backs ──
  { id: 'sq3', name: 'Henrik Madsen', age: 34, nationality: 'Denmark', position: 'CB', shirtNumber: 4, contractUntil: '2027-06-30', weeklyWage: '€55k', marketValue: '€3.50m', status: 'fit', overallRating: 74, stats: { 'Tackles/90': 3.8, 'Aerial %': 78, 'Pass %': 85, 'Interceptions': 2.4 }, radarData: radar(48, 72, 35, 82, 85, 30) },
  { id: 'sq4', name: 'Tomás Ferreira', age: 27, nationality: 'Portugal', position: 'CB', shirtNumber: 5, contractUntil: '2028-06-30', weeklyWage: '€65k', marketValue: '€14.00m', status: 'fit', overallRating: 81, stats: { 'Tackles/90': 4.1, 'Aerial %': 74, 'Pass %': 89, 'Interceptions': 2.8 }, radarData: radar(62, 78, 45, 80, 82, 35) },
  { id: 'sq5', name: 'Emil Björk', age: 20, nationality: 'Sweden', position: 'CB', altPositions: ['CDM'], shirtNumber: 24, contractUntil: '2029-06-30', weeklyWage: '€12k', marketValue: '€3.00m', status: 'fit', overallRating: 65, stats: { 'Tackles/90': 3.2, 'Aerial %': 68, 'Pass %': 82, 'Interceptions': 1.9 }, radarData: radar(65, 70, 42, 74, 72, 28) },

  // ── Left-Back (CRITICAL GAP — only 1 player, aging, contract expiring) ──
  { id: 'sq6', name: 'Jonas Eriksen', age: 30, nationality: 'Denmark', position: 'LB', shirtNumber: 3, contractUntil: '2027-01-31', weeklyWage: '€40k', marketValue: '€4.00m', status: 'fit', overallRating: 70, stats: { 'xG/90': 0.05, 'Prog. Carries': 4.2, 'Crosses/90': 3.8, 'Tackles/90': 2.9 }, radarData: radar(68, 65, 55, 70, 72, 74) },

  // ── Right-Backs ──
  { id: 'sq7', name: 'Mikkel Andersen', age: 26, nationality: 'Denmark', position: 'RB', shirtNumber: 2, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€10.00m', status: 'fit', overallRating: 77, stats: { 'xG/90': 0.08, 'Prog. Carries': 5.1, 'Crosses/90': 4.5, 'Tackles/90': 3.2 }, radarData: radar(78, 70, 62, 72, 74, 80) },
  { id: 'sq8', name: 'Lucas Vidal', age: 22, nationality: 'Spain', position: 'RB', altPositions: ['RW'], shirtNumber: 22, contractUntil: '2029-06-30', weeklyWage: '€15k', marketValue: '€4.50m', status: 'fit', overallRating: 68, stats: { 'xG/90': 0.06, 'Prog. Carries': 4.8, 'Crosses/90': 3.9, 'Tackles/90': 2.5 }, radarData: radar(82, 64, 65, 68, 66, 72) },

  // ── Defensive Midfielders ──
  { id: 'sq9', name: 'Rasmus Kjær', age: 29, nationality: 'Denmark', position: 'CDM', shirtNumber: 6, contractUntil: '2028-06-30', weeklyWage: '€60k', marketValue: '€12.00m', status: 'fit', overallRating: 79, stats: { 'Tackles/90': 4.5, 'Pass %': 91, 'Prog. Carries': 3.2, 'Interceptions': 3.1 }, radarData: radar(58, 82, 52, 78, 80, 40) },
  { id: 'sq10', name: 'Yuki Tanaka', age: 23, nationality: 'Japan', position: 'CDM', altPositions: ['CM'], shirtNumber: 18, contractUntil: '2029-06-30', weeklyWage: '€20k', marketValue: '€6.00m', status: 'fit', overallRating: 72, stats: { 'Tackles/90': 3.8, 'Pass %': 88, 'Prog. Carries': 4.0, 'Interceptions': 2.6 }, radarData: radar(64, 76, 58, 70, 74, 38) },

  // ── Central Midfielders ──
  { id: 'sq11', name: 'Simon Larsen', age: 26, nationality: 'Denmark', position: 'CM', shirtNumber: 8, contractUntil: '2028-06-30', weeklyWage: '€55k', marketValue: '€11.00m', status: 'fit', overallRating: 80, stats: { 'xG/90': 0.15, 'Pass %': 90, 'Prog. Carries': 5.8, 'Key Passes/90': 2.4 }, radarData: radar(68, 85, 72, 70, 62, 55) },
  { id: 'sq12', name: 'Marco Basile', age: 24, nationality: 'Italy', position: 'CM', altPositions: ['CAM'], shirtNumber: 10, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€13.00m', status: 'fit', overallRating: 78, stats: { 'xG/90': 0.22, 'Pass %': 87, 'Prog. Carries': 6.2, 'Key Passes/90': 2.8 }, radarData: radar(70, 82, 78, 65, 55, 60) },
  { id: 'sq13', name: 'Noah Vestergaard', age: 19, nationality: 'Denmark', position: 'CM', shirtNumber: 30, contractUntil: '2030-06-30', weeklyWage: '€6k', marketValue: '€2.00m', status: 'fit', overallRating: 60, stats: { 'xG/90': 0.08, 'Pass %': 83, 'Prog. Carries': 3.5, 'Key Passes/90': 1.2 }, radarData: radar(72, 68, 64, 58, 50, 42) },

  // ── Attacking Midfielder (HIGH GAP — only 1 player) ──
  { id: 'sq14', name: 'Liam O\'Connor', age: 25, nationality: 'Ireland', position: 'CAM', shirtNumber: 7, contractUntil: '2028-06-30', weeklyWage: '€48k', marketValue: '€9.50m', status: 'fit', overallRating: 76, stats: { 'xG/90': 0.28, 'Pass %': 84, 'Key Passes/90': 3.2, 'Succ. Dribbles': 2.8 }, radarData: radar(74, 78, 80, 62, 38, 65) },

  // ── Left Wingers ──
  { id: 'sq15', name: 'André Silva', age: 27, nationality: 'Brazil', position: 'LW', shirtNumber: 11, contractUntil: '2027-06-30', weeklyWage: '€70k', marketValue: '€16.00m', status: 'fit', overallRating: 82, stats: { 'xG/90': 0.35, 'Succ. Dribbles': 3.8, 'Prog. Carries': 7.2, 'Key Passes/90': 2.1 }, radarData: radar(88, 72, 86, 58, 30, 68) },
  { id: 'sq16', name: 'Kasper Munk', age: 21, nationality: 'Denmark', position: 'LW', altPositions: ['ST'], shirtNumber: 27, contractUntil: '2029-06-30', weeklyWage: '€10k', marketValue: '€3.50m', status: 'injured', overallRating: 66, stats: { 'xG/90': 0.20, 'Succ. Dribbles': 2.5, 'Prog. Carries': 5.0, 'Key Passes/90': 1.4 }, radarData: radar(84, 60, 72, 55, 25, 58) },

  // ── Right Wingers (aging starter) ──
  { id: 'sq17', name: 'Viktor Sørensen', age: 33, nationality: 'Denmark', position: 'RW', shirtNumber: 9, contractUntil: '2027-06-30', weeklyWage: '€52k', marketValue: '€4.50m', status: 'fit', overallRating: 71, stats: { 'xG/90': 0.25, 'Succ. Dribbles': 2.0, 'Prog. Carries': 4.5, 'Key Passes/90': 1.8 }, radarData: radar(62, 74, 65, 68, 35, 70) },
  { id: 'sq18', name: 'Amir Haddad', age: 20, nationality: 'Morocco', position: 'RW', altPositions: ['LW'], shirtNumber: 28, contractUntil: '2030-06-30', weeklyWage: '€8k', marketValue: '€2.50m', status: 'fit', overallRating: 63, stats: { 'xG/90': 0.18, 'Succ. Dribbles': 3.2, 'Prog. Carries': 5.5, 'Key Passes/90': 1.0 }, radarData: radar(86, 55, 75, 52, 22, 50) },

  // ── Strikers ──
  { id: 'sq19', name: 'Magnus Thøgersen', age: 28, nationality: 'Denmark', position: 'ST', shirtNumber: 14, contractUntil: '2028-06-30', weeklyWage: '€75k', marketValue: '€18.00m', status: 'fit', overallRating: 83, stats: { 'xG/90': 0.52, 'Goals/90': 0.48, 'Aerial %': 72, 'Shot Conv. %': 22 }, radarData: radar(76, 62, 70, 82, 28, 35) },
  { id: 'sq20', name: 'Pierre Dubois', age: 24, nationality: 'France', position: 'ST', altPositions: ['LW'], shirtNumber: 17, contractUntil: '2028-06-30', weeklyWage: '€42k', marketValue: '€10.00m', status: 'fit', overallRating: 75, stats: { 'xG/90': 0.40, 'Goals/90': 0.35, 'Aerial %': 58, 'Shot Conv. %': 18 }, radarData: radar(82, 58, 74, 68, 22, 30) },
  { id: 'sq21', name: 'Oliver Winther', age: 19, nationality: 'Denmark', position: 'ST', shirtNumber: 32, contractUntil: '2030-06-30', weeklyWage: '€5k', marketValue: '€1.80m', status: 'fit', overallRating: 55, stats: { 'xG/90': 0.22, 'Goals/90': 0.15, 'Aerial %': 52, 'Shot Conv. %': 10 }, radarData: radar(78, 50, 62, 55, 18, 25) },

  // ── Extra squad players ──
  { id: 'sq22', name: 'Jakob Poulsen', age: 31, nationality: 'Denmark', position: 'CB', altPositions: ['CDM'], shirtNumber: 15, contractUntil: '2027-06-30', weeklyWage: '€35k', marketValue: '€2.80m', status: 'injured', overallRating: 68, stats: { 'Tackles/90': 3.5, 'Aerial %': 75, 'Pass %': 83, 'Interceptions': 2.2 }, radarData: radar(50, 70, 38, 78, 78, 28) },
  { id: 'sq23', name: 'William Ravn', age: 22, nationality: 'Denmark', position: 'CM', altPositions: ['CDM', 'CAM'], shirtNumber: 20, contractUntil: '2029-06-30', weeklyWage: '€14k', marketValue: '€4.00m', status: 'on_loan', overallRating: 67, stats: { 'xG/90': 0.12, 'Pass %': 85, 'Prog. Carries': 4.2, 'Key Passes/90': 1.8 }, radarData: radar(70, 72, 68, 62, 58, 48) },
]
