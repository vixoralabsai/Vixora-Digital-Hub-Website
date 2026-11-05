# Academy Curriculum & Pricing Synchronization Plan

Synchronize Vixora Academy's live course catalog, curriculum specifications, and dual-currency pricing (NGN & USD) with the updated 2026 curriculum definitions in `trainingCurriculumData.ts`, while preserving the Cohort 1.0 Master Vault recordings and categorizing legacy non-curriculum courses into an archived catalog section.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed during Phase 1 clarification:

- **Confirmed Decision 1 (Curriculum Source)**: Sync `ACADEMY_COURSES` in `vixoraContent.ts` directly with the updated 2026 curriculum definitions from `trainingCurriculumData.ts`.
- **Confirmed Decision 2 (Pricing Across Currencies)**: Update both NGN and USD price values in `src/data/coursePricing.ts` and sync them across all `ACADEMY_COURSES` and backend payment verification objects.
- **Confirmed Decision 3 (Cohort Vault Protection)**: Keep Cohort 1.0 Master Vault (`cohort-1-master-bundle`) and its 5 accredited track recordings untouched and isolated from standalone catalog updates.
- **Confirmed Decision 4 (Legacy Courses)**: Separate non-matching legacy courses into a dedicated "Archived Specializations" catalog tab in `AcademyPage.tsx` rather than deleting them.

---

## 1. Overview & Core Concept

- **What It Does**: Aligns all active courses in Vixora Academy with the official 2026 training curriculum structure (weeks, learning outcomes, tools used, phases, capstones, and dual NGN/USD pricing).
- **Target Audience**: Prospective students, enrolled students, and admissions reps seeking accurate course details and pricing in their local or preferred currency (NGN / USD).
- **Key Value**: Delivers 100% curriculum and pricing accuracy across catalog views, course landing pages, checkout initialization, and certificate verification without breaking existing cohort vault access.

---

## 2. User Experience & Visual Design

- **Asymmetric & Segmented Catalog View**:
  - Primary Segmented Control: `Active 2026 Curriculum` vs `Archived Specializations`.
  - Active 2026 Curriculum Spotlight: Clean unboxed metadata, flagship track highlight, week-by-week curriculum badges, and dynamic NGN/USD currency toggle display.
- **Course Landing Page Consistency**:
  - `CourseHeroSection.tsx` and `CourseCurriculumSection.tsx` pull directly from synced `ACADEMY_COURSES` data.
  - Displays full week-by-week topics, hands-on projects, deliverables, and capstone specifications without AI slop or cartoon squiggles.

---

## 3. Key Product Decisions & Trade-Offs

- **Single Source of Truth for Pricing (`coursePricing.ts`)**:
  - *Chosen Approach*: Update `COURSE_PRICING` dictionary with explicit NGN and USD prices for all 2026 curriculum courses, then expose them through `ACADEMY_COURSES.tuition` and backend Paystack initialization handlers.
  - *Why*: Ensures server-authoritative price enforcement during payment initialization while allowing dynamic client-side FX currency switching.
- **Cohort Vault Isolation**:
  - *Chosen Approach*: Maintain `course-cohort-1-master-bundle` and its 5 underlying tracks in `cohortData.ts` and `vixoraContent.ts` without modifying recording links or vault access gates.
  - *Why*: Protects existing student access and Telegram recordings vault intact.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│             2026 Training Curriculum Data              │
│          (src/data/trainingCurriculumData.ts)          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            Synchronized Content & Pricing              │
│       - src/data/vixoraContent.ts (ACADEMY_COURSES)    │
│       - src/data/coursePricing.ts (COURSE_PRICING)    │
└──────────┬─────────────────────────────────┬───────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Academy Catalog UI  │          │ Payment & Checkout   │
│ - AcademyPage.tsx    │          │ - Paystack API /     │
│ - Course Page Views  │          │   Verify Endpoint    │
└──────────────────────┘          └──────────────────────┘
```

### Affected Files & Components:
1. `src/data/vixoraContent.ts`: Sync course descriptions, weeks, topics, outcomes, and tuition strings with `trainingCurriculumData.ts`.
2. `src/data/coursePricing.ts`: Update NGN and USD price maps for all active 2026 curriculum courses.
3. `src/pages/AcademyPage.tsx`: Implement segmented catalog filter (`Active 2026 Curriculum` vs `Archived Specializations`) and unboxed card metadata.
4. `server.ts` / seed files (if applicable): Ensure backend payment initialization recognizes updated course IDs and authoritative NGN/USD prices.

---

## Plan Approval Request
Please review the plan above and let me know if you would like to proceed with implementation or make any adjustments!
