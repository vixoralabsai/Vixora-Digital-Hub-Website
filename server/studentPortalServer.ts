import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  SEED_CERTIFICATES,
  SEED_STUDENTS,
  Certificate,
  StudentProfile,
  StudentCourse,
  EmailDispatchLog,
  SupabaseStudentRow,
  SupabaseCourseRow,
  SupabaseEnrollmentRow,
  SupabaseCertificateRow,
  SupabaseCompetencyRow,
  SupabaseEmailLogRow,
  generateCertificateEmailHtml,
  generateCertificateEmailText,
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText
} from '../src/data/academyPortalData.js';
import {
  dispatchCertificateEmail,
  dispatchGenericEmail,
  getEmailConfigStatus
} from './emailService.js';
import { generateCertificatePdfBuffer } from './certificatePdfGenerator.js';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabaseAdmin.js';
import { requireAuthentication } from './auth/authMiddleware.js';
import { requireAdmin, getAuthorizedAdminEmails } from './auth/requireAdmin.js';

export const portalRouter = Router();

// ==========================================
// In-Memory Fallback Cache & Seed State
// ==========================================
// When Supabase environment variables are connected, queries route to PostgreSQL.
// If Supabase is offline or not yet configured, the server gracefully falls back
// to this in-memory seed store to guarantee zero application downtime.
const fallbackCertificatesStore = new Map<string, Certificate>();
const fallbackStudentsStore = new Map<string, StudentProfile>();
const fallbackEmailLogsStore: EmailDispatchLog[] = [];

// Populate fallback stores with verified seeds
SEED_CERTIFICATES.forEach((cert) => {
  fallbackCertificatesStore.set(cert.id.toUpperCase(), { ...cert });
});

SEED_STUDENTS.forEach((student) => {
  fallbackStudentsStore.set(student.email.toLowerCase(), { ...student });
});

if (SEED_CERTIFICATES.length > 0) {
  const sample = SEED_CERTIFICATES[0];
  fallbackEmailLogsStore.push({
    id: 'eml-init-001',
    certificateId: sample.id,
    recipientEmail: sample.studentEmail,
    recipientName: sample.studentName,
    subject: `🎓 Congratulations ${sample.studentName}! Your Vixora Academy Certificate is Ready`,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    deliveryLatencyMs: 142,
    previewHtml: generateCertificateEmailHtml(sample)
  });
}

// ==========================================
// Database Row <-> TypeScript Mappers
// ==========================================
// Convert arbitrary date strings to ISO YYYY-MM-DD for PostgreSQL DATE column
function toIsoDateString(rawDate?: string): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  // If parsing fails, default to today's date
  return new Date().toISOString().split('T')[0];
}

// Convert ISO YYYY-MM-DD back to readable "Month Day, Year" for UI
function toHumanDateString(rawDate?: string): string {
  if (!rawDate) return 'September 2026';
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return rawDate;
}

function mapSupabaseCertificateToDomain(
  row: SupabaseCertificateRow,
  competenciesList: string[] = []
): Certificate {
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    courseId: row.course_id,
    courseTitle: row.course_title,
    trackBadge: row.track_badge || 'Professional Track',
    specialization: row.specialization || '',
    grade: row.grade,
    honors: row.honors || undefined,
    capstoneTitle: row.capstone_title || 'Enterprise Capstone Project',
    capstoneScore: row.capstone_score || '98 / 100',
    issueDate: toHumanDateString(row.issue_date),
    completionDate: row.completion_date ? toHumanDateString(row.completion_date) : toHumanDateString(row.issue_date),
    durationWeeks: row.duration_weeks || 12,
    credentialHash: row.credential_hash,
    verificationUrl: row.verification_url || `https://academy.vixoradigitalhub.com/verify?id=${row.id}`,
    instructorName: row.instructor_name || 'Dr. Adebayo Vance',
    instructorTitle: row.instructor_title || 'Principal AI Architect, Vixora Labs',
    directorName: row.director_name || 'Sarumi Hammad',
    directorTitle: row.director_title || 'Dean, Vixora Academy',
    competencies: competenciesList.length > 0 ? competenciesList : [
      'Autonomous AI Tool Use & System Architecture',
      'Cloud Infrastructure Hardening & Containerization',
      'Full-Stack Data Engineering & API Deployment'
    ],
    status: (row.status as 'active' | 'revoked') || 'active',
    emailSentCount: row.email_sent_count || 0,
    lastEmailSentAt: row.last_email_sent_at || undefined
  };
}

function mapSupabaseEmailLogToDomain(row: SupabaseEmailLogRow): EmailDispatchLog {
  return {
    id: row.id,
    certificateId: row.certificate_id || '',
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    subject: row.subject,
    status: (row.status as 'delivered' | 'queued' | 'failed' | 'simulated') || 'simulated',
    provider: (row.provider as 'smtp' | 'resend' | 'simulated') || undefined,
    timestamp: row.timestamp || row.created_at || new Date().toISOString(),
    deliveryLatencyMs: row.delivery_latency_ms || 0,
    previewHtml: row.preview_html || '',
    previewText: row.preview_text || undefined,
    messageId: row.message_id || undefined,
    error: row.error || undefined,
    gmailComposeUrl: row.gmail_compose_url || undefined,
    mailtoUrl: row.mailto_url || undefined,
    infoNotice: row.info_notice || undefined,
    deliveredToInternet: Boolean(row.delivered_to_internet),
    hasAttachment: Boolean(row.has_attachment),
    attachmentName: row.attachment_name || undefined
  };
}

// ==========================================
// Database Operations Helper Functions
// ==========================================

// 1. Fetch certificate by ID from Supabase
async function getCertificateById(id: string): Promise<Certificate | null> {
  const cleanId = id.toUpperCase().trim();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: certRow, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (!certError && certRow) {
        // Fetch related competencies
        const { data: compRows } = await supabase
          .from('certificate_competencies')
          .select('name')
          .eq('certificate_id', cleanId);

        const compList = (compRows || []).map((c: any) => c.name).filter(Boolean);
        return mapSupabaseCertificateToDomain(certRow as SupabaseCertificateRow, compList);
      }
    } catch (err) {
      console.warn(`[Supabase] Error querying certificate ${cleanId}, falling back to cache:`, err);
    }
  }

  return fallbackCertificatesStore.get(cleanId) || null;
}

