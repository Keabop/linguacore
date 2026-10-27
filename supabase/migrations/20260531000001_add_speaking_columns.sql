-- ====================================================================
-- Migration: Add Speaking Columns to CEFR Simulations Table
-- Execution: Paste and run this script in your Supabase SQL Editor
-- ====================================================================

-- 1. Add speaking_score column if it does not exist
ALTER TABLE cefr_simulations 
  ADD COLUMN IF NOT EXISTS speaking_score INTEGER;

-- 2. Add speaking_feedback column if it does not exist
ALTER TABLE cefr_simulations 
  ADD COLUMN IF NOT EXISTS speaking_feedback JSONB;

-- 3. Update the check constraint to include B1 and B2 Cambridge formats explicitly
-- Note: Cambridge B1 and B2 are supported by the frontend. We drop the old check 
-- constraint if needed or make sure it allows the new keys.
ALTER TABLE cefr_simulations 
  DROP CONSTRAINT IF EXISTS cefr_simulations_test_type_check;

ALTER TABLE cefr_simulations 
  ADD CONSTRAINT cefr_simulations_test_type_check 
  CHECK (test_type IN ('placement', 'toefl', 'ielts', 'cambridge_b1', 'cambridge_b2'));

COMMENT ON COLUMN cefr_simulations.speaking_score IS 'Estimated score for the oral speaking section (0-100)';
COMMENT ON COLUMN cefr_simulations.speaking_feedback IS 'Detailed analytical feedback returned by Gemini for the speaking tasks';
