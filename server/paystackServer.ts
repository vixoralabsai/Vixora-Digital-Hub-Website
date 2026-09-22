import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabaseAdmin.js';
import { dispatchGenericEmail } from './emailService.js';
import { BRAND_CONFIG, getWhatsAppUrl } from '../src/data/brandConfig.js';
import { findCanonicalCourse, CanonicalCourse } from './payments/courseCatalog.js';

export const paystackRouter = Router();

// Official Paystack API Base URL
const PAYSTACK_API_BASE = 'https://api.paystack.co';

// ==============================================================================
// 1. Configuration & Key Management
// ==============================================================================

export function getPaystackSecretKey(): string {
  return (process.env.PAYSTACK_SECRET_KEY || '').trim();
}

export function getPaystackPublicKey(): string {
  return (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
}

export function isPaystackConfigured(): boolean {
  const key = getPaystackSecretKey();
  return Boolean(key && (key.startsWith('sk_test_') || key.startsWith('sk_live_')));
}

// ==============================================================================
// 2. Sliding Window Rate Limiter
// ==============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private max: number;
  private prefix: string;

  constructor(options: { windowMs: number; max: number; prefix?: string }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || 'rl';
  }

  check(key: string): { allowed: boolean; remaining: number; resetInSeconds: number; limit: number } {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
        limit: this.max
      };
    }

    if (record.count >= this.max) {
      const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
        limit: this.max
      };
    }

    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }

  reset(key?: string) {
    if (key) {
      this.store.delete(`${this.prefix}:${key}`);
    } else {
      this.store.clear();
    }
  }
}

// Dedicated Rate Limiters as specified:
// Paystack init: 5 requests / 10 minutes per IP+email
export const payInitRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  prefix: 'pay_init'
});

// Paystack verify: 15 requests / 1 minute per IP
export const payVerifyRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  prefix: 'pay_verify'
});

// ==============================================================================
// 3. Safe Client IP Extraction
// ==============================================================================

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

// ==============================================================================
// 4. Strict Input Validation Helpers
// ==============================================================================

export function isPlainObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function hasPrototypePollutionKeys(obj: Record<string, any>): boolean {
  return Object.keys(obj).some((key) => key === '__proto__' || key === 'constructor' || key === 'prototype');
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 120;
}

export function isValidTransactionReference(ref: unknown): boolean {
  if (typeof ref !== 'string') return false;
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(ref.trim());
}

export function sanitizeText(val: unknown, maxLen = 120): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

// ==============================================================================
// 5. In-Memory Store for Fallback / Testing
// ==============================================================================

export interface PaymentRecord {
  id: string; // transaction reference
  student_id: string | null;
  course_id: string;
  amount: number; // in Naira (e.g. 60000.00)
  amount_kobo: number; // in kobo (e.g. 6000000)
  currency: 'NGN';
  channel: string | null;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  paystack_transaction_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  paid_at: string | null;
  raw_response: any;
  created_at: string;
  updated_at: string;
}

export const fallbackPaymentsStore = new Map<string, PaymentRecord>();
const dispatchedEmailsSet = new Set<string>();

export function clearPaymentStoresForTesting() {
  fallbackPaymentsStore.clear();
  dispatchedEmailsSet.clear();
  payInitRateLimiter.reset();
  payVerifyRateLimiter.reset();
}

// ==============================================================================
// 6. Sanitization of Gateway Response (No secrets or raw credentials)
// ==============================================================================

export function sanitizePaystackResponse(data: any): any {
  if (!data || typeof data !== 'object') return null;
  const sanitized = { ...data };

  // Retain non-sensitive authorization metadata, remove secrets
  if (sanitized.authorization && typeof sanitized.authorization === 'object') {
    sanitized.authorization = {
      channel: sanitized.authorization.channel,
      card_type: sanitized.authorization.card_type,
      bank: sanitized.authorization.bank,
      last4: sanitized.authorization.last4,
      exp_month: sanitized.authorization.exp_month,
      exp_year: sanitized.authorization.exp_year,
      country_code: sanitized.authorization.country_code,
      brand: sanitized.authorization.brand,
      reusable: sanitized.authorization.reusable
    };
  }

  delete sanitized.plan;
  delete sanitized.subaccount;
  return sanitized;
}