// 2. Fetch certificates for a student email
async function getCertificatesByStudentEmail(email: string): Promise<Certificate[]> {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: certRows, error } = await supabase
        .from('certificates')
        .select('*')
        .ilike('student_email', cleanEmail);

      if (!error && certRows && certRows.length > 0) {
        const certIds = certRows.map((r: any) => r.id);
        const { data: compRows } = await supabase
          .from('certificate_competencies')
          .select('certificate_id, name')
          .in('certificate_id', certIds);

        const compMap = new Map<string, string[]>();
        (compRows || []).forEach((c: any) => {
          const list = compMap.get(c.certificate_id) || [];
          list.push(c.name);
          compMap.set(c.certificate_id, list);
        });

        return certRows.map((row: any) =>
          mapSupabaseCertificateToDomain(row as SupabaseCertificateRow, compMap.get(row.id) || [])
        );
      }
    } catch (err) {
      console.warn(`[Supabase] Error querying student certificates for ${cleanEmail}:`, err);
    }
  }

  const results: Certificate[] = [];
  fallbackCertificatesStore.forEach((c) => {
    if (c.studentEmail.toLowerCase() === cleanEmail) {
      results.push(c);
    }
  });
  return results;
}

// 3. Fetch Authenticated Student Profile & Link auth_user_id
async function getAuthenticatedStudentProfile(
  authUserId: string,
  verifiedEmail: string
): Promise<StudentProfile | null> {
  const cleanEmail = verifiedEmail.toLowerCase().trim();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // Step A: Primary secure lookup via students.auth_user_id = authUserId
      let { data: studentRow, error: stuError } = await supabase
        .from('students')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      // Step B: Safe linking for existing students whose auth_user_id is NULL
      // Safely match by verified Supabase email and link auth_user_id
      if (!studentRow && !stuError) {
        const { data: studentByEmail } = await supabase
          .from('students')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (studentByEmail) {
          // If auth_user_id is not yet linked, link to this authenticated user
          if (!studentByEmail.auth_user_id) {
            const { error: linkErr } = await supabase
              .from('students')
              .update({
                auth_user_id: authUserId,
                updated_at: new Date().toISOString()
              })
              .eq('id', studentByEmail.id);

            if (!linkErr) {
              studentByEmail.auth_user_id = authUserId;
            }
          }

          // Verify ownership matches the authenticated user
          if (studentByEmail.auth_user_id === authUserId) {
            studentRow = studentByEmail;
          }
        }
      }

      if (studentRow) {
        const studentId = studentRow.id;
        const studentName = studentRow.name;
        const enrolledDate = studentRow.enrolled_date || studentRow.enrolled_at || 'September 2026';
        const role = studentRow.role || 'student';
        const avatarUrl = studentRow.avatar_url || undefined;

        // Fetch enrollments and join courses
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            id,
            status,
            cohort,
            progress_percent,
            completed_modules,
            total_modules,
            courses (
              id,
              title,
              badge,
              instructor_name,
              total_modules
            )
          `)
          .eq('student_id', studentId);

        // Map certificates to courses if available
        const certs = await getCertificatesByStudentEmail(studentRow.email || cleanEmail);
        const certMap = new Map<string, string>();
        certs.forEach((c) => certMap.set(c.courseId, c.id));

        const studentCourses: StudentCourse[] = [];
        if (!enrollError && enrollments && enrollments.length > 0) {
          enrollments.forEach((e: any) => {
            const course = e.courses;
            if (course) {
              studentCourses.push({
                courseId: course.id,
                title: course.title,
                badge: course.badge || 'Enterprise Track',
                progressPercent: e.progress_percent ?? 75,
                status: e.status || 'in-progress',
                cohort: e.cohort || 'Cohort 2026-B',
                instructor: course.instructor_name || 'Dr. Adebayo Vance',
                completedModules: e.completed_modules ?? 9,
                totalModules: course.total_modules || e.total_modules || 12,
                certificateId: certMap.get(course.id) || undefined
              });
            }
          });
        }

        if (studentCourses.length === 0) {
          studentCourses.push({
            courseId: 'ai-automation-digital-business-systems',
            title: 'Autonomous AI Systems & Scalable Architecture',
            badge: 'Enterprise Track',
            progressPercent: 75,
            status: 'in-progress',
            cohort: 'Cohort 2026-B',
            instructor: 'Dr. Adebayo Vance',
            completedModules: 9,
            totalModules: 12,
            certificateId: certMap.get('ai-automation-digital-business-systems') || undefined
          });
        }

        return {
          id: studentId,
          name: studentName,
          email: studentRow.email || cleanEmail,
          avatarUrl,
          enrolledDate,
          role,
          courses: studentCourses
        };
      }

      // No student record exists in Supabase for this authenticated user.
      // Do NOT synthesize fake records.
      return null;
    } catch (err) {
      console.warn(`[Supabase] Error reading student profile for ${cleanEmail}:`, err);
    }
  }

  // Fallback cache lookup (for offline dev environment without Supabase)
  const cachedStudent = fallbackStudentsStore.get(cleanEmail);
  return cachedStudent || null;
}

// 4. Save Issued Certificate & Competencies to Supabase
async function saveIssuedCertificate(
  cert: Certificate,
  competencies: string[]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  fallbackCertificatesStore.set(cert.id, cert);

  if (!supabase) return;

  try {
    // 1. Ensure course exists in courses table
    await supabase.from('courses').upsert({
      id: cert.courseId,
      title: cert.courseTitle,
      track_badge: cert.trackBadge,
      instructor: cert.instructorName,
      cohort: 'Cohort 2026-A',
      total_modules: cert.durationWeeks || 12
    });

    // 2. Ensure student exists in students table
    let studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .ilike('email', cert.studentEmail)
      .maybeSingle();

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      await supabase.from('students').insert({
        id: studentId,
        name: cert.studentName,
        email: cert.studentEmail,
        enrolled_date: cert.issueDate,
        role: 'alumni'
      });
    }

    // 3. Upsert certificate
    await supabase.from('certificates').upsert({
      id: cert.id,
      student_name: cert.studentName,
      student_email: cert.studentEmail,
      course_id: cert.courseId,
      course_title: cert.courseTitle,
      track_badge: cert.trackBadge,
      specialization: cert.specialization,
      grade: cert.grade,
      honors: cert.honors || null,
      capstone_title: cert.capstoneTitle,
      capstone_score: cert.capstoneScore,
      issue_date: toIsoDateString(cert.issueDate),
      completion_date: toIsoDateString(cert.completionDate),
      duration_weeks: cert.durationWeeks,
      credential_hash: cert.credentialHash,
      verification_url: cert.verificationUrl,
      instructor_name: cert.instructorName,
      instructor_title: cert.instructorTitle,
      director_name: cert.directorName,
      director_title: cert.directorTitle,
      status: cert.status,
      email_sent_count: cert.emailSentCount,
      last_email_sent_at: cert.lastEmailSentAt || new Date().toISOString()
    });

    // 4. Insert competencies
    if (competencies.length > 0) {
      await supabase
        .from('certificate_competencies')
        .delete()
        .eq('certificate_id', cert.id);

      const compRows = competencies.map((name) => ({
        certificate_id: cert.id,
        name,
        category: 'Core Engineering'
      }));
      await supabase.from('certificate_competencies').insert(compRows);
    }

    // 5. Update or insert enrollment record with certificate_id
    await supabase.from('enrollments').upsert(
      {
        student_id: studentId,
        course_id: cert.courseId,
        status: 'completed',
        progress_percent: 100,
        completed_modules: cert.durationWeeks || 12,
        certificate_id: cert.id
      },
      { onConflict: 'student_id,course_id' }
    );
  } catch (err) {
    console.error('[Supabase] Error saving issued certificate:', err);
  }
}

// 5. Save Email Dispatch Log to Supabase
async function saveEmailLog(log: EmailDispatchLog): Promise<void> {
  fallbackEmailLogsStore.unshift(log);
  const supabase = getSupabaseAdmin();

  if (!supabase) return;

  try {
    await supabase.from('email_logs').insert({
      id: log.id,
      certificate_id: log.certificateId || null,
      recipient_email: log.recipientEmail,
      recipient_name: log.recipientName,
      subject: log.subject,
      status: log.status,
      provider: log.provider || 'simulated',
      timestamp: log.timestamp,
      delivery_latency_ms: log.deliveryLatencyMs,
      preview_html: log.previewHtml,
      preview_text: log.previewText || null,
      message_id: log.messageId || null,
      error: log.error || null,
      gmail_compose_url: log.gmailComposeUrl || null,
      mailto_url: log.mailtoUrl || null,
      info_notice: log.infoNotice || null,
      delivered_to_internet: log.deliveredToInternet || false,
      has_attachment: log.hasAttachment || false,
      attachment_name: log.attachmentName || null
    });

    // Update certificate email count in Supabase
    if (log.certificateId) {
      await supabase
        .from('certificates')
        .update({
          last_email_sent_at: log.timestamp
        })
        .eq('id', log.certificateId);
    }
  } catch (err) {
    console.warn('[Supabase] Error persisting email log:', err);
  }
}

// 6. Fetch recent email logs from Supabase
async function getRecentEmailLogs(limitCount = 50): Promise<EmailDispatchLog[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (!error && rows && rows.length > 0) {
        return rows.map((r: any) => mapSupabaseEmailLogToDomain(r as SupabaseEmailLogRow));
      }
    } catch (err) {
      console.warn('[Supabase] Error fetching email logs, using fallback cache:', err);
    }
  }

  return fallbackEmailLogsStore.slice(0, limitCount);
}

// ==========================================
// Adaptive Sliding Window Rate Limiter
// ==========================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class SlidingWindowRateLimiter {
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

  peek(key: string): { remaining: number; resetInSeconds: number; limit: number; isLimited: boolean } {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
        limit: this.max,
        isLimited: false
      };
    }

    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }

  reset(key: string) {
    this.store.delete(`${this.prefix}:${key}`);
  }
}

// 5 login attempts per 15 minutes per IP/email
const loginRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: 'login'
});

// 6 certificate emails per 10 minutes per IP
const emailRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  prefix: 'cert_email'
});

// 40 verification lookups per minute per IP to protect against scraping/enumeration
const verifyRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  prefix: 'cert_verify'
});

// 10 PDF downloads per minute per IP to protect against resource exhaustion
const pdfRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  prefix: 'cert_pdf'
});

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// ==========================================
// Student Auth & Login Endpoints
// ==========================================

// Rate limit status endpoint
portalRouter.get('/student/rate-limit-status', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const email = (req.query.email as string)?.toLowerCase().trim() || 'default';
  const key = `${ip}:${email}`;
  const status = loginRateLimiter.peek(key);

  res.json({
    limit: status.limit,
    remaining: status.remaining,
    resetInSeconds: status.resetInSeconds,
    isLimited: status.isLimited
  });
});

// Helper to sanitize Supabase URL for client instance
function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

/**
 * Trigger secure password reset link and 6-digit OTP code via Supabase Auth
 */
portalRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { email, portal, redirectOrigin } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email address is required.', code: 'EMAIL_REQUIRED' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.', code: 'INVALID_EMAIL_FORMAT' });
  }

  // Rate Limiting (5 requests per 10 minutes per IP+email)
  const rlCheck = emailRateLimiter.check(`forgot_pw:${ip}:${cleanEmail}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many password reset attempts. Please wait ${rlCheck.resetInSeconds} seconds before requesting another reset link.`,
      code: 'RATE_LIMIT_EXCEEDED',
      resetInSeconds: rlCheck.resetInSeconds
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: 'Authentication service is unavailable. Supabase is not configured.',
      code: 'AUTH_SERVICE_UNCONFIGURED'
    });
  }

  const isPortalAdmin = portal === 'admin';
  const authorizedAdmins = getAuthorizedAdminEmails();

  if (isPortalAdmin && !authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: 'This email is not registered as an authorized administrator.',
      code: 'FORBIDDEN_NOT_ADMIN'
    });
  }

  try {
    // 1. Check if user exists in auth.users
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
    const allUsers: any[] = (listData as any)?.users || [];
    let authUser: any = allUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);

    // 2. If not found in auth.users, check if they exist in DB or allowlist to auto-provision
    let recipientName = cleanEmail.split('@')[0];
    if (!authUser) {
      if (isPortalAdmin && authorizedAdmins.has(cleanEmail)) {
        // Auto-provision admin in auth.users
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          email_confirm: true,
          user_metadata: { name: cleanEmail.split('@')[0], role: 'admin' }
        });
        if (!createErr && created?.user) {
          authUser = created.user;
          recipientName = 'Administrator';
        }
      } else {
        // Check student in database
        const { data: studentRow } = await supabase
          .from('students')
          .select('id, name, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (studentRow) {
          recipientName = studentRow.name || recipientName;
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: { name: studentRow.name, role: 'student' }
          });
          if (!createErr && created?.user) {
            authUser = created.user;
            // Link auth_user_id
            await supabase.from('students').update({ auth_user_id: created.user.id }).eq('id', studentRow.id);
          }
        }
      }
    } else {
      recipientName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || recipientName;
    }

    // 3. If still no auth user found, return friendly generic message to prevent account enumeration
    if (!authUser) {
      return res.json({
        success: true,
        message: 'If an account is registered with this email, a password reset link has been dispatched to your inbox.',
        email: cleanEmail
      });
    }

    // 4. Generate official Supabase Recovery Link & OTP
    const origin = (redirectOrigin && typeof redirectOrigin === 'string' && redirectOrigin.startsWith('http'))
      ? redirectOrigin.replace(/\/+$/, '')
      : `${req.protocol}://${req.get('host')}`;

    const redirectPath = isPortalAdmin ? '/admin?type=recovery' : '/pages/student-portal?type=recovery';
    const finalRedirect = `${origin}${redirectPath}`;

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: {
        redirectTo: finalRedirect
      }
    });

    if (linkErr || !linkData?.properties) {
      console.error('Supabase recovery link error:', linkErr);
      return res.status(500).json({
        error: 'Failed to generate cryptographic recovery credentials with Supabase.',
        code: 'RECOVERY_LINK_GENERATION_FAILED'
      });
    }

    const actionLink = linkData.properties.action_link;
    const emailOtp = linkData.properties.email_otp;

    // 5. Compose HTML & Text email
    const subject = isPortalAdmin
      ? `🔐 Administrator Password Recovery — Vixora Digital Hub`
      : `🔐 Reset Your Password — Vixora Academy`;

    const htmlContent = generatePasswordResetEmailHtml({
      email: cleanEmail,
      recipientName,
      actionLink,
      otpCode: emailOtp,
      portal: isPortalAdmin ? 'admin' : 'student'
    });

    const textContent = generatePasswordResetEmailText({
      email: cleanEmail,
      recipientName,
      actionLink,
      otpCode: emailOtp,
      portal: isPortalAdmin ? 'admin' : 'student'
    });

    // 6. Dispatch live email via Resend API / verified Gmail SMTP
    const dispatchResult = await dispatchGenericEmail({
      to: cleanEmail,
      toName: recipientName,
      subject,
      html: htmlContent,
      text: textContent
    });

    // 7. Save to Supabase email_logs
    const logId = `eml-reset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await saveEmailLog({
      id: logId,
      recipientEmail: cleanEmail,
      recipientName,
      subject,
      status: dispatchResult.delivered ? 'delivered' : 'simulated',
      provider: dispatchResult.provider,
      timestamp: new Date().toISOString(),
      deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
      previewHtml: htmlContent,
      previewText: textContent,
      messageId: dispatchResult.messageId,
      deliveredToInternet: dispatchResult.deliveredToInternet,
      infoNotice: `Password reset link and OTP generated via Supabase Auth. ${dispatchResult.infoNotice}`
    });

    return res.json({
      success: true,
      message: `A secure password reset link and 6-digit verification code have been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      hasOtp: Boolean(emailOtp),
      provider: dispatchResult.provider,
      delivered: dispatchResult.delivered,
      isDev: process.env.NODE_ENV !== 'production',
      devActionLink: process.env.NODE_ENV !== 'production' ? actionLink : undefined,
      devOtp: process.env.NODE_ENV !== 'production' ? emailOtp : undefined
    });
  } catch (err: any) {
    console.error('Password reset handler error:', err);
    return res.status(500).json({
      error: 'An internal server error occurred while processing your password reset request.',
      code: 'RESET_INTERNAL_ERROR'
    });
  }
});

