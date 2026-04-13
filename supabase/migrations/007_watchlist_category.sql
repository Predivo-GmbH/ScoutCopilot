-- Add category column to watchlists for filter tabs (Transfer Targets, Youth Prospects, Position-Specific)
ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS category text DEFAULT 'all';
