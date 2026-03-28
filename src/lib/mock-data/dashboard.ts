// ScoutCopilot — Mock dashboard data

import type { DashboardStats, RecentSearch, WatchlistAlert } from './types'

export const dashboardStats: DashboardStats = {
  totalSearches: 12847,
  reportsGenerated: 156,
  playersTracked: 24,
  apiCallsThisMonth: 0,
  items: [
    { value: 12847, label: 'mockData.playersAnalyzed', change: 18, period: 'mockData.vsLastMonth' },
    { value: 24, label: 'mockData.activeWatchlists', change: 0, period: '', badge: 'mockData.threeAlerts' },
    { value: 156, label: 'mockData.playersScouted', change: 0, period: 'mockData.thisWeek', badge: 'mockData.plus12ThisWeek' },
    { value: '0.6s', label: 'mockData.avgQueryTime', change: 0, period: '' },
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
  { id: '1', playerId: 'wp6', playerName: 'Luca Marchetti', club: 'Lazio Blu', change: 'Progressive Carries +15%', changeType: 'positive', timeAgo: '2m ago', imageUrl: '/avatars/player-13.webp' },
  { id: '2', playerId: 'wp12', playerName: 'K. Papadopoulos', club: 'Olympique Azur', change: 'Injury Status: Doubtful', changeType: 'warning', timeAgo: '14m ago', imageUrl: '/avatars/player-14.webp' },
  { id: '3', playerId: 'wp4', playerName: 'Ousmane Diallo', club: 'Inter Azzurra', change: 'xG Chain Threshold Reached', changeType: 'positive', timeAgo: '1h ago', imageUrl: '/avatars/player-15.webp' },
  { id: '4', playerId: 'wp5', playerName: 'Lars Henriksen', club: 'Northgate United', change: 'Key Passes Peak Performance', changeType: 'positive', timeAgo: '3h ago', imageUrl: '/avatars/player-16.webp' },
  { id: '5', playerId: 'wp7', playerName: 'Alessandro Conti', club: 'Inter Azzurra', change: 'Returned to Full Training', changeType: 'positive', timeAgo: '4h ago', imageUrl: '/avatars/player-17.webp' },
  { id: '6', playerId: 'wp8', playerName: 'Nicolás Herrera', club: 'AS Roma Rossa', change: 'Market Value ↑ €2.5m → €3.8m', changeType: 'positive', timeAgo: '5h ago', imageUrl: '/avatars/player-18.webp' },
  { id: '7', playerId: 'p2', playerName: 'Enzo Valenti', club: 'Crescent Athletic', change: 'Contract Negotiations Stalled', changeType: 'warning', timeAgo: '6h ago', imageUrl: '/avatars/player-2.webp' },
  { id: '8', playerId: 'p3', playerName: 'Dani Cortez', club: 'Atlético Ronda', change: 'Started 3 Consecutive Matches', changeType: 'positive', timeAgo: '8h ago', imageUrl: '/avatars/player-3.webp' },
  { id: '9', playerId: 'wp10', playerName: 'Jakub Nowicki', club: 'Wisła Kraków', change: 'Called Up to U21 National Team', changeType: 'positive', timeAgo: '10h ago', imageUrl: '/avatars/player-19.webp' },
  { id: '10', playerId: 'wp11', playerName: 'Tomás Ferreira', club: 'Vitória Guimarães B', change: 'Hamstring Strain — 2 Weeks Out', changeType: 'warning', timeAgo: '12h ago', imageUrl: '/avatars/player-20.webp' },
  { id: '11', playerId: 'p6', playerName: 'Bálint Varga', club: 'Southport City', change: 'Tackles Won/90 Top 5% in League', changeType: 'positive', timeAgo: '14h ago', imageUrl: '/avatars/player-6.webp' },
  { id: '12', playerId: 'p10', playerName: 'Mateo Rivas', club: 'Miami Coast FC', change: 'Transfer Listed by Club', changeType: 'warning', timeAgo: '16h ago', imageUrl: '/avatars/player-10.webp' },
  { id: '13', playerId: 'wp4', playerName: 'Ousmane Diallo', club: 'Inter Azzurra', change: 'Scored Brace in Derby Match', changeType: 'positive', timeAgo: '1d ago' },
  { id: '14', playerId: 'wp5', playerName: 'Lars Henriksen', club: 'Northgate United', change: 'Assist Record — 3 in Last Match', changeType: 'positive', timeAgo: '1d ago' },
  { id: '15', playerId: 'wp6', playerName: 'Luca Marchetti', club: 'Lazio Blu', change: 'Rumoured Interest from Premier League', changeType: 'neutral', timeAgo: '2d ago', imageUrl: '/avatars/player-13.webp' },
  { id: '16', playerId: 'wp8', playerName: 'Nicolás Herrera', club: 'AS Roma Rossa', change: 'Yellow Card Accumulation — 1 Away from Ban', changeType: 'warning', timeAgo: '2d ago', imageUrl: '/avatars/player-18.webp' },
  { id: '17', playerId: 'p2', playerName: 'Enzo Valenti', club: 'Crescent Athletic', change: 'Prog. Carries/90 Season High', changeType: 'positive', timeAgo: '3d ago', imageUrl: '/avatars/player-2.webp' },
  { id: '18', playerId: 'wp12', playerName: 'K. Papadopoulos', club: 'Olympique Azur', change: 'Clean Sheet — 4th in 5 Games', changeType: 'positive', timeAgo: '3d ago', imageUrl: '/avatars/player-14.webp' },
  { id: '19', playerId: 'wp7', playerName: 'Alessandro Conti', club: 'Inter Azzurra', change: 'Contract Extension Offer Reported', changeType: 'neutral', timeAgo: '4d ago', imageUrl: '/avatars/player-17.webp' },
  { id: '20', playerId: 'p3', playerName: 'Dani Cortez', club: 'Atlético Ronda', change: 'Pass Accuracy Dropped to 82%', changeType: 'warning', timeAgo: '5d ago', imageUrl: '/avatars/player-3.webp' },
]
