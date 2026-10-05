import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { TrainingPlanId } from '../../src/data/trainingPlans.js';

export interface AcademyCohort {
  id: string;
  courseId: string;
  name: string;
  slug: string;
  status: 'draft' | 'open' | 'full' | 'closed' | 'completed';
  startDate: string | null;
  endDate: string | null;
  enrollmentDeadline: string | null;
  groupCapacity: number;
  smallGroupCapacity: number;
  privateCapacity: number;
}

function mapCohort(row: any): AcademyCohort {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    enrollmentDeadline: row.enrollment_deadline,
    groupCapacity: row.group_capacity,
    smallGroupCapacity: row.small_group_capacity,
    privateCapacity: row.private_capacity
  };
}

export async function getOpenCohort(courseId: string): Promise<AcademyCohort | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Academy database is not configured.');

  const { data, error } = await supabase
    .from('academy_cohorts')
    .select('*')
    .eq('course_id', courseId)
    .in('status', ['open', 'full'])
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCohort(data) : null;
}

export async function getSeatsRemaining(cohortId: string, planId: TrainingPlanId): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Academy database is not configured.');

  const { data, error } = await supabase.rpc('academy_cohort_plan_seats_remaining', {
    p_cohort_id: cohortId,
    p_plan_id: planId
  });

  if (error) throw error;
  return Number(data ?? 0);
}
