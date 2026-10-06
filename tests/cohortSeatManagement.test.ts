import {
  getAvailableSeats,
  isCohortBookable,
  selectBookableCohort
} from '../server/payments/cohortService.js';

const open = {
  id: 'cohort-a',
  courseId: 'course-ai-automation-digital-business-systems',
  courseTrainingPlanId: 'plan-small',
  status: 'open' as const,
  capacity: 5,
  enrolledCount: 2
};

const full = {
  ...open,
  id: 'cohort-full',
  status: 'full' as const,
  enrolledCount: 5
};

if (getAvailableSeats(open) !== 3) {
  throw new Error('Expected 3 available seats.');
}

if (!isCohortBookable(open)) {
  throw new Error('Expected open cohort with seats to be bookable.');
}

if (isCohortBookable(full)) {
  throw new Error('Full cohort must not be bookable.');
}

const preferred = selectBookableCohort([open, full], 'cohort-a');
if (!preferred || preferred.cohortId !== 'cohort-a' || preferred.availableSeats !== 3) {
  throw new Error('Expected preferred open cohort to be selected.');
}

const none = selectBookableCohort([full]);
if (none !== null) {
  throw new Error('Expected null when no bookable cohort exists.');
}

console.log('✓ cohort seat management tests passed');
