export interface CertificateCompetency {
  name: string;
  category: string;
}

export interface Certificate {
  id: string; // e.g. "VA-2026-9042-ENG"
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  trackBadge: string;
  specialization: string;
  grade: string;
  honors?: string;
  capstoneTitle: string;
  capstoneScore: string;
  issueDate: string; // e.g. "September 11, 2026"
  completionDate: string;
  durationWeeks: number;
  credentialHash: string; // e.g. "SHA256: 8f9b2...41a"
  verificationUrl: string;
  instructorName: string;
  instructorTitle: string;
  directorName: string;
  directorTitle: string;
  competencies: string[];
  status: 'active' | 'revoked';
  emailSentCount: number;
  lastEmailSentAt?: string;
}

export interface StudentCourse {
  courseId: string;
  title: string;
  badge: string;
  progressPercent: number;
  status: 'in-progress' | 'completed' | 'enrolled';
  cohort: string;
  instructor: string;
  completedModules: number;
  totalModules: number;
  certificateId?: string;
}

export interface StudentProfile {
  id: string; // e.g. "STU-8841"
  name: string;
  email: string;
  avatarUrl?: string;
  enrolledDate: string;
  role: 'student' | 'alumni' | 'instructor' | 'admin';
  courses: StudentCourse[];
}

export interface EmailDispatchLog {
  id: string;
  certificateId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: 'delivered' | 'queued' | 'failed' | 'simulated';
  provider?: 'smtp' | 'resend' | 'simulated';
  timestamp: string;
  deliveryLatencyMs: number;
  previewHtml: string;
  previewText?: string;
  messageId?: string;
  error?: string;
  gmailComposeUrl?: string;
  mailtoUrl?: string;
  infoNotice?: string;
  deliveredToInternet?: boolean;
}

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetInSeconds: number;
  isLimited: boolean;
}

// Initial Mock Registry of Certified Graduates
export const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'VA-2026-9042-ENG',
    studentName: 'David A. Okonjo',
    studentEmail: 'student@vixora.com',
    courseId: 'ai-automation-digital-business-systems',
    courseTitle: 'Autonomous AI Systems & Scalable Architecture',
    trackBadge: 'Enterprise Track',
    specialization: 'Multi-Agent LLM Pipelines & Cloud Orchestration',
    grade: 'High Distinction',
    honors: 'Top 3% of Global Cohort',
    capstoneTitle: 'Self-Healing Enterprise Support & Document Intelligence Swarm',
    capstoneScore: '98.5 / 100',
    issueDate: 'September 11, 2026',
    completionDate: 'September 2026',
    durationWeeks: 12,
    credentialHash: 'e9b48c310fa27d50bc12948ff8a1762c9082d41ba358b3c99026e7fa40d21a91',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-9042-ENG',
    instructorName: 'Dr. Adebayo Vance',
    instructorTitle: 'Principal AI Architect, Vixora Labs',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'Multi-Agent System Orchestration (LangChain / Gemini)',
      'Deterministic Enterprise Tool Calling & Function Execution',
      'Scalable Containerized Cloud Architecture (Cloud Run & Docker)',
      'Vector Embeddings, RAG & Semantic Context Caching',
      'Production API Hardening & Token Latency Optimization'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-09-11T12:00:00Z'
  },
  {
    id: 'VA-2026-8812-AUT',
    studentName: 'Alex K. Chen',
    studentEmail: 'alex.chen@vixora.com',
    courseId: 'data-analysis-cohort',
    courseTitle: 'Data Analytics & Business Intelligence Mastery',
    trackBadge: 'Analytics Track',
    specialization: 'Advanced SQL, Automated ETL & Predictive Dashboards',
    grade: 'Distinction',
    honors: 'Excellence in Production Data Modeling',
    capstoneTitle: 'Predictive Multi-Tenant Revenue Forecasting & Churn Diagnostics',
    capstoneScore: '96.2 / 100',
    issueDate: 'August 28, 2026',
    completionDate: 'August 2026',
    durationWeeks: 16,
    credentialHash: '4a7b92c10ef18d40ba22849ef9b2671a8073e52bb467a2b88137f6ec51c32b82',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-8812-AUT',
    instructorName: 'Marcus Sterling',
    instructorTitle: 'Head of Data Systems, Vixora Analytics',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'High-Scale Relational Data Schemas & Indexing (PostgreSQL)',
      'Dynamic Automated ETL Pipelines with Airflow & Python',
      'Executive KPI Dashboards & Real-Time Aggregations',
      'Statistical Cohort Analysis & Retention Modeling'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-08-28T15:30:00Z'
  },
  {
    id: 'VA-2026-7731-DEV',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.j@vixora.com',
    courseId: 'complete-ai-digital-skills-freelancing-mastery',
    courseTitle: 'AI Digital Skills & Freelance Agency Systems',
    trackBadge: 'Practitioner Track',
    specialization: 'Autonomous Client Workflows, Copywriting & Media Automation',
    grade: 'Certified Professional',
    honors: 'Rapid Client Implementation Award',
    capstoneTitle: 'Automated Real Estate Lead Qualification & Video Prospecting Pipeline',
    capstoneScore: '94.0 / 100',
    issueDate: 'August 14, 2026',
    completionDate: 'August 2026',
    durationWeeks: 6,
    credentialHash: '3c8e11b29fa07d30ab11738ef8a1560c7061d30ba246b1a77015e5db40b11a71',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-7731-DEV',
    instructorName: 'Elena Rostova',
    instructorTitle: 'Lead Growth & Automation Strategist',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'Prompt Engineering & Multi-Modal Content Generation',
      'Zapier, Make & n8n Enterprise Workflow Automation',
      'Client Discovery, Contract Scoping & Retainer Architecture',
      'High-Conversion Landing Page & Sales Funnel Optimization'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-08-14T10:15:00Z'
  }
];