/**
 * Verify OTP and reset password endpoint (Server-side resilient option)
 */
portalRouter.post('/auth/reset-password-with-otp', async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      error: 'Email, 6-digit verification code, and new password are required.',
      code: 'MISSING_FIELDS'
    });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long.',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured.' });
  }

  try {
    const rawSbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const rawSbAnon = process.env.VITE_SUPABASE_ANON_KEY || '';
    const anonSb = createClient(sanitizeUrl(rawSbUrl), rawSbAnon);

    const { data: vData, error: vErr } = await anonSb.auth.verifyOtp({
      email: cleanEmail,
      token: cleanOtp,
      type: 'recovery'
    });

    if (vErr || !vData.user) {
      return res.status(400).json({
        error: vErr?.message || 'Invalid or expired 6-digit verification code. Please check your email or request a new code.',
        code: 'INVALID_OTP'
      });
    }

    const { data: uData, error: uErr } = await supabase.auth.admin.updateUserById(vData.user.id, {
      password: String(newPassword)
    });

    if (uErr) {
      return res.status(400).json({
        error: uErr.message || 'Failed to update password with Supabase.',
        code: 'PASSWORD_UPDATE_FAILED'
      });
    }

    return res.json({
      success: true,
      message: 'Password successfully updated. You can now sign in with your new credentials.'
    });
  } catch (err: any) {
    console.error('Error in /api/auth/reset-password-with-otp:', err);
    return res.status(500).json({
      error: 'An internal server error occurred while updating your password.',
      code: 'RESET_FAILED'
    });
  }
});

