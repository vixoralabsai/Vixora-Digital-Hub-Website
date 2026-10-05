/**
 * Vixora Academy — Training Plan Contract
 *
 * Commercial training tiers are independent of course content.
 * A course can therefore be offered through the same three learning
 * experiences while keeping its curriculum, cohort and pricing logic separate.
 */

export type TrainingPlanId = 'group' | 'small-group' | 'private';

export interface TrainingPlan {
  id: TrainingPlanId;
  name: string;
  shortName: string;
  priceNGN: number;
  capacity: number;
  badge?: string;
  description: string;
  features: string[];
  supportLevel: string;
  mentorshipWeeks: number;
  cta: string;
}

export const TRAINING_PLANS: Record<TrainingPlanId, TrainingPlan> = {
  group: {
    id: 'group',
    name: 'Group Training',
    shortName: 'Group',
    priceNGN: 45000,
    capacity: 300,
    description: 'Structured cohort training for learners who want the full Vixora learning experience at the most accessible price.',
    features: [
      'Full cohort curriculum',
      'Live group training',
      'Learning resources & templates',
      'Community access',
      'Practical projects',
      'Vixora Academy certificate'
    ],
    supportLevel: 'Group support',
    mentorshipWeeks: 0,
    cta: 'Choose Group'
  },
  'small-group': {
    id: 'small-group',
    name: 'Small Group',
    shortName: 'Small Group',
    priceNGN: 60000,
    capacity: 5,
    badge: 'Most Popular',
    description: 'A focused learning environment with fewer students and more direct guidance.',
    features: [
      'Everything in Group',
      'Maximum 5 learners',
      'Tutor support',
      'Supervisor oversight',
      'More direct feedback',
      'Vixora Academy certificate'
    ],
    supportLevel: 'Tutor + supervisor',
    mentorshipWeeks: 0,
    cta: 'Choose Small Group'
  },
  private: {
    id: 'private',
    name: 'Private 1-on-1',
    shortName: 'Private',
    priceNGN: 100000,
    capacity: 1,
    badge: 'Premium',
    description: 'Personalized training for learners who want direct attention and a focused learning path.',
    features: [
      'Everything in Small Group',
      'Private 1-on-1 training',
      'Personalized learning path',
      'Direct project guidance',
      'Priority support',
      '2 weeks mentorship'
    ],
    supportLevel: '1-on-1 + mentorship',
    mentorshipWeeks: 2,
    cta: 'Choose Private'
  }
};

export function getTrainingPlan(planId?: string | null): TrainingPlan | null {
  if (!planId || typeof planId !== 'string') return null;
  return TRAINING_PLANS[planId.trim().toLowerCase() as TrainingPlanId] ?? null;
}

export function formatTrainingPlanPrice(planId: TrainingPlanId): string {
  return `₦${TRAINING_PLANS[planId].priceNGN.toLocaleString()}`;
}