// ==============================================================================
// 7. Optional Authenticated User Extraction
// ==============================================================================

export async function extractOptionalAuthUser(req: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) return null;

    return {
      id: user.id,
      email: user.email.toLowerCase().trim()
    };
  } catch {
    return null;
  }
}

// ==============================================================================
// 8. Durable & Idempotent Fulfillment Engine
// ==============================================================================

export interface FulfillmentResult {
  verified: boolean;
  alreadyFulfilled?: boolean;
  payment?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    channel: string | null;
    paidAt: string | null;
    studentName: string | null;
    studentEmail: string;
    courseId: string;
    courseTitle: string;
  };
  error?: string;
  code?: string;
  status?: number;
}

export async function processPaymentFulfillment(
  reference: string,
  verifiedPaystackData?: any
): Promise<FulfillmentResult> {
  if (!isValidTransactionReference(reference)) {
    return {
      verified: false,
      error: 'Invalid transaction reference format.',
      code: 'INVALID_REFERENCE',
      status: 400
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. Check existing payment record in database or fallback store
  let existingPayment: PaymentRecord | null = null;

  if (supabase) {
    try {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('id', reference)
        .maybeSingle();
      if (data) existingPayment = data;
    } catch (dbErr) {
      console.warn('[Supabase payments query]:', dbErr);
    }
  }

  if (!existingPayment) {
    existingPayment = fallbackPaymentsStore.get(reference) || null;
  }

  // Idempotency: If already fulfilled with 'success', return existing record immediately
  if (existingPayment && existingPayment.status === 'success') {
    const canonical = findCanonicalCourse(existingPayment.course_id);
    return {
      verified: true,
      alreadyFulfilled: true,
      payment: {
        reference: existingPayment.id,
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        channel: existingPayment.channel,
        paidAt: existingPayment.paid_at,
        studentName: existingPayment.customer_name,
        studentEmail: existingPayment.customer_email,
        courseId: existingPayment.course_id,
        courseTitle: canonical?.title || 'Vixora Academy Cohort'
      }
    };
  }

  // 2. Fetch authoritative transaction status from Paystack API if not provided
  let paystackData = verifiedPaystackData;

  if (!paystackData) {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return {
        verified: false,
        error: 'Paystack Secret Key is not configured on the server.',
        code: 'PAYSTACK_NOT_CONFIGURED',
        status: 503
      };
    }

    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const json: any = await response.json();

      if (!response.ok || !json.status || !json.data) {
        return {
          verified: false,
          error: json.message || 'Transaction could not be verified on Paystack.',
          code: 'PAYSTACK_VERIFY_FAILED',
          status: 404
        };
      }

      paystackData = json.data;
    } catch (netErr: any) {
      return {
        verified: false,
        error: 'Network error connecting to Paystack API.',
        code: 'PAYSTACK_NETWORK_ERROR',
        status: 502
      };
    }
  }

  // 3. Strict verification of transaction state & parameters
  if (paystackData.status !== 'success') {
    return {
      verified: false,
      error: `Payment is not successful (status: ${paystackData.status}).`,
      code: 'PAYMENT_NOT_SUCCESSFUL',
      status: 400
    };
  }

  // Verify Currency strictly matches NGN
  if (paystackData.currency !== 'NGN') {
    return {
      verified: false,
      error: `Currency mismatch: Expected NGN, received ${paystackData.currency}.`,
      code: 'CURRENCY_MISMATCH',
      status: 400
    };
  }

  // Find canonical course from stored payment record or transaction metadata
  const courseId =
    existingPayment?.course_id ||
    paystackData.metadata?.courseId ||
    paystackData.metadata?.course_id;

  const canonicalCourse = findCanonicalCourse(courseId);
  if (!canonicalCourse) {
    return {
      verified: false,
      error: 'Cannot fulfill payment: Unrecognized or invalid course ID.',
      code: 'INVALID_COURSE',
      status: 400
    };
  }

  // Verify Amount matches canonical course price exactly in kobo
  const expectedKobo = canonicalCourse.koboAmount;
  const actualKobo = Math.round(Number(paystackData.amount));

  if (actualKobo !== expectedKobo) {
    return {
      verified: false,
      error: `Amount mismatch: Expected ${expectedKobo} kobo (₦${canonicalCourse.nairaAmount}), received ${actualKobo} kobo.`,
      code: 'AMOUNT_MISMATCH',
      status: 400
    };
  }

  // Customer identity
  const customerEmail = (
    paystackData.customer?.email ||
    paystackData.metadata?.studentEmail ||
    existingPayment?.customer_email ||
    ''
  ).toLowerCase().trim();

  if (!isValidEmail(customerEmail)) {
    return {
      verified: false,
      error: 'Invalid customer email associated with transaction.',
      code: 'INVALID_CUSTOMER_EMAIL',
      status: 400
    };
  }

  const customerName =
    paystackData.metadata?.studentName ||
    existingPayment?.customer_name ||
    paystackData.customer?.first_name ||
    customerEmail.split('@')[0];

  const customerPhone =
    paystackData.metadata?.phone ||
    existingPayment?.customer_phone ||
    paystackData.customer?.phone ||
    null;

  const paidAt = paystackData.paid_at || new Date().toISOString();
  const channel = paystackData.channel || 'card';
  const paystackTxId = String(paystackData.id || '');
  const authUserId = paystackData.metadata?.authUserId || null;

  // 4. Student Creation / Matching
  let studentId: string | null = existingPayment?.student_id || null;

  if (supabase) {
    try {
      // Step A: Find existing student by email (or auth_user_id)
      let studentQuery = supabase
        .from('students')
        .select('id, email, auth_user_id')
        .eq('email', customerEmail);

      const { data: matchedStudent } = await studentQuery.maybeSingle();

      if (matchedStudent) {
        studentId = matchedStudent.id;
        // If student exists but lacked auth_user_id, link it now
        if (authUserId && !matchedStudent.auth_user_id) {
          await supabase.from('students').update({ auth_user_id: authUserId }).eq('id', studentId);
        }
      } else {
        // Step B: Create student if not found
        const newStudentId = `STU-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        const { data: createdStudent } = await supabase
          .from('students')
          .insert({
            id: newStudentId,
            name: customerName,
            email: customerEmail,
            auth_user_id: authUserId,
            enrolled_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            role: 'student'
          })
          .select('id')
          .maybeSingle();

        if (createdStudent) {
          studentId = createdStudent.id;
        }
      }

      // Step C: Idempotent Enrollment Fulfillment
      // Preserve existing cohort, progress, modules, and certificate_id
      if (studentId) {
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('student_id, course_id, status, progress_percent')
          .eq('student_id', studentId)
          .eq('course_id', canonicalCourse.id)
          .maybeSingle();

        if (!existingEnrollment) {
          await supabase.from('enrollments').insert({
            student_id: studentId,
            course_id: canonicalCourse.id,
            status: 'enrolled',
            cohort: `Cohort ${canonicalCourse.nextCohortDate}`,
            progress_percent: 0,
            completed_modules: 0,
            total_modules: canonicalCourse.totalModules
          });
        } else {
          // If enrollment already exists, ensure status is 'enrolled' without resetting progress
          await supabase
            .from('enrollments')
            .update({ status: 'enrolled', updated_at: new Date().toISOString() })
            .eq('student_id', studentId)
            .eq('course_id', canonicalCourse.id);
        }
      }
    } catch (dbErr) {
      console.warn('[Supabase Fulfillment Error]:', dbErr);
    }
  }

  // 5. Durable Payment Record Creation / Update
  const updatedPaymentRecord: PaymentRecord = {
    id: reference,
    student_id: studentId,
    course_id: canonicalCourse.id,
    amount: canonicalCourse.nairaAmount,
    amount_kobo: canonicalCourse.koboAmount,
    currency: 'NGN',
    channel,
    status: 'success',
    paystack_transaction_id: paystackTxId,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    paid_at: paidAt,
    raw_response: sanitizePaystackResponse(paystackData),
    created_at: existingPayment?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('payments').upsert(updatedPaymentRecord, { onConflict: 'id' });
    } catch (paymentDbErr) {
      console.warn('[Supabase payments upsert error]:', paymentDbErr);
    }
  }

  // Always update fallback store
  fallbackPaymentsStore.set(reference, updatedPaymentRecord);

  // 6. Idempotent Confirmation / Receipt Email
  if (!dispatchedEmailsSet.has(reference)) {
    dispatchedEmailsSet.add(reference);

    try {
      const emailSubject = `🎓 Payment Receipt & Admission Confirmed: ${canonicalCourse.title} (₦${canonicalCourse.nairaAmount.toLocaleString()})`;
      const whatsappUrl = getWhatsAppUrl(
        'ng',
        `Hello Admissions! I just completed my tuition payment of ₦${canonicalCourse.nairaAmount.toLocaleString()} for ${canonicalCourse.title} via Paystack. Reference: ${reference}. My email is ${customerEmail}.`
      );

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b061d; color: #ffffff; border-radius: 16px; border: 1px solid #3b1d7a;">
          <div style="border-bottom: 1px solid #2a1458; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #a855f7; margin: 0; font-size: 22px; font-weight: 800;">Vixora Academy</h2>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Official Tuition Payment Receipt &amp; Admissions Confirmation</p>
          </div>
          <div style="background: #150d36; border: 1px solid #3b1d7a; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
            <div style="display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
              ✓ Payment Verified via Paystack
            </div>
            <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 18px;">Welcome to ${canonicalCourse.title}!</h3>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
              Dear <strong>${customerName}</strong>, your tuition payment of <strong>₦${canonicalCourse.nairaAmount.toLocaleString()}</strong> has been verified. Your seat in the upcoming cohort is officially reserved.
            </p>
          </div>
          <div style="background: #0f0926; border: 1px solid #25124d; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
            <table style="width: 100%; border-collapse: collapse; color: #e2e8f0;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Transaction Reference:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: bold; text-align: right; color: #facc15;">${reference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Amount Paid:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #34d399;">₦${canonicalCourse.nairaAmount.toLocaleString()} NGN</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Payment Channel:</td>
                <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${channel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Cohort Start:</td>
                <td style="padding: 6px 0; text-align: right; color: #a855f7;">${canonicalCourse.nextCohortDate}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${whatsappUrl}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
              💬 Join Admissions WhatsApp Cohort Group
            </a>
          </div>
          <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #2a1458; padding-top: 14px;">
            <p style="margin: 0;">Vixora Digital Hub &bull; ${BRAND_CONFIG.email}</p>
          </div>
        </div>
      `;

      await dispatchGenericEmail({
        to: customerEmail,
        toName: customerName,
        subject: emailSubject,
        html: emailHtml,
        text: `Tuition Payment Receipt: ${canonicalCourse.title}. Reference: ${reference}. Amount: ₦${canonicalCourse.nairaAmount.toLocaleString()} NGN. Welcome to Vixora Academy!`
      });
    } catch (mailErr) {
      console.warn('[Paystack Email Dispatch Warning]:', mailErr);
    }
  }

  return {
    verified: true,
    payment: {
      reference,
      status: 'success',
      amount: canonicalCourse.nairaAmount,
      currency: 'NGN',
      channel,
      paidAt,
      studentName: customerName,
      studentEmail: customerEmail,
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title
    }
  };
}

// ==============================================================================
// 9. Public Config Endpoint (Safe, no secrets)
// GET /config
// ==============================================================================
paystackRouter.get('/config', (_req: Request, res: Response) => {
  const configured = isPaystackConfigured();
  const publicKey = getPaystackPublicKey();

  return res.json({
    configured,
    hasPublicKey: Boolean(publicKey),
    publicKey: publicKey || null,
    currency: 'NGN',
    mode: getPaystackSecretKey().startsWith('sk_live_') ? 'live' : 'test',
    merchantName: 'Vixora Academy'
  });
});

// ==============================================================================
// 10. Paystack Initialization Endpoint
// POST /initialize
// ==============================================================================
paystackRouter.post('/initialize', async (req: Request, res: Response) => {
  try {
    // 1. Safe Client IP
    const clientIp = getClientIp(req);

    // 2. Strict Input Validation
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        error: 'Request body must be a valid JSON object.',
        code: 'INVALID_BODY'
      });
    }

    if (hasPrototypePollutionKeys(req.body)) {
      return res.status(400).json({
        error: 'Invalid request: Prototype pollution keys detected.',
        code: 'PROTOTYPE_POLLUTION'
      });
    }

    const { courseId, email, studentName, phone, callbackUrl } = req.body;

    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({
        error: 'Parameter "courseId" is required and must be a string.',
        code: 'COURSE_ID_REQUIRED'
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'A valid student email address is required.',
        code: 'INVALID_EMAIL'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentName = sanitizeText(studentName || cleanEmail.split('@')[0]);
    const cleanPhone = sanitizeText(phone, 30);

    // 3. Rate Limit (5 requests / 10 minutes per IP+email)
    const rateLimitKey = `${clientIp}:${cleanEmail}`;
    const rlStatus = payInitRateLimiter.check(rateLimitKey);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        error: `Too many payment initialization requests. Please wait ${rlStatus.resetInSeconds} seconds before trying again.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetInSeconds: rlStatus.resetInSeconds
      });
    }

    // 4. Canonical Course & Price Source of Truth (Client cannot supply amount)
    const canonicalCourse = findCanonicalCourse(courseId);
    if (!canonicalCourse) {
      return res.status(400).json({
        error: `Invalid courseId "${courseId}". Course is not available in the Vixora Academy catalog.`,
        code: 'INVALID_COURSE_ID'
      });
    }

    // 5. Check Server Paystack Configuration
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(503).json({
        error: 'Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in Settings -> Secrets.',
        code: 'PAYSTACK_NOT_CONFIGURED',
        help: 'Obtain your Secret Key from Paystack Dashboard -> Settings -> API Keys & Webhooks.'
      });
    }

    // 6. Optional Authenticated User
    const authUser = await extractOptionalAuthUser(req);

    // 7. Generate Secure Unique Transaction Reference
    const reference = `VIX-PS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Determine secure callback URL
    const reqOrigin = req.headers.origin || (req.headers.host ? `${req.protocol}://${req.headers.host}` : '');
    const finalCallbackUrl =
      typeof callbackUrl === 'string' && callbackUrl.startsWith('http')
        ? callbackUrl
        : `${reqOrigin}/payment/callback?reference=${reference}&courseId=${encodeURIComponent(canonicalCourse.id)}`;

    // 8. Pre-create durable pending payment record in database
    const initialPaymentRecord: PaymentRecord = {
      id: reference,
      student_id: null,
      course_id: canonicalCourse.id,
      amount: canonicalCourse.nairaAmount,
      amount_kobo: canonicalCourse.koboAmount,
      currency: 'NGN',
      channel: null,
      status: 'pending',
      paystack_transaction_id: null,
      customer_email: cleanEmail,
      customer_name: cleanStudentName,
      customer_phone: cleanPhone || null,
      paid_at: null,
      raw_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from('payments').insert(initialPaymentRecord);
      } catch (insertErr) {
        console.warn('[Supabase initial payment record insert]:', insertErr);
      }
    }
    // Always track in fallback store
    fallbackPaymentsStore.set(reference, initialPaymentRecord);

    // 9. Initialize External Paystack Transaction
    const paystackPayload = {
      email: cleanEmail,
      amount: canonicalCourse.koboAmount,
      currency: 'NGN',
      reference,
      callback_url: finalCallbackUrl,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      metadata: {
        studentName: cleanStudentName,
        studentEmail: cleanEmail,
        phone: cleanPhone,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title,
        authUserId: authUser?.id || null,
        amountNaira: canonicalCourse.nairaAmount
      }
    };

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackPayload)
    });

    const data: any = await response.json();

    if (!response.ok || !data.status || !data.data) {
      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        error: data.message || 'Failed to initialize Paystack transaction.',
        code: 'PAYSTACK_INIT_FAILED',
        reference
      });
    }

    // Return only public data required by frontend
    return res.json({
      success: true,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amountNaira: canonicalCourse.nairaAmount,
      amountKobo: canonicalCourse.koboAmount,
      currency: 'NGN',
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title
    });
  } catch (err: any) {
    console.error('[Paystack Initialize Exception]:', err);
    return res.status(500).json({
      error: 'An internal error occurred while initializing payment.',
      code: 'SERVER_ERROR'
    });
  }
});

