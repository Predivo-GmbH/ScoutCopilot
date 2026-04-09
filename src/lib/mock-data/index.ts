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

export {
  positionOptions,
  leagueOptions,
  ageRangeOptions,
  footOptions,
} from './filters'
export {
  positionLabels,
  formations,
} from './squad'
