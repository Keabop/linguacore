-- ============================================
-- Voxie — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL DEFAULT 'A1' CHECK (current_level IN ('A1','A2','B1','B2')),
  unlocked_levels TEXT[] NOT NULL DEFAULT ARRAY['A1'],
  total_words_learned INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  level_progress JSONB NOT NULL DEFAULT '{
    "A1": {"words": 0, "stories": 0, "retention": 0},
    "A2": {"words": 0, "stories": 0, "retention": 0},
    "B1": {"words": 0, "stories": 0, "retention": 0},
    "B2": {"words": 0, "stories": 0, "retention": 0}
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FSRS Flashcards
CREATE TABLE cards (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  state INTEGER NOT NULL DEFAULT 0,
  due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_review TIMESTAMPTZ,
  UNIQUE(user_id, word_id)
);
CREATE INDEX idx_cards_due ON cards(user_id, due);

-- Study Sessions
CREATE TABLE study_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  new_words_learned INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_sessions_user_date ON study_sessions(user_id, date);

-- Read Stories
CREATE TABLE read_stories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  words_added INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, story_id)
);

-- Known Words
CREATE TABLE known_words (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  known_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

-- Unit Progress
CREATE TABLE unit_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  grammar_card_read BOOLEAN NOT NULL DEFAULT FALSE,
  story_completed BOOLEAN NOT NULL DEFAULT FALSE,
  vocab_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  exercises_score INTEGER NOT NULL DEFAULT 0,
  output_completed BOOLEAN NOT NULL DEFAULT FALSE,
  checkpoint_passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, unit_id)
);
CREATE INDEX idx_unit_progress_user ON unit_progress(user_id);

-- Level Assessments
CREATE TABLE level_assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('A1','A2','B1','B2')),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Writing Submissions
CREATE TABLE writing_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  user_text TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  corrections JSONB NOT NULL DEFAULT '[]',
  feedback_summary JSONB NOT NULL DEFAULT '{}',
  improved_version TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speaking Submissions
CREATE TABLE speaking_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  accuracy_score INTEGER NOT NULL DEFAULT 0,
  ai_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own cards" ON cards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own read_stories" ON read_stories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own known_words" ON known_words
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own progress" ON unit_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own assessments" ON level_assessments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own writing" ON writing_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own speaking" ON speaking_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
