# Vixora Academy Cohort 1.0 — Architecture Audit & Alignment Plan

A thorough architectural audit and systematic alignment plan comparing what was built against the Cohort 1.0 course-sales specification: featuring four dedicated track subpages, one high-converting 4-in-1 flagship package, embedded video teasers with downloadable sample PDF workbooks, automated Paystack payment verification, student onboarding credentials, and track-specific Telegram vault invitations.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been aligned based on your direct input:
> - **Telegram Delivery Architecture:** Confirmed. Dedicated private Telegram channels per individual track, with the Cohort 1.0 Flagship Bundle granting access to all 4 Telegram vaults.
> - **Structured Commercial Pricing:** Confirmed. Retained current approved prices without currency conversions:
>   - *Course 01 (AI Content Creation):* **₦10,000**
>   - *Course 02 (AI Automation & Digital Business Systems):* **₦60,000**
>   - *Course 03 (AI Web Development & Vibe Coding):* **₦50,000**
>   - *Course 04 (Client Acquisition & Freelancing):* **₦25,000**
>   - *Complete Package (Cohort 1.0 4-in-1 Masterclass Pass):* **₦45,000** (Save ₦100,000+ vs individual enrollment).
> - **Media & Resource Previews:** Confirmed. Embedded responsive video preview teasers and one-click downloadable sample PDF workbooks directly on each course subpage.

---

## 1. Audit: What Was Built vs. The Specification

| Specification Requirement | Current State in Codebase | Audit Status | Alignment Actions Required |
| :--- | :--- | :--- | :--- |
| **1. Four Dedicated Course Subpages** | Implemented via `CohortTrackSubpage.tsx` with dynamic routing (`/cohort-1/:slug`). | **Aligned** | Standardize video teasers, sample PDF downloaders, and direct checkout CTAs across all 4 subpages. |
| **2. Complete 4-in-1 Bundle Offer** | Implemented via `CohortBundlePage.tsx` and `course-cohort-1-master-bundle` (`/cohort-1-bundle` and `/academy/cohort-1-master-bundle`). | **Aligned** | Highlight ₦45k value comparison and 4-track tabbed preview. |
| **3. Psychological Decision Framework** | "Who this is strictly for", "Who should skip this", and "Time to first measurable result" components are present. | **Aligned** | Polish contrast and ensure seamless readability on mobile screens. |
| **4. Video & PDF Previews** | Modal previews and simulated PDF generation exist. | **Needs Enhancement** | Upgrade to embedded inline video teaser players and tangible downloadable sample PDF workbooks. |
| **5. Automated Paystack Verification** | Authoritative backend verification (`server/paystackServer.ts`) with tamper resistance, idempotency, and price locking. | **Fully Aligned** | Production-hardened with 26/26 automated tests passing. |
| **6. Telegram Vault Invitation Routing** | Confirmation email dispatches credentials and WhatsApp link, but lacks track-specific Telegram links. | **Gap Identified** | Add dedicated Telegram invite link lookup for each individual track and bundle all 4 links for master bundle purchasers. |
| **7. Student Portal Access** | Auto-provisions Supabase Auth account with one-click password setup link. | **Fully Aligned** | Keeps portal login credentials intact alongside Telegram links. |

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Visitor / Buyer ]
       │
       ▼
[ Cohort 1.0 Overview / Track Subpage ]
  ├── 4-Track Tabbed Switcher (Immediate Comparison)
  ├── Psychological Qualification (Fit vs. Non-Fit)
  ├── Embedded Video Teaser & Sample PDF Workbook
  └── Pricing Card (Individual ₦10k–₦60k vs Bundle ₦45k)
       │
       ▼
[ Simplified 1-Click Paystack Modal ]
  ├── Name, Email, Phone
  └── Authoritative Backend Price Lock (NGN)
       │
       ▼
[ Paystack Gateway Verification ]
  ├── Server-side verification & Idempotent fulfillment
  ├── Supabase student enrollment & Auth credential provisioning
  └── Dynamic receipt generation
       │
       ▼
[ Automated Delivery & Onboarding ]
  ├── Instant Success Screen with direct Telegram Access
  ├── Transactional Email with Matric ID & Password Setup Link
  ├── Dedicated Track Telegram Channel Invite Link
  └── WhatsApp Admissions Concierge Support
