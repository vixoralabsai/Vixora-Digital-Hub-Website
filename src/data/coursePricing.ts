/**
 * Vixora Academy — Course Pricing Contract
 *
 * Phase 1 establishes one structured pricing source for course amounts.
 * Values are fixed commercial prices, not live FX conversions.
 *
 * IMPORTANT:
 * - null means a price for that currency has not yet been approved/configured.
 * - Do not derive one currency from the other using an exchange-rate peg.
 * - Payment amounts must remain server-authoritative.
 */

export type SupportedCourseCurrency = 'NGN' | 'USD';

export interface CoursePrices {
  NGN: number | null;
  USD: number | null;
}

export interface CoursePricing {
  courseId: string;
  prices: CoursePrices;
}

/**
 * Current approved prices migrated from ACADEMY_COURSES.tuition.
 * Missing counterpart prices are intentionally null until explicitly set.
 */
export const COURSE_PRICING: Record<string, CoursePrices> = {
  // 2026 Active Curriculum Courses
  'course-ai-automation-c2': { NGN: 60000, USD: 50 },
  'ai-automation-digital-literacy': { NGN: 60000, USD: 50 },

  'course-va-setter-c2': { NGN: 60000, USD: 50 },
  'virtual-assistance-appointment-setter': { NGN: 60000, USD: 50 },

  'course-web-dev-c2': { NGN: 60000, USD: 50 },
  'ai-web-development-vibe-coding': { NGN: 60000, USD: 50 },

  'course-content-creation-c2': { NGN: 20000, USD: 20 },
  'ai-content-creation-media': { NGN: 20000, USD: 20 },

  'course-data-science-ml-c2': { NGN: 150000, USD: 120 },
  'course-machine-learning-data-science': { NGN: 150000, USD: 120 },
  'machine-learning-data-science': { NGN: 150000, USD: 120 },

  'course-data-analysis-c2': { NGN: 60000, USD: 50 },
  'course-data-analysis-cohort': { NGN: 60000, USD: 50 },
  'data-analysis-cohort': { NGN: 60000, USD: 50 },

  // Cohort 1.0 Master Vault
  'course-cohort-1-master-bundle': { NGN: 20000, USD: 20 },
  'cohort-1-master-bundle': { NGN: 20000, USD: 20 },

  // Track 1: AI Content Creation
  'course-ai-image-short-videos-creation': { NGN: 4000, USD: 4 },
  'ai-image-short-videos-creation': { NGN: 4000, USD: 4 },

  // Track 2: AI Automation & Autonomous Systems
  'course-ai-automation-digital-skills': { NGN: 10000, USD: 10 },
  'ai-automation-digital-skills': { NGN: 10000, USD: 10 },

  'course-ai-automation-digital-business-systems': { NGN: 60000, USD: 50 },
  'ai-automation-digital-business-systems': { NGN: 60000, USD: 50 },

  // Track 3: Full Stack Vibe Coding
  'course-fullstack-vibe-coding': { NGN: 10000, USD: 10 },
  'full-stack-vibe-coding': { NGN: 10000, USD: 10 },

  // Track 4: Client Acquisition & Freelancing Masterclass
  'course-client-acquisition-freelancing': { NGN: 10000, USD: 10 },
  'client-acquisition-freelancing': { NGN: 10000, USD: 10 },

  // Track 5: PDF Automation & Digital Products
  'course-pdf-automation-digital-products': { NGN: 10000, USD: 10 },
  'pdf-automation-digital-products': { NGN: 10000, USD: 10 },
};

export function getCoursePrices(courseId: string): CoursePrices | null {
  if (!courseId || typeof courseId !== 'string') {
    return null;
  }

  return COURSE_PRICING[courseId.trim()] ?? null;
}

export function getCoursePrice(
  courseId: string,
  currency: SupportedCourseCurrency
): number | null {
  return getCoursePrices(courseId)?.[currency] ?? null;
}
