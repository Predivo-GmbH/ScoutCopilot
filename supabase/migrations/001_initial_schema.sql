-- ScoutCopilot: Initial Database Schema
-- Multi-tenant AI football scouting SaaS
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type subscription_tier as enum ('scout', 'pro', 'club');
create type user_role as enum ('owner', 'admin', 'scout');
create type data_provider as enum ('wyscout', 'statsbomb');

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations (clubs / agencies)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subscription_tier subscription_tier not null default 'scout',
  max_seats int not null default 1,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on organizations (slug);
create index idx_organizations_stripe_customer on organizations (stripe_customer_id) where stripe_customer_id is not null;

-- User profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid references organizations on delete set null,
  full_name text,
  role user_role not null default 'scout',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_organization on profiles (organization_id);

-- BYOK API credentials (encrypted via Vault in edge functions)
create table api_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  provider data_provider not null,
  encrypted_credentials jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create index idx_api_credentials_organization on api_credentials (organization_id);

-- Natural language search queries
create table search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  query_text text not null,
  parsed_parameters jsonb,
  result_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_search_queries_organization on search_queries (organization_id);
create index idx_search_queries_user on search_queries (user_id);
create index idx_search_queries_created on search_queries (created_at desc);

-- Search results (players returned per query)
create table search_results (
  id uuid primary key default gen_random_uuid(),
  search_query_id uuid not null references search_queries on delete cascade,
  player_external_id text not null,
  player_name text not null,
  player_data jsonb not null,
  rank int not null,
  fit_score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_search_results_query on search_results (search_query_id);
create index idx_search_results_player on search_results (player_external_id);

-- AI-generated scouting reports
create table player_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  player_external_id text not null,
  player_name text not null,
  report_data jsonb not null,
  source_provider data_provider not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_player_reports_organization on player_reports (organization_id);
create index idx_player_reports_user on player_reports (user_id);
create index idx_player_reports_player on player_reports (player_external_id);
create index idx_player_reports_created on player_reports (created_at desc);

-- Head-to-head player comparisons
create table player_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  title text not null,
  player_ids text[] not null,
  comparison_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_player_comparisons_organization on player_comparisons (organization_id);
create index idx_player_comparisons_user on player_comparisons (user_id);
create index idx_player_comparisons_created on player_comparisons (created_at desc);

-- Watchlists (saved player lists)
create table watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  description text,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_watchlists_organization on watchlists (organization_id);
create index idx_watchlists_user on watchlists (user_id);

-- Watchlist players (junction table)
create table watchlist_players (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references watchlists on delete cascade,
  player_external_id text not null,
  player_name text not null,
  player_data jsonb,
  notes text,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (watchlist_id, player_external_id)
);

create index idx_watchlist_players_watchlist on watchlist_players (watchlist_id);
create index idx_watchlist_players_player on watchlist_players (player_external_id);

-- Monthly usage tracking per organization
create table usage_tracking (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  month date not null,
  api_calls_count int not null default 0,
  reports_generated int not null default 0,
  searches_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, month)
);

create index idx_usage_tracking_org_month on usage_tracking (organization_id, month desc);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get the organization_id for the current authenticated user
create or replace function get_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from profiles
  where id = auth.uid()
