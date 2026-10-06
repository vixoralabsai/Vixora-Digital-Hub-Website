import assert from 'node:assert/strict';
import { findCanonicalCourse, resolveCanonicalCoursePrice } from '../server/payments/courseCatalog.js';
import { getCoursePricingMode, getCourseTrainingPlans } from '../src/data/trainingPlans.js';

console.log('🧪 Vixora course-aware pricing tests...');

const standalone = findCanonicalCourse('course-ai-automation-digital-skills');
assert.ok(standalone);
assert.equal(getCoursePricingMode(standalone.id), 'standalone');
assert.equal(resolveCanonicalCoursePrice(standalone, null)?.nairaAmount, 30000);
assert.equal(resolveCanonicalCoursePrice(standalone, 'group'), null);

const tiered = findCanonicalCourse('course-ai-automation-digital-business-systems');
assert.ok(tiered);
assert.equal(getCoursePricingMode(tiered.id), 'tiered');
assert.equal(getCourseTrainingPlans(tiered.id).length, 3);

assert.equal(resolveCanonicalCoursePrice(tiered, 'group')?.nairaAmount, 45000);
assert.equal(resolveCanonicalCoursePrice(tiered, 'small-group')?.nairaAmount, 60000);
assert.equal(resolveCanonicalCoursePrice(tiered, 'private')?.nairaAmount, 100000);
assert.equal(resolveCanonicalCoursePrice(tiered, null), null);
assert.equal(resolveCanonicalCoursePrice(tiered, 'not-a-plan'), null);

console.log('✅ Course-aware pricing tests passed.');
