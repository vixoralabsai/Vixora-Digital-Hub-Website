import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import http from 'node:http';
import express from 'express';
import {
  getBachsBaseUrl,
  getBachsMode,
  isBachsConfigured,
  normalizeBachsPayload,
  verifyBachsWebhookSignature
} from '../server/payments/bachsGateway.js';
import {
  findCanonicalCourse,
  resolveAuthoritativePrice,
  resolveGatewayForCurrency
} from '../server/payments/courseCatalog.js';
import {
  clearPaymentStoresForTesting,
  fallbackPaymentsStore,
  paymentsRouter,
  payInitRateLimiter,
  paystackRouter,
  processPaymentFulfillment
} from '../server/paystackServer.js';
import {
  clearDevAdminStoresForTesting
} from '../server/auth/adminSessionStore.js';
import { portalRouter } from '../server/studentPortalServer.js';

console.log('🧪 Starting Vixora Academy Bachs (bachs.io) USD Multi-Gateway Test Suite...\n');

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
  const originalFetch = globalThis.fetch;
  const prevEnv = {
    NODE_ENV: process.env.NODE_ENV,
    BACHS_ENV: process.env.BACHS_ENV,
    BACHS_BASE_URL: process.env.BACHS_BASE_URL,
    BACHS_API_KEY: process.env.BACHS_API_KEY,
    BACHS_WEBHOOK_SECRET: process.env.BACHS_WEBHOOK_SECRET,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    VITE_PAYSTACK_PUBLIC_KEY: process.env.VITE_PAYSTACK_PUBLIC_KEY
  };

  process.env.NODE_ENV = 'test';
  delete process.env.BACHS_ENV;
  delete process.env.BACHS_BASE_URL;
  delete process.env.BACHS_API_KEY;
  delete process.env.BACHS_WEBHOOK_SECRET;
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_paystack_multi_gateway_spec';
  process.env.VITE_PAYSTACK_PUBLIC_KEY = 'pk_test_paystack_multi_gateway_spec';

  clearPaymentStoresForTesting();
  clearDevAdminStoresForTesting();
  payInitRateLimiter.reset();

  // Build ephemeral Express app replicating server.ts mount order cleanly
  const app = express();
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        if (buf && buf.length) {
          req.rawBody = Buffer.from(buf);
        }
      }
    })
  );
  app.use('/api/payments/paystack', paystackRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api', portalRouter);

  const server = await new Promise<http.Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const addr = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // ----------------------------------------------------------------------
    // Test 1: Gateway Routing & Authoritative Pricing Contract
    // ----------------------------------------------------------------------
    await runTest('1. Exclusive currency routing pairs NGN -> Paystack and USD -> Bachs without FX conversion', () => {
      assert.equal(resolveGatewayForCurrency('NGN'), 'paystack');
      assert.equal(resolveGatewayForCurrency('USD'), 'bachs');

      const ngn = resolveAuthoritativePrice('course-data-analysis-cohort', 'NGN');
      assert.ok(ngn);
      assert.equal(ngn.gateway, 'paystack');
      assert.equal(ngn.majorAmount, 60000);
      assert.equal(ngn.minorAmount, 6000000);

      const usd = resolveAuthoritativePrice('course-data-analysis-cohort', 'USD');
      assert.ok(usd);
      assert.equal(usd.gateway, 'bachs');
      assert.equal(usd.majorAmount, 50);
      assert.equal(usd.minorAmount, 5000);

      // Unknown course must fail closed cleanly
      assert.equal(resolveAuthoritativePrice('non-existent-course-id', 'USD'), null);
    });

    // ----------------------------------------------------------------------
    // Test 2: Sandbox Default & Live Mode URL Switching
    // ----------------------------------------------------------------------
    await runTest('2. Bachs defaults to sandbox URL and switches cleanly on BACHS_ENV=live or BACHS_BASE_URL', () => {
      delete process.env.BACHS_ENV;
      delete process.env.BACHS_BASE_URL;
      assert.equal(getBachsMode(), 'sandbox');
      assert.equal(getBachsBaseUrl(), 'https://sandbox-api.bachs.io');
      assert.equal(isBachsConfigured(), false);

      process.env.BACHS_ENV = 'live';
      assert.equal(getBachsMode(), 'live');
      assert.equal(getBachsBaseUrl(), 'https://api.bachs.io');

      process.env.BACHS_BASE_URL = 'https://staging-gateway.bachs.io/';
      assert.equal(getBachsBaseUrl(), 'https://staging-gateway.bachs.io');

      delete process.env.BACHS_ENV;
      delete process.env.BACHS_BASE_URL;
    });

    // ----------------------------------------------------------------------
    // Test 3: Currency-Gateway Mismatch & Unconfigured Guardrails
    // ----------------------------------------------------------------------
    await runTest('3. Rejects USD on Paystack route (CURRENCY_GATEWAY_MISMATCH), missing USD price (PRICE_NOT_CONFIGURED), & missing BACHS_API_KEY (503)', async () => {
      const mismatchRes = await originalFetch(`${baseUrl}/api/payments/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: 'course-data-analysis-cohort',
          currency: 'USD',
          email: 'usd.student@example.com',
          studentName: 'Jordan Lee'
        })
      });
      const mismatchJson = await mismatchRes.json();
      assert.equal(mismatchRes.status, 400);
      assert.equal(mismatchJson.code, 'CURRENCY_GATEWAY_MISMATCH');

      const unconfiguredRes = await originalFetch(`${baseUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: 'course-data-analysis-cohort',
          currency: 'USD',
          email: 'usd.student@example.com',
          studentName: 'Jordan Lee'
        })
      });
      const unconfiguredJson = await unconfiguredRes.json();
      assert.equal(unconfiguredRes.status, 503);
      assert.equal(unconfiguredJson.code, 'BACHS_NOT_CONFIGURED');

      const unknownCourseRes = await originalFetch(`${baseUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: 'non-existent-course-id',
          currency: 'USD',
          email: 'usd.student@example.com',
          studentName: 'Jordan Lee'
        })
      });
      const unknownCourseJson = await unknownCourseRes.json();
      assert.equal(unknownCourseRes.status, 400);
      assert.equal(unknownCourseJson.code, 'INVALID_COURSE_ID');

      // Verify a real canonical course with USD: null fails closed with PRICE_NOT_CONFIGURED
      const cohortCanonical = findCanonicalCourse('course-cohort-1-master-bundle');
      assert.ok(cohortCanonical);
      const originalUsdPrice = cohortCanonical.prices.USD;
      cohortCanonical.prices.USD = null;
      try {
        const unpricedRes = await originalFetch(`${baseUrl}/api/payments/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: 'course-cohort-1-master-bundle',
            currency: 'USD',
            email: 'usd.student@example.com',
            studentName: 'Jordan Lee'
          })
        });
        const unpricedJson = await unpricedRes.json();
        assert.equal(unpricedRes.status, 400);
        assert.equal(unpricedJson.code, 'PRICE_NOT_CONFIGURED');
      } finally {
        cohortCanonical.prices.USD = originalUsdPrice;
      }
    });

    // ----------------------------------------------------------------------
    // Test 4: Dynamic Initialization Routes USD to Bachs Sandbox with Decimal String Pricing
    // ----------------------------------------------------------------------
    let initializedUsdRef = '';
    await runTest('4. POST /api/payments/initialize routes USD -> Bachs Sandbox with decimal string pricing ("50.00")', async () => {
      process.env.BACHS_ENV = 'sandbox';
      process.env.BACHS_API_KEY = 'sk_sandbox_bachs_vixora_001';
      process.env.BACHS_WEBHOOK_SECRET = 'whsec_test_bachs_secret_001';
      payInitRateLimiter.reset();

      let capturedUrl = '';
      let capturedBody: any = null;

      globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(url);
        if (urlStr.startsWith('https://sandbox-api.bachs.io/')) {
          capturedUrl = urlStr;
          capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
          return new Response(
            JSON.stringify({
              id: 'chk_sandbox_991827',
              checkout_url: 'https://checkout.bachs.io/pay/chk_sandbox_991827',
              status: 'open'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, init);
      }) as typeof fetch;

      const initRes = await originalFetch(`${baseUrl}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: 'course-data-analysis-cohort',
          currency: 'USD',
          amount: 1, // tampered client amount must be ignored cleanly
          email: 'usd.buyer@example.com',
          studentName: 'Taylor Brooks',
          phone: '+1 555 239 8190'
        })
      });
      const data = await initRes.json();

      assert.equal(initRes.status, 200);
      assert.equal(data.success, true);
      assert.equal(data.gateway, 'bachs');
      assert.equal(data.gatewayMode, 'sandbox');
      assert.equal(data.currency, 'USD');
      assert.equal(data.amount, 50);
      assert.equal(data.amountMinor, 5000);
      assert.equal(data.sessionId, 'chk_sandbox_991827');
      assert.equal(data.authorizationUrl, 'https://checkout.bachs.io/pay/chk_sandbox_991827');
      assert.match(data.reference, /^VIX-BC-/);

      assert.equal(capturedUrl, 'https://sandbox-api.bachs.io/v1/checkout-sessions');
      assert.equal(capturedBody.pricing.amount, '50.00', 'Must send authoritative major decimal string "50.00" per docs.bachs.io');
      assert.equal(capturedBody.pricing.currency, 'USD');

      const stored = fallbackPaymentsStore.get(data.reference);
      assert.ok(stored);
      assert.equal(stored.gateway, 'bachs');
      assert.equal(stored.gateway_mode, 'sandbox');
      assert.equal(stored.external_session_id, 'chk_sandbox_991827');
      assert.equal(stored.amount_minor, 5000);

      initializedUsdRef = data.reference;
    });

    // ----------------------------------------------------------------------
    // Test 5: Bachs Verification Guardrails & Redirected checkout_id (chk_...) Resolution
    // ----------------------------------------------------------------------
    await runTest('5. Bachs USD verification blocks amount/currency tampering and verifies chk_ redirect idempotently', async () => {
      // Wrong amount (underpaid "49.00" USD instead of "50.00" USD)
      const wrongAmt = await processPaymentFulfillment(initializedUsdRef, {
        gateway: 'bachs',
        status: 'complete',
        payment_status: 'paid',
        currency: 'USD',
        amount_total: '49.00',
        reference: initializedUsdRef,
        courseId: 'course-data-analysis-cohort',
        customer: { email: 'usd.buyer@example.com', name: 'Taylor Brooks' }
      });
      assert.equal(wrongAmt.verified, false);
      assert.equal(wrongAmt.code, 'AMOUNT_MISMATCH');

      // Wrong currency (NGN presented to Bachs USD transaction)
      const wrongCurr = await processPaymentFulfillment(initializedUsdRef, {
        gateway: 'bachs',
        status: 'complete',
        payment_status: 'paid',
        currency: 'NGN',
        amount_total: '50.00',
        reference: initializedUsdRef,
        courseId: 'course-data-analysis-cohort',
        customer: { email: 'usd.buyer@example.com' }
      });
      assert.equal(wrongCurr.verified, false);
      assert.equal(wrongCurr.code, 'CURRENCY_MISMATCH');

      // Valid USD verification triggered using Bachs redirect ?checkout_id=chk_sandbox_991827
      globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(url);
        if (urlStr.startsWith('https://sandbox-api.bachs.io/v1/checkout-sessions/chk_sandbox_991827')) {
          return new Response(
            JSON.stringify({
              id: 'chk_sandbox_991827',
              object: 'checkout_session',
              payment_status: 'paid',
              status: 'complete',
              currency: 'USD',
              amount_total: '50.00',
              client_reference_id: initializedUsdRef,
              paid_at: new Date().toISOString(),
              customer: { email: 'usd.buyer@example.com', name: 'Taylor Brooks' },
              metadata: {
                reference: initializedUsdRef,
                courseId: 'course-data-analysis-cohort',
                studentName: 'Taylor Brooks',
                studentEmail: 'usd.buyer@example.com'
              }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, init);
      }) as typeof fetch;

      const verifyRes = await originalFetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: 'chk_sandbox_991827' })
      });
      const verifyJson = await verifyRes.json();

      assert.equal(verifyRes.status, 200);
      assert.equal(verifyJson.verified, true);
      assert.equal(verifyJson.payment.reference, initializedUsdRef);
      assert.equal(verifyJson.payment.gateway, 'bachs');
      assert.equal(verifyJson.payment.gatewayMode, 'sandbox');
      assert.equal(verifyJson.payment.currency, 'USD');
      assert.equal(verifyJson.payment.amount, 50);

      // Duplicate verify call returns alreadyFulfilled idempotently
      const dupVerifyRes = await originalFetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: initializedUsdRef })
      });
      const dupJson = await dupVerifyRes.json();
      assert.equal(dupVerifyRes.status, 200);
      assert.equal(dupJson.verified, true);
      assert.equal(dupJson.alreadyFulfilled, true);
    });

    // ----------------------------------------------------------------------
    // Test 6: Official X-Bachs-Timestamp / X-Bachs-Signature / X-Bachs-Signature-V2 & collection.succeeded
    // ----------------------------------------------------------------------
    await runTest('6. verifyBachsWebhookSignature & POST /api/payments/bachs/webhook verify V1/V2 headers and collection.succeeded', async () => {
      const secret = 'whsec_test_bachs_secret_001';
      process.env.BACHS_WEBHOOK_SECRET = secret;

      const webhookRef = 'VIX-BC-TEST-WEBHOOK-006';
      const payloadObj = {
        id: 'evt_3ab4e0d5d27445cf8a52ab3d8cb8f0b1',
        type: 'collection.succeeded',
        created_at: new Date().toISOString(),
        data: {
          id: 'chg_9N2o4P5q6R7s8T9u',
          checkout_id: 'chk_sandbox_wh_006',
          status: 'succeeded',
          amount: '10.00', // $10.00 major decimal string for AI Automation & Digital Skills
          currency: 'USD',
          settlement_amount: '10.00',
          payment_method_details: { type: 'card' },
          customer: { email: 'webhook.usd@example.com', name: 'Samira Chen' },
          metadata: {
            order_reference: webhookRef,
            courseId: 'course-ai-automation-digital-skills',
            studentName: 'Samira Chen',
            studentEmail: 'webhook.usd@example.com'
          }
        }
      };

      const rawString = JSON.stringify(payloadObj);
      const rawBuf = Buffer.from(rawString);
      const nowTs = Math.floor(Date.now() / 1000);
      const staleTs = nowTs - 1000;

      const computeTsHex = (ts: number) =>
        crypto
          .createHmac('sha256', secret)
          .update(Buffer.concat([Buffer.from(`${ts}.`), rawBuf]))
          .digest('hex');

      const validTsHex = computeTsHex(nowTs);
      const staleTsHex = computeTsHex(staleTs);
      const plainBodyHex = crypto.createHmac('sha256', secret).update(rawBuf).digest('hex');

      // 1) Official X-Bachs-Timestamp + X-Bachs-Signature ("{timestamp}.{raw_body}")
      assert.equal(
        verifyBachsWebhookSignature(rawBuf, { signature: validTsHex, timestamp: String(nowTs), nowSeconds: nowTs }, secret),
        true
      );
      // 2) Official X-Bachs-Signature-V2 ("t={ts},v1={hex}") with key rotation support
      assert.equal(
        verifyBachsWebhookSignature(
          rawBuf,
          { signatureV2: `t=${nowTs},v1=deadbeef,v1=${validTsHex}`, nowSeconds: nowTs },
          secret
        ),
        true
      );
      // 3) Replay attack with stale timestamp (>300s) rejected
      assert.equal(
        verifyBachsWebhookSignature(rawBuf, { signature: staleTsHex, timestamp: String(staleTs), nowSeconds: nowTs }, secret),
        false
      );
      // 4) Plain hex without timestamp rejected if tampered
      assert.equal(verifyBachsWebhookSignature(rawBuf, plainBodyHex, secret), true);
      assert.equal(verifyBachsWebhookSignature(Buffer.from('{"tampered":true}'), plainBodyHex, secret), false);

      // Unsigned/invalid webhook rejected with 401
      const badHookRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-timestamp': String(nowTs),
          'x-bachs-signature': 'f'.repeat(64)
        },
        body: rawString
      });
      assert.equal(badHookRes.status, 401);

      // Valid signed collection.succeeded webhook using X-Bachs-Timestamp + X-Bachs-Signature & X-Bachs-Signature-V2
      const goodHookRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-timestamp': String(nowTs),
          'x-bachs-signature': validTsHex,
          'x-bachs-signature-v2': `t=${nowTs},v1=${validTsHex}`
        },
        body: rawString
      });
      const goodHookJson = await goodHookRes.json();
      assert.equal(goodHookRes.status, 200);
      assert.equal(goodHookJson.received, true);

      const stored = fallbackPaymentsStore.get(webhookRef);
      assert.ok(stored);
      assert.equal(stored.status, 'success');
      assert.equal(stored.gateway, 'bachs');
      assert.equal(stored.currency, 'USD');
      assert.equal(stored.amount, 10);
    });

    // ----------------------------------------------------------------------
    // Test 7: Public Gateway Config & Unified Admin Ledger Currency Isolation
    // ----------------------------------------------------------------------
    await runTest('7. GET /api/payments/config & Admin Overview report Paystack NGN and Bachs USD separately without FX mixing', async () => {
      const cfgRes = await originalFetch(`${baseUrl}/api/payments/config`);
      const cfgJson = await cfgRes.json();
      assert.equal(cfgRes.status, 200);
      assert.equal(cfgJson.currencyGateways.NGN, 'paystack');
      assert.equal(cfgJson.currencyGateways.USD, 'bachs');
      assert.equal(cfgJson.bachs.configured, true);
      assert.equal(cfgJson.bachs.mode, 'sandbox');
      assert.equal('secretKey' in cfgJson.bachs, false);

      // Seed a settled Paystack NGN transaction alongside the two settled Bachs USD sandbox transactions ($50 + $10 = $60)
      fallbackPaymentsStore.set('VIX-PS-ADMIN-NGN-01', {
        id: 'VIX-PS-ADMIN-NGN-01',
        gateway: 'paystack',
        gateway_mode: 'live',
        external_session_id: null,
        student_id: 'STU-7701',
        course_id: 'course-data-analysis-cohort',
        amount: 60000,
        amount_kobo: 6000000,
        amount_minor: 6000000,
        currency: 'NGN',
        channel: 'card',
        status: 'success',
        fulfillment_status: 'fulfilled',
        fulfillment_error: null,
        email_dispatched_at: new Date().toISOString(),
        paystack_transaction_id: '551122',
        customer_email: 'ngn.payer@example.com',
        customer_name: 'Chidi Obi',
        customer_phone: null,
        paid_at: new Date().toISOString(),
        raw_response: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const setupRes = await originalFetch(`${baseUrl}/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vixoralabsai@gmail.com',
          password: 'BachsAdminTest123!',
          name: 'Exec Admin'
        })
      });
      const setupData = await setupRes.json();
      assert.equal(setupRes.status, 200);

      const ovRes = await originalFetch(`${baseUrl}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${setupData.token}` }
      });
      const ovJson = await ovRes.json();
      assert.equal(ovRes.status, 200);

      assert.equal(ovJson.sales.totalRevenueNgn, 60000);
      assert.equal(ovJson.sales.totalRevenueUsd, 60);
      assert.equal(ovJson.sales.liveRevenueNgn, 60000);
      assert.equal(ovJson.sales.liveRevenueUsd, 0);
      assert.equal(ovJson.sales.sandboxRevenueUsd, 60);
      assert.equal(ovJson.sales.byGateway.paystack.verifiedPaymentsCount, 1);
      assert.equal(ovJson.sales.byGateway.paystack.revenueNgn, 60000);
      assert.equal(ovJson.sales.byGateway.bachs.verifiedPaymentsCount, 2);
      assert.equal(ovJson.sales.byGateway.bachs.revenueUsd, 60);
    });

    // ----------------------------------------------------------------------
    // Test 8: Payload Normalizer Checks for checkout.completed & collection.succeeded
    // ----------------------------------------------------------------------
    await runTest('8. normalizeBachsPayload parses checkout.completed and decimal string amounts accurately', () => {
      const normalized = normalizeBachsPayload({
        id: 'evt_chk_norm_01',
        type: 'checkout.completed',
        created_at: '2026-11-18T12:00:00Z',
        data: {
          checkout_id: 'chk_live_101',
          status: 'completed',
          currency: 'usd',
          amount: '120.00',
          client_reference_id: 'VIX-BC-NORM-01',
          customer: { email: 'ml.intl@example.com', name: 'Devon Park' },
          metadata: { courseId: 'course-machine-learning-data-science' }
        }
      });
      assert.equal(normalized.status, 'success');
      assert.equal(normalized.currency, 'USD');
      assert.equal(normalized.amountMinor, 12000);
      assert.equal(normalized.sessionId, 'chk_live_101');
      assert.equal(normalized.reference, 'VIX-BC-NORM-01');
      assert.equal(normalized.courseId, 'course-machine-learning-data-science');
    });
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    clearPaymentStoresForTesting();
    clearDevAdminStoresForTesting();

    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }

  console.log(`\n========================================`);
  console.log(`Bachs Multi-Gateway Suite: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
