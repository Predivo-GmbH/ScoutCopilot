-- 011_staging_separation_probe.sql
--
-- WHY THIS EXISTS. Until 2026-09-02, .github/workflows/deploy-staging.yml and
-- .github/workflows/deploy.yml both ran
--     node scripts/apply-migrations.mjs --project-ref rlcsuqwqzoqjykdiqjye
-- i.e. the step called "staging" applied schema changes to the PRODUCTION database.
-- ScoutCopilot had no test database, so every migration was tried in production and a
-- green staging run was not evidence about production -- it WAS production.
--
-- Staging now has its own Supabase project (ysdaeexwhbwlbatcscqn) in the same Supabase
-- account/org as production (fehhaubujickklmsjikb). This migration is the harmless
-- change used to PROVE the separation: after a staging deploy the table exists in the
-- staging database and does NOT exist in production, and both databases were read back
-- to confirm it. Production only receives it on the next production deploy -- which is
-- exactly the ordering the old wiring made impossible.
--
-- It is safe to keep. The table holds one row, carries no personal data, and is locked
-- down: RLS is enabled with NO policies, so neither `anon` nor `authenticated` can read
-- or write it through PostgREST. Only the service role and direct SQL can see it.
-- It is idempotent, so re-running it on a database that already has it is a no-op.

create table if not exists public.deploy_separation_probe (
  id         smallint primary key,
  note       text        not null,
  applied_at timestamptz not null default now(),
  constraint deploy_separation_probe_singleton check (id = 1)
);

comment on table public.deploy_separation_probe is
  'Marker proving staging and production are separate Supabase projects. Created by migration 011 (2026-09-02). Not used by the application.';

-- No policies are created on purpose: RLS on + zero policies = deny-all for the
-- anon and authenticated roles. Do not add a policy to this table.
alter table public.deploy_separation_probe enable row level security;

insert into public.deploy_separation_probe (id, note)
values (1, 'staging/production separation proven by migration 011')
on conflict (id) do nothing;
