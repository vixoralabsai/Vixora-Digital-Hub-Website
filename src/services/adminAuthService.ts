/**
 * Vixora Digital Hub - Enterprise Admin Authentication & API Client
 * Built on Supabase Auth sessions & Bearer JWT tokens
 */

import { supabase } from '../lib/supabaseClient';

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

export async function getAdminToken(): Promise<string | null> {
  // First attempt to get the freshest token from Supabase client session
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return data.session.access_token;
      }
    } catch {
      // Fallback to local session storage
    }
  }

  const session = getAdminSession();
  return session?.token || null;
}

/**
 * Authenticate admin using Supabase Auth
 */
export async function adminLogin(email: string, password: string): Promise<{
  success: boolean;
  session?: AdminSession;
  error?: string;
}> {
  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. If client Supabase is initialized, authenticate directly with Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error || !data.session) {
        return {
          success: false,
          error: error?.message || 'Invalid administrator credentials. Please check your credentials.'
        };
      }

      const token = data.session.access_token;
      const user = data.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || cleanEmail.split('@')[0];

      // 2. Verify with backend /api/admin/me to enforce server-side ADMIN_EMAILS check
      const verifyRes = await fetch('/api/admin/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!verifyRes.ok) {
        await supabase.auth.signOut();
        const errData = await verifyRes.json().catch(() => ({}));
        return {
          success: false,
          error: errData.error || 'Access denied: account is not an authorized administrator.'
        };
      }

      const verifyData = await verifyRes.json();
      const adminSession: AdminSession = {
        token,
        user: verifyData.user || {
          id: user.id,
          name,
          email: cleanEmail,
          role: 'Administrator',
          title: 'Executive Administrator',
          permissions: ['manage_projects', 'issue_certificates', 'dispatch_emails', 'manage_students', 'system_config']
        },
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000
      };

      setAdminSession(adminSession);
      return { success: true, session: adminSession };
    }

    // Fallback: Post to /api/admin/login which calls Supabase Auth server-side
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      return {
        success: false,
        error: resData.error || 'Authentication failed. Please check your credentials.'
      };
    }

    const session: AdminSession = {
      token: resData.token,
      user: resData.user,
      expiresAt: resData.expiresAt
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
  const token = await getAdminToken();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Best effort
    }
  }

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
  const token = await getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/admin/overview', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
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
  const token = await getAdminToken();
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
 * Fetch registered academy students (Admin protected)
 */
export async function fetchAdminStudents(): Promise<any[]> {
  const token = await getAdminToken();
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
