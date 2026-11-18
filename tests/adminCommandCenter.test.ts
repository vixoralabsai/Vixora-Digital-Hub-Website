import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import { getAuthorizedAdminEmails } from '../server/auth/requireAdmin.js';
import {
  authenticateDevAdminAccount,
  clearDevAdminStoresForTesting,
  createDevOtp,
  issueAdminDevToken,
  registerDevAdminAccount,
  verifyAdminDevToken,
  verifyDevOtp
} from '../server/auth/adminSessionStore.js';
import { clearPaymentStoresForTesting, fallbackPaymentsStore } from '../server/paystackServer.js';
import { portalRouter } from '../server/studentPortalServer.js';

console.log('🧪 Starting Executive Admin Command Center Test Suite...\n');

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

async function main() {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevAdminEmails = process.env.ADMIN_EMAILS;

  try {
    process.env.NODE_ENV = 'test';
    delete process.env.ADMIN_EMAILS;
    clearDevAdminStoresForTesting();
    clearPaymentStoresForTesting();

    await runTest('1. Default dev allowlist authorizes platform owner emails and excludes strangers', () => {
      const allowed = getAuthorizedAdminEmails();
      assert.equal(allowed.has('vixoralabsai@gmail.com'), true);
      assert.equal(allowed.has('vixoraacademy@gmail.com'), true);
      assert.equal(allowed.has('admin@vixoradigitalhub.com'), true);
      assert.equal(allowed.has('stranger@gmail.com'), false);
    });

    await runTest('2. Explicit ADMIN_EMAILS overrides default list and production fails closed when unset', () => {
      process.env.ADMIN_EMAILS = 'custom.ceo@vixora.test';
      const custom = getAuthorizedAdminEmails();
      assert.equal(custom.has('custom.ceo@vixora.test'), true);
      assert.equal(custom.has('vixoralabsai@gmail.com'), false);

      delete process.env.ADMIN_EMAILS;
      process.env.NODE_ENV = 'production';
      const prodUnset = getAuthorizedAdminEmails();
      assert.equal(prodUnset.size, 0, 'Production must fail closed when ADMIN_EMAILS is unset');

      process.env.NODE_ENV = 'test';
    });

    await runTest('3. Dev admin scrypt password auth, HMAC token tamper protection, and OTP lifecycle', () => {
      const acct = registerDevAdminAccount('vixoralabsai@gmail.com', 'CommandPass123!', 'Vixora Executive');
      assert.equal(acct.email, 'vixoralabsai@gmail.com');

      const goodAuth = authenticateDevAdminAccount('vixoralabsai@gmail.com', 'CommandPass123!');
      assert.equal(goodAuth.ok, true);

      const badAuth = authenticateDevAdminAccount('vixoralabsai@gmail.com', 'WrongPassword!');
      assert.equal(badAuth.ok, false);

      const { token } = issueAdminDevToken(acct);
      const verified = verifyAdminDevToken(token);
      assert.ok(verified);
      assert.equal(verified?.email, 'vixoralabsai@gmail.com');

      // Tampering with token signature must fail verification
      const tampered = token.slice(0, -4) + 'XXXX';
      assert.equal(verifyAdminDevToken(tampered), null);

      // OTP generation & single-use verification
      const otp = createDevOtp('vixoralabsai@gmail.com');
      assert.match(otp, /^\d{6}$/);
      assert.equal(verifyDevOtp('vixoralabsai@gmail.com', '000000'), false);
      assert.equal(verifyDevOtp('vixoralabsai@gmail.com', otp), true);
      assert.equal(verifyDevOtp('vixoralabsai@gmail.com', otp), false, 'OTP must be single-use');
    });

    // Spin up ephemeral Express app mounting portalRouter for live API integration checks
    clearDevAdminStoresForTesting();
    const app = express();
    app.use(express.json());
    app.use('/api', portalRouter);

    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    try {
      const addr = server.address() as { port: number };
      const baseUrl = `http://127.0.0.1:${addr.port}`;

      await runTest('4. POST /api/admin/setup rejects unauthorized email with 403', async () => {
        const res = await fetch(`${baseUrl}/api/admin/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'unauthorized.user@example.com',
            password: 'StrongPassword123!'
          })
        });
        const data = await res.json();
        assert.equal(res.status, 403);
        assert.equal(data.code, 'FORBIDDEN_NOT_ADMIN');
      });

      let authToken = '';

      await runTest('5. POST /api/admin/setup activates authorized admin and grants Bearer session token', async () => {
        const res = await fetch(`${baseUrl}/api/admin/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'vixoralabsai@gmail.com',
            password: 'ExecutivePassword123!',
            name: 'Sarumi Hammad'
          })
        });
        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(data.success, true);
        assert.ok(data.token);
        assert.equal(data.user.email, 'vixoralabsai@gmail.com');
        authToken = data.token;
      });

      await runTest('6. POST /api/admin/login authenticates activated admin and GET /api/admin/me verifies session', async () => {
        const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'vixoralabsai@gmail.com',
            password: 'ExecutivePassword123!'
          })
        });
        const loginData = await loginRes.json();
        assert.equal(loginRes.status, 200);
        assert.ok(loginData.token);

        const meRes = await fetch(`${baseUrl}/api/admin/me`, {
          headers: { Authorization: `Bearer ${loginData.token}` }
        });
        const meData = await meRes.json();
        assert.equal(meRes.status, 200);
        assert.equal(meData.authenticated, true);
        assert.equal(meData.user.email, 'vixoralabsai@gmail.com');
      });

      await runTest('7. GET /api/admin/overview reflects real payment revenue and student counts (no hardcoded fakes)', async () => {
        const emptyRes = await fetch(`${baseUrl}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const emptyData = await emptyRes.json();
        assert.equal(emptyRes.status, 200);
        assert.equal(emptyData.sales.totalRevenueNgn, 0);
        assert.equal(emptyData.sales.verifiedPaymentsCount, 0);
        assert.ok(Array.isArray(emptyData.sales.courseBreakdown));
        assert.ok(emptyData.sales.courseBreakdown.length > 0);

        // Record a real verified Paystack payment in fallbackPaymentsStore
        fallbackPaymentsStore.set('VIX-PS-ADMIN-TEST-01', {
          id: 'VIX-PS-ADMIN-TEST-01',
          student_id: 'STU-9042',
          course_id: 'course-data-analysis-cohort',
          amount: 60000,
          amount_kobo: 6000000,
          currency: 'NGN',
          channel: 'card',
          status: 'success',
          fulfillment_status: 'fulfilled',
          fulfillment_error: null,
          email_dispatched_at: new Date().toISOString(),
          paystack_transaction_id: '991001',
          customer_email: 'payer@example.com',
          customer_name: 'Test Payer',
          customer_phone: null,
          paid_at: new Date().toISOString(),
          raw_response: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        const liveRes = await fetch(`${baseUrl}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const liveData = await liveRes.json();
        assert.equal(liveRes.status, 200);
        assert.equal(liveData.sales.totalRevenueNgn, 60000);
        assert.equal(liveData.sales.verifiedPaymentsCount, 1);
        assert.equal(liveData.sales.recentPayments[0].reference, 'VIX-PS-ADMIN-TEST-01');
      });

      await runTest('8. GET /api/admin/students returns normalized student profiles and rejects unauthenticated requests', async () => {
        const unauth = await fetch(`${baseUrl}/api/admin/students`);
        assert.equal(unauth.status, 401);

        const auth = await fetch(`${baseUrl}/api/admin/students`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await auth.json();
        assert.equal(auth.status, 200);
        assert.ok(Array.isArray(data.students));
        assert.ok(data.students.length > 0);
        assert.ok(data.students[0].name);
        assert.ok(data.students[0].email);
      });
    } finally {
      server.close();
      clearPaymentStoresForTesting();
      clearDevAdminStoresForTesting();
    }
  } finally {
    if (prevNodeEnv !== undefined) {
      process.env.NODE_ENV = prevNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    if (prevAdminEmails !== undefined) {
      process.env.ADMIN_EMAILS = prevAdminEmails;
    } else {
      delete process.env.ADMIN_EMAILS;
    }
  }

  console.log('\n========================================');
  console.log(`📊 Admin Command Center Results: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running admin command center tests:', err);
  process.exit(1);
});