```

### Visual Identity & Theme Tokens
- **Background & Canvas:** Crisp, ultra-clean neutral surface (`#FFFDF9` / `#F8FAFC`) with deep Obsidian Navy footer (`#05020F`) and glowing violet accents (`#5B5FED`).
- **Accent Tints:** Amber Gold (`#F59E0B`) for high-value bundle savings and Telegram invitations; Emerald Green (`#10B981`) for verified status badges.
- **Typographic Hierarchy:** Modern sans (`Plus Jakarta Sans` / `Inter`) with monospaced accents (`SF Mono` / `Consolas`) for matriculation IDs, course codes, and pricing tags.
- **Zero-Pill Discipline:** Clean metadata lines with bullet and slash separators instead of nested colored capsules.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Track-Specific Telegram Link Routing**
  - *Chosen Approach:* Maintain a secure configuration mapping each course ID/slug to its respective private Telegram channel invite link. For the 4-in-1 Master Bundle, the email and success screen display all 4 dedicated track links.
  - *Why:* Gives bundle buyers instant, organized access to all 4 domains without overwhelming single-track students.
- **Decision 2: Embedded Video Teasers vs. Heavy Video Hosting**
  - *Chosen Approach:* High-performance HTML5 video players with custom poster thumbnails and instant playback, paired with downloadable sample PDF workbooks.
  - *Why:* Guarantees fast mobile page loads without requiring third-party video subscriptions or slowing down checkout conversions.
- **Decision 3: Dual Delivery (Telegram Vault + Student Portal)**
  - *Chosen Approach:* Students receive immediate Telegram channel access for real-time video replays, discussions, and mentor Q&A, while simultaneously receiving active credentials to the Vixora Student Portal for certificate generation and track tracking.
  - *Why:* Delivers instant gratification via Telegram while building long-term platform retention and LMS assets.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Application                            │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   CohortBundlePage    │  │        CohortTrackSubpage            │  │
│  │  (/cohort-1-bundle)   │  │       (/cohort-1/:trackSlug)         │  │
│  └───────────┬───────────┘  └──────────────────┬───────────────────┘  │
│              │                                 │                       │
│              └────────────────┬────────────────┘                       │
│                               ▼                                        │
│                 ┌───────────────────────────┐                          │
│                 │  PaystackEnrollmentModal  │                          │
│                 └─────────────┬─────────────┘                          │
└───────────────────────────────┼────────────────────────────────────────┘
                                │ POST /api/payments/paystack/initialize
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend Server                                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   server/paystackServer.ts                       │  │
│  │  - Validates Canonical Course & Authoritative NGN Price          │  │
│  │  - Communicates with Paystack API & Verifies Signature           │  │
│  │  - Resolves Telegram Links for purchased track(s)                │  │
│  └───────────────┬───────────────────────────────┬──────────────────┘  │
│                  │                               │                     │
│                  ▼                               ▼                     │
│   ┌─────────────────────────────┐  ┌───────────────────────────────┐   │
│   │    server/supabaseAdmin.ts  │  │   server/emailTemplates.ts    │   │
│   │  - Durable Payment Record   │  │  - Matriculation ID           │   │
│   │  - Student Profile & Auth   │  │  - Portal Password Setup Link │   │
│   │  - Course Enrollment        │  │  - Dedicated Telegram Link(s) │   │
│   └─────────────────────────────┘  │  - Official WhatsApp Button   │   │
│                                    └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Execution Steps

1. **Telegram Link Configuration (`server/telegramConfig.ts`):**
   - Create a clean catalog mapping each of the 4 tracks and the 4-in-1 Master Bundle to their respective private Telegram channel/group invite URLs.
2. **Onboarding Email Upgrade (`server/emailTemplates.ts`):**
   - Enhance `buildStudentOnboardingEmail` to render dedicated Telegram Access cards.
   - For individual track purchases: Display the specific track's private Telegram invitation.
   - For the 4-in-1 bundle purchase: Display all 4 dedicated track invitations in an organized master list.
3. **Course Subpage Media Enhancement (`src/pages/CohortTrackSubpage.tsx` & `src/data/cohortData.ts`):**
   - Ensure each of the 4 track subpages displays responsive embedded video teasers with clear playback controls.
   - Wire up the sample PDF workbook download buttons to trigger structured, publication-grade sample workbooks.
4. **Verification & Testing:**
   - Execute both `paystack.test.ts` and `paystackFrontend.test.ts` to verify full compatibility.
   - Run `lint_applet` and `compile_applet` to confirm zero compilation errors.
