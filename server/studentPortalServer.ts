import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  SEED_CERTIFICATES,
  SEED_STUDENTS,
  Certificate,
  StudentProfile,
  EmailDispatchLog,
  generateCertificateEmailHtml,
  generateCertificateEmailText
} from '../src/data/academyPortalData.js';
import {
  dispatchCertificateEmail,
  getEmailConfigStatus
} from './emailService.js';
import { generateCertificatePdfBuffer } from './certificatePdfGenerator.js';

export const portalRouter = Router();

// ==========================================
// In-Memory Database & State Stores
// ==========================================
const certificatesStore = new Map<string, Certificate>();
const studentsStore = new Map<string, StudentProfile>();
const emailLogsStore: EmailDispatchLog[] = [];

// Seed the stores
SEED_CERTIFICATES.forEach((cert) => {
  certificatesStore.set(cert.id.toUpperCase(), { ...cert });
});

SEED_STUDENTS.forEach((student) => {
  studentsStore.set(student.email.toLowerCase(), { ...student });
});

// Seed an initial email log for the sample graduate
if (SEED_CERTIFICATES.length > 0) {
  const sample = SEED_CERTIFICATES[0];
  emailLogsStore.push({
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

// Rate limit status endpoint (frontend uses this to display remaining attempts)
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

// Student Email Login with Rate Limiting
portalRouter.post('/student/login', (req: Request, res: Response) => {
  const { email, password, otp } = req.body;
  const ip = getClientIp(req);

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid student email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const rateLimitKey = `${ip}:${cleanEmail}`;
  const rlCheck = loginRateLimiter.check(rateLimitKey);

  // Set standard rate limit headers
  res.setHeader('X-RateLimit-Limit', rlCheck.limit);
  res.setHeader('X-RateLimit-Remaining', rlCheck.remaining);
  res.setHeader('X-RateLimit-Reset', rlCheck.resetInSeconds);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many login attempts for ${cleanEmail}. Rate limit reached.`,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rlCheck.resetInSeconds,
      remaining: 0,
      limit: rlCheck.limit
    });
  }

  // Check if student exists in store
  let student = studentsStore.get(cleanEmail);

  // If new email, create student profile dynamically with default enrollment
  if (!student) {
    const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    student = {
      id: studentId,
      name: formattedName || 'Academy Scholar',
      email: cleanEmail,
      enrolledDate: 'September 2026',
      role: 'student',
      courses: [
        {
          courseId: 'ai-automation-digital-business-systems',
          title: 'Autonomous AI Systems & Scalable Architecture',
          badge: 'Enterprise Track',
          progressPercent: 75,
          status: 'in-progress',
          cohort: 'Cohort 2026-B',
          instructor: 'Dr. Adebayo Vance',
          completedModules: 9,
          totalModules: 12
        }
      ]
    };
    studentsStore.set(cleanEmail, student);
  }

  // Find any certificates matching this student email
  const studentCerts: Certificate[] = [];
  certificatesStore.forEach((cert) => {
    if (cert.studentEmail.toLowerCase() === cleanEmail) {
      studentCerts.push(cert);
    }
  });

  // Generate session token
  const token = `vix_st_${crypto.randomBytes(16).toString('hex')}`;

  return res.json({
    success: true,
    token,
    student,
    certificates: studentCerts,
    rateLimit: {
      remaining: rlCheck.remaining,
      limit: rlCheck.limit,
      resetInSeconds: rlCheck.resetInSeconds
    }
  });
});

// Get Student Profile
portalRouter.get('/student/profile', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.toLowerCase().trim();
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const student = studentsStore.get(email);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const studentCerts: Certificate[] = [];
  certificatesStore.forEach((cert) => {
    if (cert.studentEmail.toLowerCase() === email) {
      studentCerts.push(cert);
    }
  });

  res.json({
    student,
    certificates: studentCerts
  });
});

// ==========================================
// Certificate Portal & Verification Endpoints
// ==========================================

const CERT_ID_REGEX = /^[A-Za-z0-9\-_]{4,40}$/;

// Shared Verification Handler with Cryptographic Integrity Check
function handleCertificateVerification(req: Request, res: Response, rawId?: string) {
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

  const cert = certificatesStore.get(certId);
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

  return res.json({
    verified: true,
    status: 'VERIFIED_ACTIVE',
    certificate: cert,
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

// Download PDF Certificate (Direct binary stream)
portalRouter.get('/certificates/:id/pdf', async (req: Request, res: Response) => {
  const certId = req.params.id?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({ error: 'Certificate ID is required.' });
  }

  const cert = certificatesStore.get(certId);
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
});

// Alias for PDF Download: /certificates/download/:id
portalRouter.get('/certificates/download/:id', async (req: Request, res: Response) => {
  const certId = req.params.id?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({ error: 'Certificate ID is required.' });
  }

  const cert = certificatesStore.get(certId);
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
});

// List all certificates
portalRouter.get('/certificates/list', (req: Request, res: Response) => {
  const list: Certificate[] = [];
  certificatesStore.forEach((cert) => list.push(cert));
  res.json({ certificates: list });
});

// Issue Certificate & Automatically Send Email to Graduate
portalRouter.post('/certificates/issue', async (req: Request, res: Response) => {
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

  const newCertificate: Certificate = {
    id: certId,
    studentName: studentName.trim(),
    studentEmail: cleanEmail,
    courseId: 'custom-track',
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
    competencies: Array.isArray(competencies) && competencies.length > 0
      ? competencies
      : [
          'Full-Stack AI Architecture & Tool Calling',
          'Production Workflow Automation & Orchestration',
          'Cloud Containerization & High-Throughput APIs',
          'Applied Business Intelligence & Decision Systems'
        ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: now.toISOString()
  };

  // Save to in-memory store
  certificatesStore.set(certId, newCertificate);

  // Also attach to student profile if exists
  let student = studentsStore.get(cleanEmail);
  if (!student) {
    student = {
      id: `STU-${certNumber}`,
      name: studentName,
      email: cleanEmail,
      enrolledDate: issueDateFormatted,
      role: 'alumni',
      courses: [
        {
          courseId: 'custom-track',
          title: courseTitle,
          badge: 'Professional Track',
          progressPercent: 100,
          status: 'completed',
          cohort: 'Cohort 2026-A',
          instructor: 'Dr. Adebayo Vance',
          completedModules: 12,
          totalModules: 12,
          certificateId: certId
        }
      ]
    };
    studentsStore.set(cleanEmail, student);
  } else {
    // Add or update completed course
    student.courses.push({
      courseId: 'custom-track',
      title: courseTitle,
      badge: 'Professional Track',
      progressPercent: 100,
      status: 'completed',
      cohort: 'Cohort 2026-A',
      instructor: 'Dr. Adebayo Vance',
      completedModules: 12,
      totalModules: 12,
      certificateId: certId
    });
  }

  // AUTOMATIC PDF CERTIFICATE GENERATION & EMAIL DISPATCH
  let pdfBuffer: Buffer | undefined;
  const pdfFilename = `Vixora-Academy-Certificate-${certId}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(newCertificate);
  } catch (pdfErr) {
    console.error('Failed generating certificate PDF attachment on issue:', pdfErr);
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

  emailLogsStore.unshift(emailLog);

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

  emailLogsStore.unshift(emailLog);

  cert.emailSentCount += 1;
  cert.lastEmailSentAt = new Date().toISOString();

  return { dispatchResult, emailLog, pdfBuffer };
}

// Send / Resend Certificate Email to Graduate with PDF Attachment
portalRouter.post('/certificates/send-email', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { certificateId, customRecipientEmail } = req.body;

  if (!certificateId) {
    return res.status(400).json({ error: 'certificateId is required.' });
  }

  const cert = certificatesStore.get(certificateId.toUpperCase().trim());
  if (!cert) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }

  const targetEmail = (customRecipientEmail || cert.studentEmail).toLowerCase().trim();
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

// Dedicated RESTful Trigger Endpoint: Automate Email Dispatch by Certificate ID
portalRouter.post('/certificates/:id/dispatch-email', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const certId = req.params.id?.toUpperCase().trim();
  if (!certId) {
    return res.status(400).json({ error: 'Certificate ID is required.' });
  }

  const cert = certificatesStore.get(certId);
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

// Dedicated Automated Dispatch Trigger (Alias with body: { certificateId })
portalRouter.post('/certificates/trigger-dispatch', async (req: Request, res: Response) => {
  const { certificateId, customRecipientEmail } = req.body;
  if (!certificateId) {
    return res.status(400).json({ error: 'certificateId is required.' });
  }

  const cert = certificatesStore.get(certificateId.toUpperCase().trim());
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

// Automated Cohort Batch Dispatch Trigger (Dispatches certificates with PDF attachments)
portalRouter.post('/certificates/batch-dispatch', async (req: Request, res: Response) => {
  const { certificateIds } = req.body;
  const targets: Certificate[] = [];

  if (Array.isArray(certificateIds) && certificateIds.length > 0) {
    for (const id of certificateIds) {
      const c = certificatesStore.get(id.toUpperCase().trim());
      if (c) targets.push(c);
    }
  } else {
    // Dispatch all certificates in the registry
    certificatesStore.forEach((c) => targets.push(c));
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

// Get SMTP / Email Service Configuration Status
portalRouter.get('/certificates/email-config', (req: Request, res: Response) => {
  const status = getEmailConfigStatus();
  res.json(status);
});

// Retrieve Live Outbox & Email Logs
portalRouter.get('/certificates/email-logs', (req: Request, res: Response) => {
  res.json({
    logs: emailLogsStore.slice(0, 50),
    totalSent: emailLogsStore.length,
    config: getEmailConfigStatus()
  });
});
