import express from 'express';
import { getOpenCohort, getSeatsRemaining } from './cohortCatalog.js';
import { TrainingPlanId } from '../../src/data/trainingPlans.js';

const router = express.Router();

router.get('/availability', async (req, res) => {
  try {
    const courseId = String(req.query.courseId || '').trim();

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const cohort = await getOpenCohort(courseId);

    if (!cohort) {
      return res.json({
        cohort: null,
        seats: {
          group: 0,
          'small-group': 0,
          private: 0
        }
      });
    }

    const planIds: TrainingPlanId[] = ['group', 'small-group', 'private'];
    const entries = await Promise.all(
      planIds.map(async (planId) => [planId, await getSeatsRemaining(cohort.id, planId)] as const)
    );

    return res.json({
      cohort: {
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        enrollmentDeadline: cohort.enrollmentDeadline,
        status: cohort.status
      },
      seats: Object.fromEntries(entries)
    });
  } catch (error) {
    console.error('[Academy Cohort Availability]', error);
    return res.status(500).json({ error: 'Unable to load cohort availability' });
  }
});

export default router;
