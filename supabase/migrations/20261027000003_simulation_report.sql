-- The simulators' own result (IELTS/TOEFL band, Cambridge scale, adaptive stages) next to the
-- percentages, so the history shows what the learner saw on the results screen.
ALTER TABLE cefr_simulations ADD COLUMN IF NOT EXISTS report jsonb;
