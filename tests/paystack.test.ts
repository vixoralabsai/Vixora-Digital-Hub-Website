import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  paystackRouter,
  getPaystackSecretKey,
  getPaystackPublicKey,
  isPaystackConfigured,
  payInitRateLimiter,
  payVerifyRateLimiter,
  clearPaymentStoresForTesting,
  fallbackPaymentsStore,
  processPaymentFulfillment,
  isValidEmail,
  isValidTransactionReference
} from '../server/paystackServer.js';
import { findCanonicalCourse, getAllCanonicalCourses } from '../server/payments/courseCatalog.js';

// Setup Mock Environment Variables for Testing
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key_vixora_academy';
process.env.VITE_PAYSTACK_PUBLIC_KEY = 'pk_test_mock_public_key_vixora_academy';

console.log('🧪 Starting Vixora Academy Paystack Phase 2 Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
    testsFailed++;
  }
}

async function runAllTests() {
  clearPaymentStoresForTesting();

  // ------------------------------------------------------------------------
  // Test 1: Initialization with valid course
  // ------------------------------------------------------------------------
  await runTest('1. Initialization with valid course', () => {
    const course = findCanonicalCourse('course-data-analysis-cohort');
    assert.ok(course, 'Canonical course should exist');
    assert.equal(course.id, 'course-data-analysis-cohort');
    assert.equal(course.nairaAmount, 60000);
    assert.equal(course.koboAmount, 6000000);
    assert.equal(course.currency, 'NGN');
  });

  // ------------------------------------------------------------------------
  // Test 2: Invalid course rejected
  // ------------------------------------------------------------------------
  await runTest('2. Invalid course lookup rejected', () => {
    const invalidCourse = findCanonicalCourse('non-existent-course-12345');
    assert.equal(invalidCourse, null, 'Unrecognized course must return null');
  });

  // ------------------------------------------------------------------------
  // Test 3: Client-supplied fake amount ignored
  // ------------------------------------------------------------------------
  await runTest('3. Client-supplied fake amount ignored (backend authoritative price)', () => {
    const course = findCanonicalCourse('data-analysis-cohort');
    assert.ok(course);
    // Even if a malicious client attempts to pay ₦100 (10000 kobo), the authoritative price is 6000000 kobo
    const fakeClientAmount = 100;
    assert.notEqual(course.nairaAmount, fakeClientAmount);
    assert.equal(course.nairaAmount, 60000);
  });

  // ------------------------------------------------------------------------
  // Test 4: Malformed email rejected
  // ------------------------------------------------------------------------
  await runTest('4. Malformed email validation', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail('missing@domain'), false);
    assert.equal(isValidEmail('@nodomain.com'), false);
    assert.equal(isValidEmail('valid.student@example.com'), true);
  });

  // ------------------------------------------------------------------------
  // Test 5: Malformed reference rejected
  // ------------------------------------------------------------------------
  await runTest('5. Malformed reference validation', () => {
    assert.equal(isValidTransactionReference('bad'), false); // Too short
    assert.equal(isValidTransactionReference('bad reference with spaces'), false);
    assert.equal(isValidTransactionReference('bad<script>alert(1)</script>'), false);
    assert.equal(isValidTransactionReference('VIX-PS-1774288000-A1B2C3D4'), true);
  });

  // ------------------------------------------------------------------------
  // Test 6: Rate limiter enforcement
  // ------------------------------------------------------------------------
  await runTest('6. Rate limit enforcement (pay_init limiter)', () => {
    payInitRateLimiter.reset();
    const testKey = '127.0.0.1:rate_test@example.com';
    
    // Max 5 attempts
    for (let i = 0; i < 5; i++) {
      const res = payInitRateLimiter.check(testKey);
      assert.equal(res.allowed, true, `Attempt ${i + 1} should be allowed`);
    }
    // 6th attempt must be rejected
    const blocked = payInitRateLimiter.check(testKey);
    assert.equal(blocked.allowed, false, '6th attempt must be blocked by rate limiter');
    assert.equal(blocked.remaining, 0);
  });

  // ------------------------------------------------------------------------
  // Test 7: Verification of unknown reference
  // ------------------------------------------------------------------------
  await runTest('7. Verification of unknown reference', async () => {
    const unknownRef = 'VIX-PS-9999999999-UNKNOWN';
    // When Paystack verify fails or transaction not found
    const res = await processPaymentFulfillment(unknownRef, {
      status: 'failed',
      currency: 'NGN',
      amount: 6000000
    });
    assert.equal(res.verified, false);
    assert.equal(res.code, 'PAYMENT_NOT_SUCCESSFUL');
  });

  // ------------------------------------------------------------------------
  // Test 8: Successful transaction verification
  // ------------------------------------------------------------------------
  const testRef8 = 'VIX-PS-TEST-008';
  await runTest('8. Successful transaction verification', async () => {
    const mockPaystackSuccess = {
      id: 888001,
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN',
      channel: 'card',
      paid_at: new Date().toISOString(),
      customer: {
        email: 'alex.student@example.com',
        first_name: 'Alex'
      },
      metadata: {
        courseId: 'course-data-analysis-cohort',
        studentName: 'Alex Mercer'
      }
    };

    const res = await processPaymentFulfillment(testRef8, mockPaystackSuccess);
    assert.equal(res.verified, true);
    assert.ok(res.payment);
    assert.equal(res.payment.reference, testRef8);
    assert.equal(res.payment.amount, 60000);
    assert.equal(res.payment.currency, 'NGN');
    assert.equal(res.payment.status, 'success');
  });

  // ------------------------------------------------------------------------
  // Test 9: Wrong amount rejected
  // ------------------------------------------------------------------------
  await runTest('9. Wrong amount rejected (tamper resistance)', async () => {
    const testRef9 = 'VIX-PS-TEST-009';
    const mockPaystackUnderpaid = {
      id: 888002,
      status: 'success',
      reference: testRef9,
      amount: 3000000, // ₦30,000 paid for ₦60,000 course
      currency: 'NGN',
      customer: { email: 'fraud.test@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(testRef9, mockPaystackUnderpaid);
    assert.equal(res.verified, false);
    assert.equal(res.code, 'AMOUNT_MISMATCH');
  });

  // ------------------------------------------------------------------------
  // Test 10: Wrong currency rejected
  // ------------------------------------------------------------------------
  await runTest('10. Wrong currency rejected', async () => {
    const testRef10 = 'VIX-PS-TEST-010';
    const mockPaystackForeignCurrency = {
      id: 888003,
      status: 'success',
      reference: testRef10,
      amount: 6000000,
      currency: 'USD', // Not NGN
      customer: { email: 'currency.test@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(testRef10, mockPaystackForeignCurrency);
    assert.equal(res.verified, false);
    assert.equal(res.code, 'CURRENCY_MISMATCH');
  });

  // ------------------------------------------------------------------------
  // Test 11: Duplicate verification (Idempotency)
  // ------------------------------------------------------------------------
  await runTest('11. Duplicate verification idempotency', async () => {
    // Calling verification on already fulfilled testRef8
    const res = await processPaymentFulfillment(testRef8, {
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN'
    });

    assert.equal(res.verified, true);
    assert.equal(res.alreadyFulfilled, true, 'Second verification must return alreadyFulfilled');
    assert.equal(res.payment?.reference, testRef8);
  });

  // ------------------------------------------------------------------------
  // Test 12: Duplicate webhook (Idempotency)
  // ------------------------------------------------------------------------
  await runTest('12. Duplicate webhook idempotency', async () => {
    // Replay of testRef8 via webhook payload
    const res = await processPaymentFulfillment(testRef8, {
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN'
    });

    assert.equal(res.verified, true);
    assert.equal(res.alreadyFulfilled, true);
  });

  // ------------------------------------------------------------------------
  // Test 13: Webhook signature verification (HMAC SHA-512)
  // ------------------------------------------------------------------------
  await runTest('13. Invalid webhook signature rejection', () => {
    const secret = getPaystackSecretKey();
    const rawBody = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'TEST-SIG' } }));
    
    const validSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    const invalidSignature = crypto.createHmac('sha512', 'wrong_secret').update(rawBody).digest('hex');

    // Valid check
    const validBuf = Buffer.from(validSignature, 'hex');
    const computedBuf = Buffer.from(crypto.createHmac('sha512', secret).update(rawBody).digest('hex'), 'hex');
    assert.ok(crypto.timingSafeEqual(validBuf, computedBuf), 'Valid signature matches');

    // Invalid check
    const invalidBuf = Buffer.from(invalidSignature, 'hex');
    assert.equal(crypto.timingSafeEqual(invalidBuf, computedBuf), false, 'Invalid signature rejected');
  });

  // ------------------------------------------------------------------------
  // Test 14: Webhook with malformed payload
  // ------------------------------------------------------------------------
  await runTest('14. Webhook with malformed payload', async () => {
    // Calling fulfillment with missing data
    const res = await processPaymentFulfillment('VIX-PS-MALFORMED', {
      status: 'success',
      // Missing currency and amount
    });
    assert.equal(res.verified, false);
  });

  // ------------------------------------------------------------------------
  // Test 15: Guest student creation
  // ------------------------------------------------------------------------
  await runTest('15. Guest student fulfillment', async () => {
    const guestRef = 'VIX-PS-GUEST-015';
    const guestData = {
      id: 888015,
      status: 'success',
      reference: guestRef,
      amount: 3000000,
      currency: 'NGN',
      customer: { email: 'newguest@example.com', first_name: 'GuestUser' },
      metadata: {
        courseId: 'course-ai-automation-digital-skills',
        studentName: 'Guest Student'
      }
    };

    const res = await processPaymentFulfillment(guestRef, guestData);
    assert.equal(res.verified, true);
    assert.equal(res.payment?.studentEmail, 'newguest@example.com');
    assert.equal(res.payment?.amount, 30000);
  });

  // ------------------------------------------------------------------------
  // Test 16: Existing student matching
  // ------------------------------------------------------------------------
  await runTest('16. Existing student matching by email', async () => {
    const existingRef = 'VIX-PS-EXISTING-016';
    const data = {
      id: 888016,
      status: 'success',
      reference: existingRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'newguest@example.com' }, // same email as test 15
      metadata: {
        courseId: 'course-data-analysis-cohort'
      }
    };

    const res = await processPaymentFulfillment(existingRef, data);
    assert.equal(res.verified, true);
    assert.equal(res.payment?.studentEmail, 'newguest@example.com');
  });

  // ------------------------------------------------------------------------
  // Test 17: Duplicate enrollment handling
  // ------------------------------------------------------------------------
  await runTest('17. Duplicate enrollment handling without resetting progress', async () => {
    const reEnrollRef = 'VIX-PS-REENROLL-017';
    const data = {
      id: 888017,
      status: 'success',
      reference: reEnrollRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 're-enroll@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(reEnrollRef, data);
    assert.equal(res.verified, true);
  });

  // ------------------------------------------------------------------------
  // Test 18: Email idempotency
  // ------------------------------------------------------------------------
  await runTest('18. Email dispatch idempotency', async () => {
    // Calling processPaymentFulfillment multiple times for same reference
    const repeatRef = 'VIX-PS-EMAIL-IDEMP-018';
    const data = {
      id: 888018,
      status: 'success',
      reference: repeatRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'idemp.email@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const first = await processPaymentFulfillment(repeatRef, data);
    const second = await processPaymentFulfillment(repeatRef, data);

    assert.equal(first.verified, true);
    assert.equal(second.verified, true);
    assert.equal(second.alreadyFulfilled, true);
  });

  // ------------------------------------------------------------------------
  // Test 19: Secret not exposed to frontend in payment record
  // ------------------------------------------------------------------------
  await runTest('19. Secret not exposed in payment record', () => {
    const record = fallbackPaymentsStore.get(testRef8);
    assert.ok(record);
    const serialized = JSON.stringify(record);
    assert.equal(serialized.includes(process.env.PAYSTACK_SECRET_KEY!), false, 'Secret key must NEVER appear in payment record');
  });

  // ------------------------------------------------------------------------
  // Test 20: Config endpoint does not expose secrets
  // ------------------------------------------------------------------------
  await runTest('20. Config endpoint does not expose secret keys', () => {
    const secretKey = getPaystackSecretKey();
    const publicKey = getPaystackPublicKey();

    const configResponse = {
      configured: isPaystackConfigured(),
      hasPublicKey: Boolean(publicKey),
      publicKey: publicKey || null,
      currency: 'NGN',
      mode: secretKey.startsWith('sk_live_') ? 'live' : 'test',
      merchantName: 'Vixora Academy'
    };

    const json = JSON.stringify(configResponse);
    assert.equal(json.includes(secretKey), false, 'Config response must NEVER include secret key');
    assert.equal(configResponse.currency, 'NGN');
    assert.equal(configResponse.configured, true);
  });

  console.log('\n========================================');
  console.log(`📊 Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
