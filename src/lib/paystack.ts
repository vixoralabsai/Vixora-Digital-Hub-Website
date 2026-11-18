/**
 * Paystack Client Integration Helper for Vixora Academy
 * Provides secure client-side communication with the backend Paystack endpoints.
 *
 * Rules:
 * - Browser is NEVER authoritative for amount, currency, tuition, or reference.
 * - Secret keys are NEVER imported or referenced here in client-side code.
 * - Supabase JWT Bearer token is automatically attached when user is logged in.
 */

import { supabase } from './supabaseClient';

export type PaymentGateway = 'paystack' | 'bachs';
export type PaymentCurrency = 'NGN' | 'USD';
export type PaymentGatewayMode = 'sandbox' | 'live';

export interface PaystackConfig {
  configured: boolean;
  hasPublicKey: boolean;
  publicKey: string | null;
  currency: string;
  mode: 'test' | 'live';
  merchantName: string;
}

export interface MultiGatewayPaymentsConfig {
  merchantName: string;
  currencyGateways: {
    NGN: PaymentGateway;
    USD: PaymentGateway;
  };
  paystack: {
    configured: boolean;
    hasPublicKey: boolean;
    publicKey: string | null;
    currency: 'NGN';
    mode: 'test' | 'live';
  };
  bachs: {
    configured: boolean;
    currency: 'USD';
    mode: PaymentGatewayMode;
  };
}

export interface InitializePaymentParams {
  courseId: string;
  currency?: PaymentCurrency;
  studentName?: string;
  email: string;
  phone?: string;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  gateway?: PaymentGateway;
  gatewayMode?: PaymentGatewayMode;
  sessionId?: string | null;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  amount?: number;
  amountMinor?: number;
  amountNaira?: number;
  amountKobo?: number;
  currency?: string;
  courseId?: string;
  courseTitle?: string;
  publicKey?: string | null;
  error?: string;
  code?: string;
  help?: string;
}

export interface VerifiedPaymentData {
  reference: string;
  gateway?: PaymentGateway;
  gatewayMode?: PaymentGatewayMode;
  status: string;
  amount: number;
  currency: string;
  channel: string | null;
  paidAt: string | null;
  studentName: string | null;
  studentEmail: string;
  courseTitle: string;
  courseId: string;
  emailDispatchedAt?: string | null;
  gatewayResponse?: string;
  last4?: string | null;
  telegramInvites?: Array<{
    title: string;
    description?: string;
    inviteUrl: string;
  }>;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  alreadyFulfilled?: boolean;
  payment?: VerifiedPaymentData;
  error?: string;
  code?: string;
  status?: number;
  reference?: string;
}

export interface LaunchCheckoutOptions {
  gateway?: PaymentGateway;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  email: string;
  studentName?: string;
  phone?: string;
  publicKey?: string | null;
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key?: string;
        email: string;
        amount?: number;
        currency?: string;
        ref?: string;
        access_code?: string;
        channels?: string[];
        metadata?: Record<string, any>;
        callback?: (response: { reference: string; trxref?: string; status?: string; message?: string }) => void;
        onClose?: () => void;
        onSuccess?: (response: { reference: string; trxref?: string; status?: string; message?: string }) => void;
        onCancel?: () => void;
      }) => {
        openIframe?: () => void;
      };
      newTransaction?: (options: any) => void;
    };
  }
}

/**
 * Validates transaction reference format client-side before sending to backend
 */
export function isValidClientReference(ref: unknown): boolean {
  if (typeof ref !== 'string') return false;
  const trimmed = ref.trim();
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(trimmed);
}

/**
 * Sanitizes technical, browser-specific DOMException or SyntaxError messages
 * (e.g. WebKit's generic "The string did not match the expected pattern.")
 * into clean, user-friendly error messages.
 */
export function cleanErrorMessage(msg?: unknown): string {
  if (!msg || typeof msg !== 'string') return '';
  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes('expected pattern') ||
    lower.includes('syntaxerror') ||
    lower.includes('unexpected token') ||
    lower.includes('failed to fetch') ||
    lower.includes('load failed') ||
    lower.includes('network request failed') ||
    lower.includes('type error')
  ) {
    return 'Unable to reach the payment service. Please verify your connection or try again shortly.';
  }

  if (lower.includes('405') || lower.includes('method not allowed')) {
    return 'Payment gateway service is currently updating. Please try again in a few moments.';
  }

  return trimmed;
}

/**
 * Defensively parses response text to avoid Safari/WebKit DOMException 12:
 * "The string did not match the expected pattern."
 * when an endpoint returns HTML (404/500/502/proxy error) instead of valid JSON.
 */
