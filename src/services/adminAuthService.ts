/**
 * Vixora Digital Hub - Enterprise Admin Authentication & API Client
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  permissions: string[];
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

export interface AdminOverviewMetrics {
  totalCertificates: number;
  totalStudents: number;
  totalEmailDispatches: number;
  activeProvider: string;
  activeSender: string;
  databaseTier: string;
  serverUptimeSec: number;
  timestamp: string;
}

export interface AdminOverviewResponse {
  metrics: AdminOverviewMetrics;
  emailConfig: {
    hasSmtp: boolean;
    hasResend: boolean;
    primaryProvider: 'resend' | 'smtp' | 'none';
    isConfigured: boolean;
    smtpHost?: string;
    smtpUser?: string;
    fromAddress: string;
  };
  recentCertificates: any[];
  recentEmailLogs: any[];
}

const ADMIN_STORAGE_KEY = 'vixora_enterprise_admin_session_v1';

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (!session.token || !session.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (err) {
    console.error('Failed to parse admin session:', err);
    return null;
  }
}

export function setAdminSession(session: AdminSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } else {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  }
}

export function getAdminToken(): string | null {
  const session = getAdminSession();
  return session?.token || null;
}

/**
 * Authenticate with the Vixora Admin Gateway
 */
export async function adminLogin(email: string, password: string): Promise<{
  success: boolean;
  session?: AdminSession;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Authentication failed. Please check your credentials.'
      };
    }

    const session: AdminSession = {
      token: data.token,
      user: data.user,
      expiresAt: data.expiresAt
    };

    setAdminSession(session);
    return { success: true, session };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network gateway error connecting to admin service.'
    };
  }
}

/**
 * Terminate current admin session
 */
export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch {
      // Best effort logout
    }
  }
  setAdminSession(null);
}

/**
 * Fetch executive overview and telemetry
 */
export async function fetchAdminOverview(): Promise<AdminOverviewResponse | null> {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/admin/overview', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        setAdminSession(null);
      }
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    return null;
  }
}

/**
 * Send an immediate live test email across the active Resend / SMTP engine
 */
export async function sendAdminTestEmail(params: {
  to: string;
  subject: string;
  message?: string;
}): Promise<{
  success: boolean;
  message: string;
  delivery?: any;
  emailLog?: any;
  error?: string;
}> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, message: 'Unauthorized session' };
  }

  try {
    const res = await fetch('/api/admin/send-test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || 'Failed to dispatch test email',
        error: data.error
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed connecting to dispatch server',
      error: err.message
    };
  }
}

/**
 * Fetch registered academy students
 */
export async function fetchAdminStudents(): Promise<any[]> {
  const token = getAdminToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/admin/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.students || [];
  } catch {
    return [];
  }
}
