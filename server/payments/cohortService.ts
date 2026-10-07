export type CohortStatus =
  | 'draft'
  | 'open'
  | 'full'
  | 'closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CohortSeatRecord {
  id: string;
  courseId: string;
  courseTrainingPlanId: string;
  status: CohortStatus;
  capacity: number;
  enrolledCount: number;
}

export interface CohortSelection {
  cohortId: string;
  availableSeats: number;
}

/**
 * Pure seat calculation used by checkout/admin flows.
 * Pending payments are intentionally not counted here until a durable reservation
 * mechanism is added; fulfilled/active enrollment is the source of truth.
 */
export function getAvailableSeats(cohort: CohortSeatRecord): number {
  return Math.max(0, cohort.capacity - cohort.enrolledCount);
}

export function isCohortBookable(cohort: CohortSeatRecord): boolean {
  return cohort.status === 'open' && getAvailableSeats(cohort) > 0;
}

export function selectBookableCohort(
  cohorts: CohortSeatRecord[],
  preferredCohortId?: string | null
): CohortSelection | null {
  const bookable = cohorts.filter(isCohortBookable);

  if (preferredCohortId) {
    const preferred = bookable.find((cohort) => cohort.id === preferredCohortId);
    if (preferred) {
      return {
        cohortId: preferred.id,
        availableSeats: getAvailableSeats(preferred)
      };
    }
  }

  const next = [...bookable].sort((a, b) => {
    const seats = getAvailableSeats(b) - getAvailableSeats(a);
    return seats || a.id.localeCompare(b.id);
  })[0];

  return next
    ? { cohortId: next.id, availableSeats: getAvailableSeats(next) }
    : null;
}

/**
 * Server-side Supabase lookup. This intentionally does not mutate anything;
 * reservation/transaction locking belongs in the checkout phase.
 */
export async function listBookableCohorts(
  supabase: any,
  courseTrainingPlanId: string
): Promise<CohortSeatRecord[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('cohorts')
    .select('id,course_id,course_training_plan_id,status,capacity,enrollments(status)')
    .eq('course_training_plan_id', courseTrainingPlanId)
    .in('status', ['open', 'full'])
    .order('start_date', { ascending: true });

  if (error || !Array.isArray(data)) return [];

  return data.map((row: any) => {
    const enrollments = Array.isArray(row.enrollments) ? row.enrollments : [];
    const enrolledCount = enrollments.filter((enrollment: any) =>
      ['active', 'enrolled', 'confirmed', 'paid'].includes(enrollment?.status)
    ).length;

    return {
      id: String(row.id),
      courseId: String(row.course_id),
      courseTrainingPlanId: String(row.course_training_plan_id),
      status: row.status as CohortStatus,
      capacity: Number(row.capacity),
      enrolledCount
    };
  });
}

export interface CohortReservation {
  cohortId: string;
  availableSeatsAfterReservation: number;
}

/**
 * Atomically reserves one cohort seat and creates the pending payment record.
 * The database function locks the cohort row so concurrent checkouts cannot
 * reserve the same final seat.
 */
export async function reservePaymentCohort(
  supabase: any,
  input: {
    paymentId: string;
    courseId: string;
    planId?: string | null;
    cohortId: string;
    amountKobo: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string | null;
    reservationExpiresAt: string;
  }
): Promise<CohortReservation> {
  if (!supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const { data, error } = await supabase.rpc('reserve_payment_cohort', {
    p_payment_id: input.paymentId,
    p_course_id: input.courseId,
    p_plan_id: input.planId || null,
    p_cohort_id: input.cohortId,
    p_amount_kobo: input.amountKobo,
    p_customer_email: input.customerEmail,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone || null,
    p_reservation_expires_at: input.reservationExpiresAt
  });

  if (error) {
    throw new Error(error.message || 'COHORT_RESERVATION_FAILED');
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.cohort_id) {
    throw new Error('COHORT_RESERVATION_FAILED');
  }

  return {
    cohortId: String(row.cohort_id),
    availableSeatsAfterReservation: Number(row.available_seats)
  };
}


export async function validatePaymentCohortCapacity(
  supabase: any,
  paymentId: string,
  cohortId: string
): Promise<boolean> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  const { data, error } = await supabase.rpc('validate_payment_cohort_capacity', {
    p_payment_id: paymentId,
    p_cohort_id: cohortId
  });

  if (error) {
    throw new Error(error.message || 'COHORT_CAPACITY_VALIDATION_FAILED');
  }

  return data === true;
}