// ==============================================================================
// 11. Paystack Verification Endpoint
// POST /verify  (and GET /verify/:reference for backward compatibility)
// ==============================================================================

async function handleVerificationRequest(req: Request, res: Response) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: 15 requests / 1 minute per IP
    const rlStatus = payVerifyRateLimiter.check(clientIp);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        verified: false,
        error: `Too many verification requests. Please wait ${rlStatus.resetInSeconds} seconds before retrying.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetInSeconds: rlStatus.resetInSeconds
      });
    }

    // Extract reference from body or params
    const rawRef = req.body?.reference || req.params?.reference || req.query?.reference;
    if (!isValidTransactionReference(rawRef)) {
      return res.status(400).json({
        verified: false,
        error: 'A valid transaction reference string is required.',
        code: 'INVALID_REFERENCE'
      });
    }

    const reference = String(rawRef).trim();

    // Process idempotent fulfillment
    const result = await processPaymentFulfillment(reference);

    if (!result.verified) {
      return res.status(result.status || 400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[Paystack Verify Exception]:', err);
    return res.status(500).json({
      verified: false,
      error: 'An internal server error occurred while verifying payment.',
      code: 'SERVER_ERROR'
    });
  }
}

paystackRouter.post('/verify', handleVerificationRequest);
paystackRouter.get('/verify/:reference', handleVerificationRequest);
paystackRouter.post('/verify/:reference', handleVerificationRequest);

// ==============================================================================
// 12. Paystack Webhook Endpoint
// POST /webhook
// ==============================================================================
paystackRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(503).json({ error: 'Paystack Secret Key is not configured on server.' });
    }

    // Paystack signature header
    const signature = req.headers['x-paystack-signature'];
    if (!signature || typeof signature !== 'string') {
      return res.status(401).json({ error: 'Missing x-paystack-signature header.' });
    }

    // Retrieve original raw request body buffer
    const rawBody: Buffer | undefined =
      (req as any).rawBody ||
      (Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === 'string'
        ? Buffer.from(req.body)
        : undefined);

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        error: 'Raw request body buffer unavailable for signature verification.'
      });
    }

    // Compute HMAC SHA-512 signature using official PAYSTACK_SECRET_KEY
    const computedHash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(computedHash, 'hex');
    const providedBuffer = Buffer.from(signature, 'hex');

    // Cryptographically safe comparison
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    if (!event || typeof event !== 'object') {
      return res.status(400).json({ error: 'Invalid webhook event payload structure.' });
    }

    // Handle charge.success event
    if (event.event === 'charge.success' && event.data?.reference) {
      const ref = String(event.data.reference).trim();
      // Execute idempotent fulfillment using the webhook event payload
      await processPaymentFulfillment(ref, event.data);
    }

    // Acknowledge receipt immediately with 200 OK
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Paystack Webhook Exception]:', err);
    return res.status(500).json({ error: 'Webhook processing error.' });
  }
});
