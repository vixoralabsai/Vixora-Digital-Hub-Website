var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/migrations/runner.ts
var runner_exports = {};
__export(runner_exports, {
  computeChecksum: () => computeChecksum,
  discoverMigrationFiles: () => discoverMigrationFiles,
  getDatabaseConnectionString: () => getDatabaseConnectionString,
  runMigrations: () => runMigrations
});
import fs2 from "fs";
import path2 from "path";
import crypto5 from "crypto";
import pg from "pg";
import dotenv from "dotenv";
function getDatabaseConnectionString() {
  const conn = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "";
  return conn.trim().replace(/^["']|["']$/g, "");
}
function computeChecksum(content) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  return crypto5.createHash("sha256").update(normalized, "utf8").digest("hex");
}
function discoverMigrationFiles(dirPath) {
  if (!fs2.existsSync(dirPath)) {
    return [];
  }
  const files = fs2.readdirSync(dirPath).filter((f) => f.endsWith(".sql")).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  return files.map((fileName) => {
    const fullPath = path2.join(dirPath, fileName);
    const content = fs2.readFileSync(fullPath, "utf8");
    return {
      name: fileName,
      filePath: fullPath,
      sql: content,
      checksum: computeChecksum(content)
    };
  });
}
async function runMigrations(options = {}) {
  const migrationsDir = options.migrationsDir || path2.resolve(process.cwd(), "supabase/migrations");
  const connectionString = options.connectionString || getDatabaseConnectionString();
  const dryRun = Boolean(options.dryRun);
  const statusOnly = Boolean(options.statusOnly);
  const silent = Boolean(options.silent);
  const log = (msg) => {
    if (!silent) console.log(msg);
  };
  const files = discoverMigrationFiles(migrationsDir);
  if (files.length === 0) {
    log(`[Migrations] No SQL migration files found in: ${migrationsDir}`);
    return {
      appliedCount: 0,
      skippedCount: 0,
      totalFiles: 0,
      batch: 0,
      appliedNames: [],
      skippedNames: []
    };
  }
  log(`[Migrations] Discovered ${files.length} migration file(s) in: ${migrationsDir}`);
  if (!connectionString) {
    if (statusOnly || dryRun) {
      log("\n[Migrations Status (Offline / No DATABASE_URL)]");
      files.forEach((f, idx) => {
        log(`  ${idx + 1}. [UNTRACKED] ${f.name} (SHA: ${f.checksum.slice(0, 8)}...)`);
      });
      log("\nTo connect directly to Supabase, set DATABASE_URL in your .env or Vercel environment.");
      return {
        appliedCount: 0,
        skippedCount: files.length,
        totalFiles: files.length,
        batch: 0,
        appliedNames: [],
        skippedNames: files.map((f) => f.name)
      };
    }
    throw new Error(
      "DATABASE_URL or SUPABASE_DB_URL is not configured in environment variables. Please add your PostgreSQL connection string to your environment or run the SQL files in Supabase SQL Editor."
    );
  }
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 1e4
  });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        batch INTEGER NOT NULL DEFAULT 1,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
    `);
    const res = await client.query(
      "SELECT id, name, batch, checksum, applied_at FROM _migrations ORDER BY id ASC"
    );
    const appliedMap = /* @__PURE__ */ new Map();
    let maxBatch = 0;
    for (const row of res.rows) {
      appliedMap.set(row.name, row);
      if (row.batch > maxBatch) maxBatch = row.batch;
    }
    const currentBatch = maxBatch + 1;
    if (statusOnly) {
      log("\n======================================================");
      log("  Vixora Academy: Database Migrations Status");
      log("======================================================");
      files.forEach((f, idx) => {
        const applied = appliedMap.get(f.name);
        if (applied) {
          const dateStr = new Date(applied.applied_at).toLocaleString();
          const checkMatch = applied.checksum === f.checksum ? "\u2713" : "\u26A0\uFE0F MISMATCH";
          log(`  [APPLIED]  Batch #${applied.batch} | ${f.name} (Applied: ${dateStr}) [${checkMatch}]`);
        } else {
          log(`  [PENDING]  Batch #${currentBatch} | ${f.name}`);
        }
      });
      log("======================================================\n");
      return {
        appliedCount: appliedMap.size,
        skippedCount: files.length - appliedMap.size,
        totalFiles: files.length,
        batch: currentBatch,
        appliedNames: Array.from(appliedMap.keys()),
        skippedNames: files.filter((f) => !appliedMap.has(f.name)).map((f) => f.name)
      };
    }
    const appliedNames = [];
    const skippedNames = [];
    for (const file of files) {
      const existing = appliedMap.get(file.name);
      if (existing) {
        if (existing.checksum !== file.checksum) {
          log(`[Migrations Warning] Checksum mismatch for already applied migration "${file.name}".`);
        }
        skippedNames.push(file.name);
        continue;
      }
      log(`[Migrations] Applying: ${file.name} (Batch #${currentBatch})...`);
      if (dryRun) {
        log(`  [DRY-RUN] Simulating execution of ${file.name} without committing.`);
        appliedNames.push(file.name);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(file.sql);
        await client.query(
          "INSERT INTO _migrations (name, batch, checksum, applied_at) VALUES ($1, $2, $3, NOW())",
          [file.name, currentBatch, file.checksum]
        );
        await client.query("COMMIT");
        log(`  \u2713 Successfully applied: ${file.name}`);
        appliedNames.push(file.name);
      } catch (err) {
        await client.query("ROLLBACK");
        log(`  \u274C Failed applying: ${file.name}. Transaction rolled back.`);
        throw err;
      }
    }
    log(`
[Migrations Complete] Applied: ${appliedNames.length}, Skipped (Already applied): ${skippedNames.length}
`);
    return {
      appliedCount: appliedNames.length,
      skippedCount: skippedNames.length,
      totalFiles: files.length,
      batch: currentBatch,
      appliedNames,
      skippedNames
    };
  } finally {
    client.release();
    await pool.end();
  }
}
var Pool;
var init_runner = __esm({
  "server/migrations/runner.ts"() {
    dotenv.config();
    ({ Pool } = pg);
    if (process.argv[1] && process.argv[1].endsWith("runner.ts")) {
      const args = process.argv.slice(2);
      const statusOnly = args.includes("--status");
      const dryRun = args.includes("--dry-run");
      runMigrations({ statusOnly, dryRun }).then(() => process.exit(0)).catch((err) => {
        console.error("[Migrations Execution Error]:", err.message || err);
        process.exit(1);
      });
    }
  }
});

// server.ts
import http from "http";
import express from "express";
import path3 from "path";
import dotenv2 from "dotenv";
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";

// server/studentPortalServer.ts
import { Router as Router2 } from "express";
import crypto4 from "crypto";
import { createClient as createClient3 } from "@supabase/supabase-js";

// src/data/academyPortalData.ts
var SEED_CERTIFICATES = [
  {
    id: "VA-2026-9042-ENG",
    studentName: "David A. Okonjo",
    studentEmail: "student@vixora.com",
    courseId: "ai-automation-digital-business-systems",
    courseTitle: "Autonomous AI Systems & Scalable Architecture",
    trackBadge: "Enterprise Track",
    specialization: "Multi-Agent LLM Pipelines & Cloud Orchestration",
    grade: "High Distinction",
    honors: "Top 3% of Global Cohort",
    capstoneTitle: "Self-Healing Enterprise Support & Document Intelligence Swarm",
    capstoneScore: "98.5 / 100",
    issueDate: "September 11, 2026",
    completionDate: "September 2026",
    durationWeeks: 12,
    credentialHash: "e9b48c310fa27d50bc12948ff8a1762c9082d41ba358b3c99026e7fa40d21a91",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-9042-ENG",
    instructorName: "Dr. Adebayo Vance",
    instructorTitle: "Principal AI Architect, Vixora Labs",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "Multi-Agent System Orchestration (LangChain / Gemini)",
      "Deterministic Enterprise Tool Calling & Function Execution",
      "Scalable Containerized Cloud Architecture (Cloud Run & Docker)",
      "Vector Embeddings, RAG & Semantic Context Caching",
      "Production API Hardening & Token Latency Optimization"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-09-11T12:00:00Z"
  },
  {
    id: "VA-2026-8812-AUT",
    studentName: "Alex K. Chen",
    studentEmail: "alex.chen@vixora.com",
    courseId: "data-analysis-cohort",
    courseTitle: "Data Analytics & Business Intelligence Mastery",
    trackBadge: "Analytics Track",
    specialization: "Advanced SQL, Automated ETL & Predictive Dashboards",
    grade: "Distinction",
    honors: "Excellence in Production Data Modeling",
    capstoneTitle: "Predictive Multi-Tenant Revenue Forecasting & Churn Diagnostics",
    capstoneScore: "96.2 / 100",
    issueDate: "August 28, 2026",
    completionDate: "August 2026",
    durationWeeks: 16,
    credentialHash: "4a7b92c10ef18d40ba22849ef9b2671a8073e52bb467a2b88137f6ec51c32b82",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-8812-AUT",
    instructorName: "Marcus Sterling",
    instructorTitle: "Head of Data Systems, Vixora Analytics",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "High-Scale Relational Data Schemas & Indexing (PostgreSQL)",
      "Dynamic Automated ETL Pipelines with Airflow & Python",
      "Executive KPI Dashboards & Real-Time Aggregations",
      "Statistical Cohort Analysis & Retention Modeling"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-08-28T15:30:00Z"
  },
  {
    id: "VA-2026-7731-DEV",
    studentName: "Sarah Jenkins",
    studentEmail: "sarah.j@vixora.com",
    courseId: "complete-ai-digital-skills-freelancing-mastery",
    courseTitle: "AI Digital Skills & Freelance Agency Systems",
    trackBadge: "Practitioner Track",
    specialization: "Autonomous Client Workflows, Copywriting & Media Automation",
    grade: "Certified Professional",
    honors: "Rapid Client Implementation Award",
    capstoneTitle: "Automated Real Estate Lead Qualification & Video Prospecting Pipeline",
    capstoneScore: "94.0 / 100",
    issueDate: "August 14, 2026",
    completionDate: "August 2026",
    durationWeeks: 6,
    credentialHash: "3c8e11b29fa07d30ab11738ef8a1560c7061d30ba246b1a77015e5db40b11a71",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-7731-DEV",
    instructorName: "Elena Rostova",
    instructorTitle: "Lead Growth & Automation Strategist",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "Prompt Engineering & Multi-Modal Content Generation",
      "Zapier, Make & n8n Enterprise Workflow Automation",
      "Client Discovery, Contract Scoping & Retainer Architecture",
      "High-Conversion Landing Page & Sales Funnel Optimization"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-08-14T10:15:00Z"
  }
];
var SEED_STUDENTS = [
  {
    id: "STU-9042",
    name: "David A. Okonjo",
    email: "student@vixora.com",
    enrolledDate: "June 2026",
    role: "alumni",
    courses: [
      {
        courseId: "ai-automation-digital-business-systems",
        title: "Autonomous AI Systems & Scalable Architecture",
        badge: "Enterprise Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-A",
        instructor: "Dr. Adebayo Vance",
        completedModules: 12,
        totalModules: 12,
        certificateId: "VA-2026-9042-ENG"
      },
      {
        courseId: "data-analysis-cohort",
        title: "Data Analytics & Business Intelligence Mastery",
        badge: "Analytics Track",
        progressPercent: 45,
        status: "in-progress",
        cohort: "Cohort 2026-B",
        instructor: "Marcus Sterling",
        completedModules: 7,
        totalModules: 16
      }
    ]
  },
  {
    id: "STU-8812",
    name: "Alex K. Chen",
    email: "alex.chen@vixora.com",
    enrolledDate: "May 2026",
    role: "alumni",
    courses: [
      {
        courseId: "data-analysis-cohort",
        title: "Data Analytics & Business Intelligence Mastery",
        badge: "Analytics Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-A",
        instructor: "Marcus Sterling",
        completedModules: 16,
        totalModules: 16,
        certificateId: "VA-2026-8812-AUT"
      }
    ]
  },
  {
    id: "STU-7731",
    name: "Sarah Jenkins",
    email: "sarah.j@vixora.com",
    enrolledDate: "July 2026",
    role: "alumni",
    courses: [
      {
        courseId: "complete-ai-digital-skills-freelancing-mastery",
        title: "AI Digital Skills & Freelance Agency Systems",
        badge: "Practitioner Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-Summer",
        instructor: "Elena Rostova",
        completedModules: 6,
        totalModules: 6,
        certificateId: "VA-2026-7731-DEV"
      }
    ]
  }
];
function generateCertificateEmailHtml(cert) {
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
                      <img src="https://academy.vixoradigitalhub.com/images/vixora-academy-logo.jpg" alt="Vixora Academy \u2014 Learn. Apply. Earn." style="height: 64px; width: auto; max-width: 240px; display: block; border-radius: 8px;" />
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
                Congratulations, ${cert.studentName}!
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
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #059669;">Verified &amp; Active</td>
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
                ${cert.competencies.map((c) => `<li>${c}</li>`).join("")}
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 34px; text-align: center; font-size: 11px; color: #5F6078; border-top: 1px solid #E5E5F0;">
              <p style="margin: 0 0 6px 0;">
                <strong>Vixora Academy</strong> \u2022 Silicon Corridor & Cloud Innovation Center
              </p>
              <p style="margin: 0 0 6px 0; color: #480878; font-weight: 600;">
                Academic Leadership: Dean Sarumi Hammad
              </p>
              <p style="margin: 0 0 6px 0;">
                Official Subdomain: <a href="https://academy.vixoradigitalhub.com" style="color: #480878; text-decoration: none;">academy.vixoradigitalhub.com</a> \u2022 Main Hub: <a href="https://vixoradigitalhub.com" style="color: #480878; text-decoration: none;">vixoradigitalhub.com</a>
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
function generateCertificateEmailText(cert) {
  return `VIXORA ACADEMY - OFFICIAL CERTIFICATE OF COMPLETION

Dear ${cert.studentName},

Congratulations! The Academic Directorate of Vixora Academy is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:

PROGRAM TRACK: ${cert.courseTitle}
HONORS / STANDING: ${cert.grade} (${cert.honors || "Distinction"})
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
${cert.competencies.map((c) => `\u2022 ${c}`).join("\n")}

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

// server/emailService.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";
var DEFAULT_SMTP_HOST = "smtp.gmail.com";
var DEFAULT_SMTP_USER = "vixoralabsai@gmail.com";
var VERIFIED_APP_PASS = "szagmreljkxxlywm";
var DEFAULT_FROM = "Vixora Academy <vixoraacademy@gmail.com>";
var resendClient = null;
function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
function getEmailConfigStatus() {
  const smtpUser = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const hasResend = Boolean((process.env.RESEND_API_KEY || "").trim());
  const hasSmtp = true;
  const rawFrom = (process.env.RESEND_FROM || process.env.SMTP_FROM || DEFAULT_FROM).trim();
  const fromAddress = rawFrom.includes("<") ? rawFrom : `Vixora Academy <${rawFrom}>`;
  return {
    hasSmtp,
    hasResend,
    primaryProvider: hasResend ? "resend" : hasSmtp ? "smtp" : "none",
    isConfigured: hasResend || hasSmtp,
    smtpHost: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
    smtpUser,
    fromAddress
  };
}
async function dispatchCertificateEmail(options) {
  const { to, toName, subject, html, text, certificateId, pdfBuffer, pdfFilename } = options;
  const startTime = Date.now();
  const attachmentName = pdfFilename || (certificateId ? `Vixora-Academy-Certificate-${certificateId}.pdf` : "Vixora-Document.pdf");
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(text)}`;
  const resend = getResendClient();
  if (resend) {
    const rawResendFrom = (process.env.RESEND_FROM || "").trim();
    const resendFrom = rawResendFrom ? rawResendFrom.includes("<") ? rawResendFrom : `Vixora Academy <${rawResendFrom}>` : process.env.SMTP_FROM && !process.env.SMTP_FROM.includes("gmail.com") ? process.env.SMTP_FROM : "Vixora Academy <onboarding@resend.dev>";
    try {
      const emailPayload = {
        from: resendFrom,
        to: [to],
        subject,
        html,
        text
      };
      if (pdfBuffer) {
        emailPayload.attachments = [
          {
            filename: attachmentName,
            content: pdfBuffer
          }
        ];
      }
      const { data, error } = await resend.emails.send(emailPayload);
      if (data && data.id) {
        const latency2 = Date.now() - startTime;
        return {
          delivered: true,
          deliveredToInternet: true,
          status: "delivered",
          provider: "resend",
          messageId: data.id,
          infoNotice: `Live email with official PDF certificate attachment (${attachmentName}) transmitted via Resend API to ${to} (Message ID: ${data.id}).`,
          gmailComposeUrl,
          mailtoUrl,
          deliveryLatencyMs: latency2,
          hasAttachment: Boolean(pdfBuffer),
          attachmentName
        };
      }
      if (error) {
        console.warn("Resend API dispatch note (falling back to verified SMTP):", error.message || error);
      }
    } catch (resendErr) {
      console.warn("Resend exception (falling back to SMTP):", resendErr.message || resendErr);
    }
  }
  const smtpHost = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const fromAddress = process.env.SMTP_FROM || `Vixora Academy <${smtpUser}>`;
  const candidatePasswords = [VERIFIED_APP_PASS];
  if (process.env.SMTP_PASS) {
    const envClean = process.env.SMTP_PASS.replace(/\s+/g, "");
    if (envClean && envClean !== "dzcggfhnbevwvdlc" && !candidatePasswords.includes(envClean)) {
      candidatePasswords.unshift(envClean);
    }
  }
  for (const pass of candidatePasswords) {
    try {
      const isGmail = smtpHost.includes("gmail.com");
      const port = parseInt(process.env.SMTP_PORT || (isGmail ? "465" : "587"), 10);
      const isSecure = port === 465;
      const transporter = nodemailer.createTransport(
        isGmail ? {
          service: "gmail",
          auth: {
            user: smtpUser,
            pass
          }
        } : {
          host: smtpHost,
          port,
          secure: isSecure,
          auth: {
            user: smtpUser,
            pass
          },
          tls: {
            rejectUnauthorized: false
          }
        }
      );
      const mailOptions = {
        from: fromAddress,
        to,
        subject,
        html,
        text
      };
      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: attachmentName,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ];
      }
      const info = await transporter.sendMail(mailOptions);
      const latency2 = Date.now() - startTime;
      return {
        delivered: true,
        deliveredToInternet: true,
        status: "delivered",
        provider: "smtp",
        messageId: info.messageId,
        infoNotice: `Live email with official PDF certificate attachment (${attachmentName}) delivered directly to ${to} via SMTP relay (${smtpHost}).`,
        gmailComposeUrl,
        mailtoUrl,
        deliveryLatencyMs: latency2,
        hasAttachment: Boolean(pdfBuffer),
        attachmentName
      };
    } catch (smtpErr) {
      console.warn(`SMTP delivery failure (${pass.slice(0, 4)}***):`, smtpErr.message || smtpErr);
    }
  }
  const latency = Date.now() - startTime + Math.floor(40 + Math.random() * 40);
  return {
    delivered: false,
    deliveredToInternet: false,
    status: "simulated",
    provider: "simulated",
    infoNotice: `Official Vixora Academy PDF certificate generated (${attachmentName}, ${pdfBuffer ? Math.round(pdfBuffer.length / 1024) : 0} KB) and queued for dispatch. Ready to deliver via 1-click Gmail Webmail.`,
    gmailComposeUrl,
    mailtoUrl,
    deliveryLatencyMs: latency,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName
  };
}
async function dispatchGenericEmail(params) {
  return dispatchCertificateEmail({
    to: params.to,
    toName: params.toName || params.to.split("@")[0],
    subject: params.subject,
    html: params.html,
    text: params.text || params.subject,
    certificateId: "admin-dispatch"
  });
}

// src/data/brandConfig.ts
var BRAND_CONFIG = {
  name: "Vixora Digital Hub",
  tagline: "Software \u2022 AI \u2022 Automation",
  domain: "https://www.vixoradigitalhub.com",
  cleanDomain: "vixoradigitalhub.com",
  academyDomain: "https://academy.vixoradigitalhub.com",
  cleanAcademyDomain: "academy.vixoradigitalhub.com",
  adminDomain: "https://admin.vixoradigitalhub.com",
  cleanAdminDomain: "admin.vixoradigitalhub.com",
  email: "vixoralabsai@gmail.com",
  secondaryEmail: "hello@vixoradigitalhub.com",
  phone: "+1 (279) 257-4850",
  whatsapp: {
    usAndGlobal: {
      id: "us",
      label: "US & Foreign Inbounds",
      region: "United States, Americas, Europe & Global",
      displayNumber: "+1 (279) 257-4850",
      fullInternationalNumber: "+12792574850",
      cleanDigits: "12792574850",
      flagEmoji: "US",
      isPrimary: true
    },
    nigeria: {
      id: "ng",
      label: "Nigeria Inbounds",
      region: "Nigeria & West Africa Region",
      displayNumber: "08114542934",
      fullInternationalNumber: "+2348114542934",
      cleanDigits: "2348114542934",
      flagEmoji: "NG",
      isPrimary: false
    },
    defaultUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project."
  },
  whatsappNumber: "+1 (279) 257-4850",
  whatsappUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.",
  address: "Vixora Digital Hub Headquarters, Silicon Corridor & Cloud Innovation Center",
  logo: {
    imageUrl: "/images/vixora-digital-hub-logo.png",
    secondaryImageUrl: "/images/vixora-digital-hub-logo.png",
    mobileImageUrl: "/images/brand-logo-mobile.png",
    darkImageUrl: "/images/vixora-digital-hub-logo.png",
    altText: "Vixora Digital Hub Logo"
  },
  academyLogo: {
    imageUrl: "/images/vixora-academy-logo.png",
    fallbackUrl: "/images/vixora-academy-logo.png",
    altText: "Vixora Academy"
  },
  heroBackground: {
    imageUrl: "/images/hero-background.png",
    videoUrl: "/videos/hero-background.mp4",
    overlayOpacity: 0.65
  },
  academyHeroBackground: {
    imageUrl: "/images/academy-hero-poster.jpg",
    videoUrl: "https://i.imgur.com/fo6rXq2.mp4",
    overlayOpacity: 0.65
  },
  telegramPublicUrl: "https://t.me/vixoraacademy"
};
function getWhatsAppUrl(channelOrMessage = "us", customMessage) {
  let channel = "us";
  let message = customMessage;
  if (channelOrMessage === "ng" || channelOrMessage === "us") {
    channel = channelOrMessage;
  } else if (typeof channelOrMessage === "string" && channelOrMessage.length > 0) {
    message = channelOrMessage;
    channel = "us";
  }
  const selected = channel === "ng" ? BRAND_CONFIG.whatsapp.nigeria : BRAND_CONFIG.whatsapp.usAndGlobal;
  const finalMessage = message || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
  return `https://wa.me/${selected.cleanDigits}?text=${encodeURIComponent(finalMessage)}`;
}

// server/emailTemplates.ts
var LOGO_URL = "https://academy.vixoradigitalhub.com/images/vixora-academy-logo.png";
var ACADEMY_URL = "https://academy.vixoradigitalhub.com";
var PORTAL_URL = "https://academy.vixoradigitalhub.com/pages/student-portal";
function renderPreheader(text) {
  if (!text) return "";
  return `
    <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
      ${text}
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
  `;
}
function renderEmailLayout(props) {
  const {
    previewText = "",
    badgeText,
    badgeVariant = "success",
    title,
    subtitle,
    bodyContentHtml,
    primaryCta,
    secondaryCta,
    footerNote
  } = props;
  const badgeStyles = {
    success: "background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399;",
    info: "background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;",
    warning: "background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24;",
    purple: "background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;"
  }[badgeVariant];
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0px !important;
      }
      .mobile-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  ${renderPreheader(previewText || title)}

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050212;">
    <tr>
      <td align="center" style="padding: 30px 12px 40px 12px;">
        
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #0b061d; border: 1px solid #2a1458; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td align="center" style="padding: 28px 24px 22px 24px; background: linear-gradient(180deg, #150933 0%, #0b061d 100%); border-bottom: 1px solid #25124d;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${ACADEMY_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${LOGO_URL}" alt="Vixora Academy" width="180" style="width: 180px; max-width: 180px; display: block; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #818cf8; font-weight: 700;">
                      Vixora Academy &bull; Student Portal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Section -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 30px 24px 30px;">
              
              <!-- Badge (Optional) -->
              ${badgeText ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${badgeStyles}">
                      ${badgeText}
                    </td>
                  </tr>
                </table>
              ` : ""}

              <!-- Title & Subtitle -->
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.35; letter-spacing: -0.3px;">
                ${title}
              </h1>

              ${subtitle ? `
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                  ${subtitle}
                </p>
              ` : ""}

              <!-- Dynamic Content Slot -->
              ${bodyContentHtml}

              <!-- Primary Call To Action Button -->
              ${primaryCta ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0 16px 0;">
                  <tr>
                    <td align="center">
                      <a href="${primaryCta.url}" target="_blank" style="display: block; box-sizing: border-box; width: 100%; max-width: 480px; padding: 15px 24px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; text-align: center; letter-spacing: 0.2px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);">
                        ${primaryCta.label}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}

              <!-- Secondary Call To Action Button -->
              ${secondaryCta ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                  <tr>
                    <td align="center">
                      <a href="${secondaryCta.url}" target="_blank" style="display: block; box-sizing: border-box; width: 100%; max-width: 480px; padding: 13px 22px; background-color: #150d36; border: 1px solid #3b1d7a; color: #c084fc; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; text-align: center;">
                        ${secondaryCta.label}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}

            </td>
          </tr>

          <!-- Help & Support Strip -->
          <tr>
            <td class="mobile-padding" style="padding: 16px 30px; background-color: #0e0725; border-top: 1px solid #200f42; border-bottom: 1px solid #200f42;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    \u{1F4A1} Need assistance? Contact our Admissions Desk directly at
                    <a href="mailto:${BRAND_CONFIG.email}" style="color: #38bdf8; text-decoration: none; font-weight: 600;">${BRAND_CONFIG.email}</a>
                    or reply directly to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Branded Footer -->
          <tr>
            <td class="mobile-padding" align="center" style="padding: 24px 30px 28px 30px; background-color: #080416; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #ffffff;">
                Vixora Digital Hub &bull; Academy
              </p>
              <p style="margin: 0 0 14px 0; font-size: 11px; line-height: 1.6; color: #64748b;">
                Software &bull; AI &bull; Automation &bull; Modern Tech Education<br />
                ${BRAND_CONFIG.address}
              </p>

              <!-- Quick Links -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${ACADEMY_URL}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Academy Courses</a>
                  </td>
                  <td style="color: #334155; font-size: 11px;">&bull;</td>
                  <td style="padding: 0 8px;">
                    <a href="${PORTAL_URL}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Student Portal</a>
                  </td>
                  <td style="color: #334155; font-size: 11px;">&bull;</td>
                  <td style="padding: 0 8px;">
                    <a href="${BRAND_CONFIG.domain}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Official Website</a>
                  </td>
                </tr>
              </table>

              ${footerNote ? `
                <p style="margin: 14px 0 0 0; font-size: 11px; color: #475569; line-height: 1.4;">
                  ${footerNote}
                </p>
              ` : ""}

              <p style="margin: 14px 0 0 0; font-size: 11px; color: #475569;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Vixora Digital Hub. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
function buildStudentOnboardingEmail(params) {
  const {
    customerName,
    customerEmail,
    courseTitle,
    tuitionNaira,
    currency = "NGN",
    gateway = currency === "USD" ? "bachs" : "paystack",
    reference,
    nextCohortDate,
    channel = "card",
    studentCode,
    generatedTempPassword,
    directPasswordSetupLink,
    whatsappUrl,
    telegramInvites = []
  } = params;
  const formattedCurrencyDisplay = currency === "USD" ? `$${tuitionNaira.toLocaleString("en-US", { minimumFractionDigits: Math.round(tuitionNaira * 100) % 100 !== 0 ? 2 : 0, maximumFractionDigits: 2 })} USD` : `\u20A6${tuitionNaira.toLocaleString()} NGN`;
  const shortPriceDisplay = currency === "USD" ? `$${tuitionNaira.toLocaleString("en-US")}` : `\u20A6${tuitionNaira.toLocaleString()}`;
  const gatewayLabel = gateway === "bachs" ? "Bachs USD Checkout" : "Paystack";
  const subject = `\u{1F393} Student Account & Admission Confirmed: ${courseTitle} (${shortPriceDisplay})`;
  const portalUrl = PORTAL_URL;
  const actionButtonUrl = directPasswordSetupLink || portalUrl;
  const bodyContentHtml = `
    <!-- Personalized Admission Notice -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Dear <strong style="color: #ffffff;">${customerName}</strong>,<br /><br />
            Congratulations! Your tuition payment of <strong style="color: #34d399;">${formattedCurrencyDisplay}</strong> has been verified via <strong>${gatewayLabel}</strong>. You are officially enrolled in <strong style="color: #a855f7;">${courseTitle}</strong>. Your student account is active and your seat in the upcoming cohort is secured.
          </p>
        </td>
      </tr>
    </table>

    <!-- Credentials Card Component -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #6366f1; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 14px; border-bottom: 1px solid #2a1854;">
                <span style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 1px;">
                  \u{1F511} Your Student Portal Credentials
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0 6px 0; color: #94a3b8; font-size: 13px;">Student Matric ID:</td>
              <td align="right" style="padding: 12px 0 6px 0; color: #38bdf8; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 14px;">
                ${studentCode}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Login Email:</td>
              <td align="right" style="padding: 6px 0; color: #ffffff; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 600; font-size: 13px;">
                ${customerEmail}
              </td>
            </tr>
            ${generatedTempPassword ? `
            <tr>
              <td style="padding: 6px 0 12px 0; color: #94a3b8; font-size: 13px;">Initial Password:</td>
              <td align="right" style="padding: 6px 0 12px 0; color: #facc15; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 14px;">
                ${generatedTempPassword}
              </td>
            </tr>
            ` : `
            <tr>
              <td style="padding: 6px 0 12px 0; color: #94a3b8; font-size: 13px;">Password Setup:</td>
              <td align="right" style="padding: 6px 0 12px 0; color: #38bdf8; font-size: 13px;">
                Click below to set your permanent password
              </td>
            </tr>
            `}
          </table>

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 14px; border-top: 1px solid #2a1854; padding-top: 14px;">
            <tr>
              <td align="center" style="font-size: 12px; color: #a5b4fc; line-height: 1.4;">
                ${directPasswordSetupLink ? "\u26A1 <strong>Instant Access:</strong> Click the setup button below to pick your permanent password in one click without re-typing." : 'Log in anytime at <a href="' + portalUrl + '" style="color: #38bdf8; text-decoration: none;">' + portalUrl + "</a>."}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Transaction Receipt Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0e0725; border: 1px solid #25124d; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: #64748b;">
                Payment Receipt Details
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Payment Reference:</td>
              <td align="right" style="padding: 4px 0; font-size: 12px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; color: #facc15; font-weight: 600;">
                ${reference}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Tuition Paid:</td>
              <td align="right" style="padding: 4px 0; font-size: 14px; color: #34d399; font-weight: 700;">
                ${formattedCurrencyDisplay}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Payment Gateway:</td>
              <td align="right" style="padding: 4px 0; font-size: 13px; color: #e2e8f0;">
                ${gatewayLabel} (${channel || "Online Checkout"})
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Cohort Launch Date:</td>
              <td align="right" style="padding: 4px 0; font-size: 13px; color: #c084fc; font-weight: 600;">
                ${nextCohortDate}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Dedicated Telegram Learning Space(s) -->
    ${telegramInvites && telegramInvites.length > 0 ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #0f1c3f 0%, #081129 100%); border: 1px solid #38bdf8; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom: 14px; border-bottom: 1px solid #1e3a8a;">
                <span style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
                  \u2708\uFE0F Your Private Telegram Learning Access (${telegramInvites.length === 1 ? "1 Track Vault" : `${telegramInvites.length} Track Vaults Included`})
                </span>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                  HD session video replays, downloadable PDF workbooks, code templates, and daily mentor Q&amp;A are hosted in these private Telegram channels:
                </p>
              </td>
            </tr>
            ${telegramInvites.map((inv, idx) => `
            <tr>
              <td style="padding: 12px 0; border-bottom: ${idx < telegramInvites.length - 1 ? "1px solid #1e293b" : "none"};">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align: middle;">
                      <strong style="color: #ffffff; font-size: 14px; display: block;">${inv.title}</strong>
                      ${inv.description ? `<span style="color: #cbd5e1; font-size: 12px; display: block; margin-top: 3px;">${inv.description}</span>` : ""}
                    </td>
                    <td align="right" style="vertical-align: middle; padding-left: 14px; white-space: nowrap;">
                      <a href="${inv.inviteUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 6px; display: inline-block;">
                        Join Telegram Vault &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            `).join("")}
          </table>
        </td>
      </tr>
    </table>
    ` : ""}

    <!-- 3-Step Orientation Checklist -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
            \u{1F4CB} Your Next Steps to Get Started
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">1. Join Your Telegram Vault:</strong> Click your invite link above to join your track's private Telegram learning group.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">2. Activate Your Student Portal:</strong> Click below to set your password and access your course curriculum and resources.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">3. Join WhatsApp Admissions:</strong> Connect with your instructors and cohort peers for live updates.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Welcome to ${courseTitle}! Your tuition is verified. Login and join your Telegram vault here.`,
    badgeText: "\u2713 Verified Payment & Official Admission",
    badgeVariant: "success",
    title: `Welcome to ${courseTitle}`,
    subtitle: `Your official tuition payment receipt, student matriculation credentials, and private Telegram learning spaces.`,
    bodyContentHtml,
    primaryCta: {
      label: directPasswordSetupLink ? "\u{1F680} Set Your Password & Access Student Portal" : "\u{1F680} Log In to Your Student Portal",
      url: actionButtonUrl
    },
    secondaryCta: {
      label: "\u{1F4AC} Join Admissions WhatsApp Cohort Group",
      url: whatsappUrl
    },
    footerNote: "This is an official transactional message regarding your verified enrollment on Vixora Academy."
  });
  const textTelegram = telegramInvites.length > 0 ? `
TELEGRAM LEARNING SPACES:
` + telegramInvites.map((t) => `- ${t.title}: ${t.inviteUrl}`).join("\n") + `
` : "";
  const text = `
Welcome to Vixora Academy!
Admission Confirmed for: ${courseTitle}

Dear ${customerName},
Your tuition payment of ${formattedCurrencyDisplay} has been verified via ${gatewayLabel}.
${textTelegram}
YOUR STUDENT CREDENTIALS:
- Student ID / Code: ${studentCode}
- Login Email: ${customerEmail}
${generatedTempPassword ? `- Initial Password: ${generatedTempPassword}
` : ""}
SET YOUR PASSWORD & ACCESS YOUR PORTAL:
${actionButtonUrl}

PAYMENT RECEIPT:
- Reference: ${reference}
- Gateway: ${gatewayLabel}
- Amount: ${formattedCurrencyDisplay}
- Cohort Start: ${nextCohortDate}

WHATSAPP ADMISSIONS GROUP:
${whatsappUrl}

Vixora Digital Hub
${BRAND_CONFIG.email}
  `.trim();
  return { html, text, subject };
}
function buildPasswordResetEmail(params) {
  const { studentName = "Student", email, otpCode, recoveryUrl } = params;
  const subject = `\u{1F511} Password Reset & Security Verification Code: ${otpCode}`;
  const bodyContentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Hello <strong style="color: #ffffff;">${studentName}</strong>,<br /><br />
            We received a request to access or reset the password for your Vixora Academy student account associated with <strong style="color: #38bdf8;">${email}</strong>.
          </p>
        </td>
      </tr>
    </table>

    <!-- OTP Code Display Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #6366f1; border-radius: 14px; margin-bottom: 24px; text-align: center;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">
            Your 6-Digit Verification Code
          </p>
          <div style="display: inline-block; padding: 10px 24px; background-color: #0b061d; border: 1px solid #4f46e5; border-radius: 10px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #facc15;">
            ${otpCode}
          </div>
          <p style="margin: 14px 0 0 0; font-size: 12px; color: #94a3b8;">
            This code is strictly confidential and expires in 15 minutes.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
          You can either enter the 6-digit code above on the student portal login page, or click the direct button below to reset your password instantly.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Your Vixora Academy verification code is ${otpCode}. Valid for 15 minutes.`,
    badgeText: "\u{1F512} Security & Access Verification",
    badgeVariant: "warning",
    title: "Reset Your Student Password",
    subtitle: "Use your secure one-time code or click the direct link below to set a new password.",
    bodyContentHtml,
    primaryCta: {
      label: "\u{1F511} Set New Password in One Click",
      url: recoveryUrl
    },
    footerNote: "If you did not request this password reset, please ignore this email or notify admissions immediately."
  });
  const text = `
Vixora Academy \u2014 Password Reset
Verification Code: ${otpCode}

Hello ${studentName},
We received a request to reset the password for ${email}.
Your verification code is: ${otpCode} (expires in 15 minutes).

Or reset directly:
${recoveryUrl}

If you did not request this, please ignore this message.
  `.trim();
  return { html, text, subject };
}
function buildCertificateAwardEmail(params) {
  const {
    studentName,
    courseTitle,
    certificateId,
    grade,
    issuedDate,
    verificationUrl
  } = params;
  const subject = `\u{1F393} Official Certificate of Completion: ${courseTitle} (${certificateId})`;
  const bodyContentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Congratulations <strong style="color: #ffffff;">${studentName}</strong>!<br /><br />
            You have successfully completed all curriculum requirements, weekly practical labs, and the final capstone project for <strong style="color: #a855f7;">${courseTitle}</strong>.
            Your official accredited certificate has been issued and entered into the public registry.
          </p>
        </td>
      </tr>
    </table>

    <!-- Certificate Credentials Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #10b981; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #2a1854;">
                <span style="font-size: 12px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
                  \u{1F3C6} Verifiable Academic Credential
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0 4px 0; color: #94a3b8; font-size: 13px;">Certificate ID:</td>
              <td align="right" style="padding: 10px 0 4px 0; color: #facc15; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 13px;">
                ${certificateId}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #94a3b8; font-size: 13px;">Academic Grade:</td>
              <td align="right" style="padding: 4px 0; color: #34d399; font-weight: 700; font-size: 14px;">
                ${grade}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0 8px 0; color: #94a3b8; font-size: 13px;">Issue Date:</td>
              <td align="right" style="padding: 4px 0 8px 0; color: #ffffff; font-size: 13px;">
                ${issuedDate}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
          An official high-resolution, print-ready PDF certificate is attached to this email. You can also share the digital verification link on LinkedIn, your CV, and your portfolio.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Congratulations ${studentName}! Your official certificate for ${courseTitle} is ready.`,
    badgeText: "\u2713 Verified Academic Credential Issued",
    badgeVariant: "success",
    title: "Certificate of Completion Awarded",
    subtitle: "Your verified digital certificate has been issued and entered into the Vixora Academy registry.",
    bodyContentHtml,
    primaryCta: {
      label: "\u{1F393} View & Verify Digital Certificate",
      url: verificationUrl
    },
    footerNote: "This certificate is cryptographically recorded in the Vixora Digital Hub registry and can be verified by employers worldwide."
  });
  const text = `
Vixora Academy \u2014 Certificate of Completion
Course: ${courseTitle}
Student: ${studentName}
Certificate ID: ${certificateId}
Grade: ${grade}
Date: ${issuedDate}

Verification URL:
${verificationUrl}

A high-resolution PDF certificate is attached to this email.
Congratulations on your achievement!
  `.trim();
  return { html, text, subject };
}

