// ScoutCopilot — Mock data (barrel re-export)
// CQ-001: Original 1642-line file split into src/lib/mock-data/ domain modules.
// This file re-exports everything for backward compatibility.

export {
  // Types
  type DashboardStatItem,
  type DashboardStats,
  type RecentSearch,
  type WatchlistAlert,
  type MockPlayer,
  type MockPlayerReport,
  type MockWatchlist,
  type MockWatchlistPlayer,
  type MockComparisonPlayer,
  type SquadPosition,
  type SquadPlayer,
  type PositionGap,
  type MockSquad,
  type FormationSlot,
  type FormationType,
  // Data
  dashboardStats,
  recentSearches,
  watchlistAlerts,
  searchResults,
  playerReports,
  comparisonPlayers,
  watchlists,
  positionOptionKeys,
  leagueOptionKeys,
  ageRangeOptionKeys,
  footOptionKeys,
  positionOptions,
  leagueOptions,
  ageRangeOptions,
  footOptions,
  positionLabels,
  formations,
  mockSquads,
  squadPlayers,
  getSquadPlayerReport,
} from './mock-data/index'