// Seed Student Profiles
export const SEED_STUDENTS: StudentProfile[] = [
  {
    id: 'STU-9042',
    name: 'David A. Okonjo',
    email: 'student@vixora.com',
    enrolledDate: 'June 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'ai-automation-digital-business-systems',
        title: 'Autonomous AI Systems & Scalable Architecture',
        badge: 'Enterprise Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-A',
        instructor: 'Dr. Adebayo Vance',
        completedModules: 12,
        totalModules: 12,
        certificateId: 'VA-2026-9042-ENG'
      },
      {
        courseId: 'data-analysis-cohort',
        title: 'Data Analytics & Business Intelligence Mastery',
        badge: 'Analytics Track',
        progressPercent: 45,
        status: 'in-progress',
        cohort: 'Cohort 2026-B',
        instructor: 'Marcus Sterling',
        completedModules: 7,
        totalModules: 16
      }
    ]
  },
  {
    id: 'STU-8812',
    name: 'Alex K. Chen',
    email: 'alex.chen@vixora.com',
    enrolledDate: 'May 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'data-analysis-cohort',
        title: 'Data Analytics & Business Intelligence Mastery',
        badge: 'Analytics Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-A',
        instructor: 'Marcus Sterling',
        completedModules: 16,
        totalModules: 16,
        certificateId: 'VA-2026-8812-AUT'
      }
    ]
  },
  {
    id: 'STU-7731',
    name: 'Sarah Jenkins',
    email: 'sarah.j@vixora.com',
    enrolledDate: 'July 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'complete-ai-digital-skills-freelancing-mastery',
        title: 'AI Digital Skills & Freelance Agency Systems',
        badge: 'Practitioner Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-Summer',
        instructor: 'Elena Rostova',
        completedModules: 6,
        totalModules: 6,
        certificateId: 'VA-2026-7731-DEV'
      }
    ]
  }
];