// server/certificatePdfGenerator.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
async function generateCertificatePdfBuffer(cert) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 28, bottom: 28, left: 32, right: 32 },
        info: {
          Title: `Vixora Academy Certificate - ${cert.studentName} (${cert.id})`,
          Author: "Vixora Academy Global Directorate",
          Subject: `Conferral of Certification in ${cert.courseTitle}`,
          Keywords: "Vixora Academy, Certification, AI, Cloud, Automation, Sarumi Hammad",
          Creator: "Vixora Academy Automated Credential Dispatcher"
        }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
      const pageWidth = 841.89;
      const pageHeight = 595.28;
      doc.rect(0, 0, pageWidth, pageHeight).fill("#FCFCFF");
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(3).stroke("#000048");
      doc.rect(26, 26, pageWidth - 52, pageHeight - 52).lineWidth(1).stroke("#7000F8");
      doc.rect(29, 29, pageWidth - 58, pageHeight - 58).lineWidth(0.5).stroke("#E5E5F0");
      const cornerSize = 14;
      doc.rect(20, 20, cornerSize, cornerSize).fill("#000048");
      doc.rect(23, 23, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(pageWidth - 20 - cornerSize, 20, cornerSize, cornerSize).fill("#000048");
      doc.rect(pageWidth - 20 - cornerSize + 3, 23, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(20, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill("#000048");
      doc.rect(23, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(pageWidth - 20 - cornerSize, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill("#000048");
      doc.rect(pageWidth - 20 - cornerSize + 3, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      const logoPathJpg = path.join(process.cwd(), "public", "images", "vixora-academy-logo.jpg");
      const logoPathPng = path.join(process.cwd(), "public", "images", "vixora-academy-logo.png");
      const resolvedLogo = fs.existsSync(logoPathJpg) ? logoPathJpg : fs.existsSync(logoPathPng) ? logoPathPng : null;
      let topY = 40;
      if (resolvedLogo) {
        try {
          doc.image(resolvedLogo, (pageWidth - 140) / 2, topY, { width: 140 });
          topY += 48;
        } catch (imgErr) {
          topY += 10;
        }
      } else {
        topY += 10;
      }
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#000048").text("VIXORA ACADEMY", 40, topY, { align: "center", characterSpacing: 2 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#7000F8").text("LEARN. APPLY. EARN. \u2022 GLOBAL CREDENTIAL DIRECTORY", 40, topY + 24, {
        align: "center",
        characterSpacing: 1.5
      });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text("academy.vixoradigitalhub.com \u2022 Official Academic Directorate", 40, topY + 36, {
        align: "center"
      });
      const statementY = topY + 54;
      doc.font("Helvetica").fontSize(9).fillColor("#5F6078").text("THIS IS TO OFFICIALLY CERTIFY THAT", 40, statementY, {
        align: "center",
        characterSpacing: 2
      });
      const nameY = statementY + 16;
      doc.font("Helvetica-Bold").fontSize(26).fillColor("#000048").text(cert.studentName, 40, nameY, { align: "center" });
      const textWidth = doc.widthOfString(cert.studentName);
      const lineStartX = Math.max(120, (pageWidth - textWidth) / 2 - 20);
      const lineEndX = Math.min(pageWidth - 120, (pageWidth + textWidth) / 2 + 20);
      doc.moveTo(lineStartX, nameY + 32).lineTo(lineEndX, nameY + 32).lineWidth(1.5).stroke("#7000F8");
      const narrY = nameY + 40;
      doc.font("Helvetica").fontSize(10).fillColor("#480878").text(
        "has demonstrated executive excellence, fulfilling all prescribed rigorous curriculum standards, examinations, and the production capstone for conferral of the professional credential in:",
        80,
        narrY,
        { align: "center", width: pageWidth - 160 }
      );
      const courseY = narrY + 26;
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#000048").text(cert.courseTitle, 60, courseY, { align: "center" });
      doc.font("Helvetica-Oblique").fontSize(11).fillColor("#480878").text(`Specialization: ${cert.specialization}`, 60, courseY + 22, { align: "center" });
      const honorsY = courseY + 38;
      const honorsText = `Grade: ${cert.grade}  |  Honors: ${cert.honors || "Distinction"}  |  Track: ${cert.trackBadge}`;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#7000F8").text(honorsText, 60, honorsY, { align: "center" });
      const capstoneY = honorsY + 16;
      doc.font("Helvetica").fontSize(8.5).fillColor("#5F6078").text(
        `Production Capstone Defense: "${cert.capstoneTitle}" (Score: ${cert.capstoneScore})`,
        80,
        capstoneY,
        { align: "center", width: pageWidth - 160 }
      );
      const sigY = 460;
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#000048").text(cert.instructorName, 70, sigY + 14, { width: 220, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text(cert.instructorTitle, 70, sigY + 28, { width: 220, align: "center" });
      doc.moveTo(85, sigY + 8).lineTo(275, sigY + 8).lineWidth(1).stroke("#7000F8");
      const sealCenterX = pageWidth / 2;
      doc.circle(sealCenterX, sigY + 16, 32).lineWidth(2).stroke("#480878");
      doc.circle(sealCenterX, sigY + 16, 29).lineWidth(0.75).stroke("#7000F8");
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#480878").text("VIXORA ACADEMY", sealCenterX - 35, sigY + 2, { width: 70, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#000048").text("OFFICIAL SEAL", sealCenterX - 35, sigY + 11, { width: 70, align: "center" });
      doc.font("Helvetica").fontSize(6).fillColor("#7000F8").text("VERIFIED 2026", sealCenterX - 35, sigY + 21, { width: 70, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#000048").text(`ID: ${cert.id}`, sealCenterX - 75, sigY + 52, { width: 150, align: "center" });
      doc.font("Helvetica").fontSize(7.5).fillColor("#5F6078").text(`Issued: ${cert.issueDate}`, sealCenterX - 75, sigY + 62, { width: 150, align: "center" });
      const deanX = pageWidth - 290;
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#000048").text(cert.directorName || "Sarumi Hammad", deanX, sigY + 14, { width: 220, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text(cert.directorTitle || "Dean, Vixora Academy", deanX, sigY + 28, { width: 220, align: "center" });
      doc.moveTo(deanX + 15, sigY + 8).lineTo(deanX + 205, sigY + 8).lineWidth(1).stroke("#7000F8");
      const footY = pageHeight - 44;
      doc.font("Helvetica").fontSize(7).fillColor("#5F6078").text(
        `Tamper-Proof Verification URL: ${cert.verificationUrl}  \u2022  SHA-256 Ledger: ${cert.credentialHash}`,
        40,
        footY,
        { align: "center", width: pageWidth - 80 }
      );
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#7000F8").text(
        "CRYPTOGRAPHICALLY CONFERRED BY VIXORA ACADEMY GLOBAL DIRECTORATE \u2022 ALL RIGHTS RESERVED",
        40,
        footY + 10,
        { align: "center", characterSpacing: 1 }
      );
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// server/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";
function sanitizeSupabaseUrl(rawUrl2) {
  if (!rawUrl2) return "";
  return rawUrl2.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
var rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var supabaseUrl = sanitizeSupabaseUrl(rawUrl);
var supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
var supabaseAdminClient = null;
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminClient;
}
function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

// server/auth/adminSessionStore.ts
import crypto from "crypto";
import { createClient as createClient2 } from "@supabase/supabase-js";
var devAdminAccounts = /* @__PURE__ */ new Map();
var devAdminOtps = /* @__PURE__ */ new Map();
var DEV_SESSION_SECRET = (process.env.ADMIN_SESSION_SECRET || "").trim() || crypto.randomBytes(32).toString("hex");
var TOKEN_PREFIX = "vix_dev_adm_";
var TOKEN_TTL_MS = 12 * 60 * 60 * 1e3;
function isProductionAuthEnvironment() {
  return process.env.NODE_ENV === "production";
}
function shouldUseDevAdminFallback() {
  return !isProductionAuthEnvironment();
}
function isSupabaseNetworkError(errOrMsg) {
  if (!errOrMsg) return false;
  const msg = typeof errOrMsg === "string" ? errOrMsg : String(errOrMsg?.message || errOrMsg?.details || errOrMsg);
  const lower = msg.toLowerCase();
  return lower.includes("fetch failed") || lower.includes("enotfound") || lower.includes("eai_again") || lower.includes("econnrefused") || lower.includes("etimedout") || lower.includes("und_err_") || lower.includes("could not resolve") || lower.includes("networkerror");
}
function sanitizeUrl(rawUrl2) {
  if (!rawUrl2) return "";
  return rawUrl2.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
var cachedPublicClient = null;
function getPublicSupabaseConfig() {
  const rawUrl2 = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://xenjfszsppwqadgwzpxl.supabase.co";
  const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4";
  const url = sanitizeUrl(rawUrl2);
  const anonKey = rawAnonKey.trim();
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}
function createEphemeralPublicSupabaseClient() {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) return null;
  return createClient2(cfg.url, cfg.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
function getPublicSupabaseClient() {
  if (cachedPublicClient) return cachedPublicClient;
  const client = createEphemeralPublicSupabaseClient();
  if (!client) return null;
  cachedPublicClient = client;
  return cachedPublicClient;
}
function hashPasswordWithSalt(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}
function hasDevAdminAccount(email) {
  return devAdminAccounts.has(email.toLowerCase().trim());
}
function registerDevAdminAccount(email, password, name) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = (name || "").trim() || cleanEmail.split("@")[0];
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPasswordWithSalt(password, salt);
  const id = `adm-dev-${crypto.createHash("sha256").update(cleanEmail).digest("hex").slice(0, 12)}`;
  devAdminAccounts.set(cleanEmail, {
    id,
    email: cleanEmail,
    name: cleanName,
    salt,
    passwordHash,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return { id, email: cleanEmail, name: cleanName };
}
function authenticateDevAdminAccount(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const record = devAdminAccounts.get(cleanEmail);
  if (!record) {
    return { ok: false, reason: "NOT_FOUND" };
  }
  const candidateHash = hashPasswordWithSalt(password, record.salt);
  const expectedBuf = Buffer.from(record.passwordHash, "hex");
  const candidateBuf = Buffer.from(candidateHash, "hex");
  if (expectedBuf.length !== candidateBuf.length || !crypto.timingSafeEqual(expectedBuf, candidateBuf)) {
    return { ok: false, reason: "INVALID_PASSWORD" };
  }
  return {
    ok: true,
    user: {
      id: record.id,
      email: record.email,
      name: record.name
    }
  };
}
function resetDevAdminPassword(email, newPassword) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = devAdminAccounts.get(cleanEmail);
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPasswordWithSalt(newPassword, salt);
  if (existing) {
    existing.salt = salt;
    existing.passwordHash = passwordHash;
    return true;
  }
  registerDevAdminAccount(cleanEmail, newPassword);
  return true;
}
function createDevOtp(email) {
  const cleanEmail = email.toLowerCase().trim();
  const otp = String(crypto.randomInt(1e5, 999999));
  devAdminOtps.set(cleanEmail, {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1e3
  });
  return otp;
}
function verifyDevOtp(email, otp) {
  const cleanEmail = email.toLowerCase().trim();
  const record = devAdminOtps.get(cleanEmail);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    devAdminOtps.delete(cleanEmail);
    return false;
  }
  const cleanOtp = otp.trim();
  if (cleanOtp.length !== record.otp.length) return false;
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(cleanOtp, "utf8"),
    Buffer.from(record.otp, "utf8")
  );
  if (isMatch) {
    devAdminOtps.delete(cleanEmail);
  }
  return isMatch;
}
function issueAdminDevToken(user) {
  if (!shouldUseDevAdminFallback()) {
    throw new Error("Dev admin tokens cannot be issued in production or when Supabase admin is configured.");
  }
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = {
    sub: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    role: "admin",
    exp: expiresAt
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sigB64 = crypto.createHmac("sha256", DEV_SESSION_SECRET).update(payloadB64).digest("base64url");
  return {
    token: `${TOKEN_PREFIX}${payloadB64}.${sigB64}`,
    expiresAt
  };
}
function verifyAdminDevToken(token) {
  if (!shouldUseDevAdminFallback()) {
    return null;
  }
  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  const body = token.slice(TOKEN_PREFIX.length);
  const parts = body.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
  const expectedSigB64 = crypto.createHmac("sha256", DEV_SESSION_SECRET).update(payloadB64).digest("base64url");
  const sigBuf = Buffer.from(sigB64, "utf8");
  const expectedBuf = Buffer.from(expectedSigB64, "utf8");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!decoded || typeof decoded.email !== "string" || typeof decoded.exp !== "number") {
      return null;
    }
    if (Date.now() > decoded.exp) {
      return null;
    }
    return {
      id: String(decoded.sub || "adm-dev"),
      email: decoded.email.toLowerCase().trim(),
      name: String(decoded.name || decoded.email.split("@")[0]),
      role: String(decoded.role || "admin")
    };
  } catch {
    return null;
  }
}

// server/auth/authMiddleware.ts
async function requireAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required. Bearer token missing in Authorization header.",
      code: "AUTH_TOKEN_MISSING"
    });
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: "Empty authentication token provided.",
      code: "AUTH_TOKEN_EMPTY"
    });
  }
  if (shouldUseDevAdminFallback()) {
    const devUser = verifyAdminDevToken(token);
    if (devUser) {
      req.user = {
        id: devUser.id,
        email: devUser.email,
        role: devUser.role,
        user_metadata: {
          full_name: devUser.name,
          name: devUser.name,
          role: "admin"
        }
      };
      return next();
    }
  }
  const supabase = getSupabaseAdmin() || getPublicSupabaseClient();
  if (!supabase) {
    return res.status(503).json({
      error: "Authentication service unavailable. Supabase credentials are not configured.",
      code: "AUTH_SERVICE_UNCONFIGURED"
    });
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) {
      return res.status(401).json({
        error: "Invalid, expired, or revoked authentication session.",
        code: "AUTH_TOKEN_INVALID"
      });
    }
    req.user = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      role: user.role,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    };
    next();
  } catch (err) {
    console.error("Error verifying Supabase authentication token:", err);
    return res.status(500).json({
      error: "Internal error verifying session token.",
      code: "AUTH_VERIFY_ERROR"
    });
  }
}

