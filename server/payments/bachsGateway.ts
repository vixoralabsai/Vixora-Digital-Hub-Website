/**
 * Bachs (bachs.io) USD Payment Gateway Adapter for Vixora Academy
 *
 * Exclusively handles USD checkout sessions, verification, and HMAC webhook validation.
 * Defaults to Sandbox mode (https://sandbox-api.bachs.io) until BACHS_ENV=live.
 */

import crypto from 'crypto';

export type BachsEnvironmentMode = 'sandbox' | 'live';

const BACHS_SANDBOX_BASE_URL = 'https://sandbox-api.bachs.io';
const BACHS_LIVE_BASE_URL = 'https://api.bachs.io';

export function getBachsApiKey(): string {
  return (process.env.BACHS_API_KEY || process.env.BACHS_SECRET_KEY || '').trim();
}

export function getBachsWebhookSecret(): string {
  return (process.env.BACHS_WEBHOOK_SECRET || '').trim();
}

export function getBachsMode(): BachsEnvironmentMode {
  const env = (process.env.BACHS_ENV || '').trim().toLowerCase();
  if (env === 'live' || env === 'production' || env === 'prod') {
    return 'live';
  }
  const key = getBachsApiKey();
  if (!env && key.startsWith('sk_live_')) {
    return 'live';
  }
  return 'sandbox';
}

export function getBachsBaseUrl(): string {
  const override = (process.env.BACHS_BASE_URL || '').trim().replace(/\/+$/, '');
  if (override) {
    return override;
  }
  return getBachsMode() === 'live' ? BACHS_LIVE_BASE_URL : BACHS_SANDBOX_BASE_URL;
}

export function isBachsConfigured(): boolean {
  return Boolean(getBachsApiKey());
}

export interface CreateBachsSessionParams {
  reference: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  courseId: string;
  courseTitle: string;
  successUrl: string;
  cancelUrl: string;
  authUserId?: string | null;
}

export interface CreateBachsSessionResult {
  ok: boolean;
  status: number;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
  raw?: any;
}

export interface NormalizedBachsVerification {
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  currency: string;
  amountMinor: number;
  externalTxId: string;
  sessionId: string | null;
  reference: string | null;
  customerEmail: string | null;
  customerName: string | null;
  courseId: string | null;
  authUserId: string | null;
  channel: string;
  paidAt: string | null;
  raw: any;
}

/**
 * Strips sensitive authorization fields before storing gateway responses in DB JSONB.
 */
export function sanitizeBachsResponse(data: any): any {
  if (!data || typeof data !== 'object') return null;
  const copy: Record<string, any> = {};
  const allowedKeys = [
    'id',
    'checkout_id',
    'session_id',
    'object',
    'status',
    'payment_status',
    'currency',
    'amount',
    'total_amount',
    'amount_total',
    'settlement_amount',
    'processing_fee',
    'pricing',
    'channel',
    'payment_method',
    'payment_method_details',
    'payment_method_types',
    'paid_at',
    'created_at',
    'expires_at',
    'metadata',
    'customer',
    'customer_details'
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      copy[key] = data[key];
    }
  }

  return Object.keys(copy).length > 0 ? copy : { status: data.status || null };
}

/**
 * Converts integer cents (e.g. 5000) into Bachs' required major-unit decimal string ("50.00").
 */
