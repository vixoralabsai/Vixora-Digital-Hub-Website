-- ==============================================================================
-- Vixora Academy: Validate a reserved cohort seat during payment fulfillment
-- ==============================================================================

CREATE OR REPLACE FUNCTION validate_payment_cohort_capacity(
  p_payment_id TEXT,
  p_cohort_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cohort cohorts%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_enrolled_count INTEGER;
  v_reserved_count INTEGER;
BEGIN
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND OR v_payment.cohort_id IS DISTINCT FROM p_cohort_id THEN
    RAISE EXCEPTION 'PAYMENT_COHORT_MISMATCH';
  END IF;

  SELECT * INTO v_cohort
  FROM cohorts
  WHERE id = p_cohort_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COHORT_NOT_FOUND';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_enrolled_count
  FROM enrollments e
  WHERE e.cohort_id = p_cohort_id
    AND e.status IN ('active', 'enrolled', 'confirmed', 'paid');

  SELECT COUNT(*)::INTEGER INTO v_reserved_count
  FROM payments p
  WHERE p.cohort_id = p_cohort_id
    AND p.id <> p_payment_id
    AND p.status = 'pending'
    AND p.reservation_expires_at IS NOT NULL
    AND p.reservation_expires_at > NOW();

  IF v_enrolled_count + v_reserved_count + 1 > v_cohort.capacity THEN
    RAISE EXCEPTION 'COHORT_FULL';
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION validate_payment_cohort_capacity(TEXT, UUID) FROM PUBLIC;
