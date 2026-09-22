import { ACADEMY_COURSES, AcademyCourse } from '../../src/data/vixoraContent.js';

export interface CanonicalCourse {
  id: string;
  slug: string;
  title: string;
  nairaAmount: number;
  koboAmount: number;
  currency: 'NGN';
  totalModules: number;
  nextCohortDate: string;
  tuitionDisplay: string;
}

/**
 * Standardizes course prices into authoritative Naira amounts.
 * Tuition format in vixoraContent: "₦60,000", "₦30,000", or "$1,850".
 * For courses in USD, standard fixed peg is 1 USD = 1,000 NGN.
 */
function calculateCanonicalNaira(tuition: string): number {
  if (!tuition) return 60000;
  
  if (tuition.includes('₦')) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num <= 0 ? 60000 : num;
  }
  
  if (tuition.includes('$')) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      // 1 USD = 1,000 NGN standard peg for local currency processing
      return num * 1000;
    }
  }

  const raw = parseInt(tuition.replace(/[^0-9]/g, ''), 10);
  return isNaN(raw) || raw <= 0 ? 60000 : raw;
}

// Build canonical map indexed by both canonical ID and slug
const canonicalCourseMap = new Map<string, CanonicalCourse>();

for (const course of ACADEMY_COURSES) {
  const naira = calculateCanonicalNaira(course.tuition);
  const canonical: CanonicalCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    nairaAmount: naira,
    koboAmount: naira * 100,
    currency: 'NGN',
    totalModules: course.weeklySyllabus?.length || course.curriculum?.length || 12,
    nextCohortDate: course.nextCohortDate || 'November 9, 2026',
    tuitionDisplay: course.tuition
  };

  // Index by full ID (e.g. 'course-data-analysis-cohort')
  canonicalCourseMap.set(course.id.toLowerCase().trim(), canonical);
  // Index by slug (e.g. 'data-analysis-cohort')
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
  // Deduplicate by course id
  const unique = new Map<string, CanonicalCourse>();
  for (const course of canonicalCourseMap.values()) {
    unique.set(course.id, course);
  }
  return Array.from(unique.values());
}
