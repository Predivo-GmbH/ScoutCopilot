// Mock player data for development without real API keys
// Activate with MOCK_DATA=true environment variable

export interface MockPlayer {
  player_external_id: string;
  player_name: string;
  age: number;
  birth_date: string;
  nationality: string;
  position: string;
  positions: string[];
  foot: "left" | "right" | "both";
  height: number;
  weight: number;
  team: string;
  league: string;
  market_value: number;
  contract_expiry: string;
  stats: {
    matches_played: number;
    minutes_played: number;
    goals: number;
    assists: number;
    xG: number;
    xA: number;
    key_passes: number;
    passes_completed: number;
    pass_completion: number;
    progressive_passes: number;
    progressive_carries: number;
    through_balls: number;
    long_balls: number;
    crosses: number;
    tackles: number;
    interceptions: number;
    clearances: number;
    blocks: number;
    aerial_duels: number;
    aerial_duel_win_rate: number;
    ground_duels: number;
    ground_duel_win_rate: number;
    dribbles: number;
    dribble_success_rate: number;
    pressures: number;
    shot_creating_actions: number;
    goal_creating_actions: number;
    npxG: number;
    yellow_cards: number;
    red_cards: number;
  };
}

export const MOCK_PLAYERS: MockPlayer[] = [
  // ── CENTER-BACKS ──────────────────────────────────────────────
  {
    player_external_id: "mock-cb-001",
    player_name: "Lucas Mbemba",
    age: 22,
    birth_date: "2004-03-15",
    nationality: "France",
    position: "CB",
    positions: ["CB"],
    foot: "left",
    height: 191,
    weight: 84,
    team: "SM Caen",
    league: "Ligue 2",
    market_value: 1800000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 28, minutes_played: 2380, goals: 2, assists: 1, xG: 1.8, xA: 0.9,
      key_passes: 12, passes_completed: 1420, pass_completion: 88.2, progressive_passes: 98,
      progressive_carries: 34, through_balls: 3, long_balls: 156, crosses: 2,
      tackles: 62, interceptions: 48, clearances: 112, blocks: 18,
      aerial_duels: 148, aerial_duel_win_rate: 72.3, ground_duels: 86, ground_duel_win_rate: 61.2,
      dribbles: 12, dribble_success_rate: 66.7, pressures: 198,
      shot_creating_actions: 8, goal_creating_actions: 2, npxG: 1.4,
      yellow_cards: 5, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-cb-002",
    player_name: "Daan van der Berg",
    age: 23,
    birth_date: "2003-07-22",
    nationality: "Netherlands",
    position: "CB",
    positions: ["CB"],
    foot: "right",
    height: 188,
    weight: 82,
    team: "NAC Breda",
    league: "Eredivisie",
    market_value: 2200000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 30, minutes_played: 2610, goals: 3, assists: 2, xG: 2.4, xA: 1.6,
      key_passes: 18, passes_completed: 1680, pass_completion: 91.4, progressive_passes: 134,
      progressive_carries: 52, through_balls: 7, long_balls: 178, crosses: 1,
      tackles: 54, interceptions: 56, clearances: 98, blocks: 22,
      aerial_duels: 132, aerial_duel_win_rate: 68.9, ground_duels: 94, ground_duel_win_rate: 64.8,
      dribbles: 22, dribble_success_rate: 72.7, pressures: 224,
      shot_creating_actions: 14, goal_creating_actions: 3, npxG: 1.9,
      yellow_cards: 4, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-cb-003",
    player_name: "Moritz Kessler",
    age: 21,
    birth_date: "2005-01-10",
    nationality: "Germany",
    position: "CB",
    positions: ["CB", "CDM"],
    foot: "right",
    height: 186,
    weight: 79,
    team: "Greuther Furth",
    league: "2. Bundesliga",
    market_value: 1500000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 26, minutes_played: 2140, goals: 1, assists: 3, xG: 1.2, xA: 2.8,
      key_passes: 24, passes_completed: 1560, pass_completion: 92.1, progressive_passes: 142,
      progressive_carries: 68, through_balls: 11, long_balls: 134, crosses: 0,
      tackles: 58, interceptions: 52, clearances: 78, blocks: 14,
      aerial_duels: 108, aerial_duel_win_rate: 64.2, ground_duels: 102, ground_duel_win_rate: 67.3,
      dribbles: 28, dribble_success_rate: 75.0, pressures: 246,
      shot_creating_actions: 18, goal_creating_actions: 4, npxG: 0.8,
      yellow_cards: 3, red_cards: 0,
    },
  },
  // ── LEFT-BACKS ────────────────────────────────────────────────
  {
    player_external_id: "mock-lb-001",
    player_name: "Romain Lefebvre",
    age: 24,
    birth_date: "2002-05-18",
    nationality: "France",
    position: "LB",
    positions: ["LB", "LWB"],
    foot: "left",
    height: 178,
    weight: 73,
    team: "FC Metz",
    league: "Ligue 2",
    market_value: 1600000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 32, minutes_played: 2780, goals: 2, assists: 7, xG: 1.4, xA: 5.8,
      key_passes: 42, passes_completed: 1380, pass_completion: 84.6, progressive_passes: 88,
      progressive_carries: 92, through_balls: 8, long_balls: 64, crosses: 98,
      tackles: 72, interceptions: 38, clearances: 46, blocks: 8,
      aerial_duels: 52, aerial_duel_win_rate: 48.1, ground_duels: 142, ground_duel_win_rate: 58.4,
      dribbles: 56, dribble_success_rate: 62.5, pressures: 312,
      shot_creating_actions: 38, goal_creating_actions: 8, npxG: 1.0,
      yellow_cards: 6, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-lb-002",
    player_name: "Thiago Oliveira",
    age: 22,
    birth_date: "2004-09-03",
    nationality: "Brazil",
    position: "LB",
    positions: ["LB"],
    foot: "left",
    height: 175,
    weight: 70,
    team: "Cosenza Calcio",
    league: "Serie B",
    market_value: 1200000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 29, minutes_played: 2410, goals: 1, assists: 5, xG: 0.8, xA: 4.2,
      key_passes: 36, passes_completed: 1260, pass_completion: 82.8, progressive_passes: 76,
      progressive_carries: 108, through_balls: 5, long_balls: 52, crosses: 112,
      tackles: 68, interceptions: 42, clearances: 52, blocks: 12,
      aerial_duels: 38, aerial_duel_win_rate: 42.1, ground_duels: 156, ground_duel_win_rate: 62.8,
      dribbles: 72, dribble_success_rate: 68.1, pressures: 286,
      shot_creating_actions: 32, goal_creating_actions: 6, npxG: 0.6,
      yellow_cards: 4, red_cards: 1,
    },
  },
  // ── RIGHT-BACKS ───────────────────────────────────────────────
  {
    player_external_id: "mock-rb-001",
    player_name: "Jamie Whitfield",
    age: 23,
    birth_date: "2003-02-28",
    nationality: "England",
    position: "RB",
    positions: ["RB", "RWB"],
    foot: "right",
    height: 181,
    weight: 76,
    team: "Millwall FC",
    league: "Championship",
    market_value: 2800000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 34, minutes_played: 2920, goals: 3, assists: 8, xG: 2.2, xA: 6.4,
      key_passes: 48, passes_completed: 1520, pass_completion: 83.2, progressive_passes: 92,
      progressive_carries: 86, through_balls: 12, long_balls: 78, crosses: 124,
      tackles: 82, interceptions: 44, clearances: 56, blocks: 14,
      aerial_duels: 64, aerial_duel_win_rate: 56.3, ground_duels: 168, ground_duel_win_rate: 60.7,
      dribbles: 48, dribble_success_rate: 64.6, pressures: 342,
      shot_creating_actions: 44, goal_creating_actions: 10, npxG: 1.8,
      yellow_cards: 7, red_cards: 0,
    },
  },
  // ── CENTRAL MIDFIELDERS ───────────────────────────────────────
  {
    player_external_id: "mock-cm-001",
    player_name: "Sander Eriksen",
    age: 24,
    birth_date: "2002-04-12",
    nationality: "Norway",
    position: "CM",
    positions: ["CM", "CDM"],
    foot: "right",
    height: 183,
    weight: 78,
    team: "FC Twente",
    league: "Eredivisie",
    market_value: 3200000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 31, minutes_played: 2680, goals: 4, assists: 6, xG: 3.6, xA: 5.2,
      key_passes: 52, passes_completed: 1820, pass_completion: 89.8, progressive_passes: 156,
      progressive_carries: 74, through_balls: 18, long_balls: 112, crosses: 14,
      tackles: 76, interceptions: 62, clearances: 28, blocks: 16,
      aerial_duels: 78, aerial_duel_win_rate: 58.9, ground_duels: 164, ground_duel_win_rate: 62.2,
      dribbles: 34, dribble_success_rate: 70.6, pressures: 368,
      shot_creating_actions: 42, goal_creating_actions: 8, npxG: 2.8,
      yellow_cards: 6, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-cm-002",
    player_name: "Youssef Benali",
    age: 21,
    birth_date: "2005-08-19",
    nationality: "Morocco",
    position: "CM",
    positions: ["CM", "CAM"],
    foot: "both",
    height: 176,
    weight: 72,
    team: "Pisa SC",
    league: "Serie B",
    market_value: 1900000,
    contract_expiry: "2029-06-30",
    stats: {
      matches_played: 27, minutes_played: 2160, goals: 5, assists: 8, xG: 4.2, xA: 7.1,
      key_passes: 64, passes_completed: 1340, pass_completion: 86.4, progressive_passes: 118,
      progressive_carries: 96, through_balls: 22, long_balls: 68, crosses: 18,
      tackles: 42, interceptions: 34, clearances: 12, blocks: 8,
      aerial_duels: 42, aerial_duel_win_rate: 45.2, ground_duels: 138, ground_duel_win_rate: 56.5,
      dribbles: 62, dribble_success_rate: 64.5, pressures: 248,
      shot_creating_actions: 56, goal_creating_actions: 12, npxG: 3.4,
      yellow_cards: 3, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-cm-003",
    player_name: "Patrick Novak",
    age: 23,
    birth_date: "2003-11-05",
    nationality: "Czech Republic",
    position: "CDM",
    positions: ["CDM", "CM"],
    foot: "right",
    height: 185,
    weight: 80,
    team: "1. FC Kaiserslautern",
    league: "2. Bundesliga",
    market_value: 2100000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 30, minutes_played: 2580, goals: 2, assists: 3, xG: 1.8, xA: 2.4,
      key_passes: 28, passes_completed: 1680, pass_completion: 90.8, progressive_passes: 128,
      progressive_carries: 48, through_balls: 8, long_balls: 142, crosses: 6,
      tackles: 94, interceptions: 72, clearances: 42, blocks: 24,
      aerial_duels: 96, aerial_duel_win_rate: 66.7, ground_duels: 178, ground_duel_win_rate: 65.2,
      dribbles: 18, dribble_success_rate: 72.2, pressures: 398,
      shot_creating_actions: 22, goal_creating_actions: 4, npxG: 1.2,
      yellow_cards: 8, red_cards: 0,
    },
  },
  // ── ATTACKING MIDFIELDERS ─────────────────────────────────────
  {
    player_external_id: "mock-cam-001",
    player_name: "Enzo Ferretti",
    age: 22,
    birth_date: "2004-06-14",
    nationality: "Italy",
    position: "CAM",
    positions: ["CAM", "CM"],
    foot: "right",
    height: 177,
    weight: 71,
    team: "Modena FC",
    league: "Serie B",
    market_value: 2400000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 31, minutes_played: 2540, goals: 8, assists: 10, xG: 7.2, xA: 8.8,
      key_passes: 78, passes_completed: 1280, pass_completion: 84.2, progressive_passes: 104,
      progressive_carries: 118, through_balls: 28, long_balls: 42, crosses: 24,
      tackles: 28, interceptions: 22, clearances: 8, blocks: 4,
      aerial_duels: 28, aerial_duel_win_rate: 35.7, ground_duels: 126, ground_duel_win_rate: 52.4,
      dribbles: 84, dribble_success_rate: 61.9, pressures: 268,
      shot_creating_actions: 72, goal_creating_actions: 16, npxG: 6.4,
      yellow_cards: 4, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-cam-002",
    player_name: "Ruben Dijkstra",
    age: 20,
    birth_date: "2006-01-30",
    nationality: "Netherlands",
    position: "CAM",
    positions: ["CAM", "RW"],
    foot: "left",
    height: 174,
    weight: 68,
    team: "Willem II",
    league: "Eredivisie",
    market_value: 1700000,
    contract_expiry: "2029-06-30",
    stats: {
      matches_played: 28, minutes_played: 2080, goals: 6, assists: 9, xG: 5.8, xA: 7.6,
      key_passes: 68, passes_completed: 1120, pass_completion: 82.6, progressive_passes: 86,
      progressive_carries: 132, through_balls: 24, long_balls: 28, crosses: 36,
      tackles: 22, interceptions: 18, clearances: 4, blocks: 2,
      aerial_duels: 18, aerial_duel_win_rate: 33.3, ground_duels: 118, ground_duel_win_rate: 54.2,
      dribbles: 96, dribble_success_rate: 66.7, pressures: 234,
      shot_creating_actions: 64, goal_creating_actions: 14, npxG: 5.0,
      yellow_cards: 2, red_cards: 0,
    },
  },
  // ── WINGERS ───────────────────────────────────────────────────
  {
    player_external_id: "mock-lw-001",
    player_name: "Kwame Asante",
    age: 21,
    birth_date: "2005-03-22",
    nationality: "Ghana",
    position: "LW",
    positions: ["LW", "RW", "ST"],
    foot: "right",
    height: 179,
    weight: 74,
    team: "SC Cambuur",
    league: "Eredivisie",
    market_value: 2600000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 30, minutes_played: 2340, goals: 11, assists: 6, xG: 9.8, xA: 5.2,
      key_passes: 42, passes_completed: 920, pass_completion: 78.4, progressive_passes: 48,
      progressive_carries: 148, through_balls: 8, long_balls: 12, crosses: 42,
      tackles: 18, interceptions: 12, clearances: 4, blocks: 2,
      aerial_duels: 32, aerial_duel_win_rate: 40.6, ground_duels: 162, ground_duel_win_rate: 55.6,
      dribbles: 118, dribble_success_rate: 58.5, pressures: 286,
      shot_creating_actions: 58, goal_creating_actions: 14, npxG: 8.6,
      yellow_cards: 3, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-rw-001",
    player_name: "Oscar Lindqvist",
    age: 23,
    birth_date: "2003-10-08",
    nationality: "Sweden",
    position: "RW",
    positions: ["RW", "CAM"],
    foot: "left",
    height: 180,
    weight: 75,
    team: "Amiens SC",
    league: "Ligue 2",
    market_value: 1400000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 32, minutes_played: 2620, goals: 7, assists: 11, xG: 6.4, xA: 9.2,
      key_passes: 72, passes_completed: 1080, pass_completion: 80.8, progressive_passes: 64,
      progressive_carries: 124, through_balls: 16, long_balls: 18, crosses: 68,
      tackles: 24, interceptions: 16, clearances: 6, blocks: 4,
      aerial_duels: 24, aerial_duel_win_rate: 37.5, ground_duels: 148, ground_duel_win_rate: 52.7,
      dribbles: 102, dribble_success_rate: 62.7, pressures: 264,
      shot_creating_actions: 66, goal_creating_actions: 16, npxG: 5.6,
      yellow_cards: 5, red_cards: 0,
    },
  },
  // ── STRIKERS ──────────────────────────────────────────────────
  {
    player_external_id: "mock-st-001",
    player_name: "Viktor Horvath",
    age: 24,
    birth_date: "2002-12-01",
    nationality: "Hungary",
    position: "ST",
    positions: ["ST", "CF"],
    foot: "right",
    height: 187,
    weight: 82,
    team: "SV Darmstadt 98",
    league: "2. Bundesliga",
    market_value: 2800000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 33, minutes_played: 2820, goals: 16, assists: 4, xG: 14.2, xA: 3.6,
      key_passes: 28, passes_completed: 680, pass_completion: 74.8, progressive_passes: 22,
      progressive_carries: 64, through_balls: 4, long_balls: 8, crosses: 6,
      tackles: 14, interceptions: 8, clearances: 12, blocks: 4,
      aerial_duels: 148, aerial_duel_win_rate: 62.2, ground_duels: 118, ground_duel_win_rate: 48.3,
      dribbles: 42, dribble_success_rate: 52.4, pressures: 326,
      shot_creating_actions: 34, goal_creating_actions: 12, npxG: 12.8,
      yellow_cards: 5, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-st-002",
    player_name: "Amadou Diallo",
    age: 20,
    birth_date: "2006-04-25",
    nationality: "Senegal",
    position: "ST",
    positions: ["ST", "LW"],
    foot: "right",
    height: 182,
    weight: 77,
    team: "Le Havre AC",
    league: "Ligue 2",
    market_value: 1900000,
    contract_expiry: "2029-06-30",
    stats: {
      matches_played: 28, minutes_played: 2040, goals: 12, assists: 3, xG: 10.6, xA: 2.8,
      key_passes: 22, passes_completed: 560, pass_completion: 72.4, progressive_passes: 18,
      progressive_carries: 82, through_balls: 2, long_balls: 4, crosses: 8,
      tackles: 12, interceptions: 6, clearances: 8, blocks: 2,
      aerial_duels: 86, aerial_duel_win_rate: 54.7, ground_duels: 134, ground_duel_win_rate: 52.2,
      dribbles: 68, dribble_success_rate: 57.4, pressures: 298,
      shot_creating_actions: 28, goal_creating_actions: 10, npxG: 9.4,
      yellow_cards: 2, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-st-003",
    player_name: "Callum Henderson",
    age: 22,
    birth_date: "2004-07-14",
    nationality: "Scotland",
    position: "ST",
    positions: ["ST"],
    foot: "both",
    height: 184,
    weight: 80,
    team: "Bristol City",
    league: "Championship",
    market_value: 3400000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 35, minutes_played: 2980, goals: 14, assists: 6, xG: 12.8, xA: 5.4,
      key_passes: 36, passes_completed: 780, pass_completion: 76.2, progressive_passes: 28,
      progressive_carries: 72, through_balls: 6, long_balls: 12, crosses: 4,
      tackles: 18, interceptions: 10, clearances: 14, blocks: 6,
      aerial_duels: 132, aerial_duel_win_rate: 58.3, ground_duels: 146, ground_duel_win_rate: 50.7,
      dribbles: 54, dribble_success_rate: 55.6, pressures: 356,
      shot_creating_actions: 38, goal_creating_actions: 14, npxG: 11.2,
      yellow_cards: 4, red_cards: 1,
    },
  },
  // ── GOALKEEPERS ───────────────────────────────────────────────
  {
    player_external_id: "mock-gk-001",
    player_name: "Mats Johansson",
    age: 24,
    birth_date: "2002-02-08",
    nationality: "Sweden",
    position: "GK",
    positions: ["GK"],
    foot: "right",
    height: 193,
    weight: 88,
    team: "Heracles Almelo",
    league: "Eredivisie",
    market_value: 1600000,
    contract_expiry: "2028-06-30",
    stats: {
      matches_played: 32, minutes_played: 2880, goals: 0, assists: 0, xG: 0, xA: 0.2,
      key_passes: 4, passes_completed: 680, pass_completion: 78.4, progressive_passes: 42,
      progressive_carries: 2, through_balls: 0, long_balls: 248, crosses: 0,
      tackles: 0, interceptions: 4, clearances: 18, blocks: 2,
      aerial_duels: 22, aerial_duel_win_rate: 86.4, ground_duels: 4, ground_duel_win_rate: 75.0,
      dribbles: 0, dribble_success_rate: 0, pressures: 8,
      shot_creating_actions: 2, goal_creating_actions: 0, npxG: 0,
      yellow_cards: 1, red_cards: 0,
    },
  },
  {
    player_external_id: "mock-gk-002",
    player_name: "Alejandro Ruiz",
    age: 22,
    birth_date: "2004-11-18",
    nationality: "Spain",
    position: "GK",
    positions: ["GK"],
    foot: "right",
    height: 190,
    weight: 85,
    team: "FC Cartagena",
    league: "Serie B",
    market_value: 1200000,
    contract_expiry: "2029-06-30",
    stats: {
      matches_played: 28, minutes_played: 2520, goals: 0, assists: 1, xG: 0, xA: 0.4,
      key_passes: 6, passes_completed: 620, pass_completion: 82.6, progressive_passes: 56,
      progressive_carries: 4, through_balls: 0, long_balls: 212, crosses: 0,
      tackles: 0, interceptions: 6, clearances: 22, blocks: 4,
      aerial_duels: 18, aerial_duel_win_rate: 83.3, ground_duels: 6, ground_duel_win_rate: 66.7,
      dribbles: 2, dribble_success_rate: 100, pressures: 12,
      shot_creating_actions: 4, goal_creating_actions: 1, npxG: 0,
      yellow_cards: 2, red_cards: 0,
    },
  },
  // ── More CBs for variety ──────────────────────────────────────
  {
    player_external_id: "mock-cb-004",
    player_name: "Tomas Petrov",
    age: 23,
    birth_date: "2003-09-12",
    nationality: "Bulgaria",
    position: "CB",
    positions: ["CB"],
    foot: "left",
    height: 189,
    weight: 83,
    team: "Valenciennes FC",
    league: "Ligue 2",
    market_value: 1100000,
    contract_expiry: "2027-06-30",
    stats: {
      matches_played: 30, minutes_played: 2640, goals: 1, assists: 0, xG: 1.4, xA: 0.6,
      key_passes: 8, passes_completed: 1380, pass_completion: 86.8, progressive_passes: 72,
      progressive_carries: 22, through_balls: 1, long_balls: 168, crosses: 0,
      tackles: 78, interceptions: 64, clearances: 134, blocks: 26,
      aerial_duels: 168, aerial_duel_win_rate: 74.4, ground_duels: 92, ground_duel_win_rate: 59.8,
      dribbles: 8, dribble_success_rate: 62.5, pressures: 186,
      shot_creating_actions: 6, goal_creating_actions: 1, npxG: 0.8,
      yellow_cards: 7, red_cards: 1,
    },
  },
  {
    player_external_id: "mock-cb-005",
    player_name: "Abdul Rahman Mensah",
    age: 20,
    birth_date: "2006-06-03",
    nationality: "Ghana",
    position: "CB",
    positions: ["CB", "RB"],
    foot: "right",
    height: 185,
    weight: 78,
    team: "Eintracht Braunschweig",
    league: "2. Bundesliga",
    market_value: 1300000,
    contract_expiry: "2029-06-30",
    stats: {
      matches_played: 24, minutes_played: 1920, goals: 2, assists: 1, xG: 1.6, xA: 1.2,
      key_passes: 14, passes_completed: 1180, pass_completion: 87.4, progressive_passes: 86,
      progressive_carries: 46, through_balls: 4, long_balls: 118, crosses: 4,
      tackles: 64, interceptions: 48, clearances: 86, blocks: 18,
      aerial_duels: 112, aerial_duel_win_rate: 68.8, ground_duels: 108, ground_duel_win_rate: 63.9,
      dribbles: 20, dribble_success_rate: 70.0, pressures: 218,
      shot_creating_actions: 10, goal_creating_actions: 2, npxG: 1.2,
      yellow_cards: 4, red_cards: 0,
    },
  },
];

