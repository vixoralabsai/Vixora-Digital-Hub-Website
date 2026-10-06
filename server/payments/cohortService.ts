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
