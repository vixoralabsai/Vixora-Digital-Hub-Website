-- Vixora Academy: Training tier support
-- Stores the selected commercial learning experience on each payment.
-- Amount remains server-authoritative; this column is an audit/reference field.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON payments(plan_id);

COMMENT ON COLUMN payments.plan_id IS
  'Vixora Academy training tier: group, small-group, or private.';
