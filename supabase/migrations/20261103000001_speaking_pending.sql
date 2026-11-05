-- "No puedo hablar ahora" leaves a unit partially done: the learner finishes it and moves on,
-- but the end-of-level exam waits until every pending speaking part of the level is done.
-- Additive: the current app never reads it.

ALTER TABLE unit_progress ADD COLUMN IF NOT EXISTS speaking_pending BOOLEAN NOT NULL DEFAULT FALSE;
