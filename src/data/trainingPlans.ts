/**
 * Vixora Academy — Course-aware training plans
 *
 * Training tiers are opt-in per course. Standalone courses never inherit
 * these prices automatically.
 */

export type CoursePricingMode = 'standalone' | 'tiered';

export interface TrainingPlan {
  id: 'group' | 'small-group' | 'private';
  name: string;
  shortName: string;
  priceNGN: number;
  capacity: number;
  badge?: string;
  description: string;
  features: string[];
}

export const TRAINING_PLANS: Record<TrainingPlan['id'], TrainingPlan> = {
  group: {
    id: 'group',
    name: 'Group Training',
    shortName: 'Group',
    priceNGN: 45000,
    capacity: 300,
    description: 'Structured cohort learning with the full curriculum and community support.',
    features: ['Full cohort curriculum', 'Live practical sessions', 'Community support', 'Certificate of completion']
  },
  'small-group': {
    id: 'small-group',
    name: 'Small Group',
    shortName: 'Small Group',
    priceNGN: 60000,
    capacity: 5,
    badge: 'Most Popular',
    description: 'A focused learning environment with more direct tutor attention.',
    features: ['Everything in Group', 'Maximum 5 learners', 'Tutor guidance', 'Supervisor support']
  },
  private: {
    id: 'private',
    name: 'Private 1-on-1',
    shortName: 'Private 1-on-1',
    priceNGN: 100000,
    capacity: 1,
    badge: 'Premium',
    description: 'Private mentorship for learners who want the highest level of direct support.',
    features: ['Everything in Small Group', '1-on-1 mentorship', 'Personalized learning pace', '2-week intensive mentorship']
  }
};

/**
 * Only courses listed here use the training-tier checkout model.
 * All other courses remain standalone and use their own course price.
 */
export const TIERED_COURSE_IDS = new Set<string>([
  'course-ai-automation-digital-business-systems'
]);

export function getCoursePricingMode(courseId: string): CoursePricingMode {
  return TIERED_COURSE_IDS.has(courseId) ? 'tiered' : 'standalone';
}

export function getTrainingPlan(planId: string | null | undefined): TrainingPlan | null {
  if (!planId) return null;
  return TRAINING_PLANS[planId as TrainingPlan['id']] ?? null;
}

export function getCourseTrainingPlans(courseId: string): TrainingPlan[] {
  return getCoursePricingMode(courseId) === 'tiered' ? Object.values(TRAINING_PLANS) : [];
}

export function getCourseTrainingPlan(courseId: string, planId: string | null | undefined): TrainingPlan | null {
  if (getCoursePricingMode(courseId) !== 'tiered') return null;
  return getTrainingPlan(planId);
}

export function getTrainingPlanPrice(courseId: string, planId: string | null | undefined): number | null {
  return getCourseTrainingPlan(courseId, planId)?.priceNGN ?? null;
}