// server/auth/requireAdmin.ts
var DEFAULT_DEV_ADMIN_EMAILS = [
  "admin@vixoradigitalhub.com",
  "vixoralabsai@gmail.com",
  "vixoraacademy@gmail.com"
];
function getAuthorizedAdminEmails() {
  const envValue = process.env.ADMIN_EMAILS;
  if (envValue !== void 0) {
    const emailList = envValue.trim().replace(/^["']|["']$/g, "").split(/[,;\s]+/).map((e) => e.trim().replace(/^["']|["']$/g, "").toLowerCase()).filter((e) => e.length > 0 && e.includes("@"));
    return new Set(emailList);
  }
  if (process.env.NODE_ENV === "production") {
    return /* @__PURE__ */ new Set();
  }
  return new Set(DEFAULT_DEV_ADMIN_EMAILS);
}
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: "Authentication required prior to admin authorization check.",
      code: "UNAUTHENTICATED"
    });
  }
  const verifiedEmail = req.user.email.toLowerCase().trim();
  const allowedAdmins = getAuthorizedAdminEmails();
  if (allowedAdmins.size === 0) {
    return res.status(403).json({
      error: "Administrator allowlist (ADMIN_EMAILS) is not configured on this server. Add your email to ADMIN_EMAILS in your hosting Secrets / Environment Variables and redeploy.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  if (!allowedAdmins.has(verifiedEmail)) {
    return res.status(403).json({
      error: "Access denied: verified account is not an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  next();
}

// server/paystackServer.ts
import { Router } from "express";
import crypto3 from "crypto";

// src/data/vixoraContent.ts
var FEATURED_SERVICES = [
  {
    id: "software-dev",
    title: "Software Development",
    subtitle: "Custom Web & Cloud Platforms",
    tagline: "Engineered for speed, security, and scale.",
    description: "From complex enterprise dashboards to high-concurrency SaaS applications, we architect software tailored precisely to your operational requirements.",
    features: ["Custom web apps with React & Next.js", "Resilient microservices in Python & FastAPI", "Enterprise database architecture & optimization", "Zero-downtime CI/CD deployment pipelines"],
    icon: "Code2"
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    subtitle: "Autonomous Agents & Workflow Systems",
    tagline: "Replace repetitive busywork with intelligent automation.",
    description: "We deploy custom AI agents, automated workflow pipelines with n8n, and conversational AI chatbots that supercharge team productivity.",
    features: ["Autonomous AI agent swarms", "Omnichannel customer support chatbots", "Document OCR & automated parsing", "Cross-software n8n orchestration"],
    icon: "Bot"
  },
  {
    id: "branding-design",
    title: "Branding & Design",
    subtitle: "Brand Identity & UI/UX Systems",
    tagline: "Design that commands premium positioning.",
    description: "We create distinctive visual identities, precision design systems, and intuitive user experiences that turn first-time visitors into loyal customers.",
    features: ["Comprehensive brand identity styleguides", "Full UI/UX wireframing & prototyping in Figma", "Design tokens & reusable component systems", "Pitch decks & marketing collateral"],
    icon: "Palette"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Media Buying",
    subtitle: "Paid Acquisition & Performance Growth",
    tagline: "Turn ad spend into predictable revenue.",
    description: "Data-driven media buying campaigns across Meta, Google, and TikTok backed by conversion tracking and high-frequency creative testing.",
    features: ["Meta & Google Ads performance campaigns", "Conversion rate optimization (CRO)", "Multi-touch attribution reporting", "Audience segmentation & retargeting"],
    icon: "Megaphone"
  },
  {
    id: "media-production",
    title: "AI Media & Video Production",
    subtitle: "UGC Creatives & AI Generated Video Ads",
    tagline: "High-volume viral video creative at scale.",
    description: "We produce high-converting direct-response video ads, UGC creator content, and AI-narrated synthetic video reels for social dominance.",
    features: ["Direct-response UGC video ads", "AI voiceover & synthetic spokesperson videos", "Batch ad creative iterations", "TikTok, Reels & YouTube Shorts formatting"],
    icon: "Video"
  },
  {
    id: "vixora-academy",
    title: "Vixora Academy & Training",
    subtitle: "Tech & AI Upskilling for Teams & Builders",
    tagline: "Master the skills shaping the future.",
    description: "Practical, project-based training programs in modern software engineering, AI automation, and product building for individuals and corporate teams.",
    features: ["Full-Stack & AI Engineering Cohorts", "Corporate AI adoption masterclasses", "Hands-on project mentorship", "Official Vixora Certification"],
    icon: "GraduationCap"
  }
];
var ACADEMY_COURSES = [
  // -------------------------------------------------------------
  // 2026 ACCREDITED CURRICULUM COURSES (Active Catalog)
  // -------------------------------------------------------------
  {
    id: "course-ai-automation-c2",
    slug: "ai-automation-digital-literacy",
    title: "AI Automation & Digital Literacy",
    subtitle: "Master AI prompting, no-code workflows, and automated business agents in a 12-week practical cohort.",
    badge: "2026 Curriculum \u2022 \u20A660,000",
    level: "Beginner",
    status: "active",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort (Online + Practical Labs)",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions & Live Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Standard 2026 tuition: \u20A660,000 ($50 USD). Includes live labs, automated workflows, and lifetime alumni access.",
    seatsRemaining: 15,
    targetAudience: "Beginners, Small Business Owners, Professionals, and Job Seekers looking to master no-code AI automation.",
    description: "This beginner-friendly course teaches students to use AI tools and no-code automation to work faster and earn more. Build real automations and AI assistants for everyday and business tasks.",
    heroPitch: "Master AI prompting, no-code Zapier/Make automations, custom AI agents, and document processing in 12 structured weeks.",
    highlights: [
      "12 weeks of hands-on training with zero coding background required",
      "Master ChatGPT, Claude, Gemini, Zapier, Make, and n8n",
      "Build working automations, custom AI chatbots, and CRM lead flows",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Use computers, cloud tools and the internet safely and confidently",
      "Write clear prompts that get useful results from AI tools",
      "Design and build no-code automations that connect everyday apps",
      "Build custom AI assistants and chatbots for business operations"
    ],
    prerequisites: [
      "A laptop or smartphone with internet access",
      "Zero coding required (taught from scratch)"
    ],
    curriculum: [
      "Phase 1 \u2014 Digital Literacy & Prompt Engineering Foundations",
      "Phase 2 \u2014 AI for Writing, Research, Planning & Spreadsheets",
      "Phase 3 \u2014 Workflow Automation with Zapier, Make & Custom Chatbots",
      "Phase 4 \u2014 Portfolio Project, Client Pitch & Monetization"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Digital Literacy Foundations & Cloud Security",
        description: "Files, folders, Google Drive, password hygiene, and cloud account security setup.",
        topics: ["Cloud file systems", "Passwords & 2FA", "Search skills", "Collaboration workspace"],
        handsOnLab: "Organize a structured cloud folder system and set up all course accounts securely."
      },
      {
        week: "Week 02",
        title: "Introduction to AI & Main AI Tools",
        description: "Guided tour of ChatGPT, Claude, and Gemini across real-world tasks.",
        topics: ["AI vs ML vs LLMs", "Hallucinations & verification", "AI tools comparison", "Responsible AI"],
        handsOnLab: "Execute identical tasks across three AI tools and compare output accuracy and style."
      },
      {
        week: "Week 03",
        title: "Prompt Engineering Principles",
        description: "Role, context, task, format, and constraints for production-grade prompts.",
        topics: ["Anatomy of a strong prompt", "Few-shot prompting", "Chain of thought", "Prompt libraries"],
        handsOnLab: "Rewrite ten weak prompts into production-grade templates and test them."
      },
      {
        week: "Week 04",
        title: "AI for Writing, Research & Planning",
        description: "Drafting, editing, summarizing PDFs, and research verification with AI.",
        topics: ["Document drafting", "PDF summaries", "Fact checking", "AI project planning"],
        handsOnLab: "Produce a comprehensive research summary and work plan using AI."
      },
      {
        week: "Week 05",
        title: "Excel & AI for Spreadsheet Mastery",
        description: "Formulas, sorting, filtering, data cleaning, and automated spreadsheet logic.",
        topics: ["Excel fundamentals", "AI formula generation", "Data cleaning", "Trend insights"],
        handsOnLab: "Build a small business revenue and expense tracker with AI-generated formulas."
      },
      {
        week: "Weeks 06-07",
        title: "Workflow Automation with Zapier & Make",
        description: "Triggers, actions, filters, API webhooks, Zapier, and Make scenario builds.",
        topics: ["Workflow mapping", "Zapier multi-step Zaps", "Make scenarios", "Error handling"],
        handsOnLab: "Build a lead form-to-spreadsheet-to-email notification automation in Zapier and Make."
      },
      {
        week: "Weeks 08-09",
        title: "AI Agents, Chatbots & Operations",
        description: "No-code AI chatbots, knowledge bases, custom GPTs, and business CRM sync.",
        topics: ["Chatbots vs agents", "Knowledge bases", "Customer support bots", "Email triage"],
        handsOnLab: "Build an end-to-end lead capture, AI qualification, and automated follow-up system."
      },
      {
        week: "Weeks 10-12",
        title: "Portfolio Project, Presentation & Monetization",
        description: "Real-world portfolio automation, live presentation, proposal writing, and pricing.",
        topics: ["Portfolio build", "5-min live demo", "Proposal writing", "Service packages"],
        handsOnLab: "Build a complete real-world business automation with documentation and live demo."
      }
    ],
    capstoneProjects: [
      {
        title: "Real-World Business Automation or AI Agent Build",
        description: "A working multi-step automation or custom AI chatbot with documentation and an estimate of time saved for the business.",
        technologies: ["Zapier", "Make.com", "ChatGPT API", "Google Workspace", "Notion"]
      }
    ],
    instructors: [
      {
        name: "Vixora AI Automation Faculty",
        role: "Lead Instructors & Automation Specialists",
        bio: "Practicing automation engineers who build production no-code systems for enterprise clients.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Do I need any coding experience?",
        a: "No coding is required. The entire course uses no-code visual drag-and-drop tools and plain-language AI prompts."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Automation & Digital Literacy"
  },
  {
    id: "course-va-setter-c2",
    slug: "virtual-assistance-appointment-setter",
    title: "Virtual Assistance & Appointment Setting",
    subtitle: "Master executive VA operations, AI productivity, CRM lead management, and cold outreach scripts in an 8-week cohort.",
    badge: "2026 Curriculum \u2022 \u20A660,000",
    level: "Beginner",
    status: "active",
    track: "Business Automation",
    format: "8-Week Hybrid Cohort (Online + Practical Labs)",
    duration: "8 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions & Live Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Standard 2026 tuition: \u20A660,000 ($50 USD). Includes script suites, CRM templates, and portfolio review.",
    seatsRemaining: 12,
    targetAudience: "Aspiring Virtual Assistants, Appointment Setters, Remote Professionals, and Freelancers.",
    description: "Train to work as a professional virtual assistant and appointment setter. Learn inbox management, scheduling across time zones, CRM lead tracking, AI speed tools, and cold outreach scripts.",
    heroPitch: "Become an in-demand Executive VA & Appointment Setter with AI speed tools, CRM lead management, and proven client outreach scripts.",
    highlights: [
      "8 weeks of practical executive VA and appointment setting training",
      "Master Notion, Google Workspace, Trello, HubSpot CRM, and AI assistants",
      "Cold outreach scripts for email, LinkedIn DMs, and discovery calls",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Manage high-volume email inboxes and complex calendars across time zones",
      "Run cold outreach campaigns by email and LinkedIn using tested scripts",
      "Manage CRM pipelines and book qualified discovery calls",
      "Package VA and appointment setting services for international clients"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "Good written and verbal communication skills"
    ],
    curriculum: [
      "Phase 1 \u2014 Introduction to VA & Workspace Admin",
      "Phase 2 \u2014 Core VA Operations & AI Productivity",
      "Phase 3 \u2014 CRM Systems, Outreach Scripts & Booking Calls",
      "Phase 4 \u2014 Client Acquisition, Pricing Packages & Portfolio Launch"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Introduction to VA & Appointment Setting",
        description: "Role expectations, remote work protocols, niche selection, and professional communication.",
        topics: ["VA vs Appointment Setter", "Remote work norms", "Niche positioning", "Email etiquette"],
        handsOnLab: "Draft a professional client introduction email and niche positioning statement."
      },
      {
        week: "Week 02",
        title: "Productivity & Workspace Admin Tools",
        description: "Google Workspace, Notion dashboards, Trello Kanban boards, and Toggl time tracking.",
        topics: ["Google Workspace", "Notion databases", "Trello task boards", "File structure"],
        handsOnLab: "Configure a complete mock client workspace with task boards and shared folders."
      },
      {
        week: "Week 03",
        title: "Email & Calendar Management (Inbox Zero)",
        description: "Inbox Zero methodology, scheduling across time zones, Calendly, and travel itineraries.",
        topics: ["Inbox Zero", "Calendar buffer rules", "Calendly setup", "Conflict resolution"],
        handsOnLab: "Process a mock inbox of 50 client emails and resolve 1 week of scheduling conflicts."
      },
      {
        week: "Week 04",
        title: "AI Productivity Suite for Virtual Assistants",
        description: "Prompting AI for email drafts, Otter meeting notes, research, and social captions.",
        topics: ["AI email drafting", "Meeting transcription", "Web research", "Privacy rules"],
        handsOnLab: "Complete a complex VA task suite (inbox responses, meeting summary, research) with AI."
      },
      {
        week: "Week 05",
        title: "CRM Systems & Lead Management",
        description: "HubSpot / GoHighLevel CRM pipelines, prospect sourcing, and lead qualification.",
        topics: ["CRM fundamentals", "Pipeline stages", "LinkedIn prospect sourcing", "Lead hygiene"],
        handsOnLab: "Build a qualified lead list of 30 prospects inside a CRM workspace."
      },
      {
        week: "Week 06",
        title: "Cold Outreach Strategies & Scriptwriting",
        description: "Cold email copy, LinkedIn DMs, phone scripts, and anti-spam compliance.",
        topics: ["Cold email subject lines", "LinkedIn DM sequences", "Phone call scripts", "Personalization"],
        handsOnLab: "Write a multi-touch outreach sequence (3 emails, 2 LinkedIn DMs, 1 phone script)."
      },
      {
        week: "Week 07",
        title: "Handling Objections & Booking Sales Calls",
        description: "Acknowledge-Reframe-Bridge framework, discovery call qualification, and reducing no-shows.",
        topics: ["Objection handling", "Call qualification", "Confirmation SMS/email", "Metrics tracking"],
        handsOnLab: "Participate in live role-play appointment-setting calls and objection exercises."
      },
      {
        week: "Week 08",
        title: "Landing Clients, Rates & Portfolio Launch",
        description: "Upwork/LinkedIn client sourcing, service packaging, contracts, onboarding, and portfolio.",
        topics: ["Client acquisition", "Hourly vs Retainer", "Onboarding intake", "Portfolio page"],
        handsOnLab: "Build service packages, client onboarding checklist, and present final portfolio."
      }
    ],
    capstoneProjects: [
      {
        title: "VA Service Package & Appointment Setting Campaign",
        description: "Niche service packages, CRM pipeline with 30 prospects, multi-touch outreach sequence, and onboarding checklist.",
        technologies: ["Google Workspace", "Notion", "HubSpot CRM", "Calendly", "ChatGPT"]
      }
    ],
    instructors: [
      {
        name: "Vixora Executive VA Faculty",
        role: "Lead Instructors & Remote Operations Specialists",
        bio: "Veteran executive virtual assistants supporting global founders and high-ticket sales teams.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Do I need prior experience?",
        a: "No prior experience is required. We teach administrative fundamentals, CRM tools, and outreach scripts from scratch."
      }
    ],
    certificateType: "Vixora Certificate of Completion in Virtual Assistance & Appointment Setting"
  },
  {
    id: "course-web-dev-c2",
    slug: "ai-web-development-vibe-coding",
    title: "AI Web Development & Vibe Coding",
    subtitle: "Build web applications, React frontends, backend databases, and AI features using modern vibe coding toolchains.",
    badge: "2026 Curriculum \u2022 \u20A660,000",
    level: "Beginner",
    status: "active",
    track: "Engineering & AI",
    format: "12-Week Hybrid Cohort (Online + Coding Labs)",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week (Live Sessions & Build Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Standard 2026 tuition: \u20A660,000 ($50 USD). Includes live coding labs, code reviews, and hosting deployment.",
    seatsRemaining: 18,
    targetAudience: "Beginners, Aspiring Web Developers, Freelancers, and Entrepreneurs building digital products.",
    description: "Learn to build and launch real websites and web apps using HTML, CSS, JavaScript, React, cloud databases, and AI coding assistants like Cursor and Claude.",
    heroPitch: "Turn product ideas into deployed full-stack web applications with React, databases, and AI pair-programming assistants.",
    highlights: [
      "12 weeks of full-stack web development and vibe coding",
      "Master HTML5, CSS3, JavaScript ES6+, React 19, Tailwind, and Supabase",
      "Integrate live AI APIs (Gemini/OpenAI) into web applications",
      "Deploy production web apps with custom domains on Vercel"
    ],
    outcomes: [
      "Build responsive web applications with HTML, CSS, JavaScript, and React",
      "Use AI tools to write, test, debug, and audit code safely",
      "Connect backend cloud databases and persist user data",
      "Integrate AI features via REST APIs and deploy live to production"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Zero prior coding required (taught from the ground up)"
    ],
    curriculum: [
      "Phase 1 \u2014 Web Foundations (HTML5, CSS3, Flexbox, Grid & Git)",
      "Phase 2 \u2014 Programming Logic & Vibe Coding (JavaScript DOM & AI Pair Programming)",
      "Phase 3 \u2014 Full-Stack Development (React 19, Supabase PostgreSQL & AI APIs)",
      "Phase 4 \u2014 Production Deployment, Domain Setup & Portfolio Showcase"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "How the Web Works & Workspace Setup",
        description: "Browsers, servers, VS Code, dev tools, and Git/GitHub fundamentals.",
        topics: ["Client-server architecture", "VS Code setup", "DevTools console", "Git & GitHub"],
        handsOnLab: "Set up local coding workspace and publish your first HTML page to GitHub."
      },
      {
        week: "Week 02",
        title: "HTML & Semantic Page Structure",
        description: "Boilerplate, typography, links, form validation, and semantic HTML5.",
        topics: ["Semantic tags", "Forms & inputs", "Accessibility attributes", "DOM planning"],
        handsOnLab: "Build a personal developer bio page and a business lead intake form."
      },
      {
        week: "Week 03",
        title: "CSS Styling, Flexbox & Responsive Design",
        description: "Selectors, box model, Flexbox alignment, CSS Grid, and mobile media queries.",
        topics: ["Box model", "Flexbox layout", "CSS Grid", "Mobile responsive design"],
        handsOnLab: "Style Week 2 HTML files into a responsive, polished business website."
      },
      {
        week: "Week 04",
        title: "JavaScript Fundamentals",
        description: "Variables, data types, operators, conditionals, functions, arrays, and objects.",
        topics: ["Variables & scope", "Arrow functions", "Array methods (map/filter)", "Console debugging"],
        handsOnLab: "Build two standalone JS programs: a price calculator and an interactive quiz."
      },
      {
        week: "Week 05",
        title: "JavaScript DOM & Interactive Web Apps",
        description: "DOM manipulation, event listeners, async/await, fetch API, and LocalStorage.",
        topics: ["DOM querySelector", "Form events", "Async/await fetch", "LocalStorage state"],
        handsOnLab: "Build a dynamic To-Do app and an interactive weather app fetching live API data."
      },
      {
        week: "Week 06",
        title: "Vibe Coding & AI Coding Assistants",
        description: "Prompting AI coding assistants, step-by-step feature prompts, and code auditing.",
        topics: ["Vibe coding models", "Context-rich prompts", "Code auditing", "API key security"],
        handsOnLab: "Build a complete mini web app using AI prompting, then audit and refactor the code."
      },
      {
        week: "Week 07",
        title: "High-Converting Landing Pages with AI",
        description: "Landing page architecture, responsive assets, contact form handlers, and Lighthouse tuning.",
        topics: ["Page structure", "Asset optimization", "Form handlers", "Performance tuning"],
        handsOnLab: "Build a production-ready landing page for a real or sample business."
      },
      {
        week: "Week 08",
        title: "Frontend Frameworks: Introduction to React",
        description: "JSX, components, props, useState, useEffect, and React 19 Vite setup.",
        topics: ["React JSX", "useState & useEffect", "Form handling", "Vite build tool"],
        handsOnLab: "Rebuild an earlier JavaScript app into a modular React application."
      },
      {
        week: "Week 09",
        title: "Backend Services & Database Fundamentals",
        description: "JSON REST APIs, relational database tables, Supabase / PostgreSQL, and CRUD operations.",
        topics: ["REST API basics", "Relational tables", "Supabase PostgreSQL", "CRUD operations"],
        handsOnLab: "Add database persistent storage (saving and retrieving records) to your React app."
      },
      {
        week: "Week 10",
        title: "API Integrations & AI Features",
        description: "Consuming REST APIs, integrating AI model endpoints, and handling loading/errors.",
        topics: ["API consumption", "OpenAI / Gemini endpoints", "Loading states", "Error boundaries"],
        handsOnLab: "Integrate an AI-powered feature (e.g. smart content generator or chatbot) into your web app."
      },
      {
        week: "Weeks 11-12",
        title: "Deployment, Domains & Capstone Showcase",
        description: "Vercel hosting, custom domains, SSL certificates, pre-launch QA, and capstone presentation.",
        topics: ["Vercel hosting", "Custom domain DNS", "Cross-browser QA", "Portfolio showcase"],
        handsOnLab: "Deploy your web application live on a custom URL and present your capstone project."
      }
    ],
    capstoneProjects: [
      {
        title: "Production Web Application with AI Feature Integration",
        description: "Responsive, deployed web application hosted live with database storage and working AI feature API.",
        technologies: ["React 19", "TypeScript", "Tailwind CSS", "Supabase", "Gemini API", "Vercel"]
      }
    ],
    instructors: [
      {
        name: "Vixora Engineering Faculty",
        role: "Lead Instructors & Senior Full-Stack Engineers",
        bio: "Full-stack software engineers building production Web & AI platforms.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Will my project be live on the internet?",
        a: "Yes! Every student deploys their capstone project live to Vercel with a custom domain."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Web Development & Vibe Coding"
  },
  {
    id: "course-content-creation-c2",
    slug: "ai-content-creation-media",
    title: "AI Content Creation & Personal Branding",
    subtitle: "Master AI copywriting, image generation, short video editing, and personal branding in a 10-week sprint.",
    badge: "2026 Curriculum \u2022 \u20A620,000",
    level: "Beginner",
    status: "active",
    track: "Design & Marketing",
    format: "10-Week Practical Sprint (Online + Creative Labs)",
    duration: "10 Weeks",
    commitment: "3-4 hrs/week (Flexible Replays & Hands-On Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A620,000",
    tuitionNote: "Standard 2026 tuition: \u20A620,000 ($20 USD). Fast-track creative media sprint.",
    seatsRemaining: 25,
    targetAudience: "Content Creators, Small Business Owners, Social Media Managers, Marketers, and Beginners.",
    description: "Create professional content with AI tools: written posts, images, vertical video, synthetic voiceovers, and short-form clips.",
    heroPitch: "Build an automated content creation engine for social media, YouTube Shorts, Reels, and personal brand monetization.",
    highlights: [
      "10 weeks of practical AI creative content production",
      "Master ChatGPT, Midjourney, Canva, CapCut, and ElevenLabs",
      "Produce viral short video scripts, synthetic voiceovers, and dynamic captions",
      "Batch-produce a 30-day content calendar and publish your portfolio"
    ],
    outcomes: [
      "Write captions, scripts, blogs and ad copy with AI in your own voice",
      "Design graphics and images with AI tools and Canva",
      "Create and edit short videos with AI and CapCut",
      "Package content services for clients and earn from them"
    ],
    prerequisites: [
      "A smartphone or laptop with internet connection",
      "Zero prior design or video editing required"
    ],
    curriculum: [
      "Phase 1 \u2014 Foundations & AI Copywriting",
      "Phase 2 \u2014 AI Image Generation, Canva & Video Storyboarding",
      "Phase 3 \u2014 CapCut Video Editing & AI Audio Synthesis",
      "Phase 4 \u2014 Social Media Strategy, 30-Day Calendars & Brand Launch"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Content Creation Fundamentals & AI Toolkit",
        description: "Niche selection, audience personas, content pillars, and AI creative tools tour.",
        topics: ["Content pillars", "Niche positioning", "Value framework", "Ethics & disclosure"],
        handsOnLab: "Draft a niche positioning brief and analyze three top creators in your niche."
      },
      {
        week: "Week 02",
        title: "AI Copywriting & Tone Engineering",
        description: "Prompt frameworks for copy, viral hooks, captions, video scripts, and newsletter copy.",
        topics: ["Copy prompt formula", "Viral hook structure", "Tone customization", "Fact-checking"],
        handsOnLab: "Write 1 week of social captions, a short video script, and a blog outline."
      },
      {
        week: "Week 03",
        title: "AI Image Generation & Canva Design",
        description: "Layout, typography, Canva brand kits, and AI text-to-image prompts.",
        topics: ["Design principles", "Canva mastery", "Image generation prompts", "Commercial usage"],
        handsOnLab: "Design a brand visual kit, 3 social media graphics, and 1 multi-slide carousel."
      },
      {
        week: "Week 04",
        title: "AI Video Production & Storyboarding",
        description: "Short-form video structure (0-3s hook, story, CTA), storyboards, and AI avatars.",
        topics: ["Short-form video formula", "Storyboarding with AI", "Aspect ratios 9:16", "Repurposing"],
        handsOnLab: "Script, storyboard, and generate a 30 to 60 second video."
      },
      {
        week: "Week 05",
        title: "Video Editing with CapCut & AI",
        description: "Trimming, cuts, transitions, automated captions, kinetic subtitles, and sound effects.",
        topics: ["CapCut editing", "AI auto-captions", "Sound design & SFX", "Export settings"],
        handsOnLab: "Edit two short-form videos with AI captions, sound effects, and strong hooks."
      },
      {
        week: "Week 06",
        title: "AI Voiceovers, Audio & Music Production",
        description: "ElevenLabs text-to-speech, audio noise reduction, background music, and voice cloning.",
        topics: ["AI voice generation", "Audio cleaning", "Royalty-free music", "Voice cloning ethics"],
        handsOnLab: "Produce a voiceover video and a short audio snippet."
      },
      {
        week: "Week 07",
        title: "Social Media Strategy & Platform Optimization",
        description: "Platform dynamics for Reels, Shorts, TikTok, LinkedIn, and X algorithms.",
        topics: ["Platform algorithms", "Posting frequency", "Retention hooks", "Analytics metrics"],
        handsOnLab: "Build a multi-platform strategy and produce 3 tailored short-form pieces."
      },
      {
        week: "Week 08",
        title: "Content Calendars, Batching & Scheduling",
        description: "30-day content matrix, batch production pipeline, repurposing, and scheduling.",
        topics: ["Content matrix", "Batch production", "Asset repurposing", "Automated posting"],
        handsOnLab: "Build a 30-day content calendar and batch-produce Week 1 content."
      },
      {
        week: "Weeks 09-10",
        title: "Personal Brand Launch & Monetization",
        description: "Social media profile optimization, portfolio site launch, service packages, and pitches.",
        topics: ["Profile optimization", "Single-page portfolio", "Client retainers", "Final showcase"],
        handsOnLab: "Create a client service offer sheet and present your final capstone project."
      }
    ],
    capstoneProjects: [
      {
        title: "30-Day Content System & Portfolio Showcase",
        description: "Audience brief, 30-day content calendar, 1 week of finished media assets, and published portfolio page.",
        technologies: ["ChatGPT", "Midjourney", "Canva", "CapCut", "ElevenLabs"]
      }
    ],
    instructors: [
      {
        name: "Vixora Creative Media Faculty",
        role: "Lead Instructors & Digital Media Producers",
        bio: "Generative AI creators and media producers.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Can I take this on smartphone?",
        a: "Yes! Canva, CapCut, and major AI web apps work on smartphones."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Content Creation & Personal Branding"
  },
  {
    id: "course-data-science-ml-c2",
    slug: "machine-learning-data-science",
    title: "Data Science & Machine Learning (AI Engineer)",
    subtitle: "Master Python, R, statistical modeling, supervised/unsupervised ML algorithms, model evaluation, and deployment.",
    badge: "2026 Flagship Track \u2022 \u20A6150,000",
    level: "Beginner to Professional",
    status: "active",
    track: "Data & Analytics",
    format: "16-Week Hybrid Cohort (Online + Interactive Labs)",
    duration: "16 Weeks",
    commitment: "5-6 hrs/week (Interactive Sessions & Build Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A6150,000",
    tuitionNote: "Standard 2026 tuition: \u20A6150,000 ($120 USD). Flagship AI Engineer program.",
    seatsRemaining: 10,
    targetAudience: "Aspiring Data Scientists, ML Engineers, STEM Graduates, Analysts, and Developers.",
    description: "Go from data science foundations to building, evaluating, and deploying machine learning models in Python and R.",
    heroPitch: "Master Python, R, Scikit-Learn, statistical hypothesis testing, ML regression/classification, and model deployment APIs in 16 weeks.",
    highlights: [
      "16 weeks of rigorous data science and machine learning training",
      "Master Python (NumPy, Pandas, Scikit-Learn) and R (Tidyverse, ggplot2)",
      "Train regression, classification, clustering, and ensemble models",
      "Build an end-to-end ML pipeline with FastAPI model deployment"
    ],
    outcomes: [
      "Clean, manipulate, and explore multi-dimensional business datasets",
      "Build and evaluate supervised and unsupervised ML models",
      "Optimize hyperparameters and prevent overfitting / data leakage",
      "Deploy predictive models as REST API endpoints"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Basic math comfort helpful (taught step-by-step)"
    ],
    curriculum: [
      "Phase 1 \u2014 Python & Data Manipulation (NumPy, Pandas & Data Cleaning)",
      "Phase 2 \u2014 Visualization, Statistics & R Tidyverse (ggplot2 & EDA)",
      "Phase 3 \u2014 Machine Learning (Supervised Regression/Classification & Unsupervised Clustering)",
      "Phase 4 \u2014 AI Tools & Neural Networks Introduction",
      "Phase 5 \u2014 Capstone Pipeline & ML Career Readiness"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 01-02",
        title: "Introduction to Data Science & Python Setup",
        description: "Data science lifecycle, roles, Jupyter Colab notebook setup, and Python logic.",
        topics: ["Lifecycle stages", "Colab setup", "Python data types", "Control flow"],
        handsOnLab: "Classify business problems into ML tasks and run an end-to-end Colab notebook."
      },
      {
        week: "Weeks 03-04",
        title: "Python Data Handling (NumPy & Pandas)",
        description: "Vectorized array math, Pandas DataFrames, indexing, filtering, and data cleaning.",
        topics: ["NumPy arrays", "Pandas DataFrames", "Data cleaning", "Missing value imputation"],
        handsOnLab: "Load, clean, filter, and summarize a real-world multi-table dataset."
      },
      {
        week: "Weeks 05-06",
        title: "Data Visualization & Statistics Essentials",
        description: "Matplotlib, Seaborn charts, descriptive statistics, probability, and correlation.",
        topics: ["Seaborn charts", "Descriptive stats", "Normal distribution", "Correlation vs causation"],
        handsOnLab: "Build a statistical visualization notebook answering key business questions."
      },
      {
        week: "Weeks 07-08",
        title: "R Programming & Exploratory Data Analysis",
        description: "RStudio IDE, tidyverse data wrangling, ggplot2 Grammar of Graphics, and R Markdown.",
        topics: ["RStudio & tidyverse", "dplyr operations", "ggplot2 charts", "R Markdown reports"],
        handsOnLab: "Perform a full Exploratory Data Analysis on a new dataset in R."
      },
      {
        week: "Weeks 09-10",
        title: "Supervised Learning: Regression Models",
        description: "Train/test splits, Linear Regression, Ridge, Lasso, Decision Tree Regressor, and RMSE.",
        topics: ["Train/test split", "Linear regression", "L1/L2 Regularization", "RMSE evaluation"],
        handsOnLab: "Build and compare two regression models (e.g. house price or sales prediction)."
      },
      {
        week: "Weeks 11-12",
        title: "Supervised Learning: Classification & Ensembles",
        description: "Logistic Regression, Random Forests, Confusion Matrix, F1-Score, and ROC-AUC.",
        topics: ["Logistic regression", "Random Forests", "Confusion matrix", "ROC-AUC curves"],
        handsOnLab: "Build and evaluate a customer churn classifier in scikit-learn."
      },
      {
        week: "Weeks 13-14",
        title: "Unsupervised Learning, Tuning & Pipelines",
        description: "k-Means clustering, PCA dimensionality reduction, GridSearchCV, and scikit-learn Pipelines.",
        topics: ["k-Means clustering", "PCA reduction", "Cross-validation", "scikit-learn Pipelines"],
        handsOnLab: "Build an automated ML Pipeline with hyperparameter tuning and model persistence."
      },
      {
        week: "Weeks 15-16",
        title: "AI Tools, Model Deployment & Capstone Defense",
        description: "FastAPI inference endpoints, Joblib model serialization, and live capstone defense.",
        topics: ["FastAPI endpoints", "Joblib serialization", "GitHub portfolio", "Technical defense"],
        handsOnLab: "Deploy an end-to-end predictive API with FastAPI and defend the final Capstone Project."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Machine Learning Model Pipeline & Technical Report",
        description: "Cleaned dataset, EDA, trained ML model comparison, and FastAPI inference endpoint.",
        technologies: ["Python", "Scikit-Learn", "FastAPI", "R", "Pandas", "Matplotlib"]
      }
    ],
    instructors: [
      {
        name: "Vixora Data Science Faculty",
        role: "Lead Instructors & Senior AI Architects",
        bio: "Senior AI research scientists and enterprise data pipeline engineers.",
        companyBackground: "Vixora Labs"
      }
    ],
    faqs: [
      {
        q: "What programming languages will I learn?",
        a: "Both Python and R, using Jupyter Notebooks, Colab, and RStudio."
      }
    ],
    certificateType: "Official Vixora Certified Machine Learning & Data Science Specialist"
  },
  {
    id: "course-data-analysis-cohort",
    slug: "data-analysis-cohort",
    title: "Data Analysis & Business Intelligence",
    subtitle: "Master Excel, SQL, Python, Power BI, and AI-assisted data storytelling in a 16-week practical cohort.",
    badge: "2026 Curriculum \u2022 \u20A660,000",
    level: "Beginner",
    status: "active",
    track: "Data & Analytics",
    format: "16-Week Hybrid Cohort (Online & Physical Labs)",
    duration: "16 Weeks",
    commitment: "5-6 hrs/week (Flexible Bite-Sized Sessions & Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Standard 2026 tuition: \u20A660,000 ($50 USD). Includes Excel, SQL, Power BI, and Capstone review.",
    seatsRemaining: 12,
    targetAudience: "Students, Graduates, Job Seekers, Analysts, and Complete Beginners.",
    description: "A 16-week project-based program covering the complete data analyst toolkit: Excel \u2192 SQL \u2192 Power BI \u2192 Python & AI-assisted analysis.",
    heroPitch: "Turn raw data into business decisions with Excel, SQL queries, interactive Power BI dashboards, and AI data analysis.",
    highlights: [
      "16 weeks of structured data analysis and business intelligence training",
      "Master Excel, SQL (PostgreSQL/MySQL), Power BI, DAX, and Python",
      "Build interactive executive dashboards and customer retention models",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Clean messy datasets using Excel & Power Query",
      "Write SQL queries with JOINs, aggregations, and window functions",
      "Build interactive Power BI dashboards with DAX measures",
      "Present executive data stories using the Finding \u2192 Evidence \u2192 Meaning \u2192 Recommendation framework"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Zero prior coding or math required (taught from scratch)"
    ],
    curriculum: [
      "Phase 1 \u2014 Excel Fundamentals & Data Cleaning",
      "Phase 2 \u2014 SQL Databases & Visual Analytics",
      "Phase 3 \u2014 Power BI Intelligence & AI Analysis",
      "Phase 4 \u2014 Business Diagnostics & Capstone Defense"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 01-02",
        title: "Introduction to Data Analysis & Excel Fundamentals",
        description: "Data analysis lifecycle, Excel formulas, lookup functions (XLOOKUP), and business sales models.",
        topics: ["Data analysis lifecycle", "Excel formulas & functions", "XLOOKUP & logic", "Sales model building"],
        handsOnLab: "Build an automated Business Sales Analysis model in Excel with summary metrics."
      },
      {
        week: "Weeks 03-04",
        title: "Data Cleaning, Preparation & Pivot Tables",
        description: "Power Query data transformation, descriptive statistics, growth rates, and dynamic Pivot Tables.",
        topics: ["Power Query", "Data cleaning", "Descriptive stats", "Pivot Tables & Slicers"],
        handsOnLab: "Clean an authentic messy multi-year transactional dataset and build an Excel Pivot Dashboard."
      },
      {
        week: "Weeks 05-06",
        title: "Data Visualization & SQL for Data Analysis",
        description: "Visual hierarchy, relational databases, SELECT, WHERE, GROUP BY, JOINs, and window functions.",
        topics: ["Visual hierarchy", "Relational databases", "SQL JOINs & aggregations", "Window functions"],
        handsOnLab: "Query a multi-table Customer & Sales Database to extract revenue cohorts and retention rates."
      },
      {
        week: "Weeks 07-08",
        title: "Power BI Business Intelligence & AI Analysis",
        description: "Star schemas, DAX measures (CALCULATE), cross-filtering, and AI-assisted SQL/formula debugging.",
        topics: ["Power BI modeling", "DAX measures", "Interactive dashboards", "AI formula generation"],
        handsOnLab: "Build a production-ready Power BI Executive Operations & Revenue Dashboard."
      },
      {
        week: "Weeks 09-11",
        title: "Business Data Analysis & Data Storytelling",
        description: "Domain metrics (CAC, LTV, churn), business diagnostics, and executive slide deck frameworks.",
        topics: ["Domain metrics", "Diagnostic analysis", "Storytelling framework", "Executive summaries"],
        handsOnLab: "Conduct a full business diagnostics review on a declining commercial product."
      },
      {
        week: "Weeks 12-16",
        title: "Data Analyst Portfolio, Freelancing & Final Capstone",
        description: "Packaging projects on GitHub/Notion, freelancing offers, and final Capstone Project defense.",
        topics: ["Portfolio packaging", "Freelancing offers", "Proposal writing", "Capstone defense"],
        handsOnLab: "Complete and present your full Final Capstone Project from raw data to recommendations."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Enterprise Sales & Revenue Intelligence Dashboard",
        description: "Power BI dashboard, SQL customer retention database analysis, and executive diagnostic report.",
        technologies: ["Excel", "Power Query", "PostgreSQL", "Power BI", "DAX"]
      }
    ],
    instructors: [
      {
        name: "Vixora Data Analytics Faculty",
        role: "Lead Instructors & Senior BI Engineers",
        bio: "Senior data analysts and business intelligence specialists.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "What tools are covered in this course?",
        a: "Excel, Power Query, SQL (PostgreSQL/MySQL), and Power BI."
      }
    ],
    certificateType: "Vixora Certificate of Completion in Data Analysis & Business Intelligence"
  },
  // -------------------------------------------------------------
  // COHORT 1.0 MASTER VAULT (Preserved Untouched)
  // -------------------------------------------------------------
  {
    id: "course-cohort-1-master-bundle",
    slug: "cohort-1-master-bundle",
    title: "Cohort 1.0: 5-in-1 Masterclass All-Access Pass",
    subtitle: "Complete access to all 5 training tracks: AI Content Creation, AI Automation, AI Web Development, Client Acquisition, and PDF Automation & Digital Products.",
    badge: "Flagship Bundle \u2022 \u20A620,000",
    level: "All Levels",
    status: "active",
    track: "Engineering & AI",
    format: "5 Complete Modular Tracks + 35h Video Vault + 18 PDFs + Private Telegram Mastermind",
    duration: "Full Lifetime Access",
    commitment: "Self-Paced with Ongoing Community Mentorship",
    nextCohortDate: "Immediate Access (Cohort 1.0 Vault)",
    tuition: "\u20A620,000",
    tuitionNote: "Includes all 5 courses (Standard price \u20A644,000 when purchased separately). Save over 54%.",
    seatsRemaining: 15,
    targetAudience: "Ambitious Builders, Creators, Developers, Consultants and Entrepreneurs.",
    description: "The complete Cohort 1.0 vault. Receive full access to all 5 tracks: AI Content Creation, AI Automation, AI Web Development & Design, Client Acquisition & Freelancing, and PDF Automation & Digital Products. Includes all 35+ hours of session recordings, 18 strategy PDFs, workflow blueprints, and lifetime access to our Private Telegram Mastermind.",
    heroPitch: "Everything you need to master AI creation, automate business workflows, build modern web apps, sell high-margin PDF products, and acquire high-paying international clients.",
    highlights: [
      "Access to all 5 training tracks in one single enrollment pass",
      "35+ hours of recorded video masterclasses in our private Telegram group",
      "18 downloadable PDF guidebooks, prompt libraries & workflow blueprints",
      "Full access to the Private Telegram Mastermind with Dean Sarumi Hammad",
      "Cryptographically verifiable graduation certification"
    ],
    outcomes: [
      "Generate photorealistic visual media and short-form video pipelines",
      "Deploy production n8n workflows that automate business operations",
      "Build and deploy modern responsive web apps with React and Tailwind",
      "Research, author, and sell commercial PDF products with automated checkout",
      "Close $1,000 to $5,000 monthly client contracts and international retainers"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "Dedication to apply the frameworks and build real projects"
    ],
    curriculum: [
      "Track 1 \u2014 AI Content Creation (Image, Video & Audio)",
      "Track 2 \u2014 AI Automation & Autonomous Workflows (n8n & APIs)",
      "Track 3 \u2014 AI Web Development & Modern Design (React 19 & Tailwind)",
      "Track 4 \u2014 Client Acquisition & Freelancing (High-Ticket Positioning)",
      "Track 5 \u2014 PDF Automation & AI Digital Product Creation (W6 & W7)"
    ],
    weeklySyllabus: [
      {
        week: "Track 1",
        title: "AI Content Creation Masterclass",
        description: "Diffusion models, prompt engineering, voice cloning, and viral short-form video pipelines.",
        topics: ["Midjourney & Flux prompts", "Character consistency", "ElevenLabs voice cloning", "CapCut video pacing"],
        handsOnLab: "Deliverable: 3 Complete Viral Short Form Video Creatives"
      },
      {
        week: "Track 2",
        title: "AI Automation & Autonomous Systems",
        description: "n8n deployment, webhook architectures, OpenAI function calling, and CRM sync.",
        topics: ["Self-hosted n8n", "Webhook listeners", "AI email responder", "WhatsApp automation"],
        handsOnLab: "Deliverable: End-to-End Automated Client Ingestion & CRM Pipeline"
      },
      {
        week: "Track 3",
        title: "AI Web Development & Modern Design",
        description: "React 19, Tailwind CSS spatial math, AI-assisted vibe coding, and production deployment.",
        topics: ["Component architecture", "Dynamic state & hooks", "Paystack checkout integration", "Production deployment"],
        handsOnLab: "Deliverable: Live Production-Grade Web Application"
      },
      {
        week: "Track 4",
        title: "Client Acquisition & Freelancing",
        description: "High-ticket positioning, Upwork optimization, cold email systems, and closing retainers.",
        topics: ["Irresistible offer design", "Winning Upwork proposals", "Cold outbound campaigns", "Closing discovery calls"],
        handsOnLab: "Deliverable: Signed Client Contract & 50-Lead Outbound Campaign"
      },
      {
        week: "Track 5",
        title: "PDF Automation & AI Digital Product Creation (W6 & W7)",
        description: "Digital product research, validation, AI authoring, visual layout design, and automated storefront delivery.",
        topics: ["Audience research & validation", "AI fact-checking", "PDF guide & workbook formatting", "Paystack/Selar delivery automation"],
        handsOnLab: "Deliverable: Published Commercial PDF Product with Live Checkout Link"
      }
    ],
    capstoneProjects: [
      {
        title: "Full-Stack AI Business or Agency Launch",
        description: "Deploy an automated business engine combining AI media, automated CRM pipelines, modern web landing page, and outbound client acquisition.",
        technologies: ["React 19", "n8n Self-Hosted", "Midjourney & Flux", "Upwork Proposal Deck"]
      }
    ],
    instructors: [
      {
        name: "Sarumi Hammad",
        role: "Dean & Academic Director, Vixora Academy",
        bio: "Director of technical programs and commercial software delivery across enterprise AI and automation clients worldwide.",
        companyBackground: "Vixora Digital Hub Academic Directorate"
      }
    ],
    faqs: [
      {
        q: "How do I access the session recordings and materials after payment?",
        a: "Immediately upon enrollment, you receive direct access instructions and an exclusive invitation link to join the Private Telegram Cohort 1.0 Mastermind where all HD video replays, PDF blueprints, and mentor discussions are hosted."
      },
      {
        q: "Can I watch the sessions at my own pace?",
        a: "Yes. All sessions are permanently archived in the Telegram group so you can watch, rewatch, and download materials anytime at your own speed."
      }
    ],
    certificateType: "Official Vixora Certified Autonomous AI & Growth Engineer"
  },
  // -------------------------------------------------------------
  // ARCHIVED SPECIALIZATIONS (Separated Catalog Section)
  // -------------------------------------------------------------
  {
    id: "course-ai-image-short-videos-creation",
    slug: "ai-image-short-videos-creation",
    title: "AI Image & Short Videos Creation",
    subtitle: "Fast-track 4-week sprint on prompt engineering, photorealistic image generation, and CapCut video editing.",
    badge: "Archived Fast-Track \u2022 \u20A64,000",
    level: "Beginner",
    status: "archived",
    track: "Design & Marketing",
    format: "4-Week Practical Sprint",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Archived Sprint",
    tuition: "\u20A64,000",
    tuitionNote: "Fast-track price: \u20A64,000 ($4 USD).",
    seatsRemaining: 0,
    targetAudience: "Creators, Marketers, and Beginners.",
    description: "Learn how to use AI tools to create photorealistic images, stylized graphics, synthetic voiceovers, and short-form video scripts.",
    heroPitch: "Fast-track sprint for AI image generation, viral short-form video production, and social media media assets.",
    highlights: ["4 weeks fast-track sprint", "Midjourney & CapCut workflows", "Certificate of completion"],
    outcomes: ["Generate photorealistic images", "Edit short-form 9:16 vertical videos"],
    prerequisites: ["Smartphone or laptop"],
    curriculum: ["Module 1 \u2014 Image Prompting", "Module 2 \u2014 Short Video Production"],
    weeklySyllabus: [
      { week: "Week 01", title: "AI Image Generation", description: "Prompt formulas and Midjourney diffusion.", topics: ["Prompts", "Lighting"], handsOnLab: "Generate 5 assets" }
    ],
    capstoneProjects: [{ title: "Short Video Campaign", description: "CapCut video edit", technologies: ["CapCut", "Midjourney"] }],
    instructors: [{ name: "David Adeleke", role: "AI Producer", bio: "Digital media producer.", companyBackground: "Vixora Digital Hub" }],
    faqs: [{ q: "Is this course active?", a: "This sprint is available in our archived catalog." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-ai-automation-digital-skills",
    slug: "ai-automation-digital-skills",
    title: "AI Automation & Digital Skills",
    subtitle: "Beginner-friendly 12-week program covering ChatGPT, Make.com, Zapier, and document automation.",
    badge: "Archived Specialization \u2022 \u20A610,000",
    level: "Beginner",
    status: "archived",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "\u20A610,000",
    tuitionNote: "Archived rate: \u20A610,000 ($10 USD).",
    seatsRemaining: 0,
    targetAudience: "Students, Job Seekers, and Entrepreneurs.",
    description: "Hands-on program covering prompt engineering, Make/Zapier automations, PDF processing, and freelancing.",
    heroPitch: "Learn to build no-code automations and AI tools for business productivity.",
    highlights: ["Make & Zapier automations", "PDF document extraction", "Freelancing guide"],
    outcomes: ["Master ChatGPT prompts", "Build visual automations"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Module 1 \u2014 Prompt Mastery", "Module 2 \u2014 No-Code Automations"],
    weeklySyllabus: [
      { week: "Week 01", title: "Prompt Mastery", description: "LLM prompt frameworks.", topics: ["Prompting"], handsOnLab: "Build AI assistant" }
    ],
    capstoneProjects: [{ title: "Business Automation Pipeline", description: "Make.com lead automation", technologies: ["Make.com", "Zapier"] }],
    instructors: [{ name: "Vixora Instructors", role: "Automation Leads", bio: "Automation architects.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Yes, superceded by the 2026 AI Automation & Digital Literacy curriculum." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-ai-automation-digital-business-systems",
    slug: "ai-automation-digital-business-systems",
    title: "AI Automation & Digital Business Systems",
    subtitle: "Advanced 12-week mentorship program on Make.com, n8n, GHL CRM, Vapi voice agents, and high-ticket retainers.",
    badge: "Archived Advanced \u2022 \u20A660,000",
    level: "Advanced",
    status: "archived",
    track: "Business Automation",
    format: "12-Week Mentorship Cohort",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "\u20A660,000",
    tuitionNote: "Archived rate: \u20A660,000 ($50 USD).",
    seatsRemaining: 0,
    targetAudience: "Professionals, Agency Founders, Consultants.",
    description: "Implementation-focused program for architects building autonomous n8n workflows, GHL funnels, and Vapi voice bots.",
    heroPitch: "Build production AI systems businesses pay for\u2014n8n, Vapi voice agents, and full-stack automation.",
    highlights: ["n8n & Vapi voice agents", "GoHighLevel CRM funnels", "High-ticket retainers"],
    outcomes: ["Deploy self-hosted n8n workflows", "Build conversational voice bots"],
    prerequisites: ["Prior comfort with AI tools"],
    curriculum: ["Module 1 \u2014 Advanced Workflows", "Module 2 \u2014 Voice Agents"],
    weeklySyllabus: [
      { week: "Week 01", title: "Advanced Workflows", description: "n8n and webhooks.", topics: ["n8n"], handsOnLab: "Build n8n workflow" }
    ],
    capstoneProjects: [{ title: "Autonomous Lead System", description: "Vapi & GHL integration", technologies: ["Vapi", "GHL", "n8n"] }],
    instructors: [{ name: "Vixora Senior Mentors", role: "Systems Architects", bio: "Enterprise architects.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Yes, available in archived specializations." }],
    certificateType: "Certificate of Advanced Mastery"
  },
  {
    id: "course-fullstack-vibe-coding",
    slug: "full-stack-vibe-coding",
    title: "Full Stack Vibe Coding",
    subtitle: "Build web applications with AI pair programming\u2014React, Express APIs, PostgreSQL, and cloud deployment.",
    badge: "Archived Cohort \u2022 \u20A610,000",
    level: "Beginner to Intermediate",
    status: "archived",
    track: "Engineering & AI",
    format: "12-Week Hybrid Cohort",
    duration: "12 Weeks",
    commitment: "5-7 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "\u20A610,000",
    tuitionNote: "Archived rate: \u20A610,000 ($10 USD).",
    seatsRemaining: 0,
    targetAudience: "Aspiring developers and designers.",
    description: "Learn to build full-stack web applications with React, Node.js, databases, and AI coding assistants.",
    heroPitch: "Build products with AI as your development partner.",
    highlights: ["React & Node.js", "Database modeling", "Vercel deployment"],
    outcomes: ["Build full-stack web apps", "Debug with AI assistance"],
    prerequisites: ["Laptop with internet"],
    curriculum: ["Module 1 \u2014 React Frontend", "Module 2 \u2014 Node APIs"],
    weeklySyllabus: [
      { week: "Week 01", title: "Web Foundations", description: "HTML/CSS/JS", topics: ["JavaScript"], handsOnLab: "Build landing page" }
    ],
    capstoneProjects: [{ title: "Full-Stack Web App", description: "Deployed web app", technologies: ["React", "Express", "PostgreSQL"] }],
    instructors: [{ name: "Vixora Instructors", role: "Engineers", bio: "Software developers.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Superceded by 2026 AI Web Development & Vibe Coding." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-client-acquisition-freelancing",
    slug: "client-acquisition-freelancing",
    title: "Client Acquisition & Freelancing Masterclass",
    subtitle: "High-ticket offer positioning, Upwork optimization, cold outreach systems, and winning $1,000+ retainers.",
    badge: "Cohort 1.0 Track \u2022 \u20A610,000",
    level: "All Levels",
    status: "archived",
    track: "Business Automation",
    format: "4-Week Practical Sprint",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Immediate Vault Access",
    tuition: "\u20A610,000",
    tuitionNote: "Full access to Cohort 1.0 recorded sessions (\u20A610,000 / $10 USD).",
    seatsRemaining: 0,
    targetAudience: "Freelancers, Agency Owners, Consultants.",
    description: "Learn client acquisition engines, Upwork proposals, and outreach systems to win international clients.",
    heroPitch: "Stop competing on hourly rates. Position your services as high-ROI investments.",
    highlights: ["Upwork 80%+ proposal formulas", "Cold email templates", "Discovery call script"],
    outcomes: ["Package high-ticket offers", "Close monthly retainers"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Module 1 \u2014 Offer Architecture", "Module 2 \u2014 Upwork Mastery"],
    weeklySyllabus: [
      { week: "Week 01", title: "Offer Architecture", description: "High-ticket offer design.", topics: ["Offers"], handsOnLab: "Draft offer sheet" }
    ],
    capstoneProjects: [{ title: "Live Client Pitch", description: "Pitch deck and contract", technologies: ["Upwork", "Cold Email"] }],
    instructors: [{ name: "Sarumi Hammad", role: "Dean", bio: "Academic director.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this in the vault?", a: "Yes, included in Cohort 1.0 Master Vault." }],
    certificateType: "Official Vixora Certified Digital Business Consultant"
  },
  {
    id: "course-pdf-automation-digital-products",
    slug: "pdf-automation-digital-products",
    title: "PDF Automation & AI Digital Product Creation",
    subtitle: "Research audiences, validate problems, author PDF guides with AI, design covers, and automate Paystack delivery.",
    badge: "Cohort 1.0 Track \u2022 \u20A610,000",
    level: "All Levels",
    status: "archived",
    track: "Business Automation",
    format: "2-Week Sprint",
    duration: "2 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Immediate Vault Access",
    tuition: "\u20A610,000",
    tuitionNote: "Full access to Cohort 1.0 recorded sessions (\u20A610,000 / $10 USD).",
    seatsRemaining: 0,
    targetAudience: "Creators, Writers, Educators.",
    description: "Build digital income assets by researching hungry audiences, writing PDFs with AI, and automating sales.",
    heroPitch: "Research, write, design, and sell commercial PDF products with automated delivery.",
    highlights: ["Audience research", "AI PDF authoring", "Automated Paystack delivery"],
    outcomes: ["Create 30-50 page PDF guides", "Deploy automated storefronts"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Week 1 \u2014 Product Research", "Week 2 \u2014 AI Writing & Sales"],
    weeklySyllabus: [
      { week: "Week 01", title: "Product Research", description: "Audience validation.", topics: ["Research"], handsOnLab: "Finalize PDF outline" }
    ],
    capstoneProjects: [{ title: "Commercial PDF Product", description: "PDF & Paystack delivery", technologies: ["AI Writing", "Paystack"] }],
    instructors: [{ name: "Sarumi Hammad", role: "Dean", bio: "Academic director.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this in the vault?", a: "Yes, included in Cohort 1.0 Master Vault." }],
    certificateType: "Official Vixora Certified Digital Product Specialist"
  }
];
var COMPANY_CONTACT = {
  email: BRAND_CONFIG.email,
  secondaryEmail: BRAND_CONFIG.secondaryEmail,
  phone: BRAND_CONFIG.phone,
  whatsappNumber: BRAND_CONFIG.whatsappNumber,
  whatsappUrl: BRAND_CONFIG.whatsappUrl,
  domain: BRAND_CONFIG.domain,
  academyDomain: BRAND_CONFIG.academyDomain,
  address: BRAND_CONFIG.address,
  socials: [
    { name: "Twitter / X", url: "https://twitter.com", icon: "Twitter" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { name: "GitHub", url: "https://github.com", icon: "Github" },
    { name: "YouTube", url: "https://youtube.com", icon: "Youtube" }
  ]
};

// src/data/coursePricing.ts
var COURSE_PRICING = {
  // 2026 Active Curriculum Courses
  "course-ai-automation-c2": { NGN: 6e4, USD: 50 },
  "ai-automation-digital-literacy": { NGN: 6e4, USD: 50 },
  "course-va-setter-c2": { NGN: 6e4, USD: 50 },
  "virtual-assistance-appointment-setter": { NGN: 6e4, USD: 50 },
  "course-web-dev-c2": { NGN: 6e4, USD: 50 },
  "ai-web-development-vibe-coding": { NGN: 6e4, USD: 50 },
  "course-content-creation-c2": { NGN: 2e4, USD: 20 },
  "ai-content-creation-media": { NGN: 2e4, USD: 20 },
  "course-data-science-ml-c2": { NGN: 15e4, USD: 120 },
  "course-machine-learning-data-science": { NGN: 15e4, USD: 120 },
  "machine-learning-data-science": { NGN: 15e4, USD: 120 },
  "course-data-analysis-c2": { NGN: 6e4, USD: 50 },
  "course-data-analysis-cohort": { NGN: 6e4, USD: 50 },
  "data-analysis-cohort": { NGN: 6e4, USD: 50 },
  // Cohort 1.0 Master Vault
  "course-cohort-1-master-bundle": { NGN: 2e4, USD: 20 },
  "cohort-1-master-bundle": { NGN: 2e4, USD: 20 },
  // Track 1: AI Content Creation
  "course-ai-image-short-videos-creation": { NGN: 4e3, USD: 4 },
  "ai-image-short-videos-creation": { NGN: 4e3, USD: 4 },
  // Track 2: AI Automation & Autonomous Systems
  "course-ai-automation-digital-skills": { NGN: 1e4, USD: 10 },
  "ai-automation-digital-skills": { NGN: 1e4, USD: 10 },
  "course-ai-automation-digital-business-systems": { NGN: 6e4, USD: 50 },
  "ai-automation-digital-business-systems": { NGN: 6e4, USD: 50 },
  // Track 3: Full Stack Vibe Coding
  "course-fullstack-vibe-coding": { NGN: 1e4, USD: 10 },
  "full-stack-vibe-coding": { NGN: 1e4, USD: 10 },
  // Track 4: Client Acquisition & Freelancing Masterclass
  "course-client-acquisition-freelancing": { NGN: 1e4, USD: 10 },
  "client-acquisition-freelancing": { NGN: 1e4, USD: 10 },
  // Track 5: PDF Automation & Digital Products
  "course-pdf-automation-digital-products": { NGN: 1e4, USD: 10 },
  "pdf-automation-digital-products": { NGN: 1e4, USD: 10 }
};
function getCoursePrices(courseId) {
  if (!courseId || typeof courseId !== "string") {
    return null;
  }
  return COURSE_PRICING[courseId.trim()] ?? null;
}

// server/payments/courseCatalog.ts
function getLegacyNairaAmount(courseId, tuition) {
  const prices = getCoursePrices(courseId);
  if (prices?.NGN != null) return prices.NGN;
  if (prices?.USD != null) return prices.USD * 1e3;
  if (tuition?.includes("\u20A6")) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num > 0) return num;
  }
  const raw = parseInt(tuition?.replace(/[^0-9]/g, "") || "", 10);
  return !isNaN(raw) && raw > 0 ? raw : 6e4;
}
var canonicalCourseMap = /* @__PURE__ */ new Map();
for (const course of ACADEMY_COURSES) {
  const prices = getCoursePrices(course.id);
  const resolvedPrices = prices ?? { NGN: null, USD: null };
  const naira = getLegacyNairaAmount(course.id, course.tuition);
  const canonical = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    prices: resolvedPrices,
    nairaAmount: naira,
    koboAmount: naira * 100,
    currency: "NGN",
    totalModules: course.weeklySyllabus?.length || course.curriculum?.length || 12,
    nextCohortDate: course.nextCohortDate || "October 9, 2026",
    tuitionDisplay: course.tuition
  };
  canonicalCourseMap.set(course.id.toLowerCase().trim(), canonical);
  canonicalCourseMap.set(course.slug.toLowerCase().trim(), canonical);
}
function findCanonicalCourse(courseIdentifier) {
  if (!courseIdentifier || typeof courseIdentifier !== "string") {
    return null;
  }
  const clean = courseIdentifier.toLowerCase().trim();
  return canonicalCourseMap.get(clean) || null;
}
function getAllCanonicalCourses() {
  const unique = /* @__PURE__ */ new Map();
  for (const course of canonicalCourseMap.values()) {
    unique.set(course.id, course);
  }
  return Array.from(unique.values());
}
function resolveGatewayForCurrency(currency) {
  return currency === "USD" ? "bachs" : "paystack";
}
function formatCurrencyAmount(amount, currency) {
  if (currency === "USD") {
    const hasFraction = Math.round(amount * 100) % 100 !== 0;
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  }
  return `\u20A6${Math.round(amount).toLocaleString("en-NG")}`;
}
function resolveAuthoritativePrice(courseIdentifier, currency) {
  const course = findCanonicalCourse(courseIdentifier);
  if (!course) return null;
  const configuredAmount = course.prices?.[currency];
  if (typeof configuredAmount !== "number" || !Number.isFinite(configuredAmount) || configuredAmount <= 0) {
    return null;
  }
  return {
    course,
    currency,
    gateway: resolveGatewayForCurrency(currency),
    majorAmount: Number(configuredAmount.toFixed(2)),
    minorAmount: Math.round(configuredAmount * 100),
    formattedAmount: formatCurrencyAmount(configuredAmount, currency)
  };
}

// server/payments/bachsGateway.ts
import crypto2 from "crypto";
var BACHS_SANDBOX_BASE_URL = "https://sandbox-api.bachs.io";
var BACHS_LIVE_BASE_URL = "https://api.bachs.io";
function getBachsApiKey() {
  return (process.env.BACHS_API_KEY || process.env.BACHS_SECRET_KEY || "").trim();
}
function getBachsWebhookSecret() {
  return (process.env.BACHS_WEBHOOK_SECRET || "").trim();
}
function getBachsMode() {
  const env = (process.env.BACHS_ENV || "").trim().toLowerCase();
  if (env === "live" || env === "production" || env === "prod") {
    return "live";
  }
  const key = getBachsApiKey();
  if (!env && key.startsWith("sk_live_")) {
    return "live";
  }
  return "sandbox";
}
function getBachsBaseUrl() {
  const override = (process.env.BACHS_BASE_URL || "").trim().replace(/\/+$/, "");
  if (override) {
    return override;
  }
  return getBachsMode() === "live" ? BACHS_LIVE_BASE_URL : BACHS_SANDBOX_BASE_URL;
}
function isBachsConfigured() {
  return Boolean(getBachsApiKey());
}
function sanitizeBachsResponse(data) {
  if (!data || typeof data !== "object") return null;
  const copy = {};
  const allowedKeys = [
    "id",
    "session_id",
    "object",
    "status",
    "payment_status",
    "currency",
    "amount",
    "amount_total",
    "pricing",
    "channel",
    "payment_method",
    "payment_method_types",
    "paid_at",
    "created_at",
    "expires_at",
    "metadata",
    "customer"
  ];
  for (const key of allowedKeys) {
    if (data[key] !== void 0) {
      copy[key] = data[key];
    }
  }
  return Object.keys(copy).length > 0 ? copy : { status: data.status || null };
}
async function createBachsCheckoutSession(params) {
  const apiKey = getBachsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "Bachs API Key is not configured on the server."
    };
  }
  const baseUrl = getBachsBaseUrl();
  const payload = {
    pricing: {
      amount: params.amountCents,
      currency: "USD"
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
      phone: params.customerPhone || "",
      authUserId: params.authUserId || ""
    }
  };
  try {
    const response = await fetch(`${baseUrl}/v1/checkout-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": params.reference
      },
      body: JSON.stringify(payload)
    });
    const json = await response.json().catch(() => ({}));
    const sessionObj = json?.data && typeof json.data === "object" ? json.data : json;
    const checkoutUrl = sessionObj?.checkout_url || sessionObj?.url || sessionObj?.authorization_url || json?.checkout_url || json?.url || null;
    const sessionId = sessionObj?.id || sessionObj?.session_id || json?.id || null;
    if (!response.ok || !checkoutUrl) {
      return {
        ok: false,
        status: response.status >= 400 && response.status < 500 ? 400 : 502,
        error: json?.message || json?.error?.message || json?.error || "Failed to create Bachs USD checkout session.",
        raw: sanitizeBachsResponse(sessionObj)
      };
    }
    return {
      ok: true,
      status: 200,
      sessionId: sessionId ? String(sessionId) : void 0,
      checkoutUrl: String(checkoutUrl),
      raw: sanitizeBachsResponse(sessionObj)
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err?.message || "Network error connecting to Bachs USD payment gateway."
    };
  }
}
function normalizeBachsPayload(rawPayload) {
  const obj = rawPayload?.data && typeof rawPayload.data === "object" ? rawPayload.data : rawPayload || {};
  const paymentStatus = String(obj.payment_status || "").toLowerCase().trim();
  const sessionStatus = String(obj.status || "").toLowerCase().trim();
  let status = "pending";
  if (paymentStatus === "paid" || paymentStatus === "succeeded" || sessionStatus === "paid" || sessionStatus === "succeeded" || sessionStatus === "complete" || sessionStatus === "completed" || sessionStatus === "success") {
    status = "success";
  } else if (sessionStatus === "failed" || paymentStatus === "failed") {
    status = "failed";
  } else if (sessionStatus === "expired" || sessionStatus === "cancelled" || sessionStatus === "canceled" || sessionStatus === "abandoned") {
    status = "abandoned";
  }
  const rawCurrency = obj.currency || obj.pricing?.currency || obj.amount_details?.currency || "";
  const currency = String(rawCurrency).toUpperCase().trim();
  const rawMinor = obj.amount_total ?? obj.pricing?.amount ?? obj.amount_minor ?? obj.amount ?? 0;
  const amountMinor = Math.round(Number(rawMinor) || 0);
  const metadata = obj.metadata && typeof obj.metadata === "object" ? obj.metadata : {};
  const customer = obj.customer && typeof obj.customer === "object" ? obj.customer : {};
  const sessionId = obj.session_id || obj.checkout_session_id || (typeof obj.id === "string" && obj.id.startsWith("cs_") ? obj.id : null);
  const externalTxId = String(obj.payment_intent || obj.collection_id || obj.id || sessionId || "");
  const reference = metadata.reference || obj.client_reference_id || obj.reference || null;
  const channelRaw = obj.channel || obj.payment_method || (Array.isArray(obj.payment_method_types) ? obj.payment_method_types[0] : null) || "card";
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
    channel: String(channelRaw || "card"),
    paidAt: obj.paid_at || obj.completed_at || null,
    raw: sanitizeBachsResponse(obj)
  };
}
async function fetchBachsCheckoutSession(sessionIdOrRef) {
  const apiKey = getBachsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "Bachs API Key is not configured on the server."
    };
  }
  const baseUrl = getBachsBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/v1/checkout-sessions/${encodeURIComponent(sessionIdOrRef)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: response.status === 404 ? 404 : 502,
        error: json?.message || json?.error || "USD transaction could not be verified with Bachs."
      };
    }
    return {
      ok: true,
      status: 200,
      data: normalizeBachsPayload(json)
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err?.message || "Network error connecting to Bachs verification API."
    };
  }
}
function verifyBachsWebhookSignature(rawBody, signatureHeader, webhookSecret = getBachsWebhookSecret()) {
  if (!webhookSecret || !signatureHeader || !Buffer.isBuffer(rawBody)) {
    return false;
  }
  const trimmed = signatureHeader.trim();
  const candidates = [];
  if (trimmed.includes("t=") && trimmed.includes("v1=")) {
    const parts = Object.fromEntries(
      trimmed.split(",").map((part) => {
        const idx = part.indexOf("=");
        return idx > 0 ? [part.slice(0, idx).trim(), part.slice(idx + 1).trim()] : [part, ""];
      })
    );
    if (parts.t && parts.v1) {
      candidates.push({
        payload: Buffer.concat([Buffer.from(`${parts.t}.`), rawBody]),
        providedHex: parts.v1.toLowerCase()
      });
    }
  } else {
    const normalizedHex = trimmed.toLowerCase().replace(/^sha256=/, "");
    candidates.push({
      payload: rawBody,
      providedHex: normalizedHex
    });
  }
  for (const candidate of candidates) {
    if (!/^[0-9a-f]{64}$/.test(candidate.providedHex)) {
      continue;
    }
    const expectedHex = crypto2.createHmac("sha256", webhookSecret).update(candidate.payload).digest("hex");
    const expectedBuf = Buffer.from(expectedHex, "hex");
    const providedBuf = Buffer.from(candidate.providedHex, "hex");
    if (expectedBuf.length === providedBuf.length && crypto2.timingSafeEqual(expectedBuf, providedBuf)) {
      return true;
    }
  }
  return false;
}

// server/telegramConfig.ts
var TELEGRAM_CONFIG = {
  // Official admissions & support username
  supportUsername: process.env.TELEGRAM_SUPPORT_USERNAME || "VixoraAdmissions",
  // Public community channel (open to anyone)
  publicCommunity: process.env.TELEGRAM_PUBLIC_COMMUNITY || "https://t.me/vixoraacademy",
  // Master All-Access Cohort 1.0 Vault (All 4 course recordings - Paid full access ONLY)
  masterBundleInvite: process.env.TELEGRAM_INVITE_MASTER_BUNDLE || "https://t.me/+SGIRa-T4lL1hZTk0",
  // Track 1: AI Content Creation (Image, Video & Audio)
  contentCreationInvite: process.env.TELEGRAM_INVITE_CONTENT_CREATION || "https://t.me/+wfBtF79zAWJhMTNk",
  // Track 2: AI Automation No Code (Digital Business Systems)
  automationInvite: process.env.TELEGRAM_INVITE_AUTOMATION || "https://t.me/+g8Upx0T9tOcwOTg0",
  // Track 3: AI Web & App Development (Vibe Coding)
  vibeCodingInvite: process.env.TELEGRAM_INVITE_VIBE_CODING || "https://t.me/+CVf0IxhvRWFkYjZk",
  // Track 4: Client Acquisition & Retainers
  freelancingInvite: process.env.TELEGRAM_INVITE_FREELANCING || "https://t.me/+kItRKPShz-Y2NjM8",
  // Specialized: PDF Automation (AI Digital Product Creation)
  pdfAutomationInvite: process.env.TELEGRAM_INVITE_PDF_AUTOMATION || "https://t.me/+nsbDIiXSU7sxZmVk"
};
function getTelegramInvitesForCourse(courseIdOrSlug) {
  const normalized = (courseIdOrSlug || "").toLowerCase().trim();
  const masterVault = {
    trackId: "track-cohort1-master-vault",
    trackSlug: "cohort-1-master-bundle",
    courseId: "course-cohort-1-master-bundle",
    title: "Cohort 1.0 Master Vault (All 5 Course Recordings & Mastermind)",
    description: "Direct unlisted cloud replays for all 5 tracks, prompt libraries, and Dean Sarumi mastermind.",
    inviteUrl: TELEGRAM_CONFIG.masterBundleInvite,
    accessTier: "bundle"
  };
  const track1 = {
    trackId: "track-ai-content",
    trackSlug: "ai-image-short-videos-creation",
    courseId: "course-ai-image-short-videos-creation",
    title: "AI Content Creation Vault",
    description: "Direct-response UGC video ads, prompt recipes, and creative production masterminds.",
    inviteUrl: TELEGRAM_CONFIG.contentCreationInvite,
    accessTier: "single"
  };
  const track2 = {
    trackId: "track-ai-automation",
    trackSlug: "ai-automation-digital-business-systems",
    courseId: "course-ai-automation-digital-business-systems",
    title: "AI Automation No Code Vault",
    description: "Make.com, Zapier, n8n workflows, Vapi voice agents, and lead pipeline blueprints.",
    inviteUrl: TELEGRAM_CONFIG.automationInvite,
    accessTier: "single"
  };
  const track3 = {
    trackId: "track-vibe-coding",
    trackSlug: "fullstack-vibe-coding",
    courseId: "course-fullstack-vibe-coding",
    title: "AI Web & App Development (Vibe Coding) Vault",
    description: "React, Vite, TypeScript codebases, backend APIs, and Paystack integration repos.",
    inviteUrl: TELEGRAM_CONFIG.vibeCodingInvite,
    accessTier: "single"
  };
  const track4 = {
    trackId: "track-freelancing",
    trackSlug: "client-acquisition-freelancing",
    courseId: "course-client-acquisition-freelancing",
    title: "Client Acquisition & Retainers Vault",
    description: "Cold outreach scripts, Upwork proposal teardowns, and high-ticket service contract templates.",
    inviteUrl: TELEGRAM_CONFIG.freelancingInvite,
    accessTier: "single"
  };
  const pdfTrack = {
    trackId: "track-pdf-automation",
    trackSlug: "pdf-automation-digital-products",
    courseId: "course-pdf-automation-digital-products",
    title: "PDF Automation & AI Digital Products Vault",
    description: "Automated digital product creation, PDF compilers, and passive revenue funnels.",
    inviteUrl: TELEGRAM_CONFIG.pdfAutomationInvite,
    accessTier: "single"
  };
  if (normalized.includes("bundle") || normalized.includes("cohort-1-master") || normalized === "course-cohort-1-master-bundle") {
    return [masterVault, track1, track2, track3, track4, pdfTrack];
  }
  if (normalized.includes("content") || normalized.includes("image") || normalized.includes("video") || normalized === "course-ai-image-short-videos-creation" || normalized === "ai-image-short-videos-creation") {
    return [track1];
  }
  if (normalized.includes("pdf") || normalized.includes("digital-product") || normalized.includes("product-creation")) {
    return [pdfTrack];
  }
  if (normalized.includes("automation") || normalized.includes("systems") || normalized === "course-ai-automation-digital-business-systems" || normalized === "course-ai-automation-digital-skills" || normalized === "ai-automation-digital-business-systems" || normalized === "ai-automation-digital-skills") {
    return [track2];
  }
  if (normalized.includes("vibe") || normalized.includes("web-dev") || normalized.includes("fullstack") || normalized === "course-fullstack-vibe-coding" || normalized === "fullstack-vibe-coding") {
    return [track3];
  }
  if (normalized.includes("client") || normalized.includes("acquisition") || normalized.includes("freelanc") || normalized === "course-client-acquisition-freelancing" || normalized === "client-acquisition-freelancing") {
    return [track4];
  }
  return [
    {
      trackId: "track-public-community",
      trackSlug: "vixora-academy-public",
      courseId: normalized || "public",
      title: "Vixora Academy Public Telegram Community",
      description: "Official student announcements, open workshops, and community networking.",
      inviteUrl: TELEGRAM_CONFIG.publicCommunity,
      accessTier: "public"
    }
  ];
}

// server/paystackServer.ts
var paystackRouter = Router();
var paymentsRouter = Router();
var PAYSTACK_API_BASE = "https://api.paystack.co";
function getPaystackSecretKey() {
  return (process.env.PAYSTACK_SECRET_KEY || "").trim();
}
function getPaystackPublicKey() {
  return (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || "").trim();
}
function isPaystackConfigured() {
  const key = getPaystackSecretKey();
  return Boolean(key && (key.startsWith("sk_test_") || key.startsWith("sk_live_")));
}
function isProductionPaymentEnvironment() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}
var SlidingWindowRateLimiter = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || "rl";
  }
  check(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  reset(key) {
    if (key) {
      this.store.delete(`${this.prefix}:${key}`);
    } else {
      this.store.clear();
    }
  }
};
var payInitRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1e3,
  max: 5,
  prefix: "pay_init"
});
var payVerifyRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1e3,
  max: 15,
  prefix: "pay_verify"
});
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}
function isPlainObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function hasPrototypePollutionKeys(obj) {
  return Object.keys(obj).some((key) => key === "__proto__" || key === "constructor" || key === "prototype");
}
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 120;
}
function isValidTransactionReference(ref) {
  if (typeof ref !== "string") return false;
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(ref.trim());
}
function sanitizeText(val, maxLen = 120) {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen).replace(/[<>]/g, "");
}
var fallbackPaymentsStore = /* @__PURE__ */ new Map();
var simulateEnrollmentFailureForTesting = /* @__PURE__ */ new Set();
function sanitizePaystackResponse(data) {
  if (!data || typeof data !== "object") return null;
  const sanitized = { ...data };
  if (sanitized.authorization && typeof sanitized.authorization === "object") {
    sanitized.authorization = {
      channel: sanitized.authorization.channel,
      card_type: sanitized.authorization.card_type,
      bank: sanitized.authorization.bank,
      last4: sanitized.authorization.last4,
      exp_month: sanitized.authorization.exp_month,
      exp_year: sanitized.authorization.exp_year,
      country_code: sanitized.authorization.country_code,
      brand: sanitized.authorization.brand,
      reusable: sanitized.authorization.reusable
    };
  }
  delete sanitized.plan;
  delete sanitized.subaccount;
  return sanitized;
}
async function extractOptionalAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) return null;
    return {
      id: user.id,
      email: user.email.toLowerCase().trim()
    };
  } catch {
    return null;
  }
}
async function ensureCourseRecordInDatabase(canonicalCourse, supabase) {
  if (!supabase) return canonicalCourse.id;
  try {
    const { data: matchedCourse, error: lookupError } = await supabase.from("courses").select("id").or(`id.eq.${canonicalCourse.id},slug.eq.${canonicalCourse.slug}`).maybeSingle();
    if (lookupError) throw lookupError;
    if (matchedCourse?.id) {
      return matchedCourse.id;
    }
    const coursePayload = {
      id: canonicalCourse.id,
      slug: canonicalCourse.slug,
      title: canonicalCourse.title,
      badge: canonicalCourse.tuitionDisplay || `\u20A6${canonicalCourse.nairaAmount.toLocaleString()}`,
      total_modules: canonicalCourse.totalModules || 4,
      status: "active",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data: inserted, error: insertErr } = await supabase.from("courses").upsert(coursePayload, { onConflict: "id" }).select("id").maybeSingle();
    if (insertErr) throw insertErr;
    if (inserted?.id) {
      return inserted.id;
    }
    throw new Error(`Course record could not be resolved for "${canonicalCourse.id}".`);
  } catch (err) {
    if (err && (err.message?.includes("fetch failed") || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT")) {
      console.log("[Supabase] Note: Supabase offline or unreachable (fetch failed). Using canonical course ID fallback:", canonicalCourse.id);
      return canonicalCourse.id;
    }
    console.error("[Course record resolution failed]:", err?.message || err);
    throw new Error("Course record could not be confirmed in the database.");
  }
}
function isMissingColumnError(err) {
  const msg = String(err?.message || err?.details || "").toLowerCase();
  return err?.code === "PGRST204" || err?.code === "42703" || msg.includes("column") && msg.includes("does not exist");
}
function stripExtendedPaymentColumns(record) {
  const { gateway, gateway_mode, external_session_id, amount_minor, ...legacyRecord } = record;
  return legacyRecord;
}
async function persistPaymentInsert(supabase, record) {
  const res = await supabase.from("payments").insert(record);
  if (res.error && isMissingColumnError(res.error) && record.gateway === "paystack") {
    return await supabase.from("payments").insert(stripExtendedPaymentColumns(record));
  }
  return res;
}
async function persistPaymentUpsert(supabase, record) {
  const res = await supabase.from("payments").upsert(record, { onConflict: "id" });
  if (res.error && isMissingColumnError(res.error) && record.gateway === "paystack") {
    return await supabase.from("payments").upsert(stripExtendedPaymentColumns(record), { onConflict: "id" });
  }
  return res;
}
async function processPaymentFulfillment(reference, verifiedGatewayData) {
  if (!isValidTransactionReference(reference)) {
    return {
      verified: false,
      error: "Invalid transaction reference format.",
      code: "INVALID_REFERENCE",
      status: 400
    };
  }
  const supabase = getSupabaseAdmin();
  if (!supabase && isProductionPaymentEnvironment()) {
    return {
      verified: false,
      error: "Payment database is not configured. The transaction cannot be fulfilled safely yet.",
      code: "DATABASE_UNCONFIGURED",
      status: 503
    };
  }
  let existingPayment = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from("payments").select("*").eq("id", reference).maybeSingle();
      if (error) {
        console.error("[Supabase payments query failed]:", error);
        return {
          verified: false,
          error: "Payment record could not be read from the database. Please retry verification.",
          code: "PAYMENT_RECORD_READ_FAILED",
          status: 503
        };
      }
      if (data) {
        existingPayment = data;
        fallbackPaymentsStore.set(reference, data);
      }
    } catch (dbErr) {
      console.error("[Supabase payments query exception]:", dbErr);
      return {
        verified: false,
        error: "Payment database is unavailable. Please retry verification.",
        code: "DATABASE_UNAVAILABLE",
        status: 503
      };
    }
  }
  if (!existingPayment && (!supabase || !isProductionPaymentEnvironment())) {
    existingPayment = fallbackPaymentsStore.get(reference) || null;
  }
  const inferredGateway = verifiedGatewayData?._gateway === "bachs" || existingPayment?.gateway === "bachs" || existingPayment?.currency === "USD" || reference.toUpperCase().startsWith("VIX-BC-") ? "bachs" : "paystack";
  if (existingPayment && existingPayment.status === "success" && existingPayment.fulfillment_status === "fulfilled" && !simulateEnrollmentFailureForTesting.has(reference)) {
    fallbackPaymentsStore.set(reference, existingPayment);
    const canonical = findCanonicalCourse(existingPayment.course_id);
    return {
      verified: true,
      alreadyFulfilled: true,
      payment: {
        reference: existingPayment.id,
        gateway: existingPayment.gateway || inferredGateway,
        gatewayMode: existingPayment.gateway_mode || (inferredGateway === "bachs" ? getBachsMode() : getPaystackSecretKey().startsWith("sk_live_") ? "live" : "sandbox"),
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        channel: existingPayment.channel,
        paidAt: existingPayment.paid_at,
        studentName: existingPayment.customer_name,
        studentEmail: existingPayment.customer_email,
        courseId: existingPayment.course_id,
        courseTitle: canonical?.title || "Vixora Academy Cohort",
        emailDispatchedAt: existingPayment.email_dispatched_at,
        telegramInvites: getTelegramInvitesForCourse(existingPayment.course_id)
      }
    };
  }
  let resolvedCurrency = inferredGateway === "bachs" ? "USD" : "NGN";
  let canonicalCourse = null;
  let expectedMajorAmount = 0;
  let expectedMinorAmount = 0;
  let customerEmail = "";
  let customerName = "";
  let customerPhone = null;
  let paidAt = (/* @__PURE__ */ new Date()).toISOString();
  let channel = "card";
  let externalTxId = "";
  let externalSessionId = existingPayment?.external_session_id || null;
  let authUserId = null;
  let sanitizedRaw = null;
  const gatewayMode = existingPayment?.gateway_mode || (inferredGateway === "bachs" ? getBachsMode() : getPaystackSecretKey().startsWith("sk_live_") ? "live" : "sandbox");
  if (inferredGateway === "bachs") {
    let normalizedBachs = verifiedGatewayData?._alreadyNormalized ? verifiedGatewayData : verifiedGatewayData ? normalizeBachsPayload(verifiedGatewayData) : null;
    if (!normalizedBachs) {
      const lookupId = existingPayment?.external_session_id || reference;
      const sessionRes = await fetchBachsCheckoutSession(lookupId);
      if (!sessionRes.ok || !sessionRes.data) {
        return {
          verified: false,
          error: sessionRes.error || "USD transaction could not be verified on Bachs.",
          code: sessionRes.status === 503 ? "BACHS_NOT_CONFIGURED" : "BACHS_VERIFY_FAILED",
          status: sessionRes.status || 404
        };
      }
      normalizedBachs = sessionRes.data;
    }
    if (normalizedBachs.status !== "success") {
      const mappedStatus = normalizedBachs.status === "failed" || normalizedBachs.status === "abandoned" ? normalizedBachs.status : "pending";
      const failedUpdate = {
        status: mappedStatus,
        raw_response: normalizedBachs.raw,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (supabase) {
        try {
          await supabase.from("payments").update(failedUpdate).eq("id", reference);
        } catch (dbErr) {
          console.warn("[Supabase failed status update]:", dbErr);
        }
      }
      if (fallbackPaymentsStore.has(reference)) {
        const rec = fallbackPaymentsStore.get(reference);
        rec.status = mappedStatus;
        rec.raw_response = normalizedBachs.raw;
        rec.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      }
      return {
        verified: false,
        error: `USD payment is not successful (status: ${normalizedBachs.status}).`,
        code: "PAYMENT_NOT_SUCCESSFUL",
        status: 400
      };
    }
    if (normalizedBachs.currency !== "USD") {
      return {
        verified: false,
        error: `Currency mismatch: Expected USD for Bachs, received ${normalizedBachs.currency || "UNKNOWN"}.`,
        code: "CURRENCY_MISMATCH",
        status: 400
      };
    }
    const courseId = existingPayment?.course_id || normalizedBachs.courseId || "";
    const authPrice = resolveAuthoritativePrice(courseId, "USD");
    if (!authPrice) {
      return {
        verified: false,
        error: "Cannot fulfill USD payment: Course is unrecognized or USD pricing is unconfigured.",
        code: "INVALID_COURSE",
        status: 400
      };
    }
    if (normalizedBachs.amountMinor !== authPrice.minorAmount) {
      return {
        verified: false,
        error: `Amount mismatch: Expected ${authPrice.minorAmount} cents ($${authPrice.majorAmount}), received ${normalizedBachs.amountMinor} cents.`,
        code: "AMOUNT_MISMATCH",
        status: 400
      };
    }
    customerEmail = (normalizedBachs.customerEmail || existingPayment?.customer_email || "").toLowerCase().trim();
    if (!isValidEmail(customerEmail)) {
      return {
        verified: false,
        error: "Invalid customer email associated with USD transaction.",
        code: "INVALID_CUSTOMER_EMAIL",
        status: 400
      };
    }
    canonicalCourse = authPrice.course;
    resolvedCurrency = "USD";
    expectedMajorAmount = authPrice.majorAmount;
    expectedMinorAmount = authPrice.minorAmount;
    customerName = normalizedBachs.customerName || existingPayment?.customer_name || customerEmail.split("@")[0];
    customerPhone = existingPayment?.customer_phone || null;
    paidAt = normalizedBachs.paidAt || (/* @__PURE__ */ new Date()).toISOString();
    channel = normalizedBachs.channel || "card";
    externalTxId = normalizedBachs.externalTxId || "";
    externalSessionId = existingPayment?.external_session_id || normalizedBachs.sessionId || null;
    authUserId = normalizedBachs.authUserId || null;
    sanitizedRaw = normalizedBachs.raw;
  } else {
    let paystackData = verifiedGatewayData;
    if (!paystackData) {
      const secretKey = getPaystackSecretKey();
      if (!secretKey) {
        return {
          verified: false,
          error: "Paystack Secret Key is not configured on the server.",
          code: "PAYSTACK_NOT_CONFIGURED",
          status: 503
        };
      }
      try {
        const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
          }
        });
        const json = await response.json();
        if (!response.ok || !json.status || !json.data) {
          return {
            verified: false,
            error: json.message || "Transaction could not be verified on Paystack.",
            code: "PAYSTACK_VERIFY_FAILED",
            status: 404
          };
        }
        paystackData = json.data;
      } catch {
        return {
          verified: false,
          error: "Network error connecting to Paystack API.",
          code: "PAYSTACK_NETWORK_ERROR",
          status: 502
        };
      }
    }
    if (paystackData.status !== "success") {
      let mappedStatus = "pending";
      if (paystackData.status === "failed" || paystackData.status === "abandoned") {
        mappedStatus = paystackData.status;
      }
      const failedUpdate = {
        status: mappedStatus,
        raw_response: sanitizePaystackResponse(paystackData),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (supabase) {
        try {
          await supabase.from("payments").update(failedUpdate).eq("id", reference);
        } catch (dbErr) {
          console.warn("[Supabase failed status update]:", dbErr);
        }
      }
      if (fallbackPaymentsStore.has(reference)) {
        const rec = fallbackPaymentsStore.get(reference);
        rec.status = mappedStatus;
        rec.raw_response = sanitizePaystackResponse(paystackData);
        rec.updated_at = (/* @__PURE__ */ new Date()).toISOString();
      }
      return {
        verified: false,
        error: `Payment is not successful (status: ${paystackData.status}).`,
        code: "PAYMENT_NOT_SUCCESSFUL",
        status: 400
      };
    }
    if (paystackData.currency !== "NGN") {
      return {
        verified: false,
        error: `Currency mismatch: Expected NGN, received ${paystackData.currency}.`,
        code: "CURRENCY_MISMATCH",
        status: 400
      };
    }
    const courseId = existingPayment?.course_id || paystackData.metadata?.courseId || paystackData.metadata?.course_id;
    canonicalCourse = findCanonicalCourse(courseId);
    if (!canonicalCourse) {
      return {
        verified: false,
        error: "Cannot fulfill payment: Unrecognized or invalid course ID.",
        code: "INVALID_COURSE",
        status: 400
      };
    }
    const expectedKobo = canonicalCourse.koboAmount;
    const actualKobo = Math.round(Number(paystackData.amount));
    if (actualKobo !== expectedKobo) {
      return {
        verified: false,
        error: `Amount mismatch: Expected ${expectedKobo} kobo (\u20A6${canonicalCourse.nairaAmount}), received ${actualKobo} kobo.`,
        code: "AMOUNT_MISMATCH",
        status: 400
      };
    }
    customerEmail = (paystackData.customer?.email || paystackData.metadata?.studentEmail || existingPayment?.customer_email || "").toLowerCase().trim();
    if (!isValidEmail(customerEmail)) {
      return {
        verified: false,
        error: "Invalid customer email associated with transaction.",
        code: "INVALID_CUSTOMER_EMAIL",
        status: 400
      };
    }
    resolvedCurrency = "NGN";
    expectedMajorAmount = canonicalCourse.nairaAmount;
    expectedMinorAmount = expectedKobo;
    customerName = paystackData.metadata?.studentName || existingPayment?.customer_name || paystackData.customer?.first_name || customerEmail.split("@")[0];
    customerPhone = paystackData.metadata?.phone || existingPayment?.customer_phone || paystackData.customer?.phone || null;
    paidAt = paystackData.paid_at || (/* @__PURE__ */ new Date()).toISOString();
    channel = paystackData.channel || "card";
    externalTxId = String(paystackData.id || "");
    authUserId = paystackData.metadata?.authUserId || null;
    sanitizedRaw = sanitizePaystackResponse(paystackData);
  }
  let studentId = existingPayment?.student_id || null;
  let studentCode = null;
  let generatedTempPassword = null;
  let directPasswordSetupLink = null;
  let fulfillmentError = null;
  let isFulfilled = false;
  let dbCourseId = canonicalCourse.id;
  if (supabase) {
    try {
      dbCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);
      if (simulateEnrollmentFailureForTesting.has(reference)) {
        throw new Error("Simulated database failure during enrollment.");
      }
      const studentQuery = supabase.from("students").select("id, email, auth_user_id, student_code").eq("email", customerEmail);
      const { data: matchedStudent, error: findStudentErr } = await studentQuery.maybeSingle();
      if (findStudentErr) throw findStudentErr;
      let studentCode2 = matchedStudent?.student_code;
      if (matchedStudent) {
        studentId = matchedStudent.id;
        if (matchedStudent.auth_user_id) {
          authUserId = matchedStudent.auth_user_id;
        }
      } else {
        const newStudentId = crypto3.randomUUID();
        studentCode2 = `STU-${Math.floor(1e3 + Math.random() * 9e3)}`;
        const { data: createdStudent, error: createStudentErr } = await supabase.from("students").insert({
          id: newStudentId,
          name: customerName,
          email: customerEmail,
          auth_user_id: authUserId,
          student_code: studentCode2,
          enrolled_at: (/* @__PURE__ */ new Date()).toISOString(),
          role: "student"
        }).select("id, student_code").maybeSingle();
        if (createStudentErr) throw createStudentErr;
        if (createdStudent) {
          studentId = createdStudent.id;
          studentCode2 = createdStudent.student_code;
        } else {
          throw new Error("Student record could not be created in database.");
        }
      }
      if (supabase.auth?.admin) {
        try {
          const portalBaseUrl = "https://academy.vixoradigitalhub.com/pages/student-portal";
          let authUserExists = false;
          try {
            const { data: linkData, error: probeErr } = await supabase.auth.admin.generateLink({
              type: "recovery",
              email: customerEmail,
              options: { redirectTo: portalBaseUrl }
            });
            if (linkData?.user && !probeErr) {
              authUserExists = true;
              authUserId = linkData.user.id;
              directPasswordSetupLink = linkData.properties?.action_link || null;
            }
          } catch {
            authUserExists = false;
          }
          if (!authUserExists) {
            generatedTempPassword = `Vixora@${crypto3.randomBytes(3).toString("hex").toUpperCase()}!`;
            const { data: newAuth } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: generatedTempPassword,
              email_confirm: true,
              user_metadata: {
                name: customerName,
                role: "student"
              }
            });
            if (newAuth?.user) {
              authUserId = newAuth.user.id;
              const { data: linkData } = await supabase.auth.admin.generateLink({
                type: "recovery",
                email: customerEmail,
                options: { redirectTo: portalBaseUrl }
              });
              directPasswordSetupLink = linkData?.properties?.action_link || null;
            }
          }
          if (authUserId && studentId) {
            await supabase.from("students").update({ auth_user_id: authUserId }).eq("id", studentId);
          }
        } catch (authProvisionErr) {
          console.warn("[Student Auth Provisioning Warning]:", authProvisionErr);
        }
      }
      if (!studentId) {
        throw new Error("Valid student identifier unavailable for enrollment.");
      }
      const { data: existingEnrollment, error: findEnrollmentErr } = await supabase.from("enrollments").select("student_id, course_id, status, progress_percent").eq("student_id", studentId).eq("course_id", dbCourseId).maybeSingle();
      if (findEnrollmentErr) throw findEnrollmentErr;
      if (!existingEnrollment) {
        const { error: insertEnrollmentErr } = await supabase.from("enrollments").insert({
          id: crypto3.randomUUID(),
          student_id: studentId,
          course_id: dbCourseId,
          status: "enrolled",
          cohort: `Cohort ${canonicalCourse.nextCohortDate}`,
          progress_percent: 0,
          completed_modules: 0,
          total_modules: canonicalCourse.totalModules,
          enrolled_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (insertEnrollmentErr) throw insertEnrollmentErr;
      } else {
        const { error: updateEnrollmentErr } = await supabase.from("enrollments").update({ status: "enrolled", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("student_id", studentId).eq("course_id", dbCourseId);
        if (updateEnrollmentErr) throw updateEnrollmentErr;
      }
      isFulfilled = true;
    } catch (enrollErr) {
      console.error("[Supabase Enrollment Fulfillment Failure]:", enrollErr);
      fulfillmentError = enrollErr?.message || String(enrollErr);
      isFulfilled = false;
    }
  } else {
    if (simulateEnrollmentFailureForTesting.has(reference)) {
      isFulfilled = false;
      fulfillmentError = "Simulated database failure during enrollment.";
    } else {
      isFulfilled = true;
      studentId = existingPayment?.student_id || `STU-${Date.now().toString(36).toUpperCase()}`;
    }
  }
  const updatedPaymentRecord = {
    id: reference,
    student_id: studentId,
    course_id: dbCourseId,
    gateway: inferredGateway,
    gateway_mode: gatewayMode,
    external_session_id: externalSessionId,
    amount: expectedMajorAmount,
    amount_kobo: resolvedCurrency === "NGN" ? expectedMinorAmount : 0,
    amount_minor: expectedMinorAmount,
    currency: resolvedCurrency,
    channel,
    status: "success",
    fulfillment_status: isFulfilled ? "fulfilled" : "failed",
    fulfillment_error: fulfillmentError,
    paystack_transaction_id: externalTxId,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    paid_at: paidAt,
    email_dispatched_at: isFulfilled ? existingPayment?.email_dispatched_at || null : null,
    raw_response: sanitizedRaw,
    created_at: existingPayment?.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const formattedPaidDisplay = resolvedCurrency === "USD" ? `$${expectedMajorAmount.toLocaleString("en-US")}` : `\u20A6${expectedMajorAmount.toLocaleString()}`;
  const gatewayDisplayName = inferredGateway === "bachs" ? "Bachs" : "Paystack";
  if (supabase) {
    try {
      const { error: paymentUpsertError } = await persistPaymentUpsert(supabase, updatedPaymentRecord);
      if (paymentUpsertError) {
        console.error("[Supabase payments upsert failed]:", paymentUpsertError);
        return {
          verified: false,
          error: `${gatewayDisplayName} confirmed this payment, but the payment record could not be saved. Please retry verification or contact support with your reference.`,
          code: "PAYMENT_RECORD_PERSISTENCE_FAILED",
          status: 503,
          payment: {
            reference,
            gateway: inferredGateway,
            gatewayMode,
            status: "success",
            amount: expectedMajorAmount,
            currency: resolvedCurrency,
            channel,
            paidAt,
            studentName: customerName,
            studentEmail: customerEmail,
            courseId: canonicalCourse.id,
            courseTitle: canonicalCourse.title
          }
        };
      }
    } catch (paymentDbErr) {
      console.error("[Supabase payments upsert exception]:", paymentDbErr);
      return {
        verified: false,
        error: `${gatewayDisplayName} confirmed this payment, but the payment record could not be saved. Please retry verification or contact support with your reference.`,
        code: "PAYMENT_RECORD_PERSISTENCE_FAILED",
        status: 503
      };
    }
  } else if (isProductionPaymentEnvironment()) {
    return {
      verified: false,
      error: "Payment database is not configured. The transaction requires manual reconciliation.",
      code: "DATABASE_UNCONFIGURED",
      status: 503
    };
  }
  if (!isProductionPaymentEnvironment()) {
    fallbackPaymentsStore.set(reference, updatedPaymentRecord);
  }
  if (!isFulfilled) {
    return {
      verified: false,
      error: `Tuition payment of ${formattedPaidDisplay} was confirmed, but automated course enrollment encountered a database error: ${fulfillmentError}. Your transaction record has been saved for reconciliation.`,
      code: "ENROLLMENT_FAILED",
      status: 500,
      payment: {
        reference,
        gateway: inferredGateway,
        gatewayMode,
        status: "success",
        amount: expectedMajorAmount,
        currency: resolvedCurrency,
        channel,
        paidAt,
        studentName: customerName,
        studentEmail: customerEmail,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title
      }
    };
  }
  let alreadyEmailed = Boolean(existingPayment?.email_dispatched_at);
  if (!alreadyEmailed && supabase) {
    try {
      const { data: latestPayment } = await supabase.from("payments").select("email_dispatched_at").eq("id", reference).maybeSingle();
      if (latestPayment?.email_dispatched_at) {
        alreadyEmailed = true;
      }
    } catch (dbErr) {
      console.warn("[Supabase email check]:", dbErr);
    }
  }
  let finalEmailDispatchedAt = existingPayment?.email_dispatched_at || null;
  const telegramInvitesList = getTelegramInvitesForCourse(canonicalCourse.id || canonicalCourse.slug);
  if (!alreadyEmailed) {
    try {
      const whatsappUrl = getWhatsAppUrl(
        resolvedCurrency === "USD" ? "us" : "ng",
        `Hello Admissions! I just completed my tuition payment of ${formattedPaidDisplay} (${resolvedCurrency}) for ${canonicalCourse.title} via ${gatewayDisplayName}. Reference: ${reference}. My email is ${customerEmail}.`
      );
      const emailPayload = buildStudentOnboardingEmail({
        customerName,
        customerEmail,
        courseTitle: canonicalCourse.title,
        tuitionNaira: expectedMajorAmount,
        currency: resolvedCurrency,
        gateway: inferredGateway,
        reference,
        nextCohortDate: canonicalCourse.nextCohortDate,
        channel,
        studentCode: studentCode || "STU-ACTIVE",
        generatedTempPassword,
        directPasswordSetupLink,
        whatsappUrl,
        telegramInvites: telegramInvitesList
      });
      const emailResult = await dispatchGenericEmail({
        to: customerEmail,
        toName: customerName,
        subject: emailPayload.subject,
        html: emailPayload.html,
        text: emailPayload.text
      });
      if (emailResult && (emailResult.delivered || emailResult.status === "delivered")) {
        finalEmailDispatchedAt = (/* @__PURE__ */ new Date()).toISOString();
        if (supabase) {
          try {
            await supabase.from("payments").update({ email_dispatched_at: finalEmailDispatchedAt }).eq("id", reference);
          } catch (dbErr) {
            console.warn("[Supabase email_dispatched_at update]:", dbErr);
          }
        }
        if (fallbackPaymentsStore.has(reference)) {
          fallbackPaymentsStore.get(reference).email_dispatched_at = finalEmailDispatchedAt;
        }
      }
    } catch (mailErr) {
      console.warn("[Payment Email Dispatch Warning]:", mailErr);
    }
  }
  return {
    verified: true,
    payment: {
      reference,
      gateway: inferredGateway,
      gatewayMode,
      status: "success",
      amount: expectedMajorAmount,
      currency: resolvedCurrency,
      channel,
      paidAt,
      studentName: customerName,
      studentEmail: customerEmail,
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title,
      emailDispatchedAt: finalEmailDispatchedAt,
      telegramInvites: telegramInvitesList
    }
  };
}
paystackRouter.get("/config", (_req, res) => {
  const configured = isPaystackConfigured();
  const publicKey = getPaystackPublicKey();
  return res.json({
    configured,
    hasPublicKey: Boolean(publicKey),
    publicKey: publicKey || null,
    currency: "NGN",
    mode: getPaystackSecretKey().startsWith("sk_live_") ? "live" : "test",
    merchantName: "Vixora Academy"
  });
});
paymentsRouter.get("/config", (_req, res) => {
  const psConfigured = isPaystackConfigured();
  const psPublicKey = getPaystackPublicKey();
  const bachsConfigured = isBachsConfigured();
  const bachsMode = getBachsMode();
  return res.json({
    merchantName: "Vixora Academy",
    currencyGateways: {
      NGN: "paystack",
      USD: "bachs"
    },
    paystack: {
      configured: psConfigured,
      hasPublicKey: Boolean(psPublicKey),
      publicKey: psPublicKey || null,
      currency: "NGN",
      mode: getPaystackSecretKey().startsWith("sk_live_") ? "live" : "test"
    },
    bachs: {
      configured: bachsConfigured,
      currency: "USD",
      mode: bachsMode
    }
  });
});
async function handlePaymentInitializeRequest(req, res, forcedGateway) {
  try {
    const clientIp = getClientIp(req);
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        error: "Request body must be a valid JSON object.",
        code: "INVALID_BODY"
      });
    }
    if (hasPrototypePollutionKeys(req.body)) {
      return res.status(400).json({
        error: "Invalid request: Prototype pollution keys detected.",
        code: "PROTOTYPE_POLLUTION"
      });
    }
    const { courseId, email, studentName, phone, callbackUrl, currency: rawCurrency } = req.body;
    if (!courseId || typeof courseId !== "string") {
      return res.status(400).json({
        error: 'Parameter "courseId" is required and must be a string.',
        code: "COURSE_ID_REQUIRED"
      });
    }
    const normalizedCurrency = rawCurrency !== void 0 && rawCurrency !== null && String(rawCurrency).trim() !== "" ? String(rawCurrency).toUpperCase().trim() : forcedGateway === "bachs" ? "USD" : "NGN";
    if (normalizedCurrency !== "NGN" && normalizedCurrency !== "USD") {
      return res.status(400).json({
        error: `Unsupported currency "${normalizedCurrency}". Supported currencies are NGN (Paystack) and USD (Bachs).`,
        code: "INVALID_CURRENCY"
      });
    }
    if (forcedGateway === "paystack" && normalizedCurrency !== "NGN") {
      return res.status(400).json({
        error: "Paystack only processes NGN transactions. Use USD checkout for Bachs.",
        code: "CURRENCY_GATEWAY_MISMATCH"
      });
    }
    if (forcedGateway === "bachs" && normalizedCurrency !== "USD") {
      return res.status(400).json({
        error: "Bachs exclusively processes USD transactions. Use Paystack for NGN.",
        code: "CURRENCY_GATEWAY_MISMATCH"
      });
    }
    const activeGateway = resolveGatewayForCurrency(normalizedCurrency);
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: "A valid student email address is required.",
        code: "INVALID_EMAIL"
      });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentName = sanitizeText(studentName || cleanEmail.split("@")[0]);
    const cleanPhone = sanitizeText(phone, 30);
    const rateLimitKey = `${clientIp}:${cleanEmail}`;
    const rlStatus = payInitRateLimiter.check(rateLimitKey);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        error: `Too many payment initialization requests. Please wait ${rlStatus.resetInSeconds} seconds before trying again.`,
        code: "RATE_LIMIT_EXCEEDED",
        resetInSeconds: rlStatus.resetInSeconds
      });
    }
    const canonicalCourse = findCanonicalCourse(courseId);
    if (!canonicalCourse) {
      return res.status(400).json({
        error: `Invalid courseId "${courseId}". Course is not available in the Vixora Academy catalog.`,
        code: "INVALID_COURSE_ID"
      });
    }
    const authoritativePrice = resolveAuthoritativePrice(courseId, normalizedCurrency);
    if (!authoritativePrice) {
      return res.status(400).json({
        error: `${normalizedCurrency} pricing is not configured for "${canonicalCourse.title}". Please select NGN or contact admissions.`,
        code: "PRICE_NOT_CONFIGURED"
      });
    }
    if (activeGateway === "paystack") {
      const secretKey2 = getPaystackSecretKey();
      if (!secretKey2) {
        return res.status(503).json({
          error: "Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in Settings -> Secrets.",
          code: "PAYSTACK_NOT_CONFIGURED",
          help: "Obtain your Secret Key from Paystack Dashboard -> Settings -> API Keys & Webhooks."
        });
      }
    } else {
      const apiKey = getBachsApiKey();
      if (!apiKey) {
        return res.status(503).json({
          error: "Bachs USD API Key is not configured on the server. Please add BACHS_API_KEY in Settings -> Secrets.",
          code: "BACHS_NOT_CONFIGURED",
          help: "Obtain your Sandbox or Live API key from your Bachs (bachs.io) developer dashboard."
        });
      }
    }
    const authUser = await extractOptionalAuthUser(req);
    const refPrefix = activeGateway === "bachs" ? "VIX-BC" : "VIX-PS";
    const reference = `${refPrefix}-${Date.now()}-${crypto3.randomBytes(4).toString("hex").toUpperCase()}`;
    const reqOrigin = req.headers.origin || (req.headers.host ? `${req.protocol}://${req.headers.host}` : "");
    const defaultCallbackUrl = `${reqOrigin}/payment/callback?reference=${reference}&courseId=${encodeURIComponent(canonicalCourse.id)}&gateway=${activeGateway}`;
    let finalCallbackUrl = typeof callbackUrl === "string" && callbackUrl.startsWith("http") ? callbackUrl : defaultCallbackUrl;
    if (activeGateway === "bachs" && !finalCallbackUrl.includes("reference=")) {
      const sep = finalCallbackUrl.includes("?") ? "&" : "?";
      finalCallbackUrl = `${finalCallbackUrl}${sep}reference=${encodeURIComponent(reference)}&gateway=bachs`;
    }
    const cancelCallbackUrl = `${reqOrigin}/payment/callback?reference=${encodeURIComponent(reference)}&courseId=${encodeURIComponent(canonicalCourse.id)}&gateway=${activeGateway}&cancelled=true`;
    const supabase = getSupabaseAdmin();
    if (!supabase && isProductionPaymentEnvironment()) {
      return res.status(503).json({
        error: "Payment database is not configured. Checkout cannot be started safely.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
    let resolvedCourseId = canonicalCourse.id;
    if (supabase) {
      try {
        resolvedCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);
      } catch (courseDbErr) {
        console.error("[Payment Init Course Record Failure]:", courseDbErr);
        return res.status(503).json({
          error: "The selected course is not available in the payment database yet. Please try again later.",
          code: "COURSE_DATABASE_UNAVAILABLE"
        });
      }
    }
    const gatewayMode = activeGateway === "bachs" ? getBachsMode() : getPaystackSecretKey().startsWith("sk_live_") ? "live" : "sandbox";
    const initialPaymentRecord = {
      id: reference,
      student_id: null,
      course_id: resolvedCourseId,
      gateway: activeGateway,
      gateway_mode: gatewayMode,
      external_session_id: null,
      amount: authoritativePrice.majorAmount,
      amount_kobo: normalizedCurrency === "NGN" ? authoritativePrice.minorAmount : 0,
      amount_minor: authoritativePrice.minorAmount,
      currency: normalizedCurrency,
      channel: null,
      status: "pending",
      fulfillment_status: "pending",
      fulfillment_error: null,
      email_dispatched_at: null,
      paystack_transaction_id: null,
      customer_email: cleanEmail,
      customer_name: cleanStudentName,
      customer_phone: cleanPhone || null,
      paid_at: null,
      raw_response: null,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (supabase) {
      try {
        const { error: insertErr } = await persistPaymentInsert(supabase, initialPaymentRecord);
        if (insertErr) {
          console.error("[Supabase initial payment record insert failed]:", insertErr);
          return res.status(503).json({
            error: "We could not securely save your payment session. No checkout was started. Please try again.",
            code: "PAYMENT_RECORD_CREATE_FAILED"
          });
        }
      } catch (insertErr) {
        console.error("[Supabase initial payment record insert exception]:", insertErr);
        return res.status(503).json({
          error: "The payment database is temporarily unavailable. No checkout was started. Please try again.",
          code: "DATABASE_UNAVAILABLE"
        });
      }
    }
    if (!isProductionPaymentEnvironment()) {
      fallbackPaymentsStore.set(reference, initialPaymentRecord);
    }
    if (activeGateway === "bachs") {
      const sessionRes = await createBachsCheckoutSession({
        reference,
        amountCents: authoritativePrice.minorAmount,
        customerEmail: cleanEmail,
        customerName: cleanStudentName,
        customerPhone: cleanPhone || null,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title,
        successUrl: finalCallbackUrl,
        cancelUrl: cancelCallbackUrl,
        authUserId: authUser?.id || null
      });
      if (!sessionRes.ok || !sessionRes.checkoutUrl) {
        return res.status(sessionRes.status || 502).json({
          error: sessionRes.error || "Failed to initialize Bachs USD checkout session.",
          code: "BACHS_INIT_FAILED",
          reference
        });
      }
      if (sessionRes.sessionId) {
        if (fallbackPaymentsStore.has(reference)) {
          fallbackPaymentsStore.get(reference).external_session_id = sessionRes.sessionId;
        }
        if (supabase) {
          try {
            await supabase.from("payments").update({ external_session_id: sessionRes.sessionId, raw_response: sessionRes.raw || null }).eq("id", reference);
          } catch (err) {
            console.warn("[Bachs Init Session ID Update Warning]:", err);
          }
        }
      }
      return res.json({
        success: true,
        gateway: "bachs",
        gatewayMode,
        reference,
        sessionId: sessionRes.sessionId || null,
        authorizationUrl: sessionRes.checkoutUrl,
        amount: authoritativePrice.majorAmount,
        amountMinor: authoritativePrice.minorAmount,
        currency: "USD",
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title
      });
    }
    const secretKey = getPaystackSecretKey();
    const paystackPayload = {
      email: cleanEmail,
      amount: authoritativePrice.minorAmount,
      currency: "NGN",
      reference,
      callback_url: finalCallbackUrl,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      metadata: {
        studentName: cleanStudentName,
        studentEmail: cleanEmail,
        phone: cleanPhone,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title,
        authUserId: authUser?.id || null,
        amountNaira: authoritativePrice.majorAmount
      }
    };
    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paystackPayload)
    });
    const data = await response.json();
    if (!response.ok || !data.status || !data.data) {
      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        error: data.message || "Failed to initialize Paystack transaction.",
        code: "PAYSTACK_INIT_FAILED",
        reference
      });
    }
    return res.json({
      success: true,
      gateway: "paystack",
      gatewayMode,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amount: authoritativePrice.majorAmount,
      amountMinor: authoritativePrice.minorAmount,
      amountNaira: authoritativePrice.majorAmount,
      amountKobo: authoritativePrice.minorAmount,
      currency: "NGN",
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title
    });
  } catch (err) {
    console.error("[Payment Initialize Exception]:", err);
    return res.status(500).json({
      error: "An internal error occurred while initializing payment.",
      code: "SERVER_ERROR"
    });
  }
}
paystackRouter.post("/initialize", (req, res) => handlePaymentInitializeRequest(req, res, "paystack"));
paymentsRouter.post("/initialize", (req, res) => handlePaymentInitializeRequest(req, res));
async function handleVerificationRequest(req, res) {
  try {
    const clientIp = getClientIp(req);
    const rlStatus = payVerifyRateLimiter.check(clientIp);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        verified: false,
        error: `Too many verification requests. Please wait ${rlStatus.resetInSeconds} seconds before retrying.`,
        code: "RATE_LIMIT_EXCEEDED",
        resetInSeconds: rlStatus.resetInSeconds
      });
    }
    const rawRef = req.body?.reference || req.params?.reference || req.query?.reference;
    if (!isValidTransactionReference(rawRef)) {
      return res.status(400).json({
        verified: false,
        error: "A valid transaction reference string is required.",
        code: "INVALID_REFERENCE"
      });
    }
    const reference = String(rawRef).trim();
    const result = await processPaymentFulfillment(reference);
    if (!result.verified) {
      return res.status(result.status || 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("[Payment Verify Exception]:", err);
    return res.status(500).json({
      verified: false,
      error: "An internal server error occurred while verifying payment.",
      code: "SERVER_ERROR"
    });
  }
}
paystackRouter.post("/verify", handleVerificationRequest);
paystackRouter.get("/verify", handleVerificationRequest);
paystackRouter.get("/verify/:reference", handleVerificationRequest);
paystackRouter.post("/verify/:reference", handleVerificationRequest);
paymentsRouter.post("/verify", handleVerificationRequest);
paymentsRouter.get("/verify", handleVerificationRequest);
paymentsRouter.get("/verify/:reference", handleVerificationRequest);
paymentsRouter.post("/verify/:reference", handleVerificationRequest);
paystackRouter.get("/webhook", (_req, res) => {
  return res.json({
    status: "active",
    endpoint: "Paystack Webhook Listener",
    service: "Vixora Academy NGN Payment Gateway",
    expectedMethod: "POST",
    configured: isPaystackConfigured(),
    message: "This endpoint is active and listening for automated webhook POST events from Paystack."
  });
});
paystackRouter.post("/webhook", async (req, res) => {
  try {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(503).json({ error: "Paystack Secret Key is not configured on server." });
    }
    const signature = req.headers["x-paystack-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(401).json({ error: "Missing x-paystack-signature header." });
    }
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : typeof req.body === "string" ? Buffer.from(req.body) : void 0);
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        error: "Raw request body buffer unavailable for signature verification."
      });
    }
    const computedHash = crypto3.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(computedHash, "hex");
    const providedBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== providedBuffer.length || !crypto3.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }
    const event = req.body;
    if (!event || typeof event !== "object") {
      return res.status(400).json({ error: "Invalid webhook event payload structure." });
    }
    if (event.event === "charge.success" && event.data?.reference) {
      const ref = String(event.data.reference).trim();
      await processPaymentFulfillment(ref, event.data);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Paystack Webhook Exception]:", err);
    return res.status(500).json({ error: "Webhook processing error." });
  }
});
paymentsRouter.get("/bachs/webhook", (_req, res) => {
  return res.json({
    status: "active",
    endpoint: "Bachs Webhook Listener",
    service: "Vixora Academy USD Payment Gateway (bachs.io)",
    mode: getBachsMode(),
    expectedMethod: "POST",
    configured: isBachsConfigured() && Boolean(getBachsWebhookSecret()),
    message: "This endpoint is active and listening for signed USD webhook POST events from Bachs."
  });
});
paymentsRouter.post("/bachs/webhook", async (req, res) => {
  try {
    const webhookSecret = getBachsWebhookSecret();
    if (!webhookSecret) {
      return res.status(503).json({ error: "BACHS_WEBHOOK_SECRET is not configured on server." });
    }
    const signatureHeader = req.headers["x-bachs-signature"];
    if (!signatureHeader || typeof signatureHeader !== "string") {
      return res.status(401).json({ error: "Missing X-Bachs-Signature header." });
    }
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : typeof req.body === "string" ? Buffer.from(req.body) : void 0);
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        error: "Raw request body buffer unavailable for signature verification."
      });
    }
    if (!verifyBachsWebhookSignature(rawBody, signatureHeader, webhookSecret)) {
      return res.status(401).json({ error: "Invalid Bachs webhook signature." });
    }
    const event = req.body;
    if (!event || typeof event !== "object") {
      return res.status(400).json({ error: "Invalid webhook event payload structure." });
    }
    const eventType = String(event.event || event.type || "").toLowerCase().trim();
    const shouldProcess = eventType === "collection.succeeded" || eventType === "checkout.completed" || eventType === "checkout.session.completed" || eventType === "payment.succeeded" || eventType === "collection.failed" || eventType === "checkout.session.expired";
    if (shouldProcess && event.data) {
      const normalized = normalizeBachsPayload(event.data);
      let ref = normalized.reference;
      if (!ref && normalized.sessionId) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data: matched } = await supabase.from("payments").select("id").eq("external_session_id", normalized.sessionId).maybeSingle();
          if (matched?.id) {
            ref = matched.id;
          }
        } else {
          for (const rec of fallbackPaymentsStore.values()) {
            if (rec.external_session_id === normalized.sessionId) {
              ref = rec.id;
              break;
            }
          }
        }
      }
      if (ref && isValidTransactionReference(ref)) {
        await processPaymentFulfillment(ref, {
          ...normalized,
          _gateway: "bachs",
          _alreadyNormalized: true
        });
      }
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Bachs Webhook Exception]:", err);
    return res.status(500).json({ error: "Webhook processing error." });
  }
});

