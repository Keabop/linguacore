- ============================================
-- Migration: Create CEFR Simulations Table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS cefr_simulations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('placement', 'official_toefl', 'official_ielts', 'official_cambridge')),
  level TEXT NOT NULL, -- Estimated level e.g. 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  score INTEGER NOT NULL, -- Overall score (0-100)
  listening_score INTEGER,
  reading_score INTEGER,
  use_of_english_score INTEGER,
  writing_score INTEGER,
  writing_feedback JSONB, -- Feedback object from Gemini evaluator
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE cefr_simulations ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policy
CREATE POLICY "Users manage own simulations" ON cefr_simulations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
``
