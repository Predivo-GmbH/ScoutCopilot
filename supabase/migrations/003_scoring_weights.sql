-- Add scoring_weights JSONB column to profiles table
-- Stores user-configurable AI scoring preferences:
-- { attacking_weight, defending_weight, passing_weight, physical_weight } (each 0-100)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scoring_weights jsonb DEFAULT NULL;
