-- Vixora Academy: course-aware training plan snapshots
-- Training plans are currently configured in the application catalog.
-- These columns persist the selected plan alongside the historical payment/enrollment.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_plan_id
  ON payments(plan_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_plan_id
  ON enrollments(plan_id);