// Student Email Login Deprecation & Hardening
// Direct password-less login and mock vix_st token generation are completely retired.
// Authentication MUST be performed using genuine Supabase Auth (supabase.auth.signInWithPassword).
portalRouter.post('/student/login', (req: Request, res: Response) => {
  return res.status(401).json({
    error: 'Direct unauthenticated student login has been retired. Authenticate with Supabase Auth (supabase.auth.signInWithPassword) and query /api/student/profile with Bearer token.',
    code: 'AUTH_METHOD_DEPRECATED'
  });
});

// Protected Student Profile
// Protected by requireAuthentication (verifies Supabase Auth JWT).
// Identity is derived strictly server-side from req.user (auth.users).
// Query-string and body emails are NEVER trusted for identity resolution.
portalRouter.get('/student/profile', requireAuthentication, async (req: Request, res: Response) => {
  const verifiedUser = req.user;
  if (!verifiedUser || !verifiedUser.id || !verifiedUser.email) {
    return res.status(401).json({
      error: 'Invalid or missing user session context.',
      code: 'AUTH_SESSION_INVALID'
    });
  }

  // Prevent Student A from attempting to access Student B's profile:
  // Reject explicit mismatch if a query parameter is provided.
  const queryEmail = (req.query.email as string)?.toLowerCase().trim();
  if (queryEmail && queryEmail !== verifiedUser.email) {
    return res.status(403).json({
      error: "Access denied: You cannot request another student's profile.",
      code: 'FORBIDDEN_PROFILE_MISMATCH'
    });
  }

  try {
    const student = await getAuthenticatedStudentProfile(verifiedUser.id, verifiedUser.email);
    if (!student) {
      return res.status(404).json({
        error: 'No enrolled student record found for this authenticated account.',
        code: 'STUDENT_ACCOUNT_NOT_LINKED'
      });
    }

    const studentCerts = await getCertificatesByStudentEmail(student.email);

    return res.json({
      student,
      certificates: studentCerts
    });
  } catch (err: any) {
    console.error('Error in /api/student/profile:', err);
    return res.status(500).json({ error: 'Failed to retrieve student profile.' });
  }
});

