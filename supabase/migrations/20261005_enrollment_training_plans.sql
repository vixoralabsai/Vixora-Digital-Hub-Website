-- Vixora Academy: Persist selected training tier on learner enrollment.
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

CREATE INDEX IF NOT EXISTS idx_enrollments_plan_id ON enrollments(plan_id);

COMMENT ON COLUMN enrollments.plan_id IS
  'Vixora Academy training tier selected for this enrollment: group, small-group, or private.';