// ── Search mock data ──────────────────────────────────────────────

export function searchMockPlayers(params: {
  position?: string;
  positions?: string[];
  foot?: string;
  age_min?: number;
  age_max?: number;
  league?: string;
  leagues?: string[];
  market_value_min?: number;
  market_value_max?: number;
  height_min?: number;
  height_max?: number;
  limit?: number;
}): MockPlayer[] {
  let results = [...MOCK_PLAYERS];

  // Filter by position
  const targetPositions = params.positions ?? (params.position ? [params.position] : null);
  if (targetPositions) {
    const upper = targetPositions.map((p) => p.toUpperCase());
    results = results.filter((p) =>
      p.positions.some((pos) => upper.includes(pos.toUpperCase()))
    );
  }

  // Filter by foot
  if (params.foot) {
    results = results.filter(
      (p) => p.foot === params.foot || p.foot === "both"
    );
  }

  // Filter by age
  if (params.age_min) results = results.filter((p) => p.age >= params.age_min!);
  if (params.age_max) results = results.filter((p) => p.age <= params.age_max!);

  // Filter by league
  const targetLeagues = params.leagues ?? (params.league ? [params.league] : null);
  if (targetLeagues) {
    const lower = targetLeagues.map((l) => l.toLowerCase());
    results = results.filter((p) =>
      lower.some((l) => p.league.toLowerCase().includes(l) || l.includes(p.league.toLowerCase()))
    );
  }

  // Filter by market value
  if (params.market_value_min)
    results = results.filter((p) => p.market_value >= params.market_value_min!);
  if (params.market_value_max)
    results = results.filter((p) => p.market_value <= params.market_value_max!);

  // Filter by height
  if (params.height_min) results = results.filter((p) => p.height >= params.height_min!);
  if (params.height_max) results = results.filter((p) => p.height <= params.height_max!);

  return results.slice(0, params.limit ?? 20);
}

export function getMockPlayer(playerId: string): MockPlayer | undefined {
  return MOCK_PLAYERS.find((p) => p.player_external_id === playerId);
}
