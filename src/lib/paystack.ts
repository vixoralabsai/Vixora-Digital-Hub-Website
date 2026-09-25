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

export interface PaystackConfig {
  configured: boolean;
  hasPublicKey: boolean;
  publicKey: string | null;
  currency: string;
  mode: 'test' | 'live';
  merchantName: string;
}

export interface InitializePaymentParams {
  courseId: string;
  studentName?: string;
  email: string;
  phone?: string;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
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
  try {
    const res = await fetch('/api/payments/paystack/config');
    if (res.ok) {
      return await res.json();
    }
    // Fallback to legacy route
    const legacyRes = await fetch('/api/paystack/config');
    if (legacyRes.ok) {
      return await legacyRes.json();
    }
  } catch (err) {
    console.warn('[Paystack Config] Unable to load config:', err);
  }

  return {
    configured: false,
    hasPublicKey: false,
    publicKey: null,
    currency: 'NGN',
    mode: 'test',
    merchantName: 'Vixora Academy'
  };
}

/**
 * Initialize payment on backend.
 * Only courseId and customer identity are sent.
 * Browser NEVER supplies amount or reference.
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    // Attach Supabase Auth Bearer token if user is signed in
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

    // Only forward safe, non-financial fields
    const payload = {
      courseId: params.courseId,
      studentName: params.studentName,
      email: params.email,
      phone: params.phone,
      callbackUrl: params.callbackUrl
    };

    const res = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        reference: data.reference || '',
        error: data.error || 'Failed to initialize payment.',
        code: data.code || 'INIT_FAILED',
        help: data.help
      };
    }

    return {
      success: true,
      reference: data.reference,
      authorizationUrl: data.authorizationUrl,
      accessCode: data.accessCode,
      amountNaira: data.amountNaira,
      amountKobo: data.amountKobo,
      currency: data.currency || 'NGN',
      courseId: data.courseId,
      courseTitle: data.courseTitle
    };
  } catch (err: any) {
    return {
      success: false,
      reference: '',
      error: err?.message || 'Network error connecting to payment gateway.',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Verifies transaction reference strictly through backend.
 * Validates reference client-side before calling server.
 */
export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResponse> {
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
    const res = await fetch('/api/payments/paystack/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reference: cleanRef })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      verified: false,
      error: err?.message || 'Network error verifying payment.',
      code: 'NETWORK_ERROR',
      reference: cleanRef
    };
  }
}

/**
 * Launches Paystack checkout via inline popup or authorizationUrl redirect.
 */
export async function launchPaystackCheckout(options: LaunchCheckoutOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  /*
   * Use Paystack's server-initialized hosted checkout as the primary path.
   * The backend has already created the transaction and returned an
   * authorization_url. Redirecting to that URL avoids relying on a browser
   * SDK version/shape and keeps amount/currency/reference server-authoritative.
   *
   * Paystack documents this redirect flow as:
   * backend initialization -> authorization_url -> checkout -> callback.
   */
  if (options.authorizationUrl) {
    try {
      const checkoutUrl = new URL(options.authorizationUrl);

      if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.paystack.com') {
        throw new Error('Paystack returned an invalid checkout URL.');
      }

      window.location.assign(checkoutUrl.toString());
      return;
    } catch (err: any) {
      console.error('[Paystack Checkout] Invalid authorization URL:', err);
      if (options.onError) {
        options.onError('Paystack returned an invalid checkout link. Please try again or contact admissions.');
      }
      return;
    }
  }

  /*
   * No hosted checkout URL means initialization did not produce a usable
   * transaction. Do not attempt to construct a client-side transaction or
   * supply an amount here.
   */
  if (options.onError) {
    options.onError('Payment authorization URL could not be generated. Please try again or contact admissions.');
  }
}
