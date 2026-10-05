-- Vixora Academy: cohort and seat management

CREATE TABLE IF NOT EXISTS academy_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','full','closed','completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  enrollment_deadline TIMESTAMPTZ,
  group_capacity INTEGER NOT NULL DEFAULT 300 CHECK (group_capacity > 0),
  small_group_capacity INTEGER NOT NULL DEFAULT 5 CHECK (small_group_capacity > 0),
  private_capacity INTEGER NOT NULL DEFAULT 1 CHECK (private_capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academy_cohorts_course_id ON academy_cohorts(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_cohorts_status ON academy_cohorts(status);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES academy_cohorts(id);

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES academy_cohorts(id);

CREATE INDEX IF NOT EXISTS idx_payments_cohort_id ON payments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON enrollments(cohort_id);

CREATE OR REPLACE FUNCTION academy_cohort_plan_capacity(
  p_cohort_id UUID,
  p_plan_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  capacity INTEGER;
BEGIN
  SELECT CASE p_plan_id
    WHEN 'group' THEN group_capacity
    WHEN 'small-group' THEN small_group_capacity
    WHEN 'private' THEN private_capacity
    ELSE 0
  END
  INTO capacity
  FROM academy_cohorts
  WHERE id = p_cohort_id;

  RETURN COALESCE(capacity, 0);
END;
$$;

CREATE OR REPLACE FUNCTION academy_cohort_plan_enrollment_count(
  p_cohort_id UUID,
  p_plan_id TEXT
)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT COUNT(*)::INTEGER
  FROM enrollments
  WHERE cohort_id = p_cohort_id
    AND plan_id = p_plan_id
    AND status IN ('enrolled', 'active', 'completed');
$$;

CREATE OR REPLACE FUNCTION academy_cohort_plan_seats_remaining(
  p_cohort_id UUID,
  p_plan_id TEXT
)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT GREATEST(
    academy_cohort_plan_capacity(p_cohort_id, p_plan_id)
    - academy_cohort_plan_enrollment_count(p_cohort_id, p_plan_id),
    0
  );
$$;