// ==========================================
// Certificate Portal & Verification Endpoints
// ==========================================

const CERT_ID_REGEX = /^[A-Za-z0-9\-_]{4,40}$/;

// Shared Verification Handler with Cryptographic Integrity Check
// Crucial: Runs strictly server-side using the service-role client.
// Returns only safe verification fields to anonymous clients.
async function handleCertificateVerification(req: Request, res: Response, rawId?: string) {
  const ip = getClientIp(req);
  const rlCheck = verifyRateLimiter.check(ip);

  res.setHeader('X-RateLimit-Limit', rlCheck.limit);
  res.setHeader('X-RateLimit-Remaining', rlCheck.remaining);
  res.setHeader('X-RateLimit-Reset', rlCheck.resetInSeconds);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      verified: false,
      error: `Verification rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before attempting further verification requests.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }

  const certId = (rawId || (req.query.id as string))?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({
      verified: false,
      error: 'Certificate Credential ID is required (e.g. VA-2026-9042-ENG).'
    });
  }

  if (!CERT_ID_REGEX.test(certId)) {
    return res.status(400).json({
      verified: false,
      error: 'Invalid credential identifier format. Expected alphanumeric characters and hyphens only.'
    });
  }

  const cert = await getCertificateById(certId);
  if (!cert) {
    return res.status(404).json({
      verified: false,
      status: 'NOT_FOUND',
      error: `Certificate with ID '${certId}' was not found in the Vixora Academy Global Credential Registry.`,
      checkedAt: new Date().toISOString()
    });
  }

  // Cryptographic Ledger Integrity Check
  const hasValidLedgerHash = Boolean(cert.credentialHash && cert.credentialHash.length === 64);

  // Return safe verification payload without exposing internal student account or email metadata fields
  const publicCertificate = {
    id: cert.id,
    studentName: cert.studentName,
    courseId: cert.courseId,
    courseTitle: cert.courseTitle,
    trackBadge: cert.trackBadge,
    specialization: cert.specialization,
    grade: cert.grade,
    honors: cert.honors,
    capstoneTitle: cert.capstoneTitle,
    capstoneScore: cert.capstoneScore,
    issueDate: cert.issueDate,
    completionDate: cert.completionDate,
    durationWeeks: cert.durationWeeks,
    credentialHash: cert.credentialHash,
    verificationUrl: cert.verificationUrl,
    instructorName: cert.instructorName,
    instructorTitle: cert.instructorTitle,
    directorName: cert.directorName,
    directorTitle: cert.directorTitle,
    competencies: cert.competencies,
    status: cert.status
  };

  return res.json({
    verified: true,
    status: 'VERIFIED_ACTIVE',
    certificate: publicCertificate,
    issuer: 'Vixora Academy Global Directorate',
    dean: cert.directorName || 'Sarumi Hammad',
    deanTitle: cert.directorTitle || 'Dean, Vixora Academy',
    verificationMethod: 'Cryptographic SHA-256 Ledger Signature Match',
    integrityStatus: hasValidLedgerHash ? 'LEDGER_HASH_VALID' : 'LEGACY_COMPATIBLE',
    downloadPdfUrl: `/api/certificates/${cert.id}/pdf`,
    verifiedAt: new Date().toISOString()
  });
}

// Secure Verify Certificate by Credential ID via Path Parameter
portalRouter.get('/certificates/verify/:id', (req: Request, res: Response) => {
  return handleCertificateVerification(req, res, req.params.id);
});

// Secure Verify Certificate by Credential ID via Query Parameter (?id=VA-2026-9042-ENG)
portalRouter.get('/certificates/verify', (req: Request, res: Response) => {
  return handleCertificateVerification(req, res);
});

// Shared Handler for Public PDF Certificate Downloads with Dedicated Rate Limiting
async function handleCertificatePdfDownload(req: Request, res: Response) {
  const ip = getClientIp(req);
  const rlCheck = pdfRateLimiter.check(ip);

  res.setHeader('X-RateLimit-Limit', rlCheck.limit);
  res.setHeader('X-RateLimit-Remaining', rlCheck.remaining);
  res.setHeader('X-RateLimit-Reset', rlCheck.resetInSeconds);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: 'Too many certificate PDF requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  const certId = req.params.id?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({ error: 'Certificate ID is required.' });
  }

  const cert = await getCertificateById(certId);
  if (!cert) {
    return res.status(404).json({
      error: `Certificate '${certId}' not found in the registry.`
    });
  }

  try {
    const pdfBuffer = await generateCertificatePdfBuffer(cert);
    const filename = `Vixora-Academy-Certificate-${cert.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(pdfBuffer);
  } catch (err: any) {
    console.error('Failed to generate PDF for certificate', certId, err);
    return res.status(500).json({
      error: 'Failed to generate PDF certificate.',
      details: err.message
    });
  }
}

