import { ACADEMY_COURSES } from '../../src/data/vixoraContent.js';
import {
  getCoursePrices,
  type CoursePrices,
  type SupportedCourseCurrency
} from '../../src/data/coursePricing.js';

export type PaymentGatewayProvider = 'paystack' | 'bachs';

export interface CanonicalCourse {
  id: string;
  slug: string;
  title: string;
  /** Structured commercial prices. Null means that currency is not configured. */
  prices: CoursePrices;
  /** Legacy NGN payment fields retained for backward compatibility. */
  nairaAmount: number;
  koboAmount: number;
  currency: 'NGN';
  totalModules: number;
  nextCohortDate: string;
  tuitionDisplay: string;
}

export interface AuthoritativeCoursePrice {
  course: CanonicalCourse;
  currency: SupportedCourseCurrency;
  gateway: PaymentGatewayProvider;
  majorAmount: number;
  minorAmount: number;
  formattedAmount: string;
}

/**
 * Legacy helper retained for NGN compatibility and database course badge fallback.
 * Authoritative runtime pricing always uses course.prices[currency] via resolveAuthoritativePrice().
 */
function getLegacyNairaAmount(courseId: string, tuition: string): number {
  const prices = getCoursePrices(courseId);
  if (prices?.NGN != null) return prices.NGN;

  if (prices?.USD != null) return prices.USD * 1000;

  if (tuition?.includes('₦')) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  const raw = parseInt(tuition?.replace(/[^0-9]/g, '') || '', 10);
  return !isNaN(raw) && raw > 0 ? raw : 60000;
}

// Build canonical map indexed by both canonical ID and slug
const canonicalCourseMap = new Map<string, CanonicalCourse>();

for (const course of ACADEMY_COURSES) {
  const prices = getCoursePrices(course.id);
  const resolvedPrices: CoursePrices = prices ?? { NGN: null, USD: null };
  const naira = getLegacyNairaAmount(course.id, course.tuition);
  const canonical: CanonicalCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    prices: resolvedPrices,
    nairaAmount: naira,
    koboAmount: naira * 100,
    currency: 'NGN',
    totalModules: course.weeklySyllabus?.length || course.curriculum?.length || 12,
    nextCohortDate: course.nextCohortDate || 'October 9, 2026',
    tuitionDisplay: course.tuition
  };

  canonicalCourseMap.set(course.id.toLowerCase().trim(), canonical);
  canonicalCourseMap.set(course.slug.toLowerCase().trim(), canonical);
}

/**
 * Finds the authoritative canonical course by ID or slug.
 * Returns null if course is not recognized in the official catalog.
 */
export function findCanonicalCourse(courseIdentifier: string): CanonicalCourse | null {
  if (!courseIdentifier || typeof courseIdentifier !== 'string') {
    return null;
  }
  const clean = courseIdentifier.toLowerCase().trim();
  return canonicalCourseMap.get(clean) || null;
}

/**
 * Returns all active canonical courses
 */
export function getAllCanonicalCourses(): CanonicalCourse[] {
  const unique = new Map<string, CanonicalCourse>();
  for (const course of canonicalCourseMap.values()) {
    unique.set(course.id, course);
  }
  return Array.from(unique.values());
}

/**
 * Maps currency strictly to its exclusive payment processor:
 * - NGN -> Paystack
 * - USD -> Bachs (bachs.io)
 */
export function resolveGatewayForCurrency(currency: SupportedCourseCurrency): PaymentGatewayProvider {
  return currency === 'USD' ? 'bachs' : 'paystack';
}

/**
 * Formats currency amount consistently without synthetic FX conversion.
 */
export function formatCurrencyAmount(amount: number, currency: SupportedCourseCurrency): string {
  if (currency === 'USD') {
    const hasFraction = Math.round(amount * 100) % 100 !== 0;
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  }
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

/**
 * Resolves the server-authoritative fixed price and payment gateway for a course and currency.
 * Returns null if the course does not exist OR the requested currency price is unconfigured (null).
 */
export function resolveAuthoritativePrice(
  courseIdentifier: string,
  currency: SupportedCourseCurrency
): AuthoritativeCoursePrice | null {
  const course = findCanonicalCourse(courseIdentifier);
  if (!course) return null;

  const configuredAmount = course.prices?.[currency];
  if (typeof configuredAmount !== 'number' || !Number.isFinite(configuredAmount) || configuredAmount <= 0) {
    return null;
  }

  return {
    course,
    currency,
    gateway: resolveGatewayForCurrency(currency),
    majorAmount: Number(configuredAmount.toFixed(2)),
    minorAmount: Math.round(configuredAmount * 100),
    formattedAmount: formatCurrencyAmount(configuredAmount, currency)
  };
}
