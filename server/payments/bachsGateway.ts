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
    'session_id',
    'object',
    'status',
    'payment_status',
    'currency',
    'amount',
    'amount_total',
    'pricing',
    'channel',
    'payment_method',
    'payment_method_types',
    'paid_at',
    'created_at',
    'expires_at',
    'metadata',
    'customer'
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      copy[key] = data[key];
    }
  }

  return Object.keys(copy).length > 0 ? copy : { status: data.status || null };
}

/**
 * Creates a hosted USD checkout session via Bachs API (POST /v1/checkout-sessions).
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
      amount: params.amountCents,
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
    const sessionId = sessionObj?.id || sessionObj?.session_id || json?.id || null;

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
 * Normalizes a Bachs checkout session or webhook data payload into our canonical transaction shape.
 */
export function normalizeBachsPayload(rawPayload: any): NormalizedBachsVerification {
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
    sessionStatus === 'success'
  ) {
    status = 'success';
  } else if (sessionStatus === 'failed' || paymentStatus === 'failed') {
    status = 'failed';
  } else if (
    sessionStatus === 'expired' ||
    sessionStatus === 'cancelled' ||
    sessionStatus === 'canceled' ||
    sessionStatus === 'abandoned'
  ) {
    status = 'abandoned';
  }

  const rawCurrency = obj.currency || obj.pricing?.currency || obj.amount_details?.currency || '';
  const currency = String(rawCurrency).toUpperCase().trim();

  const rawMinor =
    obj.amount_total ??
    obj.pricing?.amount ??
    obj.amount_minor ??
    obj.amount ??
    0;
  const amountMinor = Math.round(Number(rawMinor) || 0);

  const metadata = (obj.metadata && typeof obj.metadata === 'object' ? obj.metadata : {}) as Record<string, any>;
  const customer = (obj.customer && typeof obj.customer === 'object' ? obj.customer : {}) as Record<string, any>;

  const sessionId = obj.session_id || obj.checkout_session_id || (typeof obj.id === 'string' && obj.id.startsWith('cs_') ? obj.id : null);
  const externalTxId = String(obj.payment_intent || obj.collection_id || obj.id || sessionId || '');
  const reference =
    metadata.reference ||
    obj.client_reference_id ||
    obj.reference ||
    null;

  const channelRaw =
    obj.channel ||
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
    customerEmail: (customer.email || obj.customer_email || metadata.studentEmail || null),
    customerName: (customer.name || metadata.studentName || null),
    courseId: (metadata.courseId || metadata.course_id || null),
    authUserId: (metadata.authUserId || null),
    channel: String(channelRaw || 'card'),
    paidAt: obj.paid_at || obj.completed_at || null,
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

/**
 * Verifies X-Bachs-Signature HMAC-SHA256 webhook signature against the raw request body.
 * Supports plain hex digest, `sha256=<hex>`, and `t=<ts>,v1=<hex>` header conventions.
 */
export function verifyBachsWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string,
  webhookSecret: string = getBachsWebhookSecret()
): boolean {
  if (!webhookSecret || !signatureHeader || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  const trimmed = signatureHeader.trim();
  const candidates: Array<{ payload: Buffer | string; providedHex: string }> = [];

  if (trimmed.includes('t=') && trimmed.includes('v1=')) {
    const parts = Object.fromEntries(
      trimmed.split(',').map((part) => {
        const idx = part.indexOf('=');
        return idx > 0 ? [part.slice(0, idx).trim(), part.slice(idx + 1).trim()] : [part, ''];
      })
    );
    if (parts.t && parts.v1) {
      candidates.push({
        payload: Buffer.concat([Buffer.from(`${parts.t}.`), rawBody]),
        providedHex: parts.v1.toLowerCase()
      });
    }
  } else {
    const normalizedHex = trimmed.toLowerCase().replace(/^sha256=/, '');
    candidates.push({
      payload: rawBody,
      providedHex: normalizedHex
    });
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
