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
  processPaymentFulfillment,
  setSimulateBachsSessionPersistenceFailureForTesting,
  simulateEnrollmentFailureForTesting
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
    await runTest('6. verifyBachsWebhookSignature & POST /api/payments/bachs/webhook verify timestamped V1/V2 headers and collection.succeeded', async () => {
      const secret = 'whsec_test_bachs_secret_001';
      process.env.BACHS_WEBHOOK_SECRET = secret;

      const webhookRef = 'VIX-BC-TEST-WEBHOOK-006';
      fallbackPaymentsStore.set(webhookRef, {
        id: webhookRef,
        student_id: null,
        course_id: 'course-ai-automation-digital-skills',
        gateway: 'bachs',
        gateway_mode: 'sandbox',
        external_session_id: 'chk_sandbox_wh_006',
        amount: 10,
        amount_kobo: 0,
        amount_minor: 1000,
        currency: 'USD',
        channel: null,
        status: 'pending',
        fulfillment_status: 'pending',
        fulfillment_error: null,
        email_dispatched_at: null,
        paystack_transaction_id: null,
        customer_email: 'webhook.usd@example.com',
        customer_name: 'Samira Chen',
        customer_phone: null,
        paid_at: null,
        raw_response: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

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
      assert.equal(
        verifyBachsWebhookSignature(rawBuf, { signatureV2: `t=${staleTs},v1=${staleTsHex}`, nowSeconds: nowTs }, secret),
        false
      );
      // 4) Un-timestamped plain hex and malformed V2 headers must be rejected (never weaken verification)
      assert.equal(verifyBachsWebhookSignature(rawBuf, plainBodyHex, secret), false);
      assert.equal(
        verifyBachsWebhookSignature(rawBuf, { signatureV2: `v1=${validTsHex}`, nowSeconds: nowTs }, secret),
        false
      );
      assert.equal(verifyBachsWebhookSignature(Buffer.from('{"tampered":true}'), plainBodyHex, secret), false);

      // Unsigned/invalid/stale webhooks rejected with 401
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

      const staleHookRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': `t=${staleTs},v1=${staleTsHex}`
        },
        body: rawString
      });
      assert.equal(staleHookRes.status, 401);

      // Valid signed collection.succeeded webhook using X-Bachs-Signature-V2
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
      assert.equal(goodHookJson.fulfilled, true);

      const stored = fallbackPaymentsStore.get(webhookRef);
      assert.ok(stored);
      assert.equal(stored.status, 'success');
      assert.equal(stored.fulfillment_status, 'fulfilled');
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
    // Test 8: Payload Normalizer Checks for checkout.completed (Paid vs Unconfirmed)
    // ----------------------------------------------------------------------
    await runTest('8. normalizeBachsPayload refuses success for checkout.completed unless payment_status is paid/succeeded', () => {
      const unconfirmed = normalizeBachsPayload({
        id: 'evt_chk_unconfirmed_01',
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
      assert.equal(unconfirmed.status, 'pending', 'checkout.completed without paid payment_status must NOT return success');

      const paidConfirmed = normalizeBachsPayload({
        id: 'evt_chk_norm_01',
        type: 'checkout.completed',
        created_at: '2026-11-18T12:00:00Z',
        data: {
          checkout_id: 'chk_live_101',
          status: 'completed',
          payment_status: 'paid',
          currency: 'usd',
          amount: '120.00',
          client_reference_id: 'VIX-BC-NORM-01',
          customer: { email: 'ml.intl@example.com', name: 'Devon Park' },
          metadata: { courseId: 'course-machine-learning-data-science' }
        }
      });
      assert.equal(paidConfirmed.status, 'success');
      assert.equal(paidConfirmed.currency, 'USD');
      assert.equal(paidConfirmed.amountMinor, 12000);
      assert.equal(paidConfirmed.sessionId, 'chk_live_101');
      assert.equal(paidConfirmed.reference, 'VIX-BC-NORM-01');
      assert.equal(paidConfirmed.courseId, 'course-machine-learning-data-science');
    });

    // Helper to sign Bachs V2 webhook payloads cleanly in tests
    const signBachsV2 = (bodyStr: string, secret = 'whsec_test_bachs_secret_001', ts = Math.floor(Date.now() / 1000)) => {
      const hex = crypto
        .createHmac('sha256', secret)
        .update(Buffer.concat([Buffer.from(`${ts}.`), Buffer.from(bodyStr)]))
        .digest('hex');
      return `t=${ts},v1=${hex}`;
    };

    const seedPendingBachs = (ref: string, sessionId: string, courseId = 'course-data-analysis-cohort', amount = 50, email = 'student.usd@example.com') => {
      fallbackPaymentsStore.set(ref, {
        id: ref,
        student_id: null,
        course_id: courseId,
        gateway: 'bachs',
        gateway_mode: 'sandbox',
        external_session_id: sessionId,
        amount,
        amount_kobo: 0,
        amount_minor: amount * 100,
        currency: 'USD',
        channel: null,
        status: 'pending',
        fulfillment_status: 'pending',
        fulfillment_error: null,
        email_dispatched_at: null,
        paystack_transaction_id: null,
        customer_email: email,
        customer_name: 'Audit Test Student',
        customer_phone: null,
        paid_at: null,
        raw_response: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    };

    // ----------------------------------------------------------------------
    // Test 9: Checkout completed WITHOUT confirmed payment cannot grant access
    // ----------------------------------------------------------------------
    await runTest('9. Rejects checkout.completed webhook & checkout return verification without confirmed payment_status=paid', async () => {
      const ref = 'VIX-BC-UNCONFIRMED-009';
      const chkId = 'chk_sandbox_unconf_009';
      seedPendingBachs(ref, chkId);

      // 9a. Signed checkout.completed webhook with status='completed' & payment_status='unpaid'
      const unconfWebhookBody = JSON.stringify({
        id: 'evt_unconf_009',
        type: 'checkout.completed',
        data: {
          id: chkId,
          object: 'checkout_session',
          status: 'completed',
          payment_status: 'unpaid',
          currency: 'USD',
          amount: '50.00',
          client_reference_id: ref,
          customer: { email: 'student.usd@example.com' },
          metadata: { reference: ref, courseId: 'course-data-analysis-cohort' }
        }
      });

      const whRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': signBachsV2(unconfWebhookBody)
        },
        body: unconfWebhookBody
      });
      const whJson = await whRes.json();
      assert.equal(whRes.status, 200);
      assert.equal(whJson.fulfilled, false);
      assert.equal(whJson.code, 'PAYMENT_NOT_SUCCESSFUL');
      assert.equal(fallbackPaymentsStore.get(ref)?.fulfillment_status, 'pending');
      assert.equal(fallbackPaymentsStore.get(ref)?.student_id, null);

      // 9b. Browser return verification when Bachs API returns status='complete' without payment_status='paid'
      globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url).startsWith(`https://sandbox-api.bachs.io/v1/checkout-sessions/${chkId}`)) {
          return new Response(
            JSON.stringify({
              id: chkId,
              object: 'checkout_session',
              status: 'completed',
              payment_status: 'processing',
              currency: 'USD',
              amount_total: '50.00',
              client_reference_id: ref
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, init);
      }) as typeof fetch;

      const verifyRes = await originalFetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, checkoutId: chkId })
      });
      const verifyJson = await verifyRes.json();
      assert.equal(verifyRes.status, 400);
      assert.equal(verifyJson.verified, false);
      assert.equal(verifyJson.code, 'PAYMENT_NOT_SUCCESSFUL');
      assert.equal(fallbackPaymentsStore.get(ref)?.fulfillment_status, 'pending');
    });

    // ----------------------------------------------------------------------
    // Test 10: Failed, pending, expired, and underpaid payments are rejected cleanly
    // ----------------------------------------------------------------------
    await runTest('10. Rejects failed, pending, expired, and underpaid Bachs payments without enrollment', async () => {
      const cases = [
        {
          name: 'failed',
          ref: 'VIX-BC-FAIL-010',
          chk: 'chk_fail_010',
          eventType: 'collection.failed',
          data: { id: 'chg_fail_010', checkout_id: 'chk_fail_010', status: 'failed', amount: '50.00', currency: 'USD' },
          expectedDbStatus: 'failed'
        },
        {
          name: 'pending',
          ref: 'VIX-BC-PEND-010',
          chk: 'chk_pend_010',
          eventType: 'checkout.completed',
          data: { id: 'chk_pend_010', status: 'open', payment_status: 'pending', amount: '50.00', currency: 'USD' },
          expectedDbStatus: 'pending'
        },
        {
          name: 'expired',
          ref: 'VIX-BC-EXP-010',
          chk: 'chk_exp_010',
          eventType: 'checkout.expired',
          data: { id: 'chk_exp_010', status: 'expired', amount: '50.00', currency: 'USD' },
          expectedDbStatus: 'abandoned'
        },
        {
          name: 'underpaid',
          ref: 'VIX-BC-UNDER-010',
          chk: 'chk_under_010',
          eventType: 'collection.underpaid',
          data: { id: 'chg_under_010', checkout_id: 'chk_under_010', status: 'succeeded', amount: '50.00', amount_paid: '30.00', currency: 'USD' },
          expectedDbStatus: 'failed'
        }
      ];

      for (const c of cases) {
        seedPendingBachs(c.ref, c.chk);
        const body = JSON.stringify({
          id: `evt_${c.name}_010`,
          type: c.eventType,
          data: {
            ...c.data,
            client_reference_id: c.ref,
            metadata: { reference: c.ref, courseId: 'course-data-analysis-cohort' }
          }
        });
        const res = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bachs-signature-v2': signBachsV2(body)
          },
          body
        });
        const json = await res.json();
        assert.equal(res.status, 200, `${c.name} should ack cleanly so Bachs does not retry endlessly`);
        assert.equal(json.fulfilled, false, `${c.name} must NOT fulfill`);
        assert.equal(json.code, 'PAYMENT_NOT_SUCCESSFUL');

        const rec = fallbackPaymentsStore.get(c.ref);
        assert.ok(rec);
        assert.equal(rec.status, c.expectedDbStatus);
        assert.equal(rec.fulfillment_status, 'pending');
        assert.equal(rec.student_id, null);
      }
    });

    // ----------------------------------------------------------------------
    // Test 11: Incorrect payment reference & incorrect checkout/session ID rejected
    // ----------------------------------------------------------------------
    await runTest('11. Rejects unknown/mismatched payment references and mismatched checkout/session IDs', async () => {
      const validRef = 'VIX-BC-VALID-REF-011';
      const validChk = 'chk_valid_011';
      seedPendingBachs(validRef, validChk);

      // 11a. Unknown payment reference cannot fulfill
      const unknownRes = await processPaymentFulfillment('VIX-BC-DOES-NOT-EXIST-011', {
        type: 'collection.succeeded',
        data: {
          id: 'chg_unk_011',
          checkout_id: 'chk_unk_011',
          status: 'succeeded',
          payment_status: 'paid',
          amount: '50.00',
          currency: 'USD',
          customer: { email: 'attacker@example.com' },
          metadata: { reference: 'VIX-BC-DOES-NOT-EXIST-011', courseId: 'course-data-analysis-cohort' }
        }
      });
      assert.equal(unknownRes.verified, false);
      assert.equal(unknownRes.code, 'PAYMENT_NOT_FOUND');
      assert.equal(unknownRes.status, 404);

      // 11b. Reference mismatch between pending record and Bachs response
      globalThis.fetch = (async () =>
        new Response(
          JSON.stringify({
            id: validChk,
            object: 'checkout_session',
            payment_status: 'paid',
            status: 'completed',
            currency: 'USD',
            amount_total: '50.00',
            client_reference_id: 'VIX-BC-OTHER-ORDER-999',
            customer: { email: 'student.usd@example.com' }
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as typeof fetch;

      const refMismatchRes = await originalFetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: validRef, checkoutId: validChk })
      });
      const refMismatchJson = await refMismatchRes.json();
      assert.equal(refMismatchRes.status, 400);
      assert.equal(refMismatchJson.verified, false);
      assert.equal(refMismatchJson.code, 'REFERENCE_MISMATCH');

      // 11c. Incorrect checkoutId passed on verify URL/body against pending external_session_id
      const sessionMismatchRes = await originalFetch(`${baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: validRef, checkoutId: 'chk_WRONG_SESSION_999' })
      });
      const sessionMismatchJson = await sessionMismatchRes.json();
      assert.equal(sessionMismatchRes.status, 400);
      assert.equal(sessionMismatchJson.verified, false);
      assert.equal(sessionMismatchJson.code, 'SESSION_MISMATCH');
      assert.equal(fallbackPaymentsStore.get(validRef)?.fulfillment_status, 'pending');
    });

    // ----------------------------------------------------------------------
    // Test 12: Webhook idempotency (duplicate evt_ + simultaneous return & webhook)
    // ----------------------------------------------------------------------
    await runTest('12. Duplicate webhook events & concurrent return/webhook delivery cannot duplicate fulfillment', async () => {
      const raceRef = 'VIX-BC-RACE-012';
      const raceChk = 'chk_race_012';
      seedPendingBachs(raceRef, raceChk);

      globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url).startsWith(`https://sandbox-api.bachs.io/v1/checkout-sessions/${raceChk}`)) {
          // Slight delay to force overlap with concurrent webhook
          await new Promise((r) => setTimeout(r, 25));
          return new Response(
            JSON.stringify({
              id: raceChk,
              object: 'checkout_session',
              status: 'completed',
              payment_status: 'paid',
              currency: 'USD',
              amount_total: '50.00',
              client_reference_id: raceRef,
              paid_at: new Date().toISOString(),
              customer: { email: 'student.usd@example.com', name: 'Audit Test Student' },
              metadata: { reference: raceRef, courseId: 'course-data-analysis-cohort' }
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, init);
      }) as typeof fetch;

      const whBody = JSON.stringify({
        id: 'evt_duplicate_race_012',
        type: 'collection.succeeded',
        data: {
          id: 'chg_race_012',
          checkout_id: raceChk,
          status: 'succeeded',
          payment_status: 'paid',
          amount: '50.00',
          currency: 'USD',
          customer: { email: 'student.usd@example.com', name: 'Audit Test Student' },
          metadata: { reference: raceRef, courseId: 'course-data-analysis-cohort' }
        }
      });

      // Fire browser verification AND webhook concurrently
      const [verifyRes, hookRes1] = await Promise.all([
        originalFetch(`${baseUrl}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: raceRef, checkoutId: raceChk })
        }),
        originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bachs-signature-v2': signBachsV2(whBody)
          },
          body: whBody
        })
      ]);

      const verifyJson = await verifyRes.json();
      const hookJson1 = await hookRes1.json();
      assert.equal(verifyRes.status, 200);
      assert.equal(verifyJson.verified, true);
      assert.equal(hookRes1.status, 200);
      assert.equal(hookJson1.received, true);

      // Exactly ONE of the concurrent calls fulfilled; the second observed alreadyFulfilled=true
      assert.equal(Boolean(verifyJson.alreadyFulfilled) !== Boolean(hookJson1.alreadyFulfilled), true);

      // Replay identical webhook event ID a second time
      const hookRes2 = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': signBachsV2(whBody)
        },
        body: whBody
      });
      const hookJson2 = await hookRes2.json();
      assert.equal(hookRes2.status, 200);
      assert.equal(hookJson2.received, true);
      assert.equal(hookJson2.alreadyFulfilled, true);
      assert.ok(fallbackPaymentsStore.get(raceRef)?.raw_response?._processedEventIds?.includes('evt_duplicate_race_012'));
    });

    // ----------------------------------------------------------------------
    // Test 13: Webhook fulfillment failure returns 5xx retryable & recovers on retry; unsupported event returns 200
    // ----------------------------------------------------------------------
    await runTest('13. Webhook returns non-2xx on ENROLLMENT_FAILED for retry, fulfills on subsequent retry, and acks unsupported events 200', async () => {
      const retryRef = 'VIX-BC-RETRY-013';
      const retryChk = 'chk_retry_013';
      seedPendingBachs(retryRef, retryChk);
      simulateEnrollmentFailureForTesting.add(retryRef);

      const retryBody = JSON.stringify({
        id: 'evt_retry_013',
        type: 'collection.succeeded',
        data: {
          id: 'chg_retry_013',
          checkout_id: retryChk,
          status: 'succeeded',
          payment_status: 'paid',
          amount: '50.00',
          currency: 'USD',
          customer: { email: 'student.usd@example.com', name: 'Audit Test Student' },
          metadata: { reference: retryRef, courseId: 'course-data-analysis-cohort' }
        }
      });

      const failedHookRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': signBachsV2(retryBody)
        },
        body: retryBody
      });
      const failedHookJson = await failedHookRes.json();
      assert.equal(failedHookRes.status, 500, 'Retryable ENROLLMENT_FAILED must return non-2xx so Bachs retries');
      assert.equal(failedHookJson.received, false);
      assert.equal(failedHookJson.retryable, true);
      assert.equal(failedHookJson.code, 'ENROLLMENT_FAILED');
      assert.equal(fallbackPaymentsStore.get(retryRef)?.fulfillment_status, 'failed');

      // Transient error clears; Bachs retries identical event delivery
      simulateEnrollmentFailureForTesting.delete(retryRef);

      const recoverHookRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': signBachsV2(retryBody)
        },
        body: retryBody
      });
      const recoverHookJson = await recoverHookRes.json();
      assert.equal(recoverHookRes.status, 200);
      assert.equal(recoverHookJson.received, true);
      assert.equal(recoverHookJson.fulfilled, true);
      assert.equal(fallbackPaymentsStore.get(retryRef)?.fulfillment_status, 'fulfilled');

      // Unsupported event type returns 200 ignored (prevents infinite retries)
      const unsupportedBody = JSON.stringify({
        id: 'evt_unsupported_013',
        type: 'payout.settled',
        data: { id: 'po_123' }
      });
      const unsupportedRes = await originalFetch(`${baseUrl}/api/payments/bachs/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bachs-signature-v2': signBachsV2(unsupportedBody)
        },
        body: unsupportedBody
      });
      const unsupportedJson = await unsupportedRes.json();
      assert.equal(unsupportedRes.status, 200);
      assert.equal(unsupportedJson.received, true);
      assert.equal(unsupportedJson.ignored, true);
    });

    // ----------------------------------------------------------------------
    // Test 14: Checkout session persistence failure fails safely without granting access
    // ----------------------------------------------------------------------
    await runTest('14. Database failure persisting external_session_id fails safely with 503 and does not redirect/grant access', async () => {
      payInitRateLimiter.reset();
      setSimulateBachsSessionPersistenceFailureForTesting(true);

      globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        if (String(url).startsWith('https://sandbox-api.bachs.io/v1/checkout-sessions')) {
          return new Response(
            JSON.stringify({
              id: 'chk_persist_fail_014',
              checkout_url: 'https://checkout.bachs.io/pay/chk_persist_fail_014',
              status: 'open'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return originalFetch(url, init);
      }) as typeof fetch;

      try {
        const res = await originalFetch(`${baseUrl}/api/payments/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: 'course-data-analysis-cohort',
            currency: 'USD',
            email: 'persist.fail@example.com',
            studentName: 'Persist Fail'
          })
        });
        const json = await res.json();
        assert.equal(res.status, 503);
        assert.equal(json.code, 'SESSION_PERSISTENCE_FAILED');
        assert.equal('authorizationUrl' in json, false, 'Must NOT return checkout redirect URL when session persistence fails');
        assert.ok(json.reference, 'Must retain reference for reconciliation');

        const pendingRow = fallbackPaymentsStore.get(json.reference);
        assert.ok(pendingRow, 'Pending payment record must be retained');
        assert.equal(pendingRow.status, 'pending');
        assert.equal(pendingRow.fulfillment_status, 'pending');
        assert.equal(pendingRow.external_session_id, null);
      } finally {
        setSimulateBachsSessionPersistenceFailureForTesting(false);
      }
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