async function parseSafeResponseJson<T = any>(
  res: Response,
  defaultErrorMsg = 'Payment service error.'
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const status = res.status;
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        ok: res.ok,
        status,
        data: null,
        error: res.ok ? undefined : `${defaultErrorMsg} (HTTP ${status})`
      };
    }

    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          ok: res.ok,
          status,
          data: parsed,
          error: parsed?.error ? cleanErrorMessage(parsed.error) : undefined
        };
      } catch {
        // Fall through to non-JSON handler
      }
    }

    // Response was non-JSON (e.g. HTML from proxy or error page)
    if (status === 405) {
      return {
        ok: false,
        status,
        data: null,
        error: 'Payment service connection is currently synchronizing. Please try again in a moment.'
      };
    }

    return {
      ok: false,
      status,
      data: null,
      error: status >= 500
        ? 'Payment gateway service is temporarily unavailable. Please retry shortly.'
        : `${defaultErrorMsg} (HTTP ${status})`
    };
  } catch (err: any) {
    return {
      ok: false,
      status,
      data: null,
      error: cleanErrorMessage(err?.message) || defaultErrorMsg
    };
  }
}

/**
 * Loads Paystack inline.js script dynamically
 */
export function loadPaystackInlineScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.PaystackPop) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Paystack] Inline SDK failed to load. Will fallback to hosted redirect.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetch public Paystack config from backend
 */
export async function getPaystackConfig(): Promise<PaystackConfig> {
  const fallbackConfig: PaystackConfig = {
    configured: false,
    hasPublicKey: false,
    publicKey: null,
    currency: 'NGN',
    mode: 'test',
    merchantName: 'Vixora Academy'
  };

  try {
    const res = await fetch('/api/payments/paystack/config');
    const parsed = await parseSafeResponseJson<PaystackConfig>(res);
    if (parsed.ok && parsed.data && typeof parsed.data.configured === 'boolean') {
      return parsed.data;
    }

    // Fallback to legacy route
    const legacyRes = await fetch('/api/paystack/config');
    const legacyParsed = await parseSafeResponseJson<PaystackConfig>(legacyRes);
    if (legacyParsed.ok && legacyParsed.data && typeof legacyParsed.data.configured === 'boolean') {
      return legacyParsed.data;
    }
  } catch (err) {
    console.warn('[Paystack Config] Unable to load config:', err);
  }

  return fallbackConfig;
}

export function resolveGatewayForCurrency(currency: PaymentCurrency): PaymentGateway {
  return currency === 'USD' ? 'bachs' : 'paystack';
}

export async function getPaymentsConfig(): Promise<MultiGatewayPaymentsConfig> {
  const fallback: MultiGatewayPaymentsConfig = {
    merchantName: 'Vixora Academy',
    currencyGateways: { NGN: 'paystack', USD: 'bachs' },
    paystack: {
      configured: false,
      hasPublicKey: false,
      publicKey: null,
      currency: 'NGN',
      mode: 'test'
    },
    bachs: {
      configured: false,
      currency: 'USD',
      mode: 'sandbox'
    }
  };

  try {
    const res = await fetch('/api/payments/config');
    const parsed = await parseSafeResponseJson<MultiGatewayPaymentsConfig>(res);
    if (parsed.ok && parsed.data && parsed.data.currencyGateways) {
      return parsed.data;
    }
  } catch (err) {
    console.warn('[Payments Config] Unable to load multi-gateway config:', err);
  }
  return fallback;
}

/**
 * Unified Currency-Aware Payment Initialization.
 * Dynamically routes NGN -> Paystack and USD -> Bachs on the backend.
 * Browser NEVER supplies amount, price, or tuition.
 */