// Generates an automated email HTML document with the Vixora Academy logo
export function generateCertificateEmailHtml(cert: Certificate): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations on your Vixora Academy Certification!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000048;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7FC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5F0; box-shadow: 0 10px 35px rgba(0, 0, 72, 0.08); overflow: hidden;">
          
          <!-- Top Header Brand Ribbon -->
          <tr>
            <td style="background: linear-gradient(135deg, #000048 0%, #480878 55%, #9030F8 100%); padding: 36px 30px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <!-- Vixora Academy Logo Badge -->
                    <div style="background-color: #FFFFFF; padding: 12px 24px; border-radius: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(0,0,0,0.2);">
                      <img src="https://academy.vixoradigitalhub.com/images/vixora-academy-logo.jpg" alt="Vixora Academy — Learn. Apply. Earn." style="height: 64px; width: auto; max-width: 240px; display: block; border-radius: 8px;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; margin-top: 8px;">VIXORA ACADEMY</div>
                    <div style="color: #E0C7FF; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Learn. Apply. Earn.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Congratulatory Headline -->
          <tr>
            <td style="padding: 36px 34px 16px 34px;">
              <div style="display: inline-block; background-color: #F0E8FF; border: 1px solid #C7A0FF; color: #480878; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
                Official Credential Issued
              </div>
              <h1 style="color: #000048; font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 14px 0;">
                Congratulations, ${cert.studentName}! 🎓
              </h1>
              <p style="color: #5F6078; font-size: 15px; line-height: 1.65; margin: 0 0 20px 0;">
                The Academic Directorate of <strong>Vixora Academy</strong> under the leadership of Dean <strong>Sarumi Hammad</strong> is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:
              </p>
              <div style="background-color: #F7F7FC; border-left: 4px solid #7000F8; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px;">
                <div style="color: #480878; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Program Track</div>
                <div style="color: #000048; font-size: 18px; font-weight: 800; margin-top: 2px;">${cert.courseTitle}</div>
                <div style="color: #5F6078; font-size: 13px; margin-top: 4px;">Honors Standing: <span style="color: #7000F8; font-weight: 700;">${cert.grade}</span></div>
              </div>
            </td>
          </tr>

          <!-- Certificate Metadata Card -->
          <tr>
            <td style="padding: 0 34px 24px 34px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid #E5E5F0; border-radius: 14px; padding: 18px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Certificate Credential ID:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #000048;">${cert.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Academic Dean:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #000048;">Sarumi Hammad (Dean, Vixora Academy)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Issue Date:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #000048;">${cert.issueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Capstone Project:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #000048; max-width: 250px;">${cert.capstoneTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Verification Status:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #059669;">✓ Verified & Active</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Call to Action Button -->
          <tr>
            <td style="padding: 0 34px 30px 34px; text-align: center;">
              <a href="${cert.verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #000048 0%, #480878 60%, #7000F8 100%); color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 700; padding: 16px 36px; border-radius: 12px; box-shadow: 0 8px 20px rgba(72, 8, 120, 0.28);">
                View & Download Official Certificate &rarr;
              </a>
              <div style="margin-top: 14px; font-size: 12px; color: #5F6078;">
                Your certificate is permanently anchored at: <br/>
                <a href="${cert.verificationUrl}" style="color: #7000F8; text-decoration: underline;">${cert.verificationUrl}</a>
              </div>
            </td>
          </tr>

          <!-- Competencies Preview -->
          <tr>
            <td style="padding: 20px 34px; background-color: #F7F7FC; border-top: 1px solid #E5E5F0;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #000048; letter-spacing: 0.5px; margin-bottom: 10px;">
                Verified Competencies Achieved:
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #5F6078; line-height: 1.6;">
                ${cert.competencies.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 34px; text-align: center; font-size: 11px; color: #5F6078; border-top: 1px solid #E5E5F0;">
              <p style="margin: 0 0 6px 0;">
                <strong>Vixora Academy</strong> • Silicon Corridor & Cloud Innovation Center
              </p>
              <p style="margin: 0 0 6px 0; color: #480878; font-weight: 600;">
                Academic Leadership: Dean Sarumi Hammad
              </p>
              <p style="margin: 0 0 6px 0;">
                Official Subdomain: <a href="https://academy.vixoradigitalhub.com" style="color: #480878; text-decoration: none;">academy.vixoradigitalhub.com</a> • Main Hub: <a href="https://vixoradigitalhub.com" style="color: #480878; text-decoration: none;">vixoradigitalhub.com</a>
              </p>
              <p style="margin: 0; color: #A0A0B8;">
                This automated certificate email was generated upon graduation. Rate-limiting and cryptographic integrity verified.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Generates a clean plain-text email message for mailto and Gmail compose
export function generateCertificateEmailText(cert: Certificate): string {
  return `VIXORA ACADEMY - OFFICIAL CERTIFICATE OF COMPLETION

Dear ${cert.studentName},

Congratulations! The Academic Directorate of Vixora Academy is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:

PROGRAM TRACK: ${cert.courseTitle}
HONORS / STANDING: ${cert.grade} (${cert.honors || 'Distinction'})
CAPSTONE PROJECT: ${cert.capstoneTitle}
CAPSTONE SCORE: ${cert.capstoneScore}

CREDENTIAL DETAILS:
- Certificate ID: ${cert.id}
- Issue Date: ${cert.issueDate}
- Verification Status: ACTIVE & CRYPTOGRAPHICALLY VERIFIED
- SHA-256 Hash: ${cert.credentialHash}

ACADEMIC LEADERSHIP & DEAN:
- Dean Sarumi Hammad (${cert.directorTitle})
- ${cert.instructorName} (${cert.instructorTitle})

KEY COMPETENCIES EARNED:
${cert.competencies.map(c => `• ${c}`).join('\n')}

OFFICIAL VERIFICATION LINK:
${cert.verificationUrl}

You can view, download, and print your high-resolution diploma at the link above.

Warm regards,
Academic Directorate & Certification Board
Vixora Academy | Silicon Corridor
academy.vixoradigitalhub.com
vixoradigitalhub.com
`;
}