export function formatMinorToBachsDecimal(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

/**
 * Parses Bachs wire money fields (major-unit decimal strings like "50.00" or numbers)
 * into canonical integer cents (e.g. 5000), while honoring explicit amount_minor overrides.
 */
export function parseBachsAmountMinor(obj: Record<string, any>): number {
  if (typeof obj.amount_minor === 'number' && Number.isFinite(obj.amount_minor)) {
    return Math.round(obj.amount_minor);
  }

  const rawMajor =
    obj.amount_total ??
    obj.total_amount ??
    obj.amount ??
    obj.pricing?.amount ??
    obj.settlement_amount;

  if (rawMajor === undefined || rawMajor === null || rawMajor === '') {
    return 0;
  }

  const parsed = typeof rawMajor === 'number' ? rawMajor : parseFloat(String(rawMajor).trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.round(parsed * 100);
}

/**
 * Creates a hosted USD checkout session via Bachs API (POST /v1/checkout-sessions).
 * Per docs.bachs.io, pricing.amount uses major decimal string format (e.g. "50.00").
 */
export async function createBachsCheckoutSession(
  params: CreateBachsSessionParams
): Promise<CreateBachsSessionResult> {
  const apiKey = getBachsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: 'Bachs API Key is not configured on the server.'
    };
  }

  const baseUrl = getBachsBaseUrl();
  const payload = {
    pricing: {
      amount: formatMinorToBachsDecimal(params.amountCents),
      currency: 'USD'
    },
    customer: {
      email: params.customerEmail,
      name: params.customerName
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.reference,
    metadata: {
      reference: params.reference,
      order_reference: params.reference,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      studentEmail: params.customerEmail,
      studentName: params.customerName,
      phone: params.customerPhone || '',
      authUserId: params.authUserId || ''
    }
  };

  try {
    const response = await fetch(`${baseUrl}/v1/checkout-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': params.reference
      },
      body: JSON.stringify(payload)
    });

    const json: any = await response.json().catch(() => ({}));
    const sessionObj = json?.data && typeof json.data === 'object' ? json.data : json;
    const checkoutUrl =
      sessionObj?.checkout_url ||
      sessionObj?.url ||
      sessionObj?.authorization_url ||
      json?.checkout_url ||
      json?.url ||
      null;
    const sessionId =
      sessionObj?.checkout_id ||
      sessionObj?.id ||
      sessionObj?.session_id ||
      json?.checkout_id ||
      json?.id ||
      null;

    if (!response.ok || !checkoutUrl) {
      return {
        ok: false,
        status: response.status >= 400 && response.status < 500 ? 400 : 502,
        error: json?.message || json?.error?.message || json?.error || 'Failed to create Bachs USD checkout session.',
        raw: sanitizeBachsResponse(sessionObj)
      };
    }

    return {
      ok: true,
      status: 200,
      sessionId: sessionId ? String(sessionId) : undefined,
      checkoutUrl: String(checkoutUrl),
      raw: sanitizeBachsResponse(sessionObj)
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 502,
      error: err?.message || 'Network error connecting to Bachs USD payment gateway.'
    };
  }
}

/**
 * Normalizes a Bachs checkout session, charge, or webhook envelope/data payload
 * into our canonical transaction shape.
 */
export function normalizeBachsPayload(rawPayload: any): NormalizedBachsVerification {
  const eventType = String(rawPayload?.type || rawPayload?.event || '').toLowerCase().trim();
  const obj = rawPayload?.data && typeof rawPayload.data === 'object' ? rawPayload.data : rawPayload || {};
  const paymentStatus = String(obj.payment_status || '').toLowerCase().trim();
  const sessionStatus = String(obj.status || '').toLowerCase().trim();

  let status: 'success' | 'failed' | 'abandoned' | 'pending' = 'pending';
  if (
    paymentStatus === 'paid' ||
    paymentStatus === 'succeeded' ||
    sessionStatus === 'paid' ||
    sessionStatus === 'succeeded' ||
    sessionStatus === 'complete' ||
    sessionStatus === 'completed' ||
    sessionStatus === 'success' ||
    ((eventType === 'collection.succeeded' || eventType === 'checkout.completed') && paymentStatus !== 'unpaid')
  ) {
    status = 'success';
  } else if (
    sessionStatus === 'failed' ||
    paymentStatus === 'failed' ||
    eventType === 'collection.failed' ||
    eventType === 'collection.underpaid'
  ) {
    status = 'failed';
  } else if (
    sessionStatus === 'expired' ||
    sessionStatus === 'cancelled' ||
    sessionStatus === 'canceled' ||
    sessionStatus === 'abandoned' ||
    eventType === 'checkout.expired'
  ) {
    status = 'abandoned';
  }

  const rawCurrency = obj.currency || obj.pricing?.currency || obj.amount_details?.currency || '';
  const currency = String(rawCurrency).toUpperCase().trim();

  const amountMinor = parseBachsAmountMinor(obj);

  const metadata = (obj.metadata && typeof obj.metadata === 'object' ? obj.metadata : {}) as Record<string, any>;
  const customer = (
    (obj.customer && typeof obj.customer === 'object' ? obj.customer : null) ||
    (obj.customer_details && typeof obj.customer_details === 'object' ? obj.customer_details : null) ||
    {}
  ) as Record<string, any>;

  const rawId = typeof obj.id === 'string' ? obj.id : '';
  const sessionId =
    obj.checkout_id ||
    obj.session_id ||
    obj.checkout_session_id ||
    (rawId.startsWith('chk_') || rawId.startsWith('cs_') ? rawId : null);
  const externalTxId = String(obj.payment_intent || obj.collection_id || obj.id || sessionId || '');
  const reference =
    metadata.reference ||
    metadata.order_reference ||
    obj.client_reference_id ||
    obj.reference ||
    null;

  const channelRaw =
    obj.channel ||
    obj.payment_method_details?.type ||
    obj.payment_method ||
    (Array.isArray(obj.payment_method_types) ? obj.payment_method_types[0] : null) ||
    'card';

  return {
    status,
    currency,
    amountMinor,
    externalTxId,
    sessionId: sessionId ? String(sessionId) : null,
    reference: reference ? String(reference).trim() : null,
    customerEmail: customer.email || obj.customer_email || metadata.studentEmail || null,
    customerName: customer.name || metadata.studentName || null,
    courseId: metadata.courseId || metadata.course_id || null,
    authUserId: metadata.authUserId || null,
    channel: String(channelRaw || 'card'),
    paidAt: obj.paid_at || obj.completed_at || rawPayload?.created_at || null,
    raw: sanitizeBachsResponse(obj)
  };
}

/**
 * Fetches authoritative checkout session status directly from Bachs API.
 */
export async function fetchBachsCheckoutSession(
  sessionIdOrRef: string
): Promise<{ ok: boolean; status: number; data?: NormalizedBachsVerification; error?: string }> {
  const apiKey = getBachsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: 'Bachs API Key is not configured on the server.'
    };
  }

  const baseUrl = getBachsBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/v1/checkout-sessions/${encodeURIComponent(sessionIdOrRef)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const json: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: response.status === 404 ? 404 : 502,
        error: json?.message || json?.error || 'USD transaction could not be verified with Bachs.'
      };
    }

    return {
      ok: true,
      status: 200,
      data: normalizeBachsPayload(json)
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 502,
      error: err?.message || 'Network error connecting to Bachs verification API.'
    };
  }
}

export interface BachsWebhookSignatureInput {
  signature?: string | string[];
  signatureV2?: string | string[];
  timestamp?: string | string[];
  toleranceSeconds?: number;
  nowSeconds?: number;
}

function firstHeaderValue(val?: string | string[]): string {
  if (!val) return '';
  return (Array.isArray(val) ? val[0] : val).trim();
}

function isTimestampWithinTolerance(tsRaw: string, toleranceSeconds: number, nowSeconds: number): boolean {
  if (!tsRaw) return true;
  const ts = Number(tsRaw);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  if (toleranceSeconds <= 0) return true;
  return Math.abs(nowSeconds - ts) <= toleranceSeconds;
}

/**
 * Verifies Bachs webhook HMAC-SHA256 signatures per official docs.bachs.io:
 * - `X-Bachs-Signature-V2`: `t={unix_ts},v1={hex}` computed over `"{unix_ts}.{raw_body}"` (supports multiple rotated `v1=` tokens)
 * - `X-Bachs-Timestamp` + `X-Bachs-Signature`: HMAC-SHA256 hex over `"{timestamp}.{raw_body}"`
 * - Also supports plain hex / `sha256={hex}` over raw body when no timestamp header is present.
 */
export function verifyBachsWebhookSignature(
  rawBody: Buffer,
  signatureOrHeaders: string | BachsWebhookSignatureInput,
  webhookSecret: string = getBachsWebhookSecret()
): boolean {
  if (!webhookSecret || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  const input: BachsWebhookSignatureInput =
    typeof signatureOrHeaders === 'string'
      ? { signature: signatureOrHeaders }
      : signatureOrHeaders || {};

  const sigV2 = firstHeaderValue(input.signatureV2);
  const sigV1 = firstHeaderValue(input.signature);
  const headerTs = firstHeaderValue(input.timestamp);
  const tolerance = input.toleranceSeconds ?? 300;
  const nowSec = input.nowSeconds ?? Math.floor(Date.now() / 1000);

  if (!sigV2 && !sigV1) {
    return false;
  }

  const candidates: Array<{ payload: Buffer; providedHex: string; ts?: string }> = [];

  // 1. V2 header (`t=1774300000,v1=abc...,v1=def...`)
  if (sigV2 && sigV2.includes('t=') && sigV2.includes('v1=')) {
    let tsValue = '';
    const v1Tokens: string[] = [];
    for (const part of sigV2.split(',')) {
      const idx = part.indexOf('=');
      if (idx <= 0) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k === 't') tsValue = v;
      if (k === 'v1' && v) v1Tokens.push(v.toLowerCase());
    }
    if (tsValue && v1Tokens.length > 0 && isTimestampWithinTolerance(tsValue, tolerance, nowSec)) {
      const signedPayload = Buffer.concat([Buffer.from(`${tsValue}.`), rawBody]);
      for (const hexToken of v1Tokens) {
        candidates.push({ payload: signedPayload, providedHex: hexToken, ts: tsValue });
      }
    }
  }

  // 2. Legacy/string passed as `t=...,v1=...`
  if (sigV1 && sigV1.includes('t=') && sigV1.includes('v1=')) {
    let tsValue = '';
    const v1Tokens: string[] = [];
    for (const part of sigV1.split(',')) {
      const idx = part.indexOf('=');
      if (idx <= 0) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k === 't') tsValue = v;
      if (k === 'v1' && v) v1Tokens.push(v.toLowerCase());
    }
    if (tsValue && v1Tokens.length > 0 && isTimestampWithinTolerance(tsValue, tolerance, nowSec)) {
      const signedPayload = Buffer.concat([Buffer.from(`${tsValue}.`), rawBody]);
      for (const hexToken of v1Tokens) {
        candidates.push({ payload: signedPayload, providedHex: hexToken, ts: tsValue });
      }
    }
  } else if (sigV1) {
    const normalizedHex = sigV1.toLowerCase().replace(/^sha256=/, '');
    if (headerTs) {
      // Official docs: X-Bachs-Timestamp + X-Bachs-Signature signs "{timestamp}.{raw_body}"
      if (isTimestampWithinTolerance(headerTs, tolerance, nowSec)) {
        candidates.push({
          payload: Buffer.concat([Buffer.from(`${headerTs}.`), rawBody]),
          providedHex: normalizedHex,
          ts: headerTs
        });
      }
    } else {
      // Plain HMAC over rawBody if no timestamp header was sent
      candidates.push({
        payload: rawBody,
        providedHex: normalizedHex
      });
    }
  }

  for (const candidate of candidates) {
    if (!/^[0-9a-f]{64}$/.test(candidate.providedHex)) {
      continue;
    }
    const expectedHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(candidate.payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const providedBuf = Buffer.from(candidate.providedHex, 'hex');
    if (
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf)
    ) {
      return true;
    }
  }

  return false;
}
