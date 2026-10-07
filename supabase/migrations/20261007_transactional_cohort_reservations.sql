-- ==============================================================================
-- Vixora Academy: Transactional cohort seat reservations for Paystack checkout
-- ==============================================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payments_cohort_pending_reservation
  ON payments(cohort_id, status, reservation_expires_at)
  WHERE cohort_id IS NOT NULL AND status = 'pending';

-- Atomically locks the cohort, counts active enrollments + unexpired pending
-- payment reservations, and creates the payment record in the same transaction.
-- This closes the read-then-write race that can otherwise overbook the cohort.
CREATE OR REPLACE FUNCTION reserve_payment_cohort(
  p_payment_id TEXT,
  p_course_id TEXT,
  p_plan_id TEXT,
  p_cohort_id UUID,
  p_amount_kobo BIGINT,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_reservation_expires_at TIMESTAMPTZ
)
RETURNS TABLE (
  cohort_id UUID,
  available_seats INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cohort cohorts%ROWTYPE;
  v_plan_id TEXT;
  v_enrolled_count INTEGER;
  v_reserved_count INTEGER;
  v_remaining INTEGER;
BEGIN
  SELECT *
    INTO v_cohort
  FROM cohorts
  WHERE id = p_cohort_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COHORT_NOT_FOUND';
  END IF;

  IF v_cohort.status <> 'open' THEN
    RAISE EXCEPTION 'COHORT_NOT_OPEN';
  END IF;

  IF v_cohort.course_id <> p_course_id THEN
    RAISE EXCEPTION 'COHORT_COURSE_MISMATCH';
  END IF;

  SELECT ctp.training_plan_id
    INTO v_plan_id
  FROM course_training_plans ctp
  WHERE ctp.id = v_cohort.course_training_plan_id
    AND ctp.enabled = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COHORT_PLAN_NOT_AVAILABLE';
  END IF;

  IF p_plan_id IS NOT NULL AND v_plan_id <> p_plan_id THEN
    RAISE EXCEPTION 'COHORT_PLAN_MISMATCH';
  END IF;

  SELECT COUNT(*)::INTEGER
    INTO v_enrolled_count
  FROM enrollments e
  WHERE e.cohort_id = p_cohort_id
    AND e.status IN ('active', 'enrolled', 'confirmed', 'paid');

  SELECT COUNT(*)::INTEGER
    INTO v_reserved_count
  FROM payments p
  WHERE p.cohort_id = p_cohort_id
    AND p.status = 'pending'
    AND p.reservation_expires_at IS NOT NULL
    AND p.reservation_expires_at > NOW();

  v_remaining := v_cohort.capacity - v_enrolled_count - v_reserved_count;

  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'COHORT_FULL';
  END IF;

  INSERT INTO payments (
    id,
    student_id,
    course_id,
    plan_id,
    cohort_id,
    amount,
    amount_kobo,
    currency,
    status,
    fulfillment_status,
    customer_email,
    customer_name,
    customer_phone,
    reservation_expires_at
  )
  VALUES (
    p_payment_id,
    NULL,
    p_course_id,
    p_plan_id,
    p_cohort_id,
    (p_amount_kobo::NUMERIC / 100),
    p_amount_kobo,
    'NGN',
    'pending',
    'pending',
    p_customer_email,
    p_customer_name,
    p_customer_phone,
    p_reservation_expires_at
  );

  RETURN QUERY SELECT p_cohort_id, v_remaining - 1;
END;
$$;

REVOKE ALL ON FUNCTION reserve_payment_cohort(
  TEXT, TEXT, TEXT, UUID, BIGINT, TEXT, TEXT, TEXT, TIMESTAMPTZ
) FROM PUBLIC;
