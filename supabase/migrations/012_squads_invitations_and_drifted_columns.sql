-- ScoutCopilot: close the production schema drift — 26 columns the app uses every day
-- that no migration created until now.
--
-- WHY THIS EXISTS (2026-09-09). Production has carried three tables
-- (squads, squad_players, team_invitations) and two columns
-- (profiles.notification_preferences, sb_players.photo_url) that were created by hand
-- in the dashboard and never written down as a migration. A fresh database built from
-- migrations alone cannot run the app: the squad page, team invitations, notification
-- settings and player photos all break. Measured 2026-09-04: the drift query passes on
-- production (objects exist there) and fails with all 5 missing objects on the staging
-- project, which is built from migrations only.
--
-- IDEMPOTENT ON PURPOSE. Production already has these objects, so every statement here
-- is guarded: CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, DROP TRIGGER IF
-- EXISTS, and policies created only when no policy of that name exists. On production
-- this migration changes nothing; on staging and every future fresh database it creates
-- what the app needs. Shapes follow src/types/database.ts (generated from production)
-- and the callers (src/features/squad/hooks/useSquad.ts, src/features/settings/hooks/
-- useSettings.ts, supabase/functions/invite-member, supabase/functions/generate-photo).

-- ============================================================
-- SQUADS (a user's saved squads)
-- ============================================================

create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  description text,
  formation text not null default '4-3-3',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_squads_user on squads (user_id);
create index if not exists idx_squads_organization on squads (organization_id);

drop trigger if exists trg_squads_updated on squads;
create trigger trg_squads_updated before update on squads for each row execute function update_updated_at();

-- Squad players (junction: a player in a squad, with a snapshot of his data)
create table if not exists squad_players (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references squads on delete cascade,
  player_external_id text not null,
  player_name text not null,
  player_data jsonb,
  position_key text,
  created_at timestamptz not null default now(),
  unique (squad_id, player_external_id)
);

create index if not exists idx_squad_players_squad on squad_players (squad_id);
create index if not exists idx_squad_players_player on squad_players (player_external_id);

-- ============================================================
-- TEAM INVITATIONS (org owners/admins invite members by email;
-- written by the invite-member edge function under the service
-- role, read by org members in Settings)
-- ============================================================

create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  invited_by uuid not null references profiles on delete cascade,
  email text not null,
  role text not null default 'scout',
  status text not null default 'pending',
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_team_invitations_org on team_invitations (organization_id);
create index if not exists idx_team_invitations_token on team_invitations (token);

-- ============================================================
-- DRIFTED COLUMNS
-- ============================================================

-- Settings page reads/writes per-user notification toggles.
alter table profiles add column if not exists notification_preferences jsonb;

-- Player photos: written by enrich-photos / generate-photo edge functions and the
-- sb-open-* photo upload, read by compare / backfill-reports.
alter table sb_players add column if not exists photo_url text;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
-- Policies are created only when no policy of that name exists, so production — which
-- already has working policies from the hand-created era — keeps exactly what it has.

alter table squads enable row level security;
alter table squad_players enable row level security;
alter table team_invitations enable row level security;

-- SQUADS: a user sees and manages only his own squads (useSquad selects without a
-- filter and relies on RLS to scope the rows).
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'squads' and policyname = 'Users can manage own squads') then
    create policy "Users can manage own squads"
      on squads for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- SQUAD PLAYERS: through the parent squad's ownership.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'squad_players' and policyname = 'Users can manage players in own squads') then
    create policy "Users can manage players in own squads"
      on squad_players for all
      using (
        exists (
          select 1 from squads
          where squads.id = squad_players.squad_id
          and squads.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from squads
          where squads.id = squad_players.squad_id
          and squads.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- TEAM INVITATIONS: org members can read their org's invitations (Settings page).
-- Inserts/updates go through the invite-member edge function under the service role,
-- which bypasses RLS, so no write policy is needed for regular users.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'team_invitations' and policyname = 'Org members can view invitations') then
    create policy "Org members can view invitations"
      on team_invitations for select
      using (organization_id = get_user_organization_id());
  end if;
end $$;
