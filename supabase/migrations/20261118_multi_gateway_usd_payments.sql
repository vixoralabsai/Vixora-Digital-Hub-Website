-- ==============================================================================
-- Vixora Academy: Multi-Gateway & Multi-Currency Payments Migration
-- Extends payments table for Bachs (USD) alongside Paystack (NGN),
-- adds gateway, gateway_mode ('live' | 'sandbox'), external_session_id,
-- and currency-neutral minor unit storage (amount_minor).
-- Purely additive and safe on existing production databases.
-- ==============================================================================

-- 1. Gateway & Environment Mode Columns
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway TEXT NOT NULL DEFAULT 'paystack',
ADD COLUMN IF NOT EXISTS gateway_mode TEXT NOT NULL DEFAULT 'live',
ADD COLUMN IF NOT EXISTS external_session_id TEXT,
ADD COLUMN IF NOT EXISTS amount_minor BIGINT;

-- 2. Backfill amount_minor from amount_kobo for historical NGN rows
UPDATE payments
SET amount_minor = amount_kobo
WHERE amount_minor IS NULL;

-- Ensure precision supports USD decimal prices (e.g. 50.00 or 19.99) alongside NGN
ALTER TABLE payments
ALTER COLUMN amount TYPE NUMERIC(12, 2);

-- 3. Indexes for Gateway Filtering, Reconciliation & Session Lookups
CREATE INDEX IF NOT EXISTS idx_payments_gateway
ON payments(gateway);

CREATE INDEX IF NOT EXISTS idx_payments_gateway_mode
ON payments(gateway_mode);

CREATE INDEX IF NOT EXISTS idx_payments_currency
ON payments(currency);

CREATE INDEX IF NOT EXISTS idx_payments_external_session_id
ON payments(external_session_id)
WHERE external_session_id IS NOT NULL;