export async function initializeDynamicPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      } catch {
        // Guest mode, proceed without token
      }
    }

    const currency: PaymentCurrency = params.currency === 'USD' ? 'USD' : 'NGN';
    const payload = {
      courseId: params.courseId,
      currency,
      studentName: params.studentName,
      email: params.email,
      phone: params.phone,
      callbackUrl: params.callbackUrl
    };

    let res = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    let parsed = await parseSafeResponseJson<any>(res, 'Failed to initialize payment.');

    // Backward fallback ONLY for NGN -> Paystack if proxy hasn't mounted /api/payments/initialize
    if (currency === 'NGN' && (res.status === 404 || res.status === 405)) {
      try {
        const fallbackRes = await fetch('/api/payments/paystack/initialize', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        const fallbackParsed = await parseSafeResponseJson<any>(fallbackRes, 'Failed to initialize payment.');
        if (fallbackParsed.ok && fallbackParsed.data?.success) {
          res = fallbackRes;
          parsed = fallbackParsed;
        }
      } catch {
        // Retain original response
      }
    }

    const data = parsed.data || {};

    if (!parsed.ok || !data.success) {
      const rawError = data.error || parsed.error || 'Failed to initialize payment.';
      return {
        success: false,
        gateway: data.gateway || resolveGatewayForCurrency(currency),
        reference: data.reference || '',
        error: cleanErrorMessage(rawError),
        code: data.code || (parsed.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'INIT_FAILED'),
        help: data.help
      };
    }

    return {
      success: true,
      gateway: data.gateway || resolveGatewayForCurrency(currency),
      gatewayMode: data.gatewayMode,
      sessionId: data.sessionId || null,
      reference: data.reference,
      authorizationUrl: data.authorizationUrl,
      accessCode: data.accessCode,
      amount: data.amount ?? data.amountNaira,
      amountMinor: data.amountMinor ?? data.amountKobo,
      amountNaira: data.amountNaira,
      amountKobo: data.amountKobo,
      currency: data.currency || currency,
      courseId: data.courseId,
      courseTitle: data.courseTitle
    };
  } catch (err: any) {
    return {
      success: false,
      gateway: resolveGatewayForCurrency(params.currency === 'USD' ? 'USD' : 'NGN'),
      reference: '',
      error: cleanErrorMessage(err?.message) || 'Network error connecting to payment gateway.',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Legacy NGN-explicit wrapper kept for backward compatibility.
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  return initializeDynamicPayment({
    ...params,
    currency: 'NGN'
  });
}

/**
 * Verifies any Paystack (NGN) or Bachs (USD) transaction reference strictly through backend.
 */
export async function verifyGatewayPayment(reference: string): Promise<VerifyPaymentResponse> {
  const cleanRef = (reference || '').trim();

  if (!isValidClientReference(cleanRef)) {
    return {
      verified: false,
      error: 'Invalid payment reference format.',
      code: 'INVALID_REFERENCE',
      reference: cleanRef
    };
  }

  try {
    let res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reference: cleanRef })
    });

    let parsed = await parseSafeResponseJson<VerifyPaymentResponse>(res, 'Verification error.');

    if ((res.status === 404 || res.status === 405) && (!parsed.data || !parsed.data.verified)) {
      try {
        const fallbackRes = await fetch('/api/payments/paystack/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference: cleanRef })
        });
        const fallbackParsed = await parseSafeResponseJson<VerifyPaymentResponse>(fallbackRes, 'Verification error.');
        if (fallbackParsed.ok && fallbackParsed.data) {
          res = fallbackRes;
          parsed = fallbackParsed;
        }
      } catch {
        // Retain original response
      }
    }

    if (!parsed.ok || !parsed.data) {
      return {
        verified: false,
        error: cleanErrorMessage(parsed.error || parsed.data?.error) || "We're confirming your payment. Please wait or click retry.",
        code: parsed.data?.code || 'VERIFICATION_UNAVAILABLE',
        status: parsed.status,
        reference: cleanRef
      };
    }

    return parsed.data;
  } catch (err: any) {
    return {
      verified: false,
      error: cleanErrorMessage(err?.message) || 'Network error verifying payment.',
      code: 'NETWORK_ERROR',
      reference: cleanRef
    };
  }
}

export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResponse> {
  return verifyGatewayPayment(reference);
}

function isAllowedHostedCheckoutHost(hostname: string, gateway?: PaymentGateway): boolean {
  const host = hostname.toLowerCase();
  const isPaystackHost =
    host === 'checkout.paystack.com' ||
    host === 'standard.paystack.co' ||
    host.endsWith('.paystack.com') ||
    host.endsWith('.paystack.co');

  const isBachsHost =
    host === 'bachs.io' ||
    host === 'checkout.bachs.io' ||
    host === 'pay.bachs.io' ||
    host.endsWith('.bachs.io');

  if (gateway === 'paystack') return isPaystackHost;
  if (gateway === 'bachs') return isBachsHost;
  return isPaystackHost || isBachsHost;
}

/**
 * Launches server-initialized hosted checkout for Paystack (NGN) or Bachs (USD).
 */
export async function launchGatewayCheckout(options: LaunchCheckoutOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  if (options.authorizationUrl) {
    try {
      const checkoutUrl = new URL(options.authorizationUrl);

      if (
        checkoutUrl.protocol !== 'https:' ||
        !isAllowedHostedCheckoutHost(checkoutUrl.hostname, options.gateway)
      ) {
        const gwLabel = options.gateway === 'bachs' ? 'Bachs' : 'Paystack';
        throw new Error(`${gwLabel} returned an invalid checkout link.`);
      }

      try {
        window.location.assign(checkoutUrl.href);
      } catch {
        window.location.href = checkoutUrl.href;
      }
      return;
    } catch (err: any) {
      console.error('[Gateway Checkout] Invalid authorization URL:', err);
      if (options.onError) {
        options.onError(cleanErrorMessage(err?.message) || 'Payment gateway returned an invalid checkout link. Please try again or contact admissions.');
      }
      return;
    }
  }

  if (options.onError) {
    options.onError('Payment authorization URL could not be generated. Please try again or contact admissions.');
  }
}

export const launchPaystackCheckout = launchGatewayCheckout;