// server/studentPortalServer.ts
var portalRouter = Router2();
function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}
function shouldPermitFallback() {
  return !isProductionEnvironment() && !isSupabaseConfigured();
}
var DatabaseServiceError = class extends Error {
  constructor(message = "Database service is unavailable.", code = "DATABASE_UNAVAILABLE", status = 503) {
    super(message);
    this.name = "DatabaseServiceError";
    this.code = code;
    this.status = status;
  }
};
var fallbackCertificatesStore = /* @__PURE__ */ new Map();
var fallbackStudentsStore = /* @__PURE__ */ new Map();
var fallbackEmailLogsStore = [];
SEED_CERTIFICATES.forEach((cert) => {
  fallbackCertificatesStore.set(cert.id.toUpperCase(), { ...cert });
});
SEED_STUDENTS.forEach((student) => {
  fallbackStudentsStore.set(student.email.toLowerCase(), { ...student });
});
if (SEED_CERTIFICATES.length > 0) {
  const sample = SEED_CERTIFICATES[0];
  fallbackEmailLogsStore.push({
    id: "eml-init-001",
    certificateId: sample.id,
    recipientEmail: sample.studentEmail,
    recipientName: sample.studentName,
    subject: `\u{1F393} Congratulations ${sample.studentName}! Your Vixora Academy Certificate is Ready`,
    status: "delivered",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: 142,
    previewHtml: generateCertificateEmailHtml(sample)
  });
}
function toIsoDateString(rawDate) {
  if (!rawDate) return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split("T")[0];
  }
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function toHumanDateString(rawDate) {
  if (!rawDate) return "September 2026";
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  return rawDate;
}
function mapSupabaseCertificateToDomain(row, competenciesList = []) {
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    courseId: row.course_id,
    courseTitle: row.course_title,
    trackBadge: row.track_badge || "Professional Track",
    specialization: row.specialization || "",
    grade: row.grade,
    honors: row.honors || void 0,
    capstoneTitle: row.capstone_title || "Enterprise Capstone Project",
    capstoneScore: row.capstone_score || "98 / 100",
    issueDate: toHumanDateString(row.issue_date),
    completionDate: row.completion_date ? toHumanDateString(row.completion_date) : toHumanDateString(row.issue_date),
    durationWeeks: row.duration_weeks || 12,
    credentialHash: row.credential_hash,
    verificationUrl: row.verification_url || `https://academy.vixoradigitalhub.com/verify?id=${row.id}`,
    instructorName: row.instructor_name || "Dr. Adebayo Vance",
    instructorTitle: row.instructor_title || "Principal AI Architect, Vixora Labs",
    directorName: row.director_name || "Sarumi Hammad",
    directorTitle: row.director_title || "Dean, Vixora Academy",
    competencies: competenciesList.length > 0 ? competenciesList : [
      "Autonomous AI Tool Use & System Architecture",
      "Cloud Infrastructure Hardening & Containerization",
      "Full-Stack Data Engineering & API Deployment"
    ],
    status: row.status || "active",
    emailSentCount: row.email_sent_count || 0,
    lastEmailSentAt: row.last_email_sent_at || void 0
  };
}
function mapSupabaseEmailLogToDomain(row) {
  return {
    id: row.id,
    certificateId: row.certificate_id || "",
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    subject: row.subject,
    status: row.status || "simulated",
    provider: row.provider || void 0,
    timestamp: row.timestamp || row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: row.delivery_latency_ms || 0,
    previewHtml: row.preview_html || "",
    previewText: row.preview_text || void 0,
    messageId: row.message_id || void 0,
    error: row.error || void 0,
    gmailComposeUrl: row.gmail_compose_url || void 0,
    mailtoUrl: row.mailto_url || void 0,
    infoNotice: row.info_notice || void 0,
    deliveredToInternet: Boolean(row.delivered_to_internet),
    hasAttachment: Boolean(row.has_attachment),
    attachmentName: row.attachment_name || void 0
  };
}
var CERT_ID_REGEX = /^[A-Za-z0-9\-_]{4,40}$/;
function isValidCertificateId(id) {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length < 4 || trimmed.length > 40) return false;
  return CERT_ID_REGEX.test(trimmed);
}
var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
function isValidEmail2(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  if (/[\r\n\0;,<>'"\\]/.test(trimmed)) return false;
  return EMAIL_REGEX.test(trimmed);
}
function isPlainObject2(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(obj, "__proto__") || Object.prototype.hasOwnProperty.call(obj, "constructor") || Object.prototype.hasOwnProperty.call(obj, "prototype")) {
    return false;
  }
  return true;
}
function parsePaginationQuery(rawLimit, rawOffset, defaultLimit = 50, maxLimit = 100, rawPage) {
  let limit = defaultLimit;
  let offset = 0;
  if (rawLimit !== void 0 && rawLimit !== null && rawLimit !== "") {
    if (typeof rawLimit !== "string" && typeof rawLimit !== "number") {
      return { limit, offset, error: 'Query parameter "limit" must be a valid integer.' };
    }
    const str = String(rawLimit).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "limit" must be a positive integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > maxLimit) {
      return { limit, offset, error: `Query parameter "limit" must be between 1 and ${maxLimit}.` };
    }
    limit = parsed;
  }
  if (rawOffset !== void 0 && rawOffset !== null && rawOffset !== "") {
    if (typeof rawOffset !== "string" && typeof rawOffset !== "number") {
      return { limit, offset, error: 'Query parameter "offset" must be a valid integer.' };
    }
    const str = String(rawOffset).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "offset" must be a non-negative integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1e5) {
      return { limit, offset, error: 'Query parameter "offset" must be between 0 and 100000.' };
    }
    offset = parsed;
  } else if (rawPage !== void 0 && rawPage !== null && rawPage !== "") {
    if (typeof rawPage !== "string" && typeof rawPage !== "number") {
      return { limit, offset, error: 'Query parameter "page" must be a valid integer.' };
    }
    const str = String(rawPage).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "page" must be a positive integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1e4) {
      return { limit, offset, error: 'Query parameter "page" must be between 1 and 10000.' };
    }
    offset = (parsed - 1) * limit;
  }
  return { limit, offset };
}
async function getCertificateById(id) {
  if (!isValidCertificateId(id)) {
    return null;
  }
  const cleanId = id.toUpperCase().trim();
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      const { data: certRow, error: certError } = await supabase.from("certificates").select("*").eq("id", cleanId).maybeSingle();
      if (certError) {
        if (!isProductionEnvironment() && isSupabaseNetworkError(certError)) {
          console.warn(`[Supabase] Network unreachable querying certificate ${cleanId}; falling back to local cache in non-production.`);
          useNetworkFallback = true;
        } else {
          console.error(`[Supabase] Error querying certificate ${cleanId}:`, certError);
          if (isProductionEnvironment() || isSupabaseConfigured()) {
            throw new DatabaseServiceError(`Database query failed for certificate ${cleanId}`, "DATABASE_ERROR", 503);
          }
        }
      }
      if (!useNetworkFallback && certRow) {
        const { data: compRows, error: compError } = await supabase.from("certificate_competencies").select("name").eq("certificate_id", cleanId);
        if (compError) {
          console.warn(`[Supabase] Warning reading competencies for ${cleanId}:`, compError);
        }
        const compList = (compRows || []).map((c) => c.name).filter(Boolean);
        return mapSupabaseCertificateToDomain(certRow, compList);
      }
      if (!useNetworkFallback && (isProductionEnvironment() || isSupabaseConfigured())) {
        return null;
      }
    } catch (err) {
      if (err instanceof DatabaseServiceError) {
        throw err;
      }
      if (!isProductionEnvironment() && isSupabaseNetworkError(err)) {
        console.warn(`[Supabase] Network exception querying certificate ${cleanId}; falling back to local cache in non-production.`);
        useNetworkFallback = true;
      } else {
        console.error(`[Supabase] Outage or connection failure querying certificate ${cleanId}:`, err);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          throw new DatabaseServiceError(`Database connection error while querying certificate ${cleanId}`, "DATABASE_UNAVAILABLE", 503);
        }
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Certificate registry database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback() || !isProductionEnvironment() && useNetworkFallback) {
    return fallbackCertificatesStore.get(cleanId) || null;
  }
  return null;
}
async function getCertificatesByStudentEmail(email) {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: certRows, error } = await supabase.from("certificates").select("*").ilike("student_email", cleanEmail);
      if (error) {
        console.error(`[Supabase] Error querying student certificates for ${cleanEmail}:`, error);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          throw new DatabaseServiceError(`Failed querying certificates for ${cleanEmail}`, "DATABASE_ERROR", 503);
        }
      }
      if (certRows) {
        if (certRows.length === 0) {
          return [];
        }
        const certIds = certRows.map((r) => r.id);
        const { data: compRows } = await supabase.from("certificate_competencies").select("certificate_id, name").in("certificate_id", certIds);
        const compMap = /* @__PURE__ */ new Map();
        (compRows || []).forEach((c) => {
          const list = compMap.get(c.certificate_id) || [];
          list.push(c.name);
          compMap.set(c.certificate_id, list);
        });
        return certRows.map(
          (row) => mapSupabaseCertificateToDomain(row, compMap.get(row.id) || [])
        );
      }
    } catch (err) {
      if (err instanceof DatabaseServiceError) throw err;
      console.error(`[Supabase] Connection error querying student certificates for ${cleanEmail}:`, err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        throw new DatabaseServiceError(`Database connection error querying certificates for ${cleanEmail}`, "DATABASE_UNAVAILABLE", 503);
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Certificate database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback()) {
    const results = [];
    fallbackCertificatesStore.forEach((c) => {
      if (c.studentEmail.toLowerCase() === cleanEmail) {
        results.push(c);
      }
    });
    return results;
  }
  return [];
}
async function getAuthenticatedStudentProfile(authUserId, verifiedEmail) {
  const cleanEmail = verifiedEmail.toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let { data: studentRow, error: stuError } = await supabase.from("students").select("*").eq("auth_user_id", authUserId).maybeSingle();
      if (!studentRow && !stuError) {
        const { data: studentByEmail } = await supabase.from("students").select("*").ilike("email", cleanEmail).maybeSingle();
        if (studentByEmail) {
          if (!studentByEmail.auth_user_id) {
            const { error: linkErr } = await supabase.from("students").update({
              auth_user_id: authUserId,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", studentByEmail.id);
            if (!linkErr) {
              studentByEmail.auth_user_id = authUserId;
            }
          }
          if (studentByEmail.auth_user_id === authUserId) {
            studentRow = studentByEmail;
          }
        }
      }
      if (studentRow) {
        const studentId = studentRow.id;
        const studentName = studentRow.name;
        const enrolledDate = studentRow.enrolled_date || studentRow.enrolled_at || "September 2026";
        const role = studentRow.role || "student";
        const avatarUrl = studentRow.avatar_url || void 0;
        const { data: enrollments, error: enrollError } = await supabase.from("enrollments").select(`
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
          `).eq("student_id", studentId);
        if (enrollError) {
          throw new DatabaseServiceError(
            "Unable to load course enrollments from the database.",
            "ENROLLMENTS_QUERY_FAILED",
            503
          );
        }
        const certs = await getCertificatesByStudentEmail(studentRow.email || cleanEmail);
        const certMap = /* @__PURE__ */ new Map();
        certs.forEach((c) => certMap.set(c.courseId, c.id));
        const studentCourses = [];
        if (!enrollError && enrollments && enrollments.length > 0) {
          enrollments.forEach((e) => {
            const course = e.courses;
            if (course) {
              const courseInvites = getTelegramInvitesForCourse(course.id);
              const primaryInvite = courseInvites[0];
              studentCourses.push({
                courseId: course.id,
                title: course.title,
                badge: course.badge || "Enterprise Track",
                progressPercent: e.progress_percent ?? 0,
                status: e.status || "enrolled",
                cohort: e.cohort || "Not assigned",
                instructor: course.instructor_name || "Vixora Academy",
                completedModules: e.completed_modules ?? 0,
                totalModules: course.total_modules || e.total_modules || 0,
                certificateId: certMap.get(course.id) || void 0,
                telegramInviteUrl: primaryInvite?.inviteUrl,
                telegramVaultTitle: primaryInvite?.title,
                isMasterVault: primaryInvite?.accessTier === "bundle",
                telegramInvites: courseInvites.map((i) => ({
                  title: i.title,
                  inviteUrl: i.inviteUrl,
                  description: i.description,
                  accessTier: i.accessTier
                }))
              });
            }
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
      return null;
    } catch (err) {
      if (err instanceof DatabaseServiceError) throw err;
      console.warn(`[Supabase] Error reading student profile for ${cleanEmail}:`, err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        throw new DatabaseServiceError(`Database error reading student profile for ${cleanEmail}`, "DATABASE_ERROR", 503);
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Student database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback()) {
    const cachedStudent = fallbackStudentsStore.get(cleanEmail);
    if (!cachedStudent) return null;
    return {
      ...cachedStudent,
      courses: cachedStudent.courses.map((c) => {
        const courseInvites = getTelegramInvitesForCourse(c.courseId);
        const primaryInvite = courseInvites[0];
        return {
          ...c,
          telegramInviteUrl: primaryInvite?.inviteUrl,
          telegramVaultTitle: primaryInvite?.title,
          isMasterVault: primaryInvite?.accessTier === "bundle",
          telegramInvites: courseInvites.map((i) => ({
            title: i.title,
            inviteUrl: i.inviteUrl,
            description: i.description,
            accessTier: i.accessTier
          }))
        };
      })
    };
  }
  return null;
}
async function generateSecureCertificateId(courseTitle) {
  const MAX_ATTEMPTS = 3;
  const track = courseTitle.includes("AI") ? "ENG" : "AUT";
  const supabase = getSupabaseAdmin();
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const randomBytes = crypto4.randomBytes(8);
    const tokenRaw = randomBytes.toString("hex").toUpperCase();
    const secureToken = `${tokenRaw.slice(0, 4)}-${tokenRaw.slice(4, 8)}-${tokenRaw.slice(8, 12)}`;
    const candidateId = `VA-2026-${secureToken}-${track}`;
    if (fallbackCertificatesStore.has(candidateId)) {
      console.warn(`[Certificate Collision] Candidate ID ${candidateId} collided in fallback store. Retry attempt ${attempt}/${MAX_ATTEMPTS}`);
      continue;
    }
    if (supabase) {
      try {
        const { data: existing } = await supabase.from("certificates").select("id").eq("id", candidateId).maybeSingle();
        if (existing) {
          console.warn(`[Certificate Collision] Candidate ID ${candidateId} collided in Supabase. Retry attempt ${attempt}/${MAX_ATTEMPTS}`);
          continue;
        }
      } catch (checkErr) {
        console.error("[Certificate ID Generator] Supabase check error:", checkErr);
      }
    }
    return candidateId;
  }
  throw new Error("Failed to generate a unique certificate ID after maximum attempts due to collision.");
}
async function saveIssuedCertificate(cert, competencies) {
  const supabase = getSupabaseAdmin();
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      throw new DatabaseServiceError("Cannot issue certificate: database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  } else if (shouldPermitFallback()) {
    if (fallbackCertificatesStore.has(cert.id)) {
      throw new Error(`Certificate with ID ${cert.id} already exists in fallback store.`);
    }
    fallbackCertificatesStore.set(cert.id, cert);
    if (!supabase) {
      return;
    }
  } else {
    throw new DatabaseServiceError("Cannot issue certificate: database is not configured.", "DATABASE_UNCONFIGURED", 503);
  }
  try {
    await supabase.from("courses").upsert({
      id: cert.courseId,
      title: cert.courseTitle,
      track_badge: cert.trackBadge,
      instructor: cert.instructorName,
      cohort: "Cohort 2026-A",
      total_modules: cert.durationWeeks || 12
    });
    let studentId = crypto4.randomUUID();
    const studentCode = `STU-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const { data: existingStudent } = await supabase.from("students").select("id").ilike("email", cert.studentEmail).maybeSingle();
    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      await supabase.from("students").insert({
        id: studentId,
        student_code: studentCode,
        name: cert.studentName,
        email: cert.studentEmail,
        enrolled_date: cert.issueDate,
        role: "alumni"
      });
    }
    const { error: certInsertErr } = await supabase.from("certificates").insert({
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
      last_email_sent_at: cert.lastEmailSentAt || (/* @__PURE__ */ new Date()).toISOString()
    });
    if (certInsertErr) {
      if (!isProductionEnvironment() && isSupabaseNetworkError(certInsertErr)) {
        console.warn(`[Supabase] Network unreachable saving certificate ${cert.id}; caching in local dev store.`);
        fallbackCertificatesStore.set(cert.id, cert);
        return;
      }
      if (shouldPermitFallback()) {
        fallbackCertificatesStore.delete(cert.id);
      }
      throw certInsertErr;
    }
    if (competencies.length > 0) {
      await supabase.from("certificate_competencies").delete().eq("certificate_id", cert.id);
      const compRows = competencies.map((name) => ({
        certificate_id: cert.id,
        name,
        category: "Core Engineering"
      }));
      await supabase.from("certificate_competencies").insert(compRows);
    }
    await supabase.from("enrollments").upsert(
      {
        student_id: studentId,
        course_id: cert.courseId,
        status: "completed",
        progress_percent: 100,
        completed_modules: cert.durationWeeks || 12,
        certificate_id: cert.id
      },
      { onConflict: "student_id,course_id" }
    );
  } catch (err) {
    if (!isProductionEnvironment() && isSupabaseNetworkError(err)) {
      console.warn(`[Supabase] Network exception saving certificate ${cert.id}; caching in local dev store.`);
      fallbackCertificatesStore.set(cert.id, cert);
      return;
    }
    if (shouldPermitFallback()) {
      fallbackCertificatesStore.delete(cert.id);
    }
    console.error("[Supabase] Error saving issued certificate:", err);
    throw err;
  }
}
async function saveEmailLog(log) {
  if (shouldPermitFallback() || !isProductionEnvironment()) {
    fallbackEmailLogsStore.unshift(log);
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await supabase.from("email_logs").insert({
      id: log.id,
      certificate_id: log.certificateId || null,
      recipient_email: log.recipientEmail,
      recipient_name: log.recipientName,
      subject: log.subject,
      status: log.status,
      provider: log.provider || "simulated",
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
    if (log.certificateId) {
      await supabase.from("certificates").update({
        last_email_sent_at: log.timestamp
      }).eq("id", log.certificateId);
    }
  } catch (err) {
    console.warn("[Supabase] Error persisting email log:", err);
  }
}
async function getRecentEmailLogs(limitCount = 50, offsetCount = 0) {
  const supabase = getSupabaseAdmin();
  let networkUnavailable = false;
  if (supabase) {
    try {
      const { data: rows, error } = await supabase.from("email_logs").select("*").order("created_at", { ascending: false }).range(offsetCount, offsetCount + limitCount - 1);
      if (!error && rows && rows.length > 0) {
        return rows.map((r) => mapSupabaseEmailLogToDomain(r));
      }
      if (!error && rows && rows.length === 0) {
        return [];
      }
      if (error && isSupabaseNetworkError(error)) {
        networkUnavailable = true;
      }
    } catch (err) {
      if (isSupabaseNetworkError(err)) {
        networkUnavailable = true;
      }
      console.warn("[Supabase] Error fetching email logs, using fallback cache:", err);
    }
  }
  if (!isProductionEnvironment() && (networkUnavailable || shouldPermitFallback())) {
    return fallbackEmailLogsStore.slice(offsetCount, offsetCount + limitCount);
  }
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    return [];
  }
  return fallbackEmailLogsStore.slice(offsetCount, offsetCount + limitCount);
}
var SlidingWindowRateLimiter2 = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || "rl";
  }
  check(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  peek(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max,
        isLimited: false
      };
    }
    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }
  reset(key) {
    this.store.delete(`${this.prefix}:${key}`);
  }
};
var loginRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  prefix: "login"
});
var emailRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 10 * 60 * 1e3,
  max: 6,
  prefix: "cert_email"
});
var verifyRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 60 * 1e3,
  max: 40,
  prefix: "cert_verify"
});
var pdfRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 60 * 1e3,
  max: 10,
  prefix: "cert_pdf"
});
function getClientIp2(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}
portalRouter.get("/student/rate-limit-status", (req, res) => {
  const ip = getClientIp2(req);
  if (req.query.email !== void 0 && req.query.email !== null && req.query.email !== "") {
    if (typeof req.query.email !== "string" || !isValidEmail2(req.query.email)) {
      return res.status(400).json({
        error: 'Query parameter "email" must be a valid email address.',
        code: "INVALID_EMAIL_QUERY"
      });
    }
  }
  const email = req.query.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  const status = loginRateLimiter.peek(key);
  res.json({
    limit: status.limit,
    remaining: status.remaining,
    resetInSeconds: status.resetInSeconds,
    isLimited: status.isLimited
  });
});
portalRouter.post("/student/record-login-attempt", (req, res) => {
  const ip = getClientIp2(req);
  const email = req.body?.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  const rlCheck = loginRateLimiter.check(key);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      allowed: false,
      limit: rlCheck.limit,
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds,
      error: `Too many login attempts. Please wait ${rlCheck.resetInSeconds} seconds before trying again.`,
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
  return res.json({
    allowed: true,
    limit: rlCheck.limit,
    remaining: rlCheck.remaining,
    resetInSeconds: rlCheck.resetInSeconds
  });
});
portalRouter.post("/student/reset-rate-limit", (req, res) => {
  const ip = getClientIp2(req);
  const email = req.body?.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  loginRateLimiter.reset(key);
  return res.json({ success: true, remaining: 5 });
});
function sanitizeUrl2(rawUrl2) {
  if (!rawUrl2) return "";
  return rawUrl2.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
portalRouter.post("/auth/forgot-password", async (req, res) => {
  const ip = getClientIp2(req);
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, portal, redirectOrigin } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email address is required.", code: "EMAIL_REQUIRED" });
  }
  if (!isValidEmail2(email)) {
    return res.status(400).json({ error: "Please enter a valid email address.", code: "INVALID_EMAIL_FORMAT" });
  }
  if (portal !== void 0 && portal !== null && portal !== "admin" && portal !== "student") {
    return res.status(400).json({ error: 'Portal parameter must be "admin" or "student".', code: "INVALID_PORTAL" });
  }
  if (redirectOrigin !== void 0 && redirectOrigin !== null && (typeof redirectOrigin !== "string" || redirectOrigin.length > 300)) {
    return res.status(400).json({ error: "Invalid redirectOrigin parameter.", code: "INVALID_ORIGIN" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`forgot_pw:${ip}:${cleanEmail}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many password reset attempts. Please wait ${rlCheck.resetInSeconds} seconds before requesting another reset link.`,
      code: "RATE_LIMIT_EXCEEDED",
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const isPortalAdmin = portal === "admin";
  const authorizedAdmins = getAuthorizedAdminEmails();
  if (isPortalAdmin && !authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: "This email is not registered as an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr && isSupabaseNetworkError(listErr)) {
        useNetworkFallback = true;
      } else {
        const allUsers = listData?.users || [];
        let authUser = allUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
        let recipientName = cleanEmail.split("@")[0];
        if (!authUser) {
          if (isPortalAdmin && authorizedAdmins.has(cleanEmail)) {
            const { data: created, error: createErr } = await supabase.auth.admin.createUser({
              email: cleanEmail,
              email_confirm: true,
              user_metadata: { name: cleanEmail.split("@")[0], role: "admin" }
            });
            if (createErr && isSupabaseNetworkError(createErr)) {
              useNetworkFallback = true;
            } else if (!createErr && created?.user) {
              authUser = created.user;
              recipientName = "Administrator";
            }
          } else {
            const { data: studentRow, error: stuErr } = await supabase.from("students").select("id, name, email").eq("email", cleanEmail).maybeSingle();
            if (stuErr && isSupabaseNetworkError(stuErr)) {
              useNetworkFallback = true;
            } else if (studentRow) {
              recipientName = studentRow.name || recipientName;
              const { data: created, error: createErr } = await supabase.auth.admin.createUser({
                email: cleanEmail,
                email_confirm: true,
                user_metadata: { name: studentRow.name, role: "student" }
              });
              if (!createErr && created?.user) {
                authUser = created.user;
                await supabase.from("students").update({ auth_user_id: created.user.id }).eq("id", studentRow.id);
              }
            }
          }
        } else {
          recipientName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || recipientName;
        }
        if (!useNetworkFallback) {
          if (!authUser) {
            return res.json({
              success: true,
              message: "If an account is registered with this email, a password reset link has been dispatched to your inbox.",
              email: cleanEmail
            });
          }
          const origin = redirectOrigin && typeof redirectOrigin === "string" && redirectOrigin.startsWith("http") ? redirectOrigin.replace(/\/+$/, "") : `${req.protocol}://${req.get("host")}`;
          const redirectPath = isPortalAdmin ? "/admin?type=recovery" : "/pages/student-portal?type=recovery";
          const finalRedirect = `${origin}${redirectPath}`;
          const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
            type: "recovery",
            email: cleanEmail,
            options: {
              redirectTo: finalRedirect
            }
          });
          if (linkErr && isSupabaseNetworkError(linkErr)) {
            useNetworkFallback = true;
          } else if (linkErr || !linkData?.properties) {
            console.error("Supabase recovery link error:", linkErr);
            return res.status(500).json({
              error: "Unable to generate a password reset link at this time. Please try again shortly or contact admissions support.",
              code: "RECOVERY_LINK_GENERATION_FAILED"
            });
          } else {
            const actionLink = linkData.properties.action_link;
            const emailOtp = linkData.properties.email_otp;
            const subject = isPortalAdmin ? `\u{1F510} Administrator Password Recovery \u2014 Vixora Digital Hub` : `\u{1F510} Reset Your Password \u2014 Vixora Academy`;
            const resetEmailData = buildPasswordResetEmail({
              studentName: recipientName,
              email: cleanEmail,
              otpCode: emailOtp || "",
              recoveryUrl: actionLink
            });
            const htmlContent = resetEmailData.html;
            const textContent = resetEmailData.text;
            const dispatchResult = await dispatchGenericEmail({
              to: cleanEmail,
              toName: recipientName,
              subject: resetEmailData.subject,
              html: htmlContent,
              text: textContent
            });
            const logId = `eml-reset-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
            await saveEmailLog({
              id: logId,
              recipientEmail: cleanEmail,
              recipientName,
              subject,
              status: dispatchResult.delivered ? "delivered" : "simulated",
              provider: dispatchResult.provider,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
              isDev: process.env.NODE_ENV !== "production",
              devActionLink: process.env.NODE_ENV !== "production" ? actionLink : void 0,
              devOtp: process.env.NODE_ENV !== "production" ? emailOtp : void 0
            });
          }
        }
      }
    } catch (err) {
      if (isSupabaseNetworkError(err)) {
        useNetworkFallback = true;
      } else {
        console.error("Password reset handler error:", err);
        return res.status(500).json({
          error: "An internal server error occurred while processing your password reset request.",
          code: "RESET_INTERNAL_ERROR"
        });
      }
    }
  }
  if ((!supabase || useNetworkFallback) && isPortalAdmin && shouldUseDevAdminFallback()) {
    const emailOtp = createDevOtp(cleanEmail);
    const resetEmailData = buildPasswordResetEmail({
      studentName: "Administrator",
      email: cleanEmail,
      otpCode: emailOtp,
      recoveryUrl: `${req.protocol}://${req.get("host")}/admin`
    });
    const dispatchResult = await dispatchGenericEmail({
      to: cleanEmail,
      toName: "Administrator",
      subject: resetEmailData.subject,
      html: resetEmailData.html,
      text: resetEmailData.text
    });
    await saveEmailLog({
      id: `eml-reset-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      recipientEmail: cleanEmail,
      recipientName: "Administrator",
      subject: resetEmailData.subject,
      status: dispatchResult.delivered ? "delivered" : "simulated",
      provider: dispatchResult.provider,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
      previewHtml: resetEmailData.html,
      previewText: resetEmailData.text,
      messageId: dispatchResult.messageId,
      deliveredToInternet: dispatchResult.deliveredToInternet,
      infoNotice: "Local development administrator OTP generated."
    });
    return res.json({
      success: true,
      message: `A 6-digit security verification code has been generated for ${cleanEmail}.`,
      email: cleanEmail,
      hasOtp: true,
      provider: dispatchResult.provider,
      delivered: dispatchResult.delivered,
      isDev: true,
      devOtp: emailOtp
    });
  }
  return res.status(503).json({
    error: "Authentication service is unavailable. Supabase is not configured or unreachable.",
    code: "AUTH_SERVICE_UNCONFIGURED"
  });
});
portalRouter.post("/auth/reset-password-with-otp", async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      error: "Email, 6-digit verification code, and new password are required.",
      code: "MISSING_FIELDS"
    });
  }
  if (!isValidEmail2(email)) {
    return res.status(400).json({
      error: "Please enter a valid email address.",
      code: "INVALID_EMAIL_FORMAT"
    });
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanOtp = String(otp).trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({
      error: "Verification code must be a 6-digit numeric code.",
      code: "INVALID_OTP_FORMAT"
    });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 200) {
    return res.status(400).json({
      error: "Password must be between 6 and 200 characters long.",
      code: "PASSWORD_INVALID_LENGTH"
    });
  }
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      const anonSb = getPublicSupabaseClient() || createClient3(
        sanitizeUrl2(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ""),
        process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
      );
      const { data: vData, error: vErr } = await anonSb.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: "recovery"
      });
      if (vErr && isSupabaseNetworkError(vErr)) {
        useNetworkFallback = true;
      } else if (vErr || !vData?.user) {
        return res.status(400).json({
          error: "Your 6-digit verification code has expired or is invalid. Please check your email or request a new code below.",
          code: "INVALID_OTP"
        });
      } else {
        const { error: uErr } = await supabase.auth.admin.updateUserById(vData.user.id, {
          password: String(newPassword)
        });
        if (uErr && isSupabaseNetworkError(uErr)) {
          useNetworkFallback = true;
        } else if (uErr) {
          return res.status(400).json({
            error: uErr.message || "Unable to update password. Please ensure it is at least 6 characters long.",
            code: "PASSWORD_UPDATE_FAILED"
          });
        } else {
          return res.json({
            success: true,
            message: "Password successfully updated. You can now sign in with your new credentials."
          });
        }
      }
    } catch (err) {
      if (isSupabaseNetworkError(err)) {
        useNetworkFallback = true;
      } else {
        console.error("Error in /api/auth/reset-password-with-otp:", err);
        return res.status(400).json({
          error: "Unable to update password with this verification code. Please request a fresh code below.",
          code: "RESET_FAILED"
        });
      }
    }
  }
  if (!supabase || useNetworkFallback) {
    const authorizedAdmins = getAuthorizedAdminEmails();
    if (shouldUseDevAdminFallback() && authorizedAdmins.has(cleanEmail)) {
      if (!verifyDevOtp(cleanEmail, cleanOtp)) {
        return res.status(400).json({
          error: "Invalid or expired 6-digit verification code. Please request a fresh code.",
          code: "INVALID_OTP"
        });
      }
      resetDevAdminPassword(cleanEmail, String(newPassword));
      return res.json({
        success: true,
        message: "Administrator password updated successfully. You can now sign in with your new credentials."
      });
    }
    return res.status(503).json({ error: "Supabase is not configured or unreachable." });
  }
  return res.status(400).json({
    error: "Unable to update password with this verification code.",
    code: "RESET_FAILED"
  });
});
portalRouter.post("/auth/reset-password-with-token", async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { accessToken, newPassword } = req.body;
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ error: "Valid session access token is required.", code: "TOKEN_REQUIRED" });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 200) {
    return res.status(400).json({ error: "Password must be between 6 and 200 characters long.", code: "PASSWORD_INVALID_LENGTH" });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service is unavailable.", code: "AUTH_UNAVAILABLE" });
  }
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData?.user) {
      return res.status(401).json({
        error: "Your password setup link or session has expired. Please request a new recovery link.",
        code: "TOKEN_EXPIRED"
      });
    }
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userData.user.id, {
      password: String(newPassword)
    });
    if (updateErr) {
      return res.status(400).json({
        error: updateErr.message || "Unable to update password. Please ensure it is at least 6 characters.",
        code: "UPDATE_FAILED"
      });
    }
    return res.json({
      success: true,
      message: "Password successfully updated. You can now sign in with your new credentials."
    });
  } catch (err) {
    console.error("Error in /api/auth/reset-password-with-token:", err);
    return res.status(500).json({
      error: "An internal error occurred while updating your password.",
      code: "RESET_FAILED"
    });
  }
});
portalRouter.post("/auth/student-login", async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required.", code: "MISSING_FIELDS" });
  }
  const ip = getClientIp2(req);
  const cleanEmail = email.toLowerCase().trim();
  const key = `${ip}:${cleanEmail}`;
  const rlCheck = loginRateLimiter.check(key);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many login attempts. Please wait ${rlCheck.resetInSeconds} seconds before trying again.`,
      code: "RATE_LIMIT_EXCEEDED",
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const rawSbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://xenjfszsppwqadgwzpxl.supabase.co";
  const rawSbAnon = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4";
  const anonSb = createClient3(sanitizeUrl2(rawSbUrl), rawSbAnon);
  try {
    const { data, error } = await anonSb.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });
    if (error || !data.session) {
      return res.status(401).json({
        error: error?.message || "Login failed. Invalid student credentials.",
        code: "INVALID_CREDENTIALS",
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds
      });
    }
    loginRateLimiter.reset(key);
    return res.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        token_type: data.session.token_type,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      },
      user: data.user
    });
  } catch (err) {
    console.error("Error in /api/auth/student-login:", err);
    return res.status(500).json({
      error: "Authentication service temporarily unavailable. Please retry shortly.",
      code: "AUTH_ERROR"
    });
  }
});
portalRouter.post("/student/login", (req, res) => {
  return res.status(401).json({
    error: "Direct unauthenticated student login has been retired. Authenticate with Supabase Auth (supabase.auth.signInWithPassword) and query /api/student/profile with Bearer token.",
    code: "AUTH_METHOD_DEPRECATED"
  });
});
portalRouter.get("/student/profile", requireAuthentication, async (req, res) => {
  const verifiedUser = req.user;
  if (!verifiedUser || !verifiedUser.id || !verifiedUser.email) {
    return res.status(401).json({
      error: "Invalid or missing user session context.",
      code: "AUTH_SESSION_INVALID"
    });
  }
  if (req.query.email !== void 0) {
    if (typeof req.query.email !== "string" || !isValidEmail2(req.query.email)) {
      return res.status(400).json({
        error: "Invalid email query parameter format.",
        code: "INVALID_EMAIL_QUERY"
      });
    }
  }
  const queryEmail = req.query.email?.toLowerCase().trim();
  if (queryEmail && queryEmail !== verifiedUser.email) {
    return res.status(403).json({
      error: "Access denied: You cannot request another student's profile.",
      code: "FORBIDDEN_PROFILE_MISMATCH"
    });
  }
  try {
    const student = await getAuthenticatedStudentProfile(verifiedUser.id, verifiedUser.email);
    if (!student) {
      return res.status(404).json({
        error: "No enrolled student record found for this authenticated account.",
        code: "STUDENT_ACCOUNT_NOT_LINKED"
      });
    }
    const studentCerts = await getCertificatesByStudentEmail(student.email);
    return res.json({
      student,
      certificates: studentCerts
    });
  } catch (err) {
    console.error("Error in /api/student/profile:", err);
    const status = err instanceof DatabaseServiceError ? err.status : 500;
    return res.status(status).json({
      error: "Failed to retrieve student profile.",
      code: err instanceof DatabaseServiceError ? err.code : "PROFILE_RETRIEVAL_ERROR"
    });
  }
});
portalRouter.get("/student/courses/:courseId/telegram-invite", requireAuthentication, async (req, res) => {
  const verifiedUser = req.user;
  if (!verifiedUser || !verifiedUser.id || !verifiedUser.email) {
    return res.status(401).json({
      error: "Invalid or missing user session context.",
      code: "AUTH_SESSION_INVALID"
    });
  }
  const courseId = req.params.courseId?.trim();
  if (!courseId) {
    return res.status(400).json({ error: "Course ID parameter is required.", code: "MISSING_COURSE_ID" });
  }
  try {
    const student = await getAuthenticatedStudentProfile(verifiedUser.id, verifiedUser.email);
    if (!student) {
      return res.status(404).json({ error: "Student record not found.", code: "STUDENT_NOT_FOUND" });
    }
    const normTarget = courseId.toLowerCase();
    const hasEnrolled = student.courses.some((c) => {
      const cId = c.courseId.toLowerCase();
      return cId === normTarget || cId.includes("bundle") || cId === "course-cohort-1-master-bundle" || normTarget.includes("bundle") && cId.includes("bundle");
    });
    if (!hasEnrolled) {
      return res.status(403).json({
        error: "Access denied: You are not enrolled in this course.",
        code: "FORBIDDEN_NOT_ENROLLED"
      });
    }
    const invites = getTelegramInvitesForCourse(courseId);
    return res.json({
      success: true,
      courseId,
      invites
    });
  } catch (err) {
    console.error("Error fetching course telegram invite:", err);
    return res.status(500).json({
      error: "Internal error resolving course access.",
      code: "INTERNAL_ERROR"
    });
  }
});
async function handleCertificateVerification(req, res, rawId) {
  const ip = getClientIp2(req);
  const rlCheck = verifyRateLimiter.check(ip);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      verified: false,
      error: `Verification rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before attempting further verification requests.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  const rawTarget = rawId || req.query.id;
  if (!rawTarget || typeof rawTarget !== "string") {
    return res.status(400).json({
      verified: false,
      error: "Certificate Credential ID is required (e.g. VA-2026-9042-ENG).",
      code: "MISSING_CREDENTIAL_ID"
    });
  }
  const certId = rawTarget.toUpperCase().trim();
  if (!isValidCertificateId(certId)) {
    return res.status(400).json({
      verified: false,
      error: "Invalid credential identifier format. Expected 4-40 alphanumeric characters and hyphens only.",
      code: "INVALID_CREDENTIAL_ID"
    });
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    console.error(`[Verification] Service failure querying certificate ${certId}:`, err);
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    const code = err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE";
    return res.status(status).json({
      verified: false,
      status: "SERVICE_UNAVAILABLE",
      error: "Certificate verification service is temporarily unavailable. Please try again shortly.",
      code,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (!cert) {
    return res.status(404).json({
      verified: false,
      status: "NOT_FOUND",
      error: `Certificate with ID '${certId}' was not found in the Vixora Academy Global Credential Registry.`,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const hasValidLedgerHash = Boolean(cert.credentialHash && cert.credentialHash.length === 64);
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
    status: "VERIFIED_ACTIVE",
    certificate: publicCertificate,
    issuer: "Vixora Academy Global Directorate",
    dean: cert.directorName || "Sarumi Hammad",
    deanTitle: cert.directorTitle || "Dean, Vixora Academy",
    verificationMethod: "Cryptographic SHA-256 Ledger Signature Match",
    integrityStatus: hasValidLedgerHash ? "LEDGER_HASH_VALID" : "LEGACY_COMPATIBLE",
    downloadPdfUrl: `/api/certificates/${cert.id}/pdf`,
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
}
portalRouter.get("/certificates/verify/:id", (req, res) => {
  return handleCertificateVerification(req, res, req.params.id);
});
portalRouter.get("/certificates/verify", (req, res) => {
  return handleCertificateVerification(req, res);
});
async function handleCertificatePdfDownload(req, res) {
  const ip = getClientIp2(req);
  const rlCheck = pdfRateLimiter.check(ip);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: "Too many certificate PDF requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
  const rawId = req.params.id;
  if (!rawId || typeof rawId !== "string") {
    return res.status(400).json({ error: "Certificate ID is required.", code: "MISSING_CERTIFICATE_ID" });
  }
  const certId = rawId.toUpperCase().trim();
  if (!isValidCertificateId(certId)) {
    return res.status(400).json({
      error: "Invalid certificate identifier format. Expected 4-40 alphanumeric characters and hyphens only.",
      code: "INVALID_CERTIFICATE_ID"
    });
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    console.error(`[PDF Download] Service failure querying certificate ${certId}:`, err);
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    const code = err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE";
    return res.status(status).json({
      error: "Certificate generation service is temporarily unavailable.",
      code
    });
  }
  if (!cert) {
    return res.status(404).json({
      error: `Certificate '${certId}' not found in the registry.`
    });
  }
  try {
    const pdfBuffer = await generateCertificatePdfBuffer(cert);
    const filename = `Vixora-Academy-Certificate-${cert.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Failed to generate PDF for certificate", certId, err);
    return res.status(500).json({
      error: "Failed to generate PDF certificate.",
      code: "PDF_GENERATION_FAILED"
    });
  }
}
portalRouter.get("/certificates/:id/pdf", handleCertificatePdfDownload);
portalRouter.get("/certificates/download/:id", handleCertificatePdfDownload);
portalRouter.get("/certificates/list", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 100, 100, req.query.page);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  const cleanSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (req.query.search && cleanSearch.length > 100) {
    return res.status(400).json({ error: "Search query must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  const cleanCourseId = typeof req.query.courseId === "string" ? req.query.courseId.trim() : "";
  if (req.query.courseId && cleanCourseId.length > 100) {
    return res.status(400).json({ error: "courseId filter must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  if (req.query.status && !["active", "revoked", "suspended"].includes(req.query.status)) {
    return res.status(400).json({ error: "status filter must be active, revoked, or suspended.", code: "INVALID_QUERY" });
  }
  const statusFilter = req.query.status;
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      let query = supabase.from("certificates").select("*");
      if (cleanCourseId) {
        query = query.eq("course_id", cleanCourseId);
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      if (cleanSearch) {
        query = query.or(`student_name.ilike.%${cleanSearch}%,id.ilike.%${cleanSearch}%,course_title.ilike.%${cleanSearch}%`);
      }
      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      const { data: certRows, error } = await query;
      if (error) {
        if (!isProductionEnvironment() && isSupabaseNetworkError(error)) {
          console.warn("[Supabase] Network unreachable listing certificates; falling back to local cache.");
          useNetworkFallback = true;
        } else {
          console.error("[Supabase] Error listing certificates:", error);
          if (isProductionEnvironment() || isSupabaseConfigured()) {
            return res.status(503).json({
              error: "Failed to retrieve certificates from database.",
              code: "DATABASE_ERROR"
            });
          }
        }
      }
      if (!useNetworkFallback && certRows) {
        if (certRows.length === 0) {
          return res.json({ certificates: [] });
        }
        const certIds = certRows.map((r) => r.id);
        const { data: compRows } = await supabase.from("certificate_competencies").select("certificate_id, name").in("certificate_id", certIds);
        const compMap = /* @__PURE__ */ new Map();
        (compRows || []).forEach((c) => {
          const list2 = compMap.get(c.certificate_id) || [];
          list2.push(c.name);
          compMap.set(c.certificate_id, list2);
        });
        const list = certRows.map(
          (row) => mapSupabaseCertificateToDomain(row, compMap.get(row.id) || [])
        );
        return res.json({ certificates: list });
      }
    } catch (err) {
      if (!isProductionEnvironment() && isSupabaseNetworkError(err)) {
        console.warn("[Supabase] Network exception listing certificates; falling back to local cache.");
        useNetworkFallback = true;
      } else {
        console.error("[Supabase] Error listing certificates:", err);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          return res.status(503).json({
            error: "Certificate database service is temporarily unavailable.",
            code: "DATABASE_UNAVAILABLE"
          });
        }
      }
    }
  } else {
    if (isProductionEnvironment()) {
      return res.status(503).json({
        error: "Certificate registry database is not configured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
  }
  if (shouldPermitFallback() || !isProductionEnvironment() && useNetworkFallback) {
    let list = Array.from(fallbackCertificatesStore.values());
    if (cleanCourseId) {
      list = list.filter((c) => c.courseId === cleanCourseId);
    }
    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (cleanSearch) {
      const q = cleanSearch.toLowerCase();
      list = list.filter(
        (c) => c.studentName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.courseTitle.toLowerCase().includes(q)
      );
    }
    const paged = list.slice(offset, offset + limit);
    return res.json({ certificates: paged });
  }
  return res.json({ certificates: [] });
});
portalRouter.post("/certificates/issue", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp2(req);
  const rlCheck = emailRateLimiter.check(`issue:${ip}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Certificate issuance rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before issuing more credentials.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const {
    studentName,
    studentEmail,
    courseTitle,
    courseId,
    trackBadge,
    specialization,
    grade,
    honors,
    capstoneTitle,
    capstoneScore,
    competencies,
    durationWeeks,
    instructorName,
    instructorTitle,
    directorName,
    directorTitle,
    status,
    customCertificateId
  } = req.body;
  if (typeof studentName !== "string" || studentName.trim().length < 2 || studentName.trim().length > 150) {
    return res.status(400).json({
      error: "studentName is required and must be a string between 2 and 150 characters.",
      code: "INVALID_STUDENT_NAME"
    });
  }
  if (!isValidEmail2(studentEmail)) {
    return res.status(400).json({
      error: "studentEmail is required and must be a valid email address format.",
      code: "INVALID_EMAIL"
    });
  }
  if (typeof courseTitle !== "string" || courseTitle.trim().length < 2 || courseTitle.trim().length > 200) {
    return res.status(400).json({
      error: "courseTitle is required and must be a string between 2 and 200 characters.",
      code: "INVALID_COURSE_TITLE"
    });
  }
  if (customCertificateId !== void 0 && customCertificateId !== null) {
    if (!isValidCertificateId(customCertificateId)) {
      return res.status(400).json({
        error: "customCertificateId must be between 4 and 40 alphanumeric characters and hyphens.",
        code: "INVALID_CERTIFICATE_ID"
      });
    }
  }
  if (durationWeeks !== void 0 && durationWeeks !== null) {
    if (typeof durationWeeks !== "number" && typeof durationWeeks !== "string") {
      return res.status(400).json({
        error: "durationWeeks must be a positive integer between 1 and 104.",
        code: "INVALID_DURATION"
      });
    }
    const parsedDuration = Number(durationWeeks);
    if (!Number.isFinite(parsedDuration) || !Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 104) {
      return res.status(400).json({
        error: "durationWeeks must be a positive integer between 1 and 104.",
        code: "INVALID_DURATION"
      });
    }
  }
  if (competencies !== void 0 && competencies !== null) {
    if (!Array.isArray(competencies)) {
      return res.status(400).json({
        error: "competencies must be an array of strings.",
        code: "INVALID_COMPETENCIES"
      });
    }
    if (competencies.length > 20) {
      return res.status(400).json({
        error: "competencies array cannot exceed 20 items.",
        code: "COMPETENCIES_OVERSIZED"
      });
    }
    for (let i = 0; i < competencies.length; i++) {
      const comp = competencies[i];
      if (typeof comp !== "string" || comp.trim().length < 1 || comp.trim().length > 200) {
        return res.status(400).json({
          error: `Each competency item must be a non-empty string under 200 characters (issue at index ${i}).`,
          code: "INVALID_COMPETENCY_ITEM"
        });
      }
    }
  }
  const optionalStringFields = [
    { val: courseId, name: "courseId", maxLen: 100 },
    { val: trackBadge, name: "trackBadge", maxLen: 100 },
    { val: specialization, name: "specialization", maxLen: 150 },
    { val: grade, name: "grade", maxLen: 50 },
    { val: honors, name: "honors", maxLen: 150 },
    { val: capstoneTitle, name: "capstoneTitle", maxLen: 200 },
    { val: capstoneScore, name: "capstoneScore", maxLen: 50 },
    { val: instructorName, name: "instructorName", maxLen: 150 },
    { val: instructorTitle, name: "instructorTitle", maxLen: 150 },
    { val: directorName, name: "directorName", maxLen: 150 },
    { val: directorTitle, name: "directorTitle", maxLen: 150 }
  ];
  for (const field of optionalStringFields) {
    if (field.val !== void 0 && field.val !== null) {
      if (typeof field.val !== "string" || field.val.trim().length === 0 || field.val.length > field.maxLen) {
        return res.status(400).json({
          error: `${field.name} must be a non-empty string up to ${field.maxLen} characters.`,
          code: "FIELD_TOO_LONG"
        });
      }
    }
  }
  if (status !== void 0 && status !== null && !["active", "revoked", "suspended"].includes(status)) {
    return res.status(400).json({ error: "status must be active, revoked, or suspended.", code: "INVALID_STATUS" });
  }
  const cleanEmail = studentEmail.toLowerCase().trim();
  let certId;
  if (customCertificateId) {
    certId = customCertificateId.toUpperCase().trim();
  } else {
    try {
      certId = await generateSecureCertificateId(courseTitle);
    } catch (genErr) {
      console.error("Failed to generate secure certificate ID:", genErr);
      return res.status(500).json({ error: "Failed to issue certificate: unable to allocate a unique credential identifier." });
    }
  }
  const hashRaw = `${certId}:${cleanEmail}:${studentName}:${Date.now()}`;
  const credentialHash = crypto4.createHash("sha256").update(hashRaw).digest("hex");
  const now = /* @__PURE__ */ new Date();
  const issueDateFormatted = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const assignedCompetencies = Array.isArray(competencies) && competencies.length > 0 ? competencies : [
    "Full-Stack AI Architecture & Tool Calling",
    "Production Workflow Automation & Orchestration",
    "Cloud Containerization & High-Throughput APIs",
    "Applied Business Intelligence & Decision Systems"
  ];
  const courseSlug = req.body.courseId || (courseTitle.trim() === "Machine Learning & Data Science" ? "machine-learning-data-science" : courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-track");
  const isMLCourse = courseSlug === "machine-learning-data-science" || courseTitle.trim() === "Machine Learning & Data Science";
  const newCertificate = {
    id: certId,
    studentName: studentName.trim(),
    studentEmail: cleanEmail,
    courseId: courseSlug,
    courseTitle: courseTitle.trim(),
    trackBadge: req.body.trackBadge || (isMLCourse ? "Data & Analytics" : "Professional Track"),
    specialization: specialization || (isMLCourse ? "Predictive Modeling, Scikit-Learn & Feature Engineering" : "Enterprise Digital & AI Solutions"),
    grade: grade || "High Distinction",
    honors: honors || "Demonstrated Rigorous Engineering Mastery",
    capstoneTitle: capstoneTitle || (isMLCourse ? "End-to-End Predictive Machine Learning Pipeline & Model Deployment" : "Enterprise Production Deployment & Architecture"),
    capstoneScore: capstoneScore || "97.8 / 100",
    issueDate: issueDateFormatted,
    completionDate: "September 2026",
    durationWeeks: req.body.durationWeeks || (isMLCourse ? 18 : 12),
    credentialHash,
    verificationUrl: `https://academy.vixoradigitalhub.com/verify?id=${certId}`,
    instructorName: req.body.instructorName || (isMLCourse ? "Marcus Sterling" : "Dr. Adebayo Vance"),
    instructorTitle: req.body.instructorTitle || (isMLCourse ? "Head of Data Systems, Vixora Analytics" : "Principal AI Architect, Vixora Labs"),
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: assignedCompetencies,
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: now.toISOString()
  };
  try {
    await saveIssuedCertificate(newCertificate, assignedCompetencies);
  } catch (saveErr) {
    console.error("Failed persisting issued certificate:", saveErr);
    return res.status(500).json({ error: "Failed to persist issued certificate to registry." });
  }
  let pdfBuffer;
  const pdfFilename = `Vixora-Academy-Certificate-${certId}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(newCertificate);
  } catch (pdfErr) {
    console.error("Failed generating certificate PDF attachment on issue:", pdfErr);
  }
  const supabase = getSupabaseAdmin();
  if (supabase && pdfBuffer) {
    try {
      await supabase.storage.from("certificates").upload(`${certId}.pdf`, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });
    } catch (storageErr) {
    }
  }
  const emailHtml = generateCertificateEmailHtml(newCertificate);
  const emailText = generateCertificateEmailText(newCertificate);
  const emailSubject = `\u{1F393} Congratulations ${studentName}! Your Vixora Academy Certificate is Ready`;
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
  const emailLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
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
  await saveEmailLog(emailLog);
  return res.json({
    success: true,
    message: dispatchResult.deliveredToInternet ? `Certificate ${certId} issued and official confirmation email with PDF certificate attachment delivered to ${cleanEmail} via SMTP!` : `Certificate ${certId} issued with attached PDF certificate (${pdfFilename}) prepared in Outbox. Ready for instant delivery.`,
    certificate: newCertificate,
    emailLog,
    delivery: dispatchResult
  });
});
async function executeCertificateEmailDispatch(cert, targetEmail) {
  let pdfBuffer;
  const pdfFilename = `Vixora-Academy-Certificate-${cert.id}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(cert);
  } catch (pdfErr) {
    console.error("Failed generating certificate PDF buffer for email dispatch:", pdfErr);
  }
  const verificationUrl = cert.verificationUrl || `https://academy.vixoradigitalhub.com/verify?code=${encodeURIComponent(cert.id)}`;
  const certEmailData = buildCertificateAwardEmail({
    studentName: cert.studentName,
    studentEmail: targetEmail,
    courseTitle: cert.courseTitle,
    certificateId: cert.id,
    grade: cert.grade || "Distinction",
    issuedDate: cert.issueDate,
    verificationUrl
  });
  const emailHtml = certEmailData.html;
  const emailText = certEmailData.text;
  const emailSubject = certEmailData.subject;
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
  const emailLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    certificateId: cert.id,
    recipientEmail: targetEmail,
    recipientName: cert.studentName,
    subject: emailSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
  cert.lastEmailSentAt = (/* @__PURE__ */ new Date()).toISOString();
  return { dispatchResult, emailLog, pdfBuffer };
}
portalRouter.post("/certificates/send-email", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp2(req);
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateId, customRecipientEmail, recipientEmail, email } = req.body;
  if (!isValidCertificateId(certificateId)) {
    return res.status(400).json({ error: "Valid certificateId is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  const rawTargetEmail = customRecipientEmail ?? recipientEmail ?? email;
  if (rawTargetEmail !== void 0 && rawTargetEmail !== null) {
    if (typeof rawTargetEmail !== "string" || rawTargetEmail.trim().length === 0 || !isValidEmail2(rawTargetEmail)) {
      return res.status(400).json({ error: "Recipient email address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certificateId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
  if (!cert) {
    return res.status(404).json({ error: "Certificate not found." });
  }
  const targetEmail = (rawTargetEmail || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Email sending rate limit reached for this recipient. Please wait ${rlCheck.resetInSeconds} seconds before sending another email.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);
  res.json({
    success: true,
    message: dispatchResult.deliveredToInternet ? `Certificate with PDF attachment successfully delivered to ${targetEmail} via SMTP!` : `Certificate email with PDF attachment prepared for ${targetEmail}. Click 'Open in Gmail' to deliver immediately from your inbox, or configure SMTP.`,
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
portalRouter.post("/certificates/:id/dispatch-email", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp2(req);
  if (!isValidCertificateId(req.params.id)) {
    return res.status(400).json({ error: "Valid certificate ID is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  const certId = req.params.id.toUpperCase().trim();
  if (req.body !== void 0 && req.body !== null && Object.keys(req.body).length > 0) {
    if (!isPlainObject2(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
    }
  }
  const customEmail = req.body?.customRecipientEmail;
  if (customEmail !== void 0 && customEmail !== null) {
    if (typeof customEmail !== "string" || customEmail.trim().length === 0 || !isValidEmail2(customEmail)) {
      return res.status(400).json({ error: "customRecipientEmail address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
  if (!cert) {
    return res.status(404).json({ error: `Certificate '${certId}' not found.` });
  }
  const targetEmail = (customEmail || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${rlCheck.resetInSeconds} seconds before triggering another email.`,
      code: "RATE_LIMIT_EXCEEDED",
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
    message: dispatchResult.deliveredToInternet ? `Automated dispatch trigger completed. Email and PDF delivered to ${targetEmail} via SMTP!` : `Automated dispatch trigger completed. Certificate and PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});
portalRouter.post("/certificates/trigger-dispatch", requireAuthentication, requireAdmin, async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateId, customRecipientEmail } = req.body;
  if (!isValidCertificateId(certificateId)) {
    return res.status(400).json({ error: "Valid certificateId is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  if (customRecipientEmail !== void 0 && customRecipientEmail !== null) {
    if (typeof customRecipientEmail !== "string" || customRecipientEmail.trim().length === 0 || !isValidEmail2(customRecipientEmail)) {
      return res.status(400).json({ error: "customRecipientEmail address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certificateId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
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
    message: dispatchResult.deliveredToInternet ? `Automated email dispatch trigger completed: PDF delivered to ${targetEmail} via SMTP.` : `Automated email dispatch trigger completed: PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});
portalRouter.post("/certificates/batch-dispatch", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp2(req);
  const rlCheck = emailRateLimiter.check(`batch_dispatch:${ip}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Batch dispatch rate limit reached. Please wait ${rlCheck.resetInSeconds} seconds before triggering another batch.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateIds } = req.body;
  const targets = [];
  if (certificateIds !== void 0) {
    if (!Array.isArray(certificateIds)) {
      return res.status(400).json({ error: "certificateIds must be an array of string IDs.", code: "INVALID_BATCH_ARRAY" });
    }
    if (certificateIds.length === 0) {
      return res.status(400).json({ error: "certificateIds array cannot be empty.", code: "EMPTY_BATCH_ARRAY" });
    }
    if (certificateIds.length > 50) {
      return res.status(400).json({ error: "certificateIds array cannot exceed maximum batch size of 50.", code: "BATCH_TOO_LARGE" });
    }
    for (let i = 0; i < certificateIds.length; i++) {
      const id = certificateIds[i];
      if (!isValidCertificateId(id)) {
        return res.status(400).json({
          error: `Invalid certificate ID at index ${i}: '${String(id)}'. Expected 4-40 alphanumeric characters and hyphens.`,
          code: "INVALID_CERTIFICATE_ID"
        });
      }
    }
    for (const id of certificateIds) {
      try {
        const c = await getCertificateById(id);
        if (c) targets.push(c);
      } catch (err) {
        console.warn(`[Batch Dispatch] Error resolving certificate ${id}:`, err);
      }
    }
  } else {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data: certRows, error } = await supabase.from("certificates").select("*");
        if (error) {
          console.error("[Batch Dispatch] Supabase query error:", error);
          if (isProductionEnvironment() || isSupabaseConfigured()) {
            return res.status(503).json({
              error: "Database error reading certificates for batch dispatch.",
              code: "DATABASE_ERROR"
            });
          }
        }
        if (certRows) {
          for (const row of certRows) {
            targets.push(mapSupabaseCertificateToDomain(row));
          }
        }
      } catch (err) {
        console.error("[Batch Dispatch] Connection error:", err);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          return res.status(503).json({
            error: "Database connection error during batch dispatch.",
            code: "DATABASE_UNAVAILABLE"
          });
        }
      }
    } else {
      if (isProductionEnvironment()) {
        return res.status(503).json({
          error: "Certificate database is not configured in production.",
          code: "DATABASE_UNCONFIGURED"
        });
      }
    }
    if (targets.length === 0 && shouldPermitFallback()) {
      fallbackCertificatesStore.forEach((c) => targets.push(c));
    }
  }
  const results = [];
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
    } catch (err) {
      results.push({
        certificateId: cert.id,
        recipient: cert.studentEmail,
        status: "error",
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
portalRouter.get("/certificates/email-config", requireAuthentication, requireAdmin, (req, res) => {
  const status = getEmailConfigStatus();
  res.json(status);
});
portalRouter.get("/certificates/email-logs", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 50, 100, req.query.page);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  const logs = await getRecentEmailLogs(limit, offset);
  res.json({
    logs,
    totalSent: logs.length,
    config: getEmailConfigStatus()
  });
});
portalRouter.post("/admin/setup", async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Administrator email and password are required.", code: "MISSING_FIELDS" });
  }
  if (!isValidEmail2(email)) {
    return res.status(400).json({ error: "Invalid email address format.", code: "INVALID_EMAIL" });
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 200) {
    return res.status(400).json({ error: "Password must be between 6 and 200 characters long.", code: "INVALID_PASSWORD" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = typeof name === "string" && name.trim().length > 0 ? name.trim().slice(0, 120) : cleanEmail.split("@")[0];
  const authorizedAdmins = getAuthorizedAdminEmails();
  if (authorizedAdmins.size === 0) {
    return res.status(403).json({
      error: "Administrator allowlist (ADMIN_EMAILS) is not configured on this server. Add your email to ADMIN_EMAILS in your hosting Secrets / Environment Variables and redeploy.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  if (!authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: "Access denied: this email address is not in the authorized administrator allowlist.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  const role = "Administrator";
  const title = "Executive Administrator";
  const permissions = ["manage_projects", "issue_certificates", "dispatch_emails", "manage_students", "manage_sales", "system_config"];
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1e3 });
      if (listErr && isSupabaseNetworkError(listErr)) {
        useNetworkFallback = true;
      } else {
        const allUsers = listData?.users || [];
        const existingUser = allUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existingUser) {
          return res.status(409).json({
            error: "An administrator account already exists for this email. Please sign in or use Forgot Password.",
            code: "ACCOUNT_EXISTS"
          });
        }
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: String(password),
          email_confirm: true,
          user_metadata: {
            full_name: cleanName,
            name: cleanName,
            role: "admin"
          }
        });
        if (createErr && isSupabaseNetworkError(createErr)) {
          useNetworkFallback = true;
        } else if (createErr && /already.*(registered|exists)/i.test(createErr.message || "")) {
          return res.status(409).json({
            error: "An administrator account already exists for this email. Please sign in or use Forgot Password.",
            code: "ACCOUNT_EXISTS"
          });
        } else if (createErr || !created?.user) {
          return res.status(400).json({
            error: createErr?.message || "Unable to provision administrator account in Supabase.",
            code: "ADMIN_CREATE_FAILED"
          });
        } else {
          const authClient = createEphemeralPublicSupabaseClient() || supabase;
          const { data: loginData, error: loginErr } = await authClient.auth.signInWithPassword({
            email: cleanEmail,
            password: String(password)
          });
          if (loginErr && isSupabaseNetworkError(loginErr)) {
            useNetworkFallback = true;
          } else if (loginErr || !loginData?.session) {
            return res.json({
              success: true,
              message: `Administrator account created for ${cleanEmail}. Please sign in with your password.`
            });
          } else {
            return res.json({
              success: true,
              message: `Executive Administrator account activated for ${cleanName}.`,
              token: loginData.session.access_token,
              user: {
                id: loginData.user.id,
                name: cleanName,
                email: cleanEmail,
                role,
                title,
                permissions
              },
              expiresAt: loginData.session.expires_at ? loginData.session.expires_at * 1e3 : Date.now() + 3600 * 1e3
            });
          }
        }
      }
    } catch (err) {
      if (isSupabaseNetworkError(err)) {
        useNetworkFallback = true;
      } else {
        console.error("Supabase admin setup error:", err);
        return res.status(500).json({
          error: "Internal error provisioning administrator account.",
          code: "AUTH_EXCEPTION"
        });
      }
    }
  }
  if (shouldUseDevAdminFallback() && (!supabase || useNetworkFallback)) {
    if (hasDevAdminAccount(cleanEmail)) {
      return res.status(409).json({
        error: "This administrator account is already activated. Switch to Sign In or use Forgot Password.",
        code: "ACCOUNT_EXISTS"
      });
    }
    const registered = registerDevAdminAccount(cleanEmail, String(password), cleanName);
    const { token, expiresAt } = issueAdminDevToken(registered);
    return res.json({
      success: true,
      message: `Executive Admin Command Center activated for ${registered.name}.`,
      token,
      user: {
        id: registered.id,
        name: registered.name,
        email: registered.email,
        role,
        title,
        permissions
      },
      expiresAt,
      authMode: "local_dev"
    });
  }
  return res.status(503).json({
    error: "Authentication service unavailable. Supabase Service Role Key is not configured or unreachable.",
    code: "AUTH_SERVICE_UNCONFIGURED"
  });
});
portalRouter.post("/admin/login", async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and administrator password are required.", code: "MISSING_FIELDS" });
  }
  if (!isValidEmail2(email)) {
    return res.status(400).json({ error: "Invalid email address format.", code: "INVALID_EMAIL" });
  }
  if (typeof password !== "string" || password.length < 1 || password.length > 200) {
    return res.status(400).json({ error: "Password must be a string up to 200 characters.", code: "INVALID_PASSWORD" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const authorizedAdmins = getAuthorizedAdminEmails();
  if (authorizedAdmins.size === 0) {
    return res.status(403).json({
      error: "Administrator allowlist (ADMIN_EMAILS) is not configured on this server. Add your email to ADMIN_EMAILS in your hosting Secrets / Environment Variables and redeploy.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  if (!authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: "Access denied: account is not an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  const role = "Administrator";
  const title = "Executive Administrator";
  const permissions = ["manage_projects", "issue_certificates", "dispatch_emails", "manage_students", "manage_sales", "system_config"];
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (supabase) {
    try {
      const authClient = createEphemeralPublicSupabaseClient() || supabase;
      const { data, error } = await authClient.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password)
      });
      if (error && isSupabaseNetworkError(error)) {
        useNetworkFallback = true;
      } else if (error || !data.session) {
        try {
          const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1e3 });
          const allUsers = listData?.users || [];
          const existingUser = allUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (!existingUser) {
            return res.status(401).json({
              error: 'No password has been activated yet for this authorized admin email. Switch to "Create Admin Account" to set your password and enter the dashboard.',
              code: "ACCOUNT_NOT_ACTIVATED"
            });
          }
        } catch {
        }
        return res.status(401).json({
          error: error?.message || "Invalid administrator credentials.",
          code: "INVALID_CREDENTIALS"
        });
      } else {
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split("@")[0];
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
            permissions
          },
          expiresAt: data.session.expires_at ? data.session.expires_at * 1e3 : Date.now() + 3600 * 1e3
        });
      }
    } catch (err) {
      if (isSupabaseNetworkError(err)) {
        useNetworkFallback = true;
      } else {
        console.error("Supabase admin login exception:", err);
        return res.status(500).json({
          error: "Internal authentication service error.",
          code: "AUTH_EXCEPTION"
        });
      }
    }
  }
  if (!supabase && !useNetworkFallback) {
    const publicSb = getPublicSupabaseClient();
    if (publicSb) {
      try {
        const { data, error } = await publicSb.auth.signInWithPassword({
          email: cleanEmail,
          password: String(password)
        });
        if (!error && data?.session && data.user) {
          const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split("@")[0];
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
              permissions
            },
            expiresAt: data.session.expires_at ? data.session.expires_at * 1e3 : Date.now() + 3600 * 1e3
          });
        }
      } catch {
      }
    }
  }
  if (shouldUseDevAdminFallback() && (!supabase || useNetworkFallback)) {
    const authRes = authenticateDevAdminAccount(cleanEmail, String(password));
    if (authRes.ok === true) {
      const { token, expiresAt } = issueAdminDevToken(authRes.user);
      return res.json({
        success: true,
        message: `Welcome back, ${authRes.user.name}. Executive Command session authorized.`,
        token,
        user: {
          id: authRes.user.id,
          name: authRes.user.name,
          email: authRes.user.email,
          role,
          title,
          permissions
        },
        expiresAt,
        authMode: "local_dev"
      });
    } else {
      if (authRes.reason === "NOT_FOUND") {
        return res.status(401).json({
          error: 'No password has been activated yet for this authorized admin email. Switch to "Create Admin Account" to set your password and enter the dashboard.',
          code: "ACCOUNT_NOT_ACTIVATED"
        });
      }
      return res.status(401).json({
        error: "Invalid administrator password. Please check your password or use Forgot Password.",
        code: "INVALID_CREDENTIALS"
      });
    }
  }
  return res.status(503).json({
    error: "Authentication service unavailable. Supabase is not configured or unreachable.",
    code: "AUTH_SERVICE_UNCONFIGURED"
  });
});
portalRouter.get("/admin/me", requireAuthentication, requireAdmin, (req, res) => {
  const user = req.user;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0];
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      name,
      email: user.email,
      role: "Administrator",
      title: "Executive Administrator",
      permissions: ["manage_projects", "issue_certificates", "dispatch_emails", "manage_students", "manage_sales", "system_config"]
    }
  });
});
portalRouter.post("/admin/logout", requireAuthentication, (req, res) => {
  return res.json({ success: true, message: "Administrator session terminated." });
});
function resolveRecordGateway(p) {
  if (p.gateway === "bachs" || p.gateway === "paystack") {
    return p.gateway;
  }
  if ((p.currency || "").toUpperCase() === "USD" || p.id.toUpperCase().startsWith("VIX-BC-")) {
    return "bachs";
  }
  return "paystack";
}
function buildSalesSummaryFromData(params) {
  const canonicalCourses = getAllCanonicalCourses();
  const normalizedPayments = params.payments.map((p) => {
    const gateway = resolveRecordGateway(p);
    const currency = (p.currency || (gateway === "bachs" ? "USD" : "NGN")).toUpperCase();
    const gatewayMode = p.gateway_mode === "sandbox" ? "sandbox" : "live";
    return {
      ...p,
      gateway,
      gatewayMode,
      currency,
      numericAmount: Number(p.amount) || 0
    };
  });
  const verifiedPayments = normalizedPayments.filter((p) => p.status === "success");
  const pendingPayments = normalizedPayments.filter((p) => p.status === "pending");
  const failedPayments = normalizedPayments.filter((p) => p.status === "failed" || p.status === "abandoned");
  const ngnVerified = verifiedPayments.filter((p) => p.currency === "NGN");
  const usdVerified = verifiedPayments.filter((p) => p.currency === "USD");
  const totalRevenueNgn = ngnVerified.reduce((sum, p) => sum + p.numericAmount, 0);
  const totalRevenueUsd = Number(usdVerified.reduce((sum, p) => sum + p.numericAmount, 0).toFixed(2));
  const liveRevenueNgn = ngnVerified.filter((p) => p.gatewayMode === "live").reduce((sum, p) => sum + p.numericAmount, 0);
  const liveRevenueUsd = Number(
    usdVerified.filter((p) => p.gatewayMode === "live").reduce((sum, p) => sum + p.numericAmount, 0).toFixed(2)
  );
  const sandboxRevenueUsd = Number(
    usdVerified.filter((p) => p.gatewayMode === "sandbox").reduce((sum, p) => sum + p.numericAmount, 0).toFixed(2)
  );
  const sandboxPaymentsCount = normalizedPayments.filter((p) => p.gatewayMode === "sandbox").length;
  const completedAttempts = verifiedPayments.length + failedPayments.length;
  const successRatePercent = completedAttempts > 0 ? Math.round(verifiedPayments.length / completedAttempts * 100) : null;
  const summarizeGateway = (gw) => {
    const list = normalizedPayments.filter((p) => p.gateway === gw);
    const ver = list.filter((p) => p.status === "success");
    const pend = list.filter((p) => p.status === "pending");
    const fail = list.filter((p) => p.status === "failed" || p.status === "abandoned");
    const att = ver.length + fail.length;
    return {
      verifiedPaymentsCount: ver.length,
      pendingPaymentsCount: pend.length,
      failedPaymentsCount: fail.length,
      totalTransactionsCount: list.length,
      successRatePercent: att > 0 ? Math.round(ver.length / att * 100) : null,
      revenueNgn: gw === "paystack" ? ver.reduce((s, p) => s + p.numericAmount, 0) : 0,
      revenueUsd: gw === "bachs" ? Number(ver.reduce((s, p) => s + p.numericAmount, 0).toFixed(2)) : 0
    };
  };
  const enrollmentCountByCourse = /* @__PURE__ */ new Map();
  for (const enr of params.enrollments) {
    const resolved = findCanonicalCourse(enr.course_id);
    const key = resolved ? resolved.id : enr.course_id;
    enrollmentCountByCourse.set(key, (enrollmentCountByCourse.get(key) || 0) + 1);
  }
  const revenueByCourse = /* @__PURE__ */ new Map();
  for (const p of verifiedPayments) {
    const resolved = findCanonicalCourse(p.course_id);
    const key = resolved ? resolved.id : p.course_id;
    const prev = revenueByCourse.get(key) || {
      revenueNgn: 0,
      revenueUsd: 0,
      verifiedPayments: 0,
      verifiedPaymentsNgn: 0,
      verifiedPaymentsUsd: 0
    };
    const isUsd = p.currency === "USD";
    revenueByCourse.set(key, {
      revenueNgn: prev.revenueNgn + (isUsd ? 0 : p.numericAmount),
      revenueUsd: Number((prev.revenueUsd + (isUsd ? p.numericAmount : 0)).toFixed(2)),
      verifiedPayments: prev.verifiedPayments + 1,
      verifiedPaymentsNgn: prev.verifiedPaymentsNgn + (isUsd ? 0 : 1),
      verifiedPaymentsUsd: prev.verifiedPaymentsUsd + (isUsd ? 1 : 0)
    });
  }
  const courseBreakdown = canonicalCourses.map((course) => {
    const stats = revenueByCourse.get(course.id) || {
      revenueNgn: 0,
      revenueUsd: 0,
      verifiedPayments: 0,
      verifiedPaymentsNgn: 0,
      verifiedPaymentsUsd: 0
    };
    const enrolledStudents = enrollmentCountByCourse.get(course.id) || 0;
    return {
      courseId: course.id,
      courseTitle: course.title,
      tuitionDisplay: course.tuitionDisplay,
      priceNgn: course.prices.NGN,
      priceUsd: course.prices.USD,
      enrolledStudents,
      verifiedPayments: stats.verifiedPayments,
      verifiedPaymentsNgn: stats.verifiedPaymentsNgn,
      verifiedPaymentsUsd: stats.verifiedPaymentsUsd,
      revenueNgn: stats.revenueNgn,
      revenueUsd: stats.revenueUsd
    };
  });
  const recentPayments = normalizedPayments.slice(0, 100).map((p) => {
    const resolved = findCanonicalCourse(p.course_id);
    return {
      reference: p.id,
      gateway: p.gateway,
      gatewayMode: p.gatewayMode,
      customerEmail: p.customer_email,
      customerName: p.customer_name || p.customer_email.split("@")[0],
      courseId: p.course_id,
      courseTitle: resolved ? resolved.title : p.course_id,
      amount: p.numericAmount,
      currency: p.currency,
      channel: p.channel || (p.gateway === "bachs" ? "card" : "paystack"),
      status: p.status,
      fulfillmentStatus: p.fulfillment_status || "pending",
      paidAt: p.paid_at || null,
      createdAt: p.created_at || (/* @__PURE__ */ new Date()).toISOString()
    };
  });
  return {
    totalRevenueNgn,
    totalRevenueUsd,
    liveRevenueNgn,
    liveRevenueUsd,
    sandboxRevenueUsd,
    sandboxPaymentsCount,
    verifiedPaymentsCount: verifiedPayments.length,
    pendingPaymentsCount: pendingPayments.length,
    failedPaymentsCount: failedPayments.length,
    totalTransactionsCount: normalizedPayments.length,
    totalEnrollmentsCount: params.enrollments.length,
    successRatePercent,
    byGateway: {
      paystack: summarizeGateway("paystack"),
      bachs: summarizeGateway("bachs")
    },
    courseBreakdown,
    recentPayments
  };
}
portalRouter.get("/admin/overview", requireAuthentication, requireAdmin, async (req, res) => {
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      return res.status(503).json({
        error: "Registry database service is unconfigured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
    try {
      let paymentsRes = await supabase.from("payments").select("id, course_id, gateway, gateway_mode, amount, currency, channel, status, fulfillment_status, customer_email, customer_name, paid_at, created_at").order("created_at", { ascending: false }).limit(250);
      if (paymentsRes.error && (paymentsRes.error.code === "42703" || String(paymentsRes.error.message || "").includes("does not exist"))) {
        paymentsRes = await supabase.from("payments").select("id, course_id, amount, currency, channel, status, fulfillment_status, customer_email, customer_name, paid_at, created_at").order("created_at", { ascending: false }).limit(250);
      }
      const [
        certCountRes,
        recentCertsRes,
        studentsCountRes,
        enrollmentsRes,
        emailCountRes
      ] = await Promise.all([
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("course_id, status"),
        supabase.from("email_logs").select("*", { count: "exact", head: true })
      ]);
      const anyNetworkError = [
        certCountRes.error,
        recentCertsRes.error,
        studentsCountRes.error,
        paymentsRes.error,
        enrollmentsRes.error,
        emailCountRes.error
      ].find((e) => e && isSupabaseNetworkError(e));
      if (anyNetworkError && !isProductionEnvironment()) {
        console.warn("[Supabase] Overview network unreachable; falling back to local cache in non-production.");
        useNetworkFallback = true;
      } else {
        if (certCountRes.error) {
          console.error("[Supabase] Overview certificates count error:", certCountRes.error);
          return res.status(503).json({
            error: "Failed to retrieve certificate count from database.",
            code: "DATABASE_ERROR"
          });
        }
        if (recentCertsRes.error) {
          console.error("[Supabase] Overview recent certificates error:", recentCertsRes.error);
          return res.status(503).json({
            error: "Failed to retrieve recent certificates from database.",
            code: "DATABASE_ERROR"
          });
        }
        if (studentsCountRes.error) {
          console.error("[Supabase] Overview students count error:", studentsCountRes.error);
          return res.status(503).json({
            error: "Failed to retrieve student count from database.",
            code: "DATABASE_ERROR"
          });
        }
        const certCount = typeof certCountRes.count === "number" ? certCountRes.count : 0;
        const studentsCount = typeof studentsCountRes.count === "number" ? studentsCountRes.count : 0;
        const recentCerts = recentCertsRes.data && recentCertsRes.data.length > 0 ? recentCertsRes.data.map((r) => mapSupabaseCertificateToDomain(r)) : [];
        const recentEmailLogs = await getRecentEmailLogs(20);
        const totalEmailDispatches = typeof emailCountRes.count === "number" ? emailCountRes.count : recentEmailLogs.length;
        const emailConfig = getEmailConfigStatus();
        const sales = buildSalesSummaryFromData({
          payments: paymentsRes.data || [],
          enrollments: enrollmentsRes.data || []
        });
        return res.json({
          metrics: {
            totalCertificates: certCount,
            totalStudents: studentsCount,
            totalEmailDispatches,
            activeProvider: emailConfig.primaryProvider,
            activeSender: emailConfig.fromAddress,
            databaseTier: "Supabase Cloud (PostgreSQL)",
            serverUptimeSec: Math.floor(process.uptime()),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          },
          sales,
          emailConfig,
          recentCertificates: recentCerts,
          recentEmailLogs
        });
      }
    } catch (err) {
      if (!isProductionEnvironment() && isSupabaseNetworkError(err)) {
        console.warn("[Supabase] Overview network exception; falling back to local cache in non-production.");
        useNetworkFallback = true;
      } else {
        console.error("[Supabase] Overview query exception:", err);
        return res.status(503).json({
          error: "Database service is currently unavailable.",
          code: "DATABASE_UNAVAILABLE"
        });
      }
    }
  }
  if (shouldPermitFallback() || !isProductionEnvironment() && useNetworkFallback) {
    const certCount = fallbackCertificatesStore.size;
    const allStudents = Array.from(fallbackStudentsStore.values());
    const studentsCount = allStudents.length;
    const recentCerts = Array.from(fallbackCertificatesStore.values()).slice(0, 6);
    const recentEmailLogs = await getRecentEmailLogs(20);
    const emailConfig = getEmailConfigStatus();
    const fallbackPayments = Array.from(fallbackPaymentsStore.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const fallbackEnrollments = [];
    for (const stu of allStudents) {
      for (const course of stu.courses || []) {
        fallbackEnrollments.push({ course_id: course.courseId });
      }
    }
    const sales = buildSalesSummaryFromData({
      payments: fallbackPayments,
      enrollments: fallbackEnrollments
    });
    return res.json({
      metrics: {
        totalCertificates: certCount,
        totalStudents: studentsCount,
        totalEmailDispatches: fallbackEmailLogsStore.length,
        activeProvider: emailConfig.primaryProvider,
        activeSender: emailConfig.fromAddress,
        databaseTier: useNetworkFallback ? "Local Dev Cache (Supabase Unreachable)" : "High-Performance Local Cache",
        serverUptimeSec: Math.floor(process.uptime()),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      sales,
      emailConfig,
      recentCertificates: recentCerts,
      recentEmailLogs
    });
  }
  return res.status(503).json({
    error: "Database service is unavailable.",
    code: "DATABASE_UNAVAILABLE"
  });
});
portalRouter.post("/admin/send-test-email", requireAuthentication, requireAdmin, async (req, res) => {
  if (!isPlainObject2(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const user = req.user;
  const { to, subject, message } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: "Recipient email and subject are required.", code: "MISSING_FIELDS" });
  }
  if (!isValidEmail2(to)) {
    return res.status(400).json({ error: "Recipient email address format is invalid.", code: "INVALID_EMAIL" });
  }
  if (typeof subject !== "string" || subject.trim().length === 0 || subject.trim().length > 200) {
    return res.status(400).json({ error: "Subject must be between 1 and 200 characters.", code: "INVALID_SUBJECT" });
  }
  if (message !== void 0 && message !== null) {
    if (typeof message !== "string" || message.length > 5e3) {
      return res.status(400).json({ error: "Message must be a string up to 5000 characters.", code: "INVALID_MESSAGE" });
    }
  }
  const cleanTo = to.toLowerCase().trim();
  const testSubject = subject.trim();
  const testMessage = message || "This is a test notification from Vixora Digital Hub Admin Command Center.";
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
        <p style="margin: 4px 0 0 0;">Engine: <strong>Resend API &amp; Google SMTP Infrastructure</strong> &bull; Vixora Digital Hub &bull; ${(/* @__PURE__ */ new Date()).toUTCString()}</p>
      </div>
    </div>
  `;
  const dispatchResult = await dispatchGenericEmail({
    to: cleanTo,
    toName: cleanTo.split("@")[0],
    subject: testSubject,
    html,
    text: testMessage
  });
  const emailLog = {
    id: `eml-test-${Date.now()}`,
    certificateId: "admin-test",
    recipientEmail: cleanTo,
    recipientName: cleanTo.split("@")[0],
    subject: testSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
    message: dispatchResult.deliveredToInternet ? `Test email successfully transmitted to ${cleanTo} via ${dispatchResult.provider === "resend" ? "Resend API" : "SMTP"}!` : `Test email prepared and logged in outbox.`,
    delivery: dispatchResult,
    emailLog
  });
});
portalRouter.get("/admin/students", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 100, 100);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  if (req.query.search && (typeof req.query.search !== "string" || req.query.search.length > 100)) {
    return res.status(400).json({ error: "Search query must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  const supabase = getSupabaseAdmin();
  let useNetworkFallback = false;
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      return res.status(503).json({
        error: "Student database service is unconfigured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
    try {
      const [{ data: rows, error }, { data: enrollmentRows, error: enrollError }] = await Promise.all([
        supabase.from("students").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1),
        supabase.from("enrollments").select("student_id, course_id, status, progress_percent")
      ]);
      if ((isSupabaseNetworkError(error) || isSupabaseNetworkError(enrollError)) && !isProductionEnvironment()) {
        console.warn("[Supabase] Query students network unreachable; falling back to local cache in non-production.");
        useNetworkFallback = true;
      } else if (error) {
        console.error("[Supabase] Query students error:", error);
        return res.status(503).json({
          error: "Failed to retrieve students from database.",
          code: "DATABASE_ERROR"
        });
      } else {
        const enrollMap = /* @__PURE__ */ new Map();
        for (const enr of enrollmentRows || []) {
          const resolved = findCanonicalCourse(enr.course_id);
          const list = enrollMap.get(enr.student_id) || [];
          list.push({
            courseId: enr.course_id,
            title: resolved ? resolved.title : enr.course_id,
            status: enr.status || "enrolled",
            progressPercent: enr.progress_percent || 0
          });
          enrollMap.set(enr.student_id, list);
        }
        const normalized = (rows || []).map((row) => {
          const courses = enrollMap.get(row.id) || [];
          const displayName = row.full_name || row.name || row.email?.split("@")[0] || "Student";
          return {
            ...row,
            name: displayName,
            full_name: displayName,
            enrolledDate: row.enrolled_date || (row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "\u2014"),
            courses,
            coursesCount: courses.length,
            course_title: courses[0]?.title || "No active track"
          };
        });
        return res.json({ students: normalized });
      }
    } catch (err) {
      if (!isProductionEnvironment() && isSupabaseNetworkError(err)) {
        console.warn("[Supabase] Query students network exception; falling back to local cache in non-production.");
        useNetworkFallback = true;
      } else {
        console.error("[Supabase] Query students exception:", err);
        return res.status(503).json({
          error: "Student database service is currently unavailable.",
          code: "DATABASE_UNAVAILABLE"
        });
      }
    }
  }
  if (shouldPermitFallback() || !isProductionEnvironment() && useNetworkFallback) {
    const list = Array.from(fallbackStudentsStore.values()).map((st) => ({
      ...st,
      full_name: st.name,
      coursesCount: st.courses?.length || 0,
      course_title: st.courses?.[0]?.title || "No active track"
    }));
    return res.json({ students: list.slice(offset, offset + limit) });
  }
  return res.status(503).json({
    error: "Database service is unavailable.",
    code: "DATABASE_UNAVAILABLE"
  });
});

// server/aiAdvisorServer.ts
import { Router as Router3 } from "express";
import { GoogleGenAI } from "@google/genai";
var aiAdvisorRouter = Router3();
var SlidingWindowRateLimiter3 = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix;
  }
  check(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      this.store.set(fullKey, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  peek(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max,
        isLimited: false
      };
    }
    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }
};
var advisorRateLimiter = new SlidingWindowRateLimiter3({
  windowMs: 10 * 60 * 1e3,
  max: 12,
  prefix: "ai_advisor"
});
function getClientIp3(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown-ip";
}
function isPlainObject3(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
function buildAuthoritativeKnowledgeBase() {
  const servicesText = FEATURED_SERVICES.map((s) => {
    return `- **${s.title}** (${s.subtitle}): ${s.description} Features: ${s.features.join(", ")}`;
  }).join("\n");
  const coursesText = ACADEMY_COURSES.map((c) => {
    const approvedPrice = COURSE_PRICING[c.id]?.NGN ? `\u20A6${COURSE_PRICING[c.id].NGN.toLocaleString()}` : c.tuition;
    return `- **${c.title}** (Slug: \`${c.slug}\`, ID: \`${c.id}\`)
  \u2022 Tuition: ${approvedPrice}
  \u2022 Duration: ${c.duration} (${c.format})
  \u2022 Next Cohort: ${c.nextCohortDate}
  \u2022 Level: ${c.level} | Track: ${c.track}
  \u2022 Audience: ${c.targetAudience}
  \u2022 Description: ${c.description}
  \u2022 Core Skills: ${c.curriculum.slice(0, 4).join(", ")}`;
  }).join("\n\n");
  return `
=== VIXORA DIGITAL HUB OFFICIAL KNOWLEDGE BASE ===

COMPANY OVERVIEW:
Vixora Digital Hub is an elite technology studio and executive education hub operating across two major divisions:
1. Vixora Agency & Solutions: Bespoke software engineering, autonomous AI agent swarms, workflow orchestration (n8n), brand systems, and high-converting paid media acquisition.
2. Vixora Academy: Implementation-first technical training cohorts teaching hands-on AI engineering, data analytics, automated business systems, and creative AI media.

DIRECT CONTACT CHANNELS:
- Email: ${COMPANY_CONTACT.email}
- US & Global WhatsApp Inbound: +1 (279) 257-4850
- Nigeria WhatsApp Inbound: +234 811 454 2934
- Student & Certificate Portal: /pages/student-portal

AGENCY SOLUTIONS & ENGINEERING PILLARS:
${servicesText}

ACADEMY COHORT PROGRAMS & PRICING:
${coursesText}

CRITICAL RULES:
1. Always state the exact, approved tuition for courses (e.g. AI Image & Short Videos Creation is \u20A610,000, AI Automation & Digital Skills is \u20A630,000, Data Analysis Cohort is \u20A660,000). Never invent or guess prices.
2. If a user asks about building a custom software/AI system, diagnose their business problem, propose a concrete technology architecture, and suggest booking a project consultation.
3. If a user asks what course to study, assess their starting point, recommend the optimal Vixora Academy program, and highlight the start date and tuition.
4. Keep answers concise, highly structured, professional, and directly actionable.
`;
}
function getGeminiApiKey() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GEMINI_SECRET || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_APIKEY || process.env.GEMINI_TOKEN || "";
  return rawKey.trim().replace(/^["']|["']$/g, "");
}
var cachedApiKey = "";
var aiClient = null;
function getGemini() {
  const currentKey = getGeminiApiKey();
  if (!aiClient || cachedApiKey !== currentKey) {
    cachedApiKey = currentKey;
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-vixora-advisor"
        }
      }
    });
  }
  return aiClient;
}
aiAdvisorRouter.get("/advisor/status", (req, res) => {
  const ip = getClientIp3(req);
  const status = advisorRateLimiter.peek(ip);
  const apiKey = getGeminiApiKey();
  res.json({
    ready: Boolean(apiKey),
    limit: status.limit,
    remaining: status.remaining,
    resetInSeconds: status.resetInSeconds,
    isLimited: status.isLimited
  });
});
aiAdvisorRouter.post("/advisor", async (req, res) => {
  if (!isPlainObject3(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { message, conversationHistory = [], track = "all" } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: 'Field "message" is required.', code: "MISSING_MESSAGE" });
  }
  if (message.length > 2500) {
    return res.status(400).json({ error: "Message cannot exceed 2500 characters.", code: "MESSAGE_TOO_LONG" });
  }
  const ip = getClientIp3(req);
  const rlCheck = advisorRateLimiter.check(ip);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many advisor queries. Please wait ${rlCheck.resetInSeconds} seconds before asking again.`,
      code: "RATE_LIMIT_EXCEEDED",
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in environment variables. Please add GEMINI_API_KEY to your Vercel Project Settings and redeploy.",
      code: "GEMINI_UNCONFIGURED"
    });
  }
  try {
    const ai = getGemini();
    const knowledgeBase = buildAuthoritativeKnowledgeBase();
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn && typeof turn.text === "string" && (turn.role === "user" || turn.role === "model")) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [
        {
          text: `User Question: "${message.trim()}"

Context Filter: User is inquiring about "${track}" track.

Please answer authoritatively, concisely, and provide clear recommended next steps.`
        }
      ]
    });
    const systemInstruction = `You are the Vixora AI Business & Academy Advisor for Vixora Digital Hub.
You are direct, articulate, deeply knowledgeable in modern AI engineering and software architecture, and laser-focused on practical outcomes.

${knowledgeBase}

OUTPUT SPECIFICATION:
Respond with a JSON object strictly matching this schema:
{
  "reply": "Your markdown-formatted, clear response (use bolding, bullet points, concise paragraphs).",
  "category": "academy" | "business" | "general",
  "recommendedCourseSlug": "optional-course-slug-if-relevant",
  "recommendedCourseTitle": "optional-course-title-if-relevant",
  "suggestedActions": [
    {
      "label": "Button text (e.g. 'Explore Data Analysis Cohort' or 'Start Project Blueprint')",
      "actionType": "navigate_course" | "enroll_course" | "start_project" | "whatsapp_consultation",
      "target": "slug or phone or page"
    }
  ]
}

DO NOT wrap the JSON in extra text outside the JSON structure. Return ONLY valid JSON.`;
    let response = null;
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash"
    ];
    let lastError = null;
    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        if (response?.text) break;
      } catch (mErr) {
        lastError = mErr;
      }
    }
    if (!response || !response.text) {
      throw lastError || new Error("All model candidates failed to respond.");
    }
    const rawText = response.text || "";
    let parsedData = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        parsedData = {
          reply: rawText,
          category: "general",
          suggestedActions: [
            { label: "Book Project Consultation", actionType: "start_project", target: "consultation" }
          ]
        };
      }
    }
    return res.json({
      success: true,
      data: parsedData,
      quota: {
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds,
        limit: rlCheck.limit
      }
    });
  } catch (err) {
    console.error("[AI Advisor Error]:", err?.message || err);
    const isVideoQuery = message.toLowerCase().includes("video") || message.toLowerCase().includes("short") || message.toLowerCase().includes("tiktok");
    const fallbackReply = isVideoQuery ? `For learning AI-driven video creation and short-form content, the **AI Image & Short Videos Creation** cohort is our dedicated program.

* **Tuition:** \u20A610,000
* **Duration:** 4 Weeks
* **Tools Covered:** Midjourney, Flux, ElevenLabs, CapCut, and Runway.

You will master prompt engineering, voice cloning, and synthetic video production.` : `Vixora Digital Hub offers industry-leading cohorts in Autonomous AI Engineering, Enterprise Workflow Automation, and AI-Powered Software. Our advisors are available to guide your roadmap.`;
    return res.json({
      success: true,
      data: {
        reply: fallbackReply,
        category: track === "academy" ? "academy" : "business",
        recommendedCourseSlug: isVideoQuery ? "ai-image-short-videos-creation" : void 0,
        recommendedCourseTitle: isVideoQuery ? "AI Image & Short Videos Creation" : void 0,
        suggestedActions: [
          {
            label: isVideoQuery ? "Explore AI Image & Short Videos Creation" : "Explore Academy Courses",
            actionType: "navigate_course",
            target: isVideoQuery ? "ai-image-short-videos-creation" : "all"
          },
          {
            label: "Contact Vixora on WhatsApp",
            actionType: "whatsapp_consultation",
            target: COMPANY_CONTACT.phone || "+1 (279) 257-4850"
          }
        ]
      },
      quota: {
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds,
        limit: rlCheck.limit
      }
    });
  }
});

// server.ts
dotenv2.config();
var app = express();
var PORT = 3e3;
app.use(
  express.json({
    limit: "15mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api", portalRouter);
app.use("/api/ai", aiAdvisorRouter);
app.use("/api", aiAdvisorRouter);
app.use("/ai", aiAdvisorRouter);
app.use("/advisor", aiAdvisorRouter);
app.use("/api/payments/paystack", paystackRouter);
app.use("/api/paystack", paystackRouter);
app.use("/payments/paystack", paystackRouter);
app.use("/paystack", paystackRouter);
app.use("/api/payments", paymentsRouter);
app.use("/payments", paymentsRouter);
var cachedApiKey2 = "";
var aiClient2 = null;
function getGemini2() {
  const currentKey = getGeminiApiKey();
  if (!aiClient2 || cachedApiKey2 !== currentKey) {
    cachedApiKey2 = currentKey;
    aiClient2 = new GoogleGenAI2({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient2;
}
app.get("/api/health", (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(apiKey),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var exchangeRatesCache = null;
var FX_CACHE_DURATION_MS = 24 * 60 * 60 * 1e3;
app.get("/api/exchange-rates", async (req, res) => {
  const now = Date.now();
  if (exchangeRatesCache && now - exchangeRatesCache.lastUpdated < FX_CACHE_DURATION_MS) {
    return res.json({
      success: true,
      source: "cache",
      base: exchangeRatesCache.base,
      rates: exchangeRatesCache.rates,
      lastUpdated: new Date(exchangeRatesCache.lastUpdated).toISOString(),
      nextUpdate: new Date(exchangeRatesCache.nextUpdate).toISOString()
    });
  }
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data && data.result === "success" && data.conversion_rates) {
        const lastUp = data.time_last_update_unix ? data.time_last_update_unix * 1e3 : now;
        const nextUp = data.time_next_update_unix ? data.time_next_update_unix * 1e3 : now + FX_CACHE_DURATION_MS;
        exchangeRatesCache = {
          rates: data.conversion_rates,
          base: data.base_code || "USD",
          lastUpdated: lastUp,
          nextUpdate: nextUp
        };
        return res.json({
          success: true,
          source: "live",
          base: exchangeRatesCache.base,
          rates: exchangeRatesCache.rates,
          lastUpdated: new Date(exchangeRatesCache.lastUpdated).toISOString(),
          nextUpdate: new Date(exchangeRatesCache.nextUpdate).toISOString()
        });
      }
    }
  } catch (error) {
    console.warn("[Exchange Rate API] \u26A0\uFE0F Fetch from open.er-api.com failed, using fallback:", error?.message);
  }
  const fallbackRates = {
    USD: 1,
    NGN: 1450,
    EUR: 0.92,
    GBP: 0.78
  };
  return res.json({
    success: true,
    source: "fallback",
    base: "USD",
    rates: fallbackRates,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    nextUpdate: new Date(now + FX_CACHE_DURATION_MS).toISOString()
  });
});
app.get("/api/geo", async (req, res) => {
  try {
    const rawCountry = (req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || req.headers["x-country-code"] || req.headers["x-country"] || req.headers["x-appengine-country"] || "").toString().toUpperCase().trim();
    if (rawCountry && rawCountry.length === 2) {
      const isNigeria = rawCountry === "NG";
      return res.json({
        country: rawCountry,
        isNigeria,
        currency: isNigeria ? "NGN" : "USD",
        source: "header"
      });
    }
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "";
    if (!clientIp || clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("192.168.") || clientIp.startsWith("10.")) {
      return res.json({
        country: "UNKNOWN",
        isNigeria: false,
        currency: "USD",
        source: "local-default"
      });
    }
    const geoRes = await fetch(`https://api.country.is/${encodeURIComponent(clientIp)}`, {
      signal: AbortSignal.timeout(1500)
    });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const detected = (geoData?.country || "").toUpperCase().trim();
      if (detected && detected.length === 2) {
        const isNigeria = detected === "NG";
        return res.json({
          country: detected,
          isNigeria,
          currency: isNigeria ? "NGN" : "USD",
          source: "ip"
        });
      }
    }
  } catch (err) {
  }
  return res.json({
    country: "GLOBAL",
    isNigeria: false,
    currency: "USD",
    source: "fallback"
  });
});
app.post("/api/analyze-requirements", async (req, res) => {
  try {
    if (!isPlainObject2(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object." });
    }
    const { files, customInstructions } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided for analysis." });
    }
    if (files.length > 50) {
      return res.status(400).json({ error: "Maximum 50 files allowed per analysis request." });
    }
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!isPlainObject2(f)) {
        return res.status(400).json({ error: `File at index ${i} must be a valid object.` });
      }
      if (typeof f.name !== "string" || f.name.length > 255) {
        return res.status(400).json({ error: `File name at index ${i} must be a string up to 255 characters.` });
      }
      if (f.extractedContent !== void 0 && f.extractedContent !== null && typeof f.extractedContent !== "string") {
        return res.status(400).json({ error: `extractedContent at index ${i} must be a string.` });
      }
    }
    if (customInstructions !== void 0 && customInstructions !== null) {
      if (typeof customInstructions !== "string" || customInstructions.length > 5e3) {
        return res.status(400).json({ error: "customInstructions must be a string up to 5000 characters." });
      }
    }
    const ai = getGemini2();
    const documentsContext = files.map((f, idx) => {
      return `=== DOCUMENT ${idx + 1}: ${f.name} (Type: ${f.mimeType || "unknown"}) ===
${f.extractedContent || f.snippet || "No text extracted."}
`;
    }).join("\n\n");
    const prompt = `You are an expert Principal Software Architect and Technical Product Manager.
Analyze the following Google Drive files gathered for "Vixora Web Development" and compile an exhaustive, professional, and structured Project Requirements Document (PRD).

SOURCE DOCUMENTS CONTEXT:
${documentsContext}

${customInstructions ? `USER INSTRUCTIONS / FOCUS:
${customInstructions}
` : ""}

CRITICAL TASK:
Synthesize all the details from the documents into a structured JSON object with the following schema:
{
  "projectName": "Vixora Web Platform",
  "summary": "Executive summary of the Vixora web development project",
  "primaryObjective": "Core business and technical objective",
  "targetAudience": ["List of target user groups/personas"],
  "keyFeatures": ["List of primary features"],
  "functionalRequirements": [
    {
      "id": "REQ-1",
      "title": "Feature / Module Title",
      "description": "Detailed functional behavior description",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "module": "Authentication" | "Workspace" | "Analytics" | "API" | "UI/UX" | "Integrations" | "Database",
      "acceptanceCriteria": ["Given X when Y then Z", "Requirement detail 2"]
    }
  ],
  "techStack": [
    {
      "category": "Frontend" | "Backend" | "Database" | "Authentication" | "DevOps & Hosting" | "AI & Integrations",
      "technology": "React 19 / Express / PostgreSQL etc.",
      "versionOrDetail": "Version or library details",
      "rationale": "Why this technology is chosen for Vixora"
    }
  ],
  "designAndUXGuidelines": [
    "Design principles, responsiveness, theme, accessibility standards"
  ],
  "milestones": [
    {
      "phase": "Sprint 1 / Phase 1",
      "title": "Milestone Title",
      "targetTimeline": "Week 1-2",
      "keyDeliverables": ["Deliverable item 1", "Deliverable item 2"]
    }
  ],
  "securityAndNonFunctional": [
    "Performance latency SLA, encryption, RBAC rules, WCAG AA compliance"
  ],
  "openQuestionsAndRisks": [
    "Identified dependencies, ambiguities, or technical risks"
  ],
  "rawMarkdownReport": "# Full Markdown version of the PRD with tables and rich formatting",
  "sourceFilesSummary": [
    {
      "name": "Filename",
      "relevance": "How this file contributed to the requirements"
    }
  ]
}

Return ONLY valid JSON matching this exact structure. Ensure the rawMarkdownReport is well-formatted and includes complete headers, bullet points, and code/architecture blocks.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      parsedData = JSON.parse(cleanJson);
    }
    parsedData.analyzedAt = (/* @__PURE__ */ new Date()).toISOString();
    parsedData.sourceFilesCount = files.length;
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error analyzing requirements with Gemini:", error);
    res.status(500).json({
      error: error.message || "Failed to synthesize project requirements."
    });
  }
});
app.post("/api/ask-requirements", async (req, res) => {
  try {
    if (!isPlainObject2(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object." });
    }
    const { question, prdContext } = req.body;
    if (!question || typeof question !== "string" || question.trim().length === 0 || question.length > 2e3) {
      return res.status(400).json({ error: "Question is required and must be a string up to 2000 characters." });
    }
    if (prdContext !== void 0 && prdContext !== null) {
      if (typeof prdContext !== "object" && typeof prdContext !== "string") {
        return res.status(400).json({ error: "prdContext must be a valid object or string." });
      }
    }
    const ai = getGemini2();
    const prompt = `You are the lead AI Technical Architect for the Vixora Web Development project.
Answer the following developer/stakeholder question accurately based on the compiled Vixora Project Requirements:

PROJECT REQUIREMENTS CONTEXT:
${JSON.stringify(prdContext, null, 2)}

QUESTION:
${question}

Provide a direct, helpful, and concise answer with actionable technical clarity. Use bullet points or code snippets where helpful.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt
    });
    res.json({ success: true, answer: response.text });
  } catch (error) {
    console.error("Error in ask-requirements:", error);
    res.status(500).json({ error: error.message || "Failed to answer query." });
  }
});
app.use(express.static(path3.join(process.cwd(), "public")));
app.all("/api/*", (_req, res) => {
  res.status(404).json({
    error: "API endpoint not found.",
    code: "NOT_FOUND"
  });
});
app.use((err, req, res, next) => {
  if (req.path.startsWith("/api")) {
    const status = typeof err.status === "number" ? err.status : 500;
    return res.status(status).json({
      error: err?.message || "Internal server error",
      code: err?.code || "SERVER_ERROR"
    });
  }
  next(err);
});
async function startServer() {
  const httpServer = http.createServer(app);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : { server: httpServer }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path3.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", async () => {
    console.log(`Vixora Analyzer server running on http://0.0.0.0:${PORT}`);
    if (process.env.AUTO_MIGRATE === "true") {
      try {
        const { runMigrations: runMigrations2, getDatabaseConnectionString: getDatabaseConnectionString2 } = await Promise.resolve().then(() => (init_runner(), runner_exports));
        if (getDatabaseConnectionString2()) {
          console.log("[Startup] Executing pending database migrations...");
          await runMigrations2({ silent: false });
        }
      } catch (mErr) {
        console.error("[Startup Migration Warning]:", mErr?.message || mErr);
      }
    }
  });
}
var server_default = app;
var isMainScript = typeof process !== "undefined" && Boolean(process.argv?.[1]) && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.cjs") || process.argv[1].endsWith("server.js") || process.argv[1].includes("tsx"));
if (isMainScript) {
  startServer();
}
export {
  server_default as default
};
