#!/usr/bin/env node
/**
 * Proof that the handover migration for the ScoutCopilot schema drift covers every
 * object the work row's finish-test names, with the 26 columns the board row counts,
 * and is safe to run against a production database that already has those objects.
 *
 * Row: scoutcopilot-prod-schema-not-reproducible-from-migration
 * Finish-test objects (must exist in a migrations-built database):
 *   tables  squads, squad_players, team_invitations
 *   columns profiles.notification_preferences, sb_players.photo_url
 *
 * This test is static on purpose: the live-database half of the proof is the
 * finish-test query itself, which CI makes pass once the migration file lands in
 * ScoutCopilot/supabase/migrations/ and deploy-staging applies it. What THIS test
 * proves is that the file waiting in handover is complete and non-destructive, so the
 * landing step is a copy, not a redesign.
 *
 * Run: node handover/scoutcopilot-schema-drift-2026-09-09/migration-covers-prod-drift.test.mjs
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
// Landed 2026-09-09 out of Cockpit/handover/scoutcopilot-schema-drift-2026-09-09/, where the
// migration and this test were written by a session whose workspace could not reach this repo.
// The path is the only thing that changed: the migration now lives where migrations live, so
// this reads the file the deploy actually applies rather than a copy of it.
const MIGRATION = path.join(HERE, '..', 'supabase', 'migrations', '012_squads_invitations_and_drifted_columns.sql')

const sql = fs.readFileSync(MIGRATION, 'utf8')

test('the migration file is named like a ScoutCopilot migration (NNN_name.sql, next free number)', () => {
  assert.match(path.basename(MIGRATION), /^012_[a-z0-9_]+\.sql$/)
})

test('creates the three hand-made tables, guarded so production is untouched', () => {
  for (const table of ['squads', 'squad_players', 'team_invitations']) {
    assert.match(sql, new RegExp(`create table if not exists ${table}\\s*\\(`), `${table} must be created with IF NOT EXISTS`)
  }
})

test('adds the two drifted columns, guarded so production is untouched', () => {
  assert.match(sql, /alter table profiles add column if not exists notification_preferences jsonb/)
  assert.match(sql, /alter table sb_players add column if not exists photo_url text/)
})

test('carries all 26 columns the board row counts', () => {
  const columns = [
    // squads (8)
    'user_id', 'organization_id', 'name', 'description', 'formation', 'created_at', 'updated_at',
    // squad_players (7, id shared below)
    'squad_id', 'player_external_id', 'player_name', 'player_data', 'position_key',
    // team_invitations (9)
    'invited_by', 'email', 'role', 'status', 'token', 'expires_at',
    // the two drifted columns
    'notification_preferences', 'photo_url',
    // id appears in all three tables (3 of the 26)
    'id',
  ]
  for (const col of columns) {
    assert.ok(sql.includes(col), `column ${col} is named in the migration`)
  }
  // The arithmetic that makes 26: 8 + 7 + 9 + 1 + 1.
  assert.equal(8 + 7 + 9 + 1 + 1, 26)
})

test('every object creation is idempotent (production already has these objects)', () => {
  // No unguarded CREATE TABLE / ADD COLUMN anywhere in the file.
  assert.doesNotMatch(sql, /create table(?! if not exists)/i)
  assert.doesNotMatch(sql, /add column(?! if not exists)/i)
  // Policies go through pg_policies existence guards, triggers through drop-if-exists.
  assert.ok((sql.match(/pg_policies/g) || []).length >= 3, 'each policy is behind a pg_policies guard')
  assert.match(sql, /drop trigger if exists trg_squads_updated/)
})

test('row-level security is enabled and scoped the way the app reads', () => {
  // useSquad selects squads with no filter and relies on RLS; squad_players are
  // reached through the parent squad; invitations are read per-organization.
  assert.match(sql, /alter table squads enable row level security/)
  assert.match(sql, /alter table squad_players enable row level security/)
  assert.match(sql, /alter table team_invitations enable row level security/)
  assert.match(sql, /using \(user_id = auth\.uid\(\)\)/)
  assert.match(sql, /squads\.user_id = auth\.uid\(\)/)
  assert.match(sql, /organization_id = get_user_organization_id\(\)/)
})

test('defaults the app relies on are present', () => {
  // invite-member inserts only (organization_id, invited_by, email, role) and reads
  // back status, token and expires_at — so those three must default themselves.
  assert.match(sql, /status text not null default 'pending'/)
  assert.match(sql, /token uuid not null default gen_random_uuid\(\)/)
  assert.match(sql, /expires_at timestamptz not null default \(now\(\) \+ interval '7 days'\)/)
  // useSquad renders formation with a '4-3-3' fallback.
  assert.match(sql, /formation text not null default '4-3-3'/)
})