$$;

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers to all tables
create trigger trg_organizations_updated before update on organizations for each row execute function update_updated_at();
create trigger trg_profiles_updated before update on profiles for each row execute function update_updated_at();
create trigger trg_api_credentials_updated before update on api_credentials for each row execute function update_updated_at();
create trigger trg_search_queries_updated before update on search_queries for each row execute function update_updated_at();
create trigger trg_search_results_updated before update on search_results for each row execute function update_updated_at();
create trigger trg_player_reports_updated before update on player_reports for each row execute function update_updated_at();
create trigger trg_player_comparisons_updated before update on player_comparisons for each row execute function update_updated_at();
create trigger trg_watchlists_updated before update on watchlists for each row execute function update_updated_at();
create trigger trg_watchlist_players_updated before update on watchlist_players for each row execute function update_updated_at();
create trigger trg_usage_tracking_updated before update on usage_tracking for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE + ORGANIZATION ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  user_name text;
begin
  -- Extract name from user metadata (Supabase auth stores it there)
  user_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  -- Create a new organization for the user
  insert into organizations (name, slug)
  values (
    user_name || '''s Organization',
    'org-' || substr(new.id::text, 1, 8)
  )
  returning id into new_org_id;

  -- Create the user's profile as the org owner
  insert into profiles (id, organization_id, full_name, role)
  values (
    new.id,
    new_org_id,
    user_name,
    'owner'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table api_credentials enable row level security;
alter table search_queries enable row level security;
alter table search_results enable row level security;
alter table player_reports enable row level security;
alter table player_comparisons enable row level security;
alter table watchlists enable row level security;
alter table watchlist_players enable row level security;
alter table usage_tracking enable row level security;

-- ORGANIZATIONS
-- Users can read their own organization
create policy "Users can view their own organization"
  on organizations for select
  using (id = get_user_organization_id());

-- Owners can update their organization
create policy "Owners can update their organization"
  on organizations for update
  using (id = get_user_organization_id()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'owner'
    ));

-- PROFILES
-- Users can read all profiles in their organization
create policy "Users can view org profiles"
  on profiles for select
  using (organization_id = get_user_organization_id());

-- Users can update only their own profile
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Allow insert during signup (trigger runs as security definer, but just in case)
create policy "System can insert profiles"
  on profiles for insert
  with check (id = auth.uid());

-- API CREDENTIALS
-- Only admins and owners can view credentials
create policy "Admins can view org credentials"
  on api_credentials for select
  using (
    organization_id = get_user_organization_id()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Only admins and owners can insert credentials
create policy "Admins can insert org credentials"
  on api_credentials for insert
  with check (
    organization_id = get_user_organization_id()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Only admins and owners can update credentials
create policy "Admins can update org credentials"
  on api_credentials for update
  using (
    organization_id = get_user_organization_id()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- Only admins and owners can delete credentials
create policy "Admins can delete org credentials"
  on api_credentials for delete
  using (
    organization_id = get_user_organization_id()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
    )
  );

-- SEARCH QUERIES
-- Users can view their org's search queries
create policy "Users can view org searches"
  on search_queries for select
  using (organization_id = get_user_organization_id());

-- Users can insert search queries for their org
create policy "Users can create searches"
  on search_queries for insert
  with check (
    organization_id = get_user_organization_id()
    and user_id = auth.uid()
  );

-- SEARCH RESULTS
-- Users can view results for queries in their org
create policy "Users can view org search results"
  on search_results for select
  using (
    exists (
      select 1 from search_queries
      where search_queries.id = search_results.search_query_id
      and search_queries.organization_id = get_user_organization_id()
    )
  );

-- Users can insert results for their own queries
create policy "Users can insert search results"
  on search_results for insert
  with check (
    exists (
      select 1 from search_queries
      where search_queries.id = search_results.search_query_id
      and search_queries.user_id = auth.uid()
    )
  );

-- PLAYER REPORTS
-- Users can view their org's reports
create policy "Users can view org reports"
  on player_reports for select
  using (organization_id = get_user_organization_id());

-- Users can create reports for their org
create policy "Users can create reports"
  on player_reports for insert
  with check (
    organization_id = get_user_organization_id()
    and user_id = auth.uid()
  );

-- Users can delete their own reports
create policy "Users can delete own reports"
  on player_reports for delete
  using (user_id = auth.uid());

-- PLAYER COMPARISONS
-- Users can view their org's comparisons
create policy "Users can view org comparisons"
  on player_comparisons for select
  using (organization_id = get_user_organization_id());

-- Users can create comparisons for their org
create policy "Users can create comparisons"
  on player_comparisons for insert
  with check (
    organization_id = get_user_organization_id()
    and user_id = auth.uid()
  );

-- Users can delete their own comparisons
create policy "Users can delete own comparisons"
  on player_comparisons for delete
  using (user_id = auth.uid());

-- WATCHLISTS
-- Users can see their own watchlists + shared ones in their org
create policy "Users can view own and shared watchlists"
  on watchlists for select
  using (
    organization_id = get_user_organization_id()
    and (user_id = auth.uid() or is_shared = true)
  );

-- Users can create watchlists for their org
create policy "Users can create watchlists"
  on watchlists for insert
  with check (
    organization_id = get_user_organization_id()
    and user_id = auth.uid()
  );

-- Users can update their own watchlists
create policy "Users can update own watchlists"
  on watchlists for update
  using (user_id = auth.uid());

-- Users can delete their own watchlists
create policy "Users can delete own watchlists"
  on watchlists for delete
  using (user_id = auth.uid());

-- WATCHLIST PLAYERS
-- Users can view players in watchlists they can see
create policy "Users can view watchlist players"
  on watchlist_players for select
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_players.watchlist_id
      and watchlists.organization_id = get_user_organization_id()
      and (watchlists.user_id = auth.uid() or watchlists.is_shared = true)
    )
  );

-- Users can add players to their own watchlists
create policy "Users can add watchlist players"
  on watchlist_players for insert
  with check (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_players.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

-- Users can update players in their own watchlists
create policy "Users can update watchlist players"
  on watchlist_players for update
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_players.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

-- Users can remove players from their own watchlists
create policy "Users can delete watchlist players"
  on watchlist_players for delete
  using (
    exists (
      select 1 from watchlists
      where watchlists.id = watchlist_players.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

-- USAGE TRACKING
-- Users can view their org's usage
create policy "Users can view org usage"
  on usage_tracking for select
  using (organization_id = get_user_organization_id());

-- Only service role can insert/update usage (edge functions)
-- No insert/update policies for regular users
