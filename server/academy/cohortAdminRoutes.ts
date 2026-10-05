import express from 'express';
import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { requireAuthentication } from '../auth/authMiddleware.js';
import { requireAdmin } from '../auth/requireAdmin.js';
import { TrainingPlanId } from '../../src/data/trainingPlans.js';

const router = express.Router();

const PLAN_IDS: TrainingPlanId[] = ['group', 'small-group', 'private'];

function toIsoOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapCohort(row: any, seats: Record<string, number>) {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    enrollmentDeadline: row.enrollment_deadline,
    capacities: {
      group: row.group_capacity,
      'small-group': row.small_group_capacity,
      private: row.private_capacity
    },
    seats
  };
}

async function getCohortSeats(supabase: any, cohortId: string) {
  const entries = await Promise.all(
    PLAN_IDS.map(async (planId) => {
      const { data, error } = await supabase.rpc('academy_cohort_plan_seats_remaining', {
        p_cohort_id: cohortId,
        p_plan_id: planId
      });
      if (error) throw error;
      return [planId, Number(data ?? 0)] as const;
    })
  );
  return Object.fromEntries(entries) as Record<string, number>;
}

router.use(requireAuthentication, requireAdmin);

router.get('/admin', async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(503).json({ error: 'Academy database is not configured.', code: 'DATABASE_UNCONFIGURED' });

    const { data: cohorts, error } = await supabase
      .from('academy_cohorts')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;

    const items = await Promise.all((cohorts || []).map(async (cohort: any) => {
      const seats = await getCohortSeats(supabase, cohort.id);
      return mapCohort(cohort, seats);
    }));

    const active = items.filter((c) => ['open', 'full'].includes(c.status));
    return res.json({
      cohorts: items,
      activeCohort: active[0] || null,
      totals: {
        cohorts: items.length,
        open: items.filter((c) => c.status === 'open').length,
        full: items.filter((c) => c.status === 'full').length,
        closed: items.filter((c) => c.status === 'closed').length,
        completed: items.filter((c) => c.status === 'completed').length
      }
    });
  } catch (error: any) {
    console.error('[Academy Cohort Admin]', error);
    return res.status(500).json({ error: error?.message || 'Unable to load academy cohorts.' });
  }
});

router.post('/admin', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(503).json({ error: 'Academy database is not configured.', code: 'DATABASE_UNCONFIGURED' });

    const body = req.body || {};
    const courseId = String(body.courseId || '').trim();
    const name = String(body.name || '').trim();
    const slug = String(body.slug || '').trim();

    if (!courseId || !name || !slug) {
      return res.status(400).json({ error: 'courseId, name and slug are required.' });
    }

    const payload = {
      course_id: courseId,
      name,
      slug,
      status: ['draft', 'open', 'full', 'closed', 'completed'].includes(body.status) ? body.status : 'draft',
      start_date: toIsoOrNull(body.startDate),
      end_date: toIsoOrNull(body.endDate),
      enrollment_deadline: toIsoOrNull(body.enrollmentDeadline),
      group_capacity: Math.max(1, Number(body.groupCapacity) || 300),
      small_group_capacity: Math.max(1, Number(body.smallGroupCapacity) || 5),
      private_capacity: Math.max(1, Number(body.privateCapacity) || 1)
    };

    if (payload.status === 'open') {
      await supabase.from('academy_cohorts').update({ status: 'closed' }).eq('course_id', courseId).eq('status', 'open');
    }

    const { data, error } = await supabase.from('academy_cohorts').insert(payload).select('*').single();
    if (error) throw error;

    return res.status(201).json({ cohort: mapCohort(data, { group: payload.group_capacity, 'small-group': payload.small_group_capacity, private: payload.private_capacity }) });
  } catch (error: any) {
    console.error('[Academy Cohort Create]', error);
    return res.status(500).json({ error: error?.message || 'Unable to create cohort.' });
  }
});

router.patch('/admin/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return res.status(503).json({ error: 'Academy database is not configured.', code: 'DATABASE_UNCONFIGURED' });

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Cohort id is required.' });

    const body = req.body || {};
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.slug !== undefined) update.slug = String(body.slug).trim();
    if (body.status !== undefined && ['draft', 'open', 'full', 'closed', 'completed'].includes(body.status)) update.status = body.status;
    if (body.startDate !== undefined) update.start_date = toIsoOrNull(body.startDate);
    if (body.endDate !== undefined) update.end_date = toIsoOrNull(body.endDate);
    if (body.enrollmentDeadline !== undefined) update.enrollment_deadline = toIsoOrNull(body.enrollmentDeadline);
    if (body.groupCapacity !== undefined) update.group_capacity = Math.max(1, Number(body.groupCapacity) || 1);
    if (body.smallGroupCapacity !== undefined) update.small_group_capacity = Math.max(1, Number(body.smallGroupCapacity) || 1);
    if (body.privateCapacity !== undefined) update.private_capacity = Math.max(1, Number(body.privateCapacity) || 1);

    const { data: current, error: currentError } = await supabase.from('academy_cohorts').select('course_id').eq('id', id).single();
    if (currentError) throw currentError;

    if (update.status === 'open') {
      await supabase.from('academy_cohorts').update({ status: 'closed' }).eq('course_id', current.course_id).neq('id', id).eq('status', 'open');
    }

    const { data, error } = await supabase.from('academy_cohorts').update(update).eq('id', id).select('*').single();
    if (error) throw error;

    const seats = await getCohortSeats(supabase, id);
    return res.json({ cohort: mapCohort(data, seats) });
  } catch (error: any) {
    console.error('[Academy Cohort Update]', error);
    return res.status(500).json({ error: error?.message || 'Unable to update cohort.' });
  }
});

export default router;
