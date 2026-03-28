// ScoutCopilot — Filter option constants

export const positionOptionKeys = [
  'filterOptions.allPositions',
  'filterOptions.goalkeeper',
  'filterOptions.centreBack',
  'filterOptions.fullBack',
  'filterOptions.defensiveMidfielder',
  'filterOptions.centralMidfielder',
  'filterOptions.attackingMidfielder',
  'filterOptions.winger',
  'filterOptions.centreForward',
]

export const leagueOptionKeys = [
  'filterOptions.allLeagues',
  'filterOptions.premierLeague',
  'filterOptions.laLiga',
  'filterOptions.bundesliga',
  'filterOptions.serieA',
  'filterOptions.ligue1',
  'filterOptions.eredivisie',
  'filterOptions.primeiraLiga',
  'filterOptions.championship',
  'filterOptions.mls',
]

export const ageRangeOptionKeys = [
  'filterOptions.allAges',
  '16 - 19',
  '20 - 23',
  '24 - 27',
  '28 - 31',
  '32+',
]

export const footOptionKeys = [
  'filterOptions.eitherFoot',
  'filterOptions.left',
  'filterOptions.right',
  'filterOptions.both',
]

// Backward-compatible exports (resolved at render time with t())
export const positionOptions = positionOptionKeys
export const leagueOptions = leagueOptionKeys
export const ageRangeOptions = ageRangeOptionKeys
export const footOptions = footOptionKeys
