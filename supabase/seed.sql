-- ScoutCopilot: Development Seed Data
-- NOTE: Run AFTER creating test users via Supabase Auth
-- This seed assumes two test users already exist in auth.users.
-- The handle_new_user trigger will auto-create profiles + orgs on signup.
-- This file adds sample data for development/testing.

-- ============================================================
-- After signup, update the first org to have meaningful data
-- Replace ORG_ID and USER_IDs with actual values after signup
-- ============================================================

-- For local dev: create org + profiles manually if not using auth
do $$
declare
  org_id uuid := 'a0000000-0000-0000-0000-000000000001';
  user1_id uuid := 'b0000000-0000-0000-0000-000000000001';
  user2_id uuid := 'b0000000-0000-0000-0000-000000000002';
  wl_id uuid;
  sq_id uuid;
begin
  -- Organization
  insert into organizations (id, name, slug, subscription_tier, max_seats)
  values (org_id, 'FC Demo Club', 'fc-demo-club', 'pro', 3)
  on conflict (id) do nothing;

  -- Profiles (skip if using auth trigger)
  insert into profiles (id, organization_id, full_name, role)
  values
    (user1_id, org_id, 'Marcus Schmidt', 'owner'),
    (user2_id, org_id, 'Lena Fischer', 'scout')
  on conflict (id) do nothing;

  -- API Credentials (dummy — not real keys)
  insert into api_credentials (organization_id, provider, encrypted_credentials, is_active)
  values (org_id, 'wyscout', '{"note": "placeholder — replace with real encrypted creds"}'::jsonb, true)
  on conflict (organization_id, provider) do nothing;

  -- Search query
  insert into search_queries (id, user_id, organization_id, query_text, parsed_parameters, result_count)
  values (
    'c0000000-0000-0000-0000-000000000001',
    user1_id, org_id,
    'Left-footed center-backs under 24 in Ligue 2 with aerial win rate above 65%',
    '{"position": "CB", "foot": "left", "age_max": 24, "league": "Ligue 2", "aerial_win_pct_min": 65}'::jsonb,
    3
  )
  on conflict (id) do nothing;
  sq_id := 'c0000000-0000-0000-0000-000000000001';

  -- Search results
  insert into search_results (search_query_id, player_external_id, player_name, player_data, rank, fit_score)
  values
    (sq_id, 'ws-12345', 'Antoine Dupont', '{"age": 22, "position": "CB", "league": "Ligue 2", "club": "AC Ajaccio", "aerial_win_pct": 71.2, "progressive_passes_p90": 4.8}'::jsonb, 1, 92.5),
    (sq_id, 'ws-23456', 'Mehdi Benali', '{"age": 23, "position": "CB", "league": "Ligue 2", "club": "Pau FC", "aerial_win_pct": 68.4, "progressive_passes_p90": 3.9}'::jsonb, 2, 87.3),
    (sq_id, 'ws-34567', 'Lucas Ferreira', '{"age": 21, "position": "CB", "league": "Ligue 2", "club": "Rodez AF", "aerial_win_pct": 66.1, "progressive_passes_p90": 5.2}'::jsonb, 3, 84.1)
  on conflict do nothing;

  -- Player report
  insert into player_reports (user_id, organization_id, player_external_id, player_name, report_data, source_provider)
  values (user1_id, org_id, 'ws-12345', 'Antoine Dupont', '{
    "summary": "Left-footed ball-playing CB with strong aerial presence. Progressive passing numbers rank in the top 15% for Ligue 2 centre-backs.",
    "strengths": ["Aerial duels", "Progressive passing", "Left-foot distribution"],
    "weaknesses": ["Pace in transition", "1v1 defending in wide areas"],
    "recommendation": "Strong fit for possession-based system. Monitor development over next 6 months."
  }'::jsonb, 'wyscout')
  on conflict do nothing;

  -- Watchlist
  insert into watchlists (id, user_id, organization_id, name, description, is_shared)
  values ('d0000000-0000-0000-0000-000000000001', user1_id, org_id, 'Summer 2026 — CB Targets', 'Left-footed centre-back options for summer window', true)
  on conflict (id) do nothing;
  wl_id := 'd0000000-0000-0000-0000-000000000001';

  -- Watchlist players
  insert into watchlist_players (watchlist_id, player_external_id, player_name, player_data, notes)
  values
    (wl_id, 'ws-12345', 'Antoine Dupont', '{"age": 22, "club": "AC Ajaccio"}'::jsonb, 'Top target. Fits profile perfectly. Agent contact: TBD'),
    (wl_id, 'ws-34567', 'Lucas Ferreira', '{"age": 21, "club": "Rodez AF"}'::jsonb, 'Backup option. Younger, higher ceiling but less proven aerially.')
  on conflict do nothing;

  -- Usage tracking
  insert into usage_tracking (organization_id, month, api_calls_count, reports_generated, searches_count)
  values (org_id, '2026-03-01', 142, 8, 23)
  on conflict (organization_id, month) do nothing;

end $$;
