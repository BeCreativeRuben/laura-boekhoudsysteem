-- Add solidaris_uitzondering field to klanten table
-- This allows marking clients who have a doctor's attest for Solidaris (8 sessions instead of 4)

ALTER TABLE IF EXISTS klanten 
ADD COLUMN IF NOT EXISTS solidaris_uitzondering boolean DEFAULT false;

COMMENT ON COLUMN klanten.solidaris_uitzondering IS 'Indicates if client has doctor attest for Solidaris (allows 8 sessions instead of 4)';