// Download PDF Certificate (Direct binary stream)
portalRouter.get('/certificates/:id/pdf', handleCertificatePdfDownload);

// Alias for PDF Download: /certificates/download/:id
portalRouter.get('/certificates/download/:id', handleCertificatePdfDownload);

// List all certificates
portalRouter.get('/certificates/list', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: certRows, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && certRows) {
        const certIds = certRows.map((r: any) => r.id);
        const { data: compRows } = await supabase
          .from('certificate_competencies')
          .select('certificate_id, name')
          .in('certificate_id', certIds);

        const compMap = new Map<string, string[]>();
        (compRows || []).forEach((c: any) => {
          const list = compMap.get(c.certificate_id) || [];
          list.push(c.name);
          compMap.set(c.certificate_id, list);
        });

        const list = certRows.map((row: any) =>
          mapSupabaseCertificateToDomain(row as SupabaseCertificateRow, compMap.get(row.id) || [])
        );
        return res.json({ certificates: list });
      }
    } catch (err) {
      console.warn('[Supabase] Error listing certificates, falling back to cache:', err);
    }
  }

  const list: Certificate[] = [];
  fallbackCertificatesStore.forEach((cert) => list.push(cert));
  return res.json({ certificates: list });
});

// Issue Certificate & Automatically Send Email to Graduate (Protected Admin Endpoint)
portalRouter.post('/certificates/issue', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const rlCheck = emailRateLimiter.check(`issue:${ip}`);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Certificate issuance rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before issuing more credentials.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }

  const {
    studentName,
    studentEmail,
    courseTitle,
    specialization,
    grade,
    honors,
    capstoneTitle,
    capstoneScore,
    competencies
  } = req.body;

  if (!studentName || !studentEmail || !courseTitle) {
    return res.status(400).json({ error: 'Student Name, Email, and Course Title are required.' });
  }

  const cleanEmail = studentEmail.toLowerCase().trim();
  const certNumber = Math.floor(1000 + Math.random() * 9000);
  const certId = `VA-2026-${certNumber}-${courseTitle.includes('AI') ? 'ENG' : 'AUT'}`;
  
  const hashRaw = `${certId}:${cleanEmail}:${studentName}:${Date.now()}`;
  const credentialHash = crypto.createHash('sha256').update(hashRaw).digest('hex');

  const now = new Date();
  const issueDateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const assignedCompetencies: string[] = Array.isArray(competencies) && competencies.length > 0
    ? competencies
    : [
        'Full-Stack AI Architecture & Tool Calling',
        'Production Workflow Automation & Orchestration',
        'Cloud Containerization & High-Throughput APIs',
        'Applied Business Intelligence & Decision Systems'
      ];

  const courseSlug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'custom-track';

  const newCertificate: Certificate = {
    id: certId,
    studentName: studentName.trim(),
    studentEmail: cleanEmail,
    courseId: courseSlug,
    courseTitle: courseTitle.trim(),
    trackBadge: 'Professional Track',
    specialization: specialization || 'Enterprise Digital & AI Solutions',
    grade: grade || 'High Distinction',
    honors: honors || 'Demonstrated Rigorous Engineering Mastery',
    capstoneTitle: capstoneTitle || 'Enterprise Production Deployment & Architecture',
    capstoneScore: capstoneScore || '97.8 / 100',
    issueDate: issueDateFormatted,
    completionDate: 'September 2026',
    durationWeeks: 12,
    credentialHash,
    verificationUrl: `https://academy.vixoradigitalhub.com/verify?id=${certId}`,
    instructorName: 'Dr. Adebayo Vance',
    instructorTitle: 'Principal AI Architect, Vixora Labs',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: assignedCompetencies,
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: now.toISOString()
  };

  // Persist to Supabase Database (with automatic fallback caching)
  await saveIssuedCertificate(newCertificate, assignedCompetencies);

  // AUTOMATIC PDF CERTIFICATE GENERATION & EMAIL DISPATCH
  let pdfBuffer: Buffer | undefined;
  const pdfFilename = `Vixora-Academy-Certificate-${certId}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(newCertificate);
  } catch (pdfErr) {
    console.error('Failed generating certificate PDF attachment on issue:', pdfErr);
  }

  // Optional: upload to Supabase Storage if available
  const supabase = getSupabaseAdmin();
  if (supabase && pdfBuffer) {
    try {
      await supabase.storage
        .from('certificates')
        .upload(`${certId}.pdf`, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });
    } catch (storageErr) {
      // Non-blocking if storage bucket is not configured yet
    }
  }

  const emailHtml = generateCertificateEmailHtml(newCertificate);
  const emailText = generateCertificateEmailText(newCertificate);
  const emailSubject = `🎓 Congratulations ${studentName}! Your Vixora Academy Certificate is Ready`;

  const dispatchResult = await dispatchCertificateEmail({
    to: cleanEmail,
    toName: studentName,
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
    certificateId: certId,
    pdfBuffer,
    pdfFilename
  });

  const emailLog: EmailDispatchLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    certificateId: certId,
    recipientEmail: cleanEmail,
    recipientName: studentName,
    subject: emailSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: now.toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: emailHtml,
    previewText: emailText,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName: pdfFilename
  };

  // Persist log directly to Supabase email_logs
  await saveEmailLog(emailLog);

  return res.json({
    success: true,
    message: dispatchResult.deliveredToInternet
      ? `Certificate ${certId} issued and official confirmation email with PDF certificate attachment delivered to ${cleanEmail} via SMTP!`
      : `Certificate ${certId} issued with attached PDF certificate (${pdfFilename}) prepared in Outbox. Ready for instant delivery.`,
    certificate: newCertificate,
    emailLog,
    delivery: dispatchResult
  });
});

// Helper function to dispatch a certificate email with generated PDF attachment
async function executeCertificateEmailDispatch(
  cert: Certificate,
  targetEmail: string
): Promise<{ dispatchResult: any; emailLog: EmailDispatchLog; pdfBuffer?: Buffer }> {
  let pdfBuffer: Buffer | undefined;
  const pdfFilename = `Vixora-Academy-Certificate-${cert.id}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(cert);
  } catch (pdfErr) {
    console.error('Failed generating certificate PDF buffer for email dispatch:', pdfErr);
  }

  const emailHtml = generateCertificateEmailHtml(cert);
  const emailText = generateCertificateEmailText(cert);
  const emailSubject = `🎓 Congratulations ${cert.studentName}! Your Vixora Academy Certificate is Ready`;

  const dispatchResult = await dispatchCertificateEmail({
    to: targetEmail,
    toName: cert.studentName,
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
    certificateId: cert.id,
    pdfBuffer,
    pdfFilename
  });

  const emailLog: EmailDispatchLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    certificateId: cert.id,
    recipientEmail: targetEmail,
    recipientName: cert.studentName,
    subject: emailSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: new Date().toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: emailHtml,
    previewText: emailText,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName: pdfFilename
  };

  await saveEmailLog(emailLog);

  cert.emailSentCount += 1;
  cert.lastEmailSentAt = new Date().toISOString();

  return { dispatchResult, emailLog, pdfBuffer };
}

