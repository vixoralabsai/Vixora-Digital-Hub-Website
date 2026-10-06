-- ==============================================================================
-- Vixora Academy: Cohort & Seat Management (Phase 2)
-- Commercial model: Course -> Training Plan -> Cohort -> Enrollment
-- Keeps payment pricing authoritative while adding real cohort capacity.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS training_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  default_price_ngn NUMERIC(12, 2) NOT NULL CHECK (default_price_ngn >= 0),
  default_capacity INTEGER NOT NULL CHECK (default_capacity > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  training_plan_id TEXT NOT NULL REFERENCES training_plans(id) ON DELETE RESTRICT,
  price_ngn NUMERIC(12, 2) NOT NULL CHECK (price_ngn >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, training_plan_id)
);

CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  course_training_plan_id UUID NOT NULL REFERENCES course_training_plans(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'full', 'closed', 'in_progress', 'completed', 'cancelled')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  tutor_id UUID,
  supervisor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_course_training_plans_course
  ON course_training_plans(course_id);

CREATE INDEX IF NOT EXISTS idx_course_training_plans_enabled
  ON course_training_plans(enabled);

CREATE INDEX IF NOT EXISTS idx_cohorts_course_status
  ON cohorts(course_id, status);

CREATE INDEX IF NOT EXISTS idx_cohorts_plan_status
  ON cohorts(course_training_plan_id, status);

CREATE INDEX IF NOT EXISTS idx_cohorts_start_date
  ON cohorts(start_date);

-- Historical references: a payment/enrollment must remain tied to the cohort
-- selected/reserved at checkout. These are nullable for legacy records.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payments_cohort_id
  ON payments(cohort_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'enrollments'
  ) THEN
    ALTER TABLE enrollments
      ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id
      ON enrollments(cohort_id);
  END IF;
END $$;

-- Prevent duplicate active cohort enrollment for the same student.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'enrollments'
      AND column_name = 'student_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'enrollments'
      AND column_name = 'status'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_student_active_cohort
      ON enrollments(student_id, cohort_id)
      WHERE cohort_id IS NOT NULL
        AND status IN ('active', 'enrolled', 'confirmed', 'paid');
  END IF;
END $$;

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

-- Public users may read only active course-plan options and open cohorts.
-- Writes remain server/admin controlled.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_plans' AND policyname = 'Public can view active training plans'
  ) THEN
    CREATE POLICY "Public can view active training plans"
      ON training_plans FOR SELECT TO anon, authenticated
      USING (active = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'course_training_plans' AND policyname = 'Public can view enabled course plans'
  ) THEN
    CREATE POLICY "Public can view enabled course plans"
      ON course_training_plans FOR SELECT TO anon, authenticated
      USING (enabled = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'Public can view open cohorts'
  ) THEN
    CREATE POLICY "Public can view open cohorts"
      ON cohorts FOR SELECT TO anon, authenticated
      USING (status IN ('open', 'full'));
  END IF;
END $$;
