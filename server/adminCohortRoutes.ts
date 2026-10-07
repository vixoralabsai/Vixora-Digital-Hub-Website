import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuthentication } from './auth/authMiddleware.js';
import { requireAdmin } from './auth/requireAdmin.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import type { CohortStatus } from './payments/cohortService.js';

export const adminCohortRouter = Router();

adminCohortRouter.use(requireAuthentication, requireAdmin);

const STATUSES: CohortStatus[] = [
  'draft',
  'open',
  'full',
  'closed',
  'in_progress',
  'completed',
  'cancelled'
];

function cleanText(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseDate(value: unknown): string | null {
  const raw = cleanText(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : raw;
}

function parseCapacity(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 100000) return null;
  return n;
}

async function getCohortUsage(supabase: any, cohortId: string) {
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('status')
    .eq('cohort_id', cohortId);

  if (enrollmentError) {
    throw new Error('Failed to read cohort enrollment usage.');
  }

  const enrolledCount = (enrollments || []).filter((row: any) =>
    ['active', 'enrolled', 'confirmed', 'paid'].includes(row.status)
  ).length;

  const now = new Date().toISOString();
  const { data: reservations, error: reservationError } = await supabase
    .from('payments')
    .select('id')
    .eq('cohort_id', cohortId)
    .eq('status', 'pending')
    .gt('reservation_expires_at', now);

  if (reservationError) {
    throw new Error('Failed to read cohort payment reservations.');
  }

  return {
    enrolledCount,
    pendingReservations: (reservations || []).length
  };
}

adminCohortRouter.get('/cohorts', async (_req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Cohort database service is unavailable.', code: 'DATABASE_UNAVAILABLE' });
  }

  try {
    const { data: cohorts, error } = await supabase
      .from('cohorts')
      .select(`
        id,
        course_id,
        course_training_plan_id,
        name,
        code,
        start_date,
        end_date,
        status,
        capacity,
        tutor_id,
        supervisor_id,
        tutor_contact,
        supervisor_contact,
        ai_insight,
        ai_insight_generated_at,
        created_at,
        updated_at,
        course_training_plans (
          id,
          training_plan_id,
          price_ngn,
          capacity,
          enabled,
          training_plans (
            id,
            name,
            short_name,
            default_price_ngn,
            default_capacity,
            active
          )
        ),
        courses (
          id,
          title
        )
      `)
      .order('start_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Cohorts] list:', error);
      return res.status(503).json({ error: 'Failed to retrieve cohorts.', code: 'DATABASE_ERROR' });
    }

    const rows = await Promise.all((cohorts || []).map(async (cohort: any) => {
      const usage = await getCohortUsage(supabase, String(cohort.id));
      return {
        id: String(cohort.id),
        courseId: String(cohort.course_id),
        courseTitle: cohort.courses?.title || cohort.course_id,
        courseTrainingPlanId: String(cohort.course_training_plan_id),
        trainingPlanId: cohort.course_training_plans?.training_plan_id || null,
        trainingPlanName: cohort.course_training_plans?.training_plans?.name || 'Training Plan',
        trainingPlanShortName: cohort.course_training_plans?.training_plans?.short_name || null,
        planPriceNgn: Number(cohort.course_training_plans?.price_ngn ?? 0),
        name: cohort.name,
        code: cohort.code,
        startDate: cohort.start_date,
        endDate: cohort.end_date,
        status: cohort.status,
        capacity: Number(cohort.capacity),
        enrolledCount: usage.enrolledCount,
        pendingReservations: usage.pendingReservations,
        availableSeats: Math.max(0, Number(cohort.capacity) - usage.enrolledCount - usage.pendingReservations),
        tutorId: cohort.tutor_id,
        supervisorId: cohort.supervisor_id,
        tutor: cohort.tutor_contact || null,
        supervisor: cohort.supervisor_contact || null,
        aiInsight: cohort.ai_insight || null,
        aiInsightGeneratedAt: cohort.ai_insight_generated_at || null,
        createdAt: cohort.created_at,
        updatedAt: cohort.updated_at
      };
    }));

    return res.json({ cohorts: rows });
  } catch (error: any) {
    console.error('[Admin Cohorts] list exception:', error);
    return res.status(503).json({ error: error.message || 'Failed to retrieve cohorts.', code: 'DATABASE_ERROR' });
  }
});

adminCohortRouter.get('/cohort-options', async (_req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Cohort database service is unavailable.', code: 'DATABASE_UNAVAILABLE' });
  }

  try {
    const [{ data: plans, error: planError }, { data: courses, error: courseError }] = await Promise.all([
      supabase.from('training_plans').select('id,name,short_name,default_price_ngn,default_capacity,active').order('name'),
      supabase.from('course_training_plans').select('id,course_id,training_plan_id,price_ngn,capacity,enabled,training_plans(id,name,short_name,active),courses(id,title)').eq('enabled', true)
    ]);

    if (planError || courseError) {
      return res.status(503).json({ error: 'Failed to retrieve cohort setup options.', code: 'DATABASE_ERROR' });
    }

    return res.json({
      trainingPlans: plans || [],
      courseTrainingPlans: courses || []
    });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Failed to retrieve cohort setup options.', code: 'DATABASE_ERROR' });
  }
});

