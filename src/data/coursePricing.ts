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

  // Cohort 1.0 Master Vault (Preserved Untouched)
  'course-cohort-1-master-bundle': { NGN: 45000, USD: 45 },
  'cohort-1-master-bundle': { NGN: 45000, USD: 45 },

  // Legacy / Specialization Courses (Archived Catalog)
  'course-ai-image-short-videos-creation': { NGN: 10000, USD: 10 },
  'ai-image-short-videos-creation': { NGN: 10000, USD: 10 },

  'course-ai-automation-digital-skills': { NGN: 30000, USD: 25 },
  'ai-automation-digital-skills': { NGN: 30000, USD: 25 },

  'course-ai-automation-digital-business-systems': { NGN: 60000, USD: 50 },
  'ai-automation-digital-business-systems': { NGN: 60000, USD: 50 },

  'course-fullstack-vibe-coding': { NGN: 50000, USD: 50 },
  'full-stack-vibe-coding': { NGN: 50000, USD: 50 },

  'course-client-acquisition-freelancing': { NGN: 25000, USD: 25 },
  'client-acquisition-freelancing': { NGN: 25000, USD: 25 },

  'course-pdf-automation-digital-products': { NGN: 20000, USD: 20 },
  'pdf-automation-digital-products': { NGN: 20000, USD: 20 },
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
