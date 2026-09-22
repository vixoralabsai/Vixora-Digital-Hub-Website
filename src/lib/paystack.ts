/**
 * Paystack Client Integration Helper for Vixora Academy
 * Supports both Inline Popup and Server-Side Hosted Checkout with Verification
 */

export interface PaystackConfig {
  configured: boolean;
  hasPublicKey: boolean;
  publicKey: string | null;
  currency: string;
  mode: 'test' | 'live';
  defaultTuitionNaira: number;
  merchantName: string;
  channels: string[];
}

export interface InitializePaymentParams {
  email: string;
  studentName?: string;
  phone?: string;
  courseId?: string;
  courseTitle?: string;
  tuition?: string;
  amount?: number;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  amountNaira: number;
  amountKobo: number;
  currency: string;
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
  channel: string;
  paidAt: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseId: string;
  gatewayResponse: string;
  authorizationCode?: string | null;
  cardType?: string | null;
  bank?: string | null;
  last4?: string | null;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  status?: string;
  message?: string;
  payment?: VerifiedPaymentData;
  error?: string;
  code?: string;
  reference?: string;
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
      console.warn('Failed to load Paystack inline JS SDK, fallback to redirect checkout');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetch Paystack config status from server
 */
export async function getPaystackConfig(): Promise<PaystackConfig> {
  try {
    const res = await fetch('/api/paystack/config');
    if (!res.ok) {
      throw new Error(`Config fetch failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch Paystack config:', err);
    return {
      configured: false,
      hasPublicKey: false,
      publicKey: null,
      currency: 'NGN',
      mode: 'test',
      defaultTuitionNaira: 60000,
      merchantName: 'Vixora Digital Hub',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    };
  }
}

/**
 * Initialize a transaction on the server
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      reference: '',
      amountNaira: 0,
      amountKobo: 0,
      currency: 'NGN',
      error: data.error || data.message || 'Failed to initialize payment',
      code: data.code,
      help: data.help
    };
  }

  return data;
}

/**
 * Verify a completed transaction with Paystack via server
 */
export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResponse> {
  try {
    const res = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`);
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      verified: false,
      error: err.message || 'Network error verifying payment.',
      code: 'NETWORK_ERROR',
      reference
    };
  }
}

/**
 * Utility to parse formatted tuition into numerical Naira value
 */
export function extractTuitionNaira(tuitionStr?: string): number {
  if (!tuitionStr) return 60000;
  const num = parseInt(tuitionStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) || num === 0 ? 60000 : num;
}