async function validatePlanAndCourse(supabase: any, courseTrainingPlanId: string) {
  const { data, error } = await supabase
    .from('course_training_plans')
    .select('id,course_id,training_plan_id,price_ngn,capacity,enabled,training_plans(id,name,short_name,active),courses(id,title)')
    .eq('id', courseTrainingPlanId)
    .maybeSingle();

  if (error || !data) throw new Error('Selected course training plan was not found.');
  if (!data.enabled) throw new Error('Selected course training plan is disabled.');
  if (!data.training_plans?.active) throw new Error('Selected training plan is inactive.');
  return data;
}

adminCohortRouter.post('/cohorts', async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(503).json({ error: 'Cohort database service is unavailable.', code: 'DATABASE_UNAVAILABLE' });

  const name = cleanText(req.body?.name, 120);
  const code = cleanText(req.body?.code, 60).toUpperCase();
  const courseTrainingPlanId = cleanText(req.body?.courseTrainingPlanId, 80);
  const startDate = parseDate(req.body?.startDate);
  const endDate = req.body?.endDate ? parseDate(req.body.endDate) : null;
  const capacity = parseCapacity(req.body?.capacity);
  const status = cleanText(req.body?.status, 30) as CohortStatus;

  if (!name || !code || !courseTrainingPlanId || !startDate || !capacity || !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Name, code, course plan, start date, valid capacity, and status are required.', code: 'INVALID_INPUT' });
  }
  if (endDate && endDate < startDate) {
    return res.status(400).json({ error: 'End date cannot be before start date.', code: 'INVALID_DATE_RANGE' });
  }

  try {
    const plan = await validatePlanAndCourse(supabase, courseTrainingPlanId);
    const requestedTutorId = null;
    const requestedSupervisorId = null;
    const tutor = { name: cleanText(req.body?.tutor?.name, 120), email: cleanText(req.body?.tutor?.email, 160), phone: cleanText(req.body?.tutor?.phone, 40), role: cleanText(req.body?.tutor?.role, 80) || 'Tutor' };
    const supervisor = { name: cleanText(req.body?.supervisor?.name, 120), email: cleanText(req.body?.supervisor?.email, 160), phone: cleanText(req.body?.supervisor?.phone, 40), role: cleanText(req.body?.supervisor?.role, 80) || 'Supervisor' };

    const { data, error } = await supabase
      .from('cohorts')
      .insert({
        course_id: plan.course_id,
        course_training_plan_id: courseTrainingPlanId,
        name,
        code,
        start_date: startDate,
        end_date: endDate,
        status,
        capacity,
        tutor_id: requestedTutorId,
        supervisor_id: requestedSupervisorId,
        tutor_contact: tutor,
        supervisor_contact: supervisor
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'A cohort with this code already exists.', code: 'COHORT_CODE_EXISTS' });
      return res.status(400).json({ error: error.message || 'Failed to create cohort.', code: 'COHORT_CREATE_FAILED' });
    }

    return res.status(201).json({ success: true, cohortId: data.id });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create cohort.', code: 'COHORT_CREATE_FAILED' });
  }
});