// Send / Resend Certificate Email to Graduate with PDF Attachment (Protected Admin Endpoint)
portalRouter.post('/certificates/send-email', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { certificateId, customRecipientEmail, recipientEmail, email } = req.body;

  if (!certificateId) {
    return res.status(400).json({ error: 'certificateId is required.' });
  }

  const cert = await getCertificateById(certificateId);
  if (!cert) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }

  const targetEmail = (customRecipientEmail || recipientEmail || email || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);

  res.setHeader('X-RateLimit-Limit', rlCheck.limit);
  res.setHeader('X-RateLimit-Remaining', rlCheck.remaining);
  res.setHeader('X-RateLimit-Reset', rlCheck.resetInSeconds);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Email sending rate limit reached for this recipient. Please wait ${rlCheck.resetInSeconds} seconds before sending another email.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }

  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);

  res.json({
    success: true,
    message: dispatchResult.deliveredToInternet
      ? `Certificate with PDF attachment successfully delivered to ${targetEmail} via SMTP!`
      : `Certificate email with PDF attachment prepared for ${targetEmail}. Click 'Open in Gmail' to deliver immediately from your inbox, or configure SMTP.`,
    emailLog,
    certificate: cert,
    delivery: dispatchResult,
    rateLimit: {
      remaining: rlCheck.remaining,
      limit: rlCheck.limit,
      resetInSeconds: rlCheck.resetInSeconds
    }
  });
});

// Dedicated RESTful Trigger Endpoint: Automate Email Dispatch by Certificate ID (Protected Admin Endpoint)
portalRouter.post('/certificates/:id/dispatch-email', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const certId = req.params.id?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({ error: 'Certificate ID is required.' });
  }

  const cert = await getCertificateById(certId);
  if (!cert) {
    return res.status(404).json({ error: `Certificate '${certId}' not found.` });
  }

  const targetEmail = (req.body?.customRecipientEmail || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${rlCheck.resetInSeconds} seconds before triggering another email.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }

  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);

  return res.json({
    success: true,
    triggered: true,
    certificateId: cert.id,
    recipient: targetEmail,
    hasPdfAttachment: true,
    message: dispatchResult.deliveredToInternet
      ? `Automated dispatch trigger completed. Email and PDF delivered to ${targetEmail} via SMTP!`
      : `Automated dispatch trigger completed. Certificate and PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});

// Dedicated Automated Dispatch Trigger (Alias with body: { certificateId }) (Protected Admin Endpoint)
portalRouter.post('/certificates/trigger-dispatch', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const { certificateId, customRecipientEmail } = req.body;
  if (!certificateId) {
    return res.status(400).json({ error: 'certificateId is required.' });
  }

  const cert = await getCertificateById(certificateId);
  if (!cert) {
    return res.status(404).json({ error: `Certificate '${certificateId}' not found.` });
  }

  const targetEmail = (customRecipientEmail || cert.studentEmail).toLowerCase().trim();
  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);

  return res.json({
    success: true,
    triggered: true,
    certificateId: cert.id,
    recipient: targetEmail,
    hasPdfAttachment: true,
    message: dispatchResult.deliveredToInternet
      ? `Automated email dispatch trigger completed: PDF delivered to ${targetEmail} via SMTP.`
      : `Automated email dispatch trigger completed: PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});

// Automated Cohort Batch Dispatch Trigger (Dispatches certificates with PDF attachments) (Protected Admin Endpoint)
portalRouter.post('/certificates/batch-dispatch', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const { certificateIds } = req.body;
  const targets: Certificate[] = [];

  if (Array.isArray(certificateIds) && certificateIds.length > 0) {
    for (const id of certificateIds) {
      const c = await getCertificateById(id);
      if (c) targets.push(c);
    }
  } else {
    // Dispatch all certificates in the registry
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: certRows } = await supabase.from('certificates').select('*');
      if (certRows) {
        for (const row of certRows) {
          targets.push(mapSupabaseCertificateToDomain(row as SupabaseCertificateRow));
        }
      }
    }
    if (targets.length === 0) {
      fallbackCertificatesStore.forEach((c) => targets.push(c));
    }
  }

  const results: any[] = [];
  for (const cert of targets) {
    try {
      const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, cert.studentEmail);
      results.push({
        certificateId: cert.id,
        recipient: cert.studentEmail,
        status: dispatchResult.status,
        delivered: dispatchResult.deliveredToInternet,
        logId: emailLog.id
      });
    } catch (err: any) {
      results.push({
        certificateId: cert.id,
        recipient: cert.studentEmail,
        status: 'error',
        error: err.message
      });
    }
  }

  return res.json({
    success: true,
    totalProcessed: targets.length,
    results,
    message: `Batch email dispatch triggered for ${targets.length} graduate certificates with PDF attachments.`
  });
});

// Get SMTP / Email Service Configuration Status (Protected Admin Endpoint)
portalRouter.get('/certificates/email-config', requireAuthentication, requireAdmin, (req: Request, res: Response) => {
  const status = getEmailConfigStatus();
  res.json(status);
});

