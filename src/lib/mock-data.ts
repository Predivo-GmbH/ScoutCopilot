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
