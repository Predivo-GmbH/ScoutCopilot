-- Fleet-hardening Wave 1 (2026-08-17): codify RLS + authenticated-read on the 4
-- StatsBomb tables.
--
-- WHY: 002 created these tables with RLS DISABLED. The LIVE DB had since been
-- secured out-of-band (RLS enabled + an "Authenticated users can read" policy),
-- but that state lived only in the running DB, NOT in the migration files — so a
-- fresh rebuild from migrations would have come up UNPROTECTED. This migration
-- codifies the live secure state so migrations == reality.
--
-- POSTURE:
--   READ  = authenticated only (the app reads sb_players etc. from authenticated
--           settings pages; there is no unauthenticated/public page that needs them).
--   WRITE = service_role only (import-statsbomb.ts + backfill-birth-dates use the
--           service_role key, which bypasses RLS; there is no write policy).
--
-- Idempotent (safe to re-run).

alter table public.sb_competitions          enable row level security;
alter table public.sb_matches               enable row level security;
alter table public.sb_players               enable row level security;
alter table public.sb_player_season_stats   enable row level security;

-- Drop any public/anon read (do NOT over-expose these to unauthenticated clients).
drop policy if exists "Public read sb_competitions"        on public.sb_competitions;
drop policy if exists "Public read sb_matches"             on public.sb_matches;
drop policy if exists "Public read sb_players"             on public.sb_players;
drop policy if exists "Public read sb_player_season_stats" on public.sb_player_season_stats;

-- Codify the authenticated-read policy (previously live-DB-only drift).
drop policy if exists "Authenticated users can read" on public.sb_competitions;
drop policy if exists "Authenticated users can read" on public.sb_matches;
drop policy if exists "Authenticated users can read" on public.sb_players;
drop policy if exists "Authenticated users can read" on public.sb_player_season_stats;

create policy "Authenticated users can read" on public.sb_competitions        for select to authenticated using (true);
create policy "Authenticated users can read" on public.sb_matches             for select to authenticated using (true);
create policy "Authenticated users can read" on public.sb_players             for select to authenticated using (true);
create policy "Authenticated users can read" on public.sb_player_season_stats for select to authenticated using (true);
