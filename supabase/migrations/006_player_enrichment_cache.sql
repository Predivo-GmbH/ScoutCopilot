-- Cache for current player data from API-Football
-- Prevents burning through 100 req/day free tier limit
-- TTL: enrichment is refreshed when stale (>30 days)

CREATE TABLE IF NOT EXISTS player_enrichment_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_external_id text NOT NULL,
  current_club text,
  current_league text,
  birth_date date,
  photo_url text,
  api_football_id integer,
  raw_data jsonb DEFAULT '{}'::jsonb,
  enriched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint on player_external_id so we upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrichment_cache_player
  ON player_enrichment_cache (player_external_id);

-- Index for stale lookups
CREATE INDEX IF NOT EXISTS idx_enrichment_cache_stale
  ON player_enrichment_cache (enriched_at);

-- RLS: service role only (edge functions use service key)
ALTER TABLE player_enrichment_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (for frontend caching if needed)
CREATE POLICY "Authenticated users can read enrichment cache"
  ON player_enrichment_cache FOR SELECT
  TO authenticated
  USING (true);
