// ScoutCopilot — Mock data barrel export
// CQ-001: Split from single 1642-line file into domain modules

export type {
  DashboardStatItem,
  DashboardStats,
  RecentSearch,
  WatchlistAlert,
  MockPlayer,
  MockPlayerReport,
  MockWatchlist,
  MockWatchlistPlayer,
  MockComparisonPlayer,
  SquadPosition,
  SquadPlayer,
  PositionGap,
  MockSquad,
  FormationSlot,
  FormationType,
} from './types'

export { dashboardStats, recentSearches, watchlistAlerts } from './dashboard'
export { searchResults } from './search'
export { playerReports } from './reports'
export { comparisonPlayers } from './comparison'
export { watchlists } from './watchlists'
export {
  positionOptionKeys,
  leagueOptionKeys,
  ageRangeOptionKeys,
  footOptionKeys,
  positionOptions,
  leagueOptions,
  ageRangeOptions,
  footOptions,
} from './filters'
export {
  positionLabels,
  formations,
  mockSquads,
  squadPlayers,
  getSquadPlayerReport,
} from './squad'
