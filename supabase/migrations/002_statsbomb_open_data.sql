-- StatsBomb Open Data: Player stats from free open dataset
-- Pre-aggregated from event-level data for fast search queries
-- ============================================================

-- Extend data_provider enum to include statsbomb-open
alter type data_provider add value if not exists 'statsbomb-open';

-- ============================================================
-- TABLES
-- ============================================================

-- StatsBomb Open Data competitions (small reference table)
create table sb_competitions (
  id serial primary key,
  competition_id int not null,
  competition_name text not null,
  season_id int not null,
  season_name text not null,
  country_name text not null,
  match_count int not null default 0,
  imported_at timestamptz,
  unique (competition_id, season_id)
);

-- StatsBomb Open Data matches
create table sb_matches (
  id serial primary key,
  match_id int not null unique,
  competition_id int not null,
  season_id int not null,
  match_date date not null,
  home_team_id int not null,
  home_team_name text not null,
  away_team_id int not null,
  away_team_name text not null,
  home_score int,
  away_score int,
  stadium_name text,
  match_week int,
  imported_at timestamptz not null default now()
);

create index idx_sb_matches_competition on sb_matches (competition_id, season_id);

-- StatsBomb unique players (deduplicated across all competitions)
create table sb_players (
  id serial primary key,
  player_id int not null unique,
  player_name text not null,
  player_nickname text,
  nationality text,
  jersey_number int,
  primary_position text,
  positions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_sb_players_name on sb_players using gin (to_tsvector('simple', player_name));
create index idx_sb_players_position on sb_players (primary_position);
create index idx_sb_players_nationality on sb_players (nationality);

-- Pre-aggregated player stats per competition-season
create table sb_player_season_stats (
  id serial primary key,
  player_id int not null references sb_players(player_id),
  competition_id int not null,
  season_id int not null,
  competition_name text not null,
  season_name text not null,
  team_name text not null,
  -- Core appearance stats
  matches_played int not null default 0,
  minutes_played int not null default 0,
  -- Attacking
  goals int not null default 0,
  assists int not null default 0,
  xg numeric(6,3) not null default 0,
  xa numeric(6,3) not null default 0,
  npxg numeric(6,3) not null default 0,
  -- Passing
  key_passes int not null default 0,
  passes_completed int not null default 0,
  passes_attempted int not null default 0,
  pass_completion numeric(5,2) not null default 0,
  progressive_passes int not null default 0,
  through_balls int not null default 0,
  long_balls int not null default 0,
  crosses int not null default 0,
  -- Ball progression
  progressive_carries int not null default 0,
  -- Defending
  tackles int not null default 0,
  interceptions int not null default 0,
  clearances int not null default 0,
  blocks int not null default 0,
  -- Duels
  aerial_duels int not null default 0,
  aerial_duels_won int not null default 0,
  aerial_duel_win_rate numeric(5,2) not null default 0,
  ground_duels int not null default 0,
  ground_duels_won int not null default 0,
  ground_duel_win_rate numeric(5,2) not null default 0,
  -- Dribbling
  dribbles int not null default 0,
  dribbles_successful int not null default 0,
  dribble_success_rate numeric(5,2) not null default 0,
  -- Pressing
  pressures int not null default 0,
  -- Creativity
  shot_creating_actions int not null default 0,
  goal_creating_actions int not null default 0,
  -- Discipline
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  -- Metadata
  computed_at timestamptz not null default now(),
  unique (player_id, competition_id, season_id)
);

create index idx_sb_pss_player on sb_player_season_stats (player_id);
create index idx_sb_pss_competition on sb_player_season_stats (competition_id, season_id);
create index idx_sb_pss_team on sb_player_season_stats (team_name);

-- No RLS on these tables — they're public reference data read by edge functions via service role