adminCohortRouter.patch('/cohorts/:id', async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(503).json({ error: 'Cohort database service is unavailable.', code: 'DATABASE_UNAVAILABLE' });

  const id = cleanText(req.params.id, 80);
  if (!id) return res.status(400).json({ error: 'Cohort id is required.', code: 'COHORT_ID_REQUIRED' });

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('cohorts')
      .select('id,course_id,course_training_plan_id,start_date,end_date,status,capacity')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) return res.status(404).json({ error: 'Cohort not found.', code: 'COHORT_NOT_FOUND' });

    const usage = await getCohortUsage(supabase, id);
    const updates: Record<string, any> = {};

    if (req.body?.name !== undefined) {
      const name = cleanText(req.body.name, 120);
      if (!name) return res.status(400).json({ error: 'Cohort name cannot be empty.', code: 'INVALID_NAME' });
      updates.name = name;
    }
    if (req.body?.code !== undefined) {
      const code = cleanText(req.body.code, 60).toUpperCase();
      if (!code) return res.status(400).json({ error: 'Cohort code cannot be empty.', code: 'INVALID_CODE' });
      updates.code = code;
    }
    if (req.body?.startDate !== undefined) {
      const date = parseDate(req.body.startDate);
      if (!date) return res.status(400).json({ error: 'Start date must use YYYY-MM-DD.', code: 'INVALID_START_DATE' });
      updates.start_date = date;
    }
    if (req.body?.endDate !== undefined) {
      const date = req.body.endDate ? parseDate(req.body.endDate) : null;
      if (req.body.endDate && !date) return res.status(400).json({ error: 'End date must use YYYY-MM-DD.', code: 'INVALID_END_DATE' });
      updates.end_date = date;
    }
    if (updates.start_date && (updates.end_date || existing.end_date) && (updates.end_date || existing.end_date) < updates.start_date) {
      return res.status(400).json({ error: 'End date cannot be before start date.', code: 'INVALID_DATE_RANGE' });
    }
    if (req.body?.capacity !== undefined) {
      const capacity = parseCapacity(req.body.capacity);
      if (!capacity) return res.status(400).json({ error: 'Capacity must be a positive integer.', code: 'INVALID_CAPACITY' });
      if (capacity < usage.enrolledCount + usage.pendingReservations) {
        return res.status(409).json({ error: 'Capacity cannot be reduced below current enrolled students and active reservations.', code: 'CAPACITY_BELOW_USAGE' });
      }
      updates.capacity = capacity;
    }
    if (req.body?.status !== undefined) {
      const status = cleanText(req.body.status, 30) as CohortStatus;
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid cohort status.', code: 'INVALID_STATUS' });
      if (status === 'open' && existing.status !== 'open' && existing.capacity <= usage.enrolledCount + usage.pendingReservations) {
        return res.status(409).json({ error: 'Cohort cannot be opened because it has no available seats.', code: 'NO_AVAILABLE_SEATS' });
      }
      updates.status = status;
    }
    if (req.body?.tutor !== undefined) updates.tutor_contact = { name: cleanText(req.body.tutor?.name, 120), email: cleanText(req.body.tutor?.email, 160), phone: cleanText(req.body.tutor?.phone, 40), role: cleanText(req.body.tutor?.role, 80) || 'Tutor' };
    if (req.body?.supervisor !== undefined) updates.supervisor_contact = { name: cleanText(req.body.supervisor?.name, 120), email: cleanText(req.body.supervisor?.email, 160), phone: cleanText(req.body.supervisor?.phone, 40), role: cleanText(req.body.supervisor?.role, 80) || 'Supervisor' };

    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase.from('cohorts').update(updates).eq('id', id);
    if (updateError) {
      if (updateError.code === '23505') return res.status(409).json({ error: 'A cohort with this code already exists.', code: 'COHORT_CODE_EXISTS' });
      return res.status(400).json({ error: updateError.message || 'Failed to update cohort.', code: 'COHORT_UPDATE_FAILED' });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update cohort.', code: 'COHORT_UPDATE_FAILED' });
  }
});


adminCohortRouter.post('/cohorts/:id/insights', async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(503).json({ error: 'Cohort database service is unavailable.', code: 'DATABASE_UNAVAILABLE' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI insights are not configured.', code: 'GEMINI_UNCONFIGURED' });

  try {
    const id = cleanText(req.params.id, 80);
    const { data: cohort, error } = await supabase.from('cohorts')
      .select('id,name,code,status,capacity,start_date,end_date,tutor_contact,supervisor_contact')
      .eq('id', id).maybeSingle();
    if (error || !cohort) return res.status(404).json({ error: 'Cohort not found.', code: 'COHORT_NOT_FOUND' });

    const usage = await getCohortUsage(supabase, id);
    const availableSeats = Math.max(0, Number(cohort.capacity) - usage.enrolledCount - usage.pendingReservations);
    const snapshot = {
      cohort: { name: cohort.name, code: cohort.code, status: cohort.status, capacity: cohort.capacity, startDate: cohort.start_date, endDate: cohort.end_date },
      enrollment: { enrolled: usage.enrolledCount, pendingReservations: usage.pendingReservations, availableSeats },
      staffing: { tutor: cohort.tutor_contact || null, supervisor: cohort.supervisor_contact || null }
    };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: 'Review this Vixora Academy cohort snapshot and return 3-5 concise, practical admin insights. Focus on enrollment momentum, seat pressure, readiness, and one recommended action. Do not discuss attendance or invent missing data. Snapshot: ' + JSON.stringify(snapshot) }] }],
      config: { temperature: 0.2 }
    });
    const insight = (response.text || '').trim();
    if (!insight) return res.status(502).json({ error: 'AI did not return an insight.', code: 'AI_EMPTY' });

    const generatedAt = new Date().toISOString();
    await supabase.from('cohorts').update({ ai_insight: insight, ai_insight_generated_at: generatedAt, updated_at: generatedAt }).eq('id', id);
    return res.json({ success: true, insight, generatedAt, snapshot });
  } catch (error: any) {
    console.error('[Admin Cohort AI] insight:', error);
    return res.status(500).json({ error: 'Failed to generate cohort insight.', code: 'AI_INSIGHT_FAILED' });
  }
});

export default adminCohortRouter;