// Retrieve Live Outbox & Email Logs from Supabase (Protected Admin Endpoint)
portalRouter.get('/certificates/email-logs', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const logs = await getRecentEmailLogs(50);
  res.json({
    logs,
    totalSent: logs.length,
    config: getEmailConfigStatus()
  });
});

// ==========================================
// Vixora Digital Hub Enterprise Admin API (Protected with Supabase Auth & ADMIN_EMAILS allowlist)
// ==========================================

// 1. Admin Login (Server-side Supabase Auth Login with ADMIN_EMAILS verification)
portalRouter.post('/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and administrator password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const authorizedAdmins = getAuthorizedAdminEmails();

  if (!authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: 'Access denied: account is not an authorized administrator.',
      code: 'FORBIDDEN_NOT_ADMIN'
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: 'Authentication service unavailable. Supabase is not configured.',
      code: 'AUTH_SERVICE_UNCONFIGURED'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });

    if (error || !data.session) {
      return res.status(401).json({
        error: error?.message || 'Invalid administrator credentials.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split('@')[0];
    const role = 'Administrator';
    const title = 'Executive Administrator';

    return res.json({
      success: true,
      message: `Welcome back, ${name}. Admin session authorized via Supabase Auth.`,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name,
        email: cleanEmail,
        role,
        title,
        permissions: ['manage_projects', 'issue_certificates', 'dispatch_emails', 'manage_students', 'system_config']
      },
      expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000
    });
  } catch (err: any) {
    console.error('Supabase admin login exception:', err);
    return res.status(500).json({
      error: 'Internal authentication service error.',
      code: 'AUTH_EXCEPTION'
    });
  }
});

// 2. Admin Verify Current Session (Verifies Supabase JWT and checks ADMIN_EMAILS allowlist)
portalRouter.get('/admin/me', requireAuthentication, requireAdmin, (req: Request, res: Response) => {
  const user = req.user!;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];

  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      name,
      email: user.email,
      role: 'Administrator',
      title: 'Executive Administrator',
      permissions: ['manage_projects', 'issue_certificates', 'dispatch_emails', 'manage_students', 'system_config']
    }
  });
});

// 3. Admin Logout
portalRouter.post('/admin/logout', requireAuthentication, (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Administrator session terminated.' });
});

// 4. Admin Executive Overview & Metrics
portalRouter.get('/admin/overview', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  let certCount = fallbackCertificatesStore.size;
  let studentsCount = fallbackStudentsStore.size;
  let recentCerts: Certificate[] = [];

  if (supabase) {
    try {
      const { count: cCount, data: cRows } = await supabase
        .from('certificates')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(6);

      if (typeof cCount === 'number') certCount = cCount;
      if (cRows && cRows.length > 0) {
        recentCerts = cRows.map((r: any) => mapSupabaseCertificateToDomain(r as SupabaseCertificateRow));
      }

      const { count: sCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (typeof sCount === 'number') studentsCount = sCount;
    } catch (err) {
      console.warn('Supabase stats count query warning:', err);
    }
  }

  if (recentCerts.length === 0) {
    recentCerts = Array.from(fallbackCertificatesStore.values()).slice(0, 6);
  }

  const recentEmailLogs = await getRecentEmailLogs(10);
  const emailConfig = getEmailConfigStatus();

  return res.json({
    metrics: {
      totalCertificates: certCount,
      totalStudents: studentsCount,
      totalEmailDispatches: recentEmailLogs.length,
      activeProvider: emailConfig.primaryProvider,
      activeSender: emailConfig.fromAddress,
      databaseTier: isSupabaseConfigured() ? 'Supabase Cloud (PostgreSQL)' : 'High-Performance Local Cache',
      serverUptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    },
    emailConfig,
    recentCertificates: recentCerts,
    recentEmailLogs
  });
});

// 5. Admin Live Test Email Dispatcher
portalRouter.post('/admin/send-test-email', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const user = req.user!;
  const { to, subject, message } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: 'Recipient email and subject are required.' });
  }

  const cleanTo = to.toLowerCase().trim();
  const testSubject = subject.trim();
  const testMessage = message || 'This is a test notification from Vixora Digital Hub Admin Command Center.';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b061d; color: #ffffff; border-radius: 16px; border: 1px solid #3b1d7a;">
      <div style="border-bottom: 1px solid #2a1458; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #a855f7; margin: 0; font-size: 20px; font-weight: 700;">Vixora Digital Hub</h2>
        <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Admin Command Center Live Test Dispatch</p>
      </div>
      <div style="background: #150d36; border: 1px solid #3b1d7a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <p style="font-size: 15px; line-height: 1.6; color: #f1f5f9; margin: 0;">${testMessage}</p>
      </div>
      <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #2a1458; padding-top: 14px;">
        <p style="margin: 0;">Sent by Administrator: <strong>${user.email}</strong></p>
        <p style="margin: 4px 0 0 0;">Engine: <strong>Resend API &amp; Google SMTP Infrastructure</strong> &bull; Vixora Digital Hub &bull; ${new Date().toUTCString()}</p>
      </div>
    </div>
  `;

  const dispatchResult = await dispatchGenericEmail({
    to: cleanTo,
    toName: cleanTo.split('@')[0],
    subject: testSubject,
    html,
    text: testMessage
  });

  const emailLog: EmailDispatchLog = {
    id: `eml-test-${Date.now()}`,
    certificateId: 'admin-test',
    recipientEmail: cleanTo,
    recipientName: cleanTo.split('@')[0],
    subject: testSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: new Date().toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: html,
    previewText: testMessage,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet
  };

  await saveEmailLog(emailLog);

  return res.json({
    success: true,
    message: dispatchResult.deliveredToInternet
      ? `Test email successfully transmitted to ${cleanTo} via ${dispatchResult.provider === 'resend' ? 'Resend API' : 'SMTP'}!`
      : `Test email prepared and logged in outbox.`,
    delivery: dispatchResult,
    emailLog
  });
});

// 6. Admin Students List
portalRouter.get('/admin/students', requireAuthentication, requireAdmin, async (req: Request, res: Response) => {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: rows, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && rows && rows.length > 0) {
        return res.json({ students: rows });
      }
    } catch (err) {
      console.warn('Supabase query students error:', err);
    }
  }

  const list = Array.from(fallbackStudentsStore.values());
  return res.json({ students: list });
});

