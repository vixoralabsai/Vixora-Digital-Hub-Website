# Vixora Academy Cohort 2 Curriculum Hub (`/training`)

Updated implementation plan for creating a dedicated, pure informational curriculum hub at `/training` (and `/pages/training`) with the updated pricing schedule across all 6 Cohort 2 programs.

---

### User Review & Confirmed Choices

> [!IMPORTANT]
> **Revised Pricing Schedule (Confirmed)**:
> - **AI Content Creation**: **₦20,000**
> - **AI Engineer / Data Science & ML**: **₦150,000**
> - **All Other Courses** (AI Automation, Virtual Assistance, AI Web Dev, Data Analysis): **₦60,000**

- **Confirmed UX Format**: Interactive curriculum hub featuring track category filters, expandable week-by-week module accordions, phase badges, and a real-time topic search bar.
- **Confirmed Integration Scope**: Pure informational catalog focused strictly on week-by-week learning outcomes, toolchains, hands-on lab assignments, and weekly deliverables.
- **Confirmed Course Coverage & Pricing**:
  1. **AI Automation & Digital Literacy** (12 Weeks · **₦60,000** · 4 Phases)
  2. **Virtual Assistance & Appointment Setting** (8 Weeks · **₦60,000** · 4 Phases)
  3. **AI Web Development & Vibe Coding** (12 Weeks · **₦60,000** · 4 Phases)
  4. **AI Content Creation & Personal Branding** (10 Weeks · **₦20,000** · 4 Phases)
  5. **AI Engineer / Data Science & Machine Learning** (16 Weeks · **₦150,000** · 5 Phases)
  6. **Data Analysis & Business Intelligence** (16 Weeks · **₦60,000** · 5 Phases)

---

### 1. Overview & Core Concept

The `/training` page serves as the authoritative academic blueprint for Vixora Academy Cohort 2. It allows students, corporate partners, and technical auditors to inspect complete week-by-week progression, tool requirements, phase transitions, hands-on lab projects, and portfolio criteria.

- **Target Persona**: Aspiring tech professionals, career switchers, virtual assistants, data analysts, and software developers seeking transparent, zero-fluff syllabus breakdowns.
- **Key Value**: 100% transparency into week-by-week learning outcomes, toolchains, practical assignments, and capstone project requirements.

---

### 2. User Experience & Visual Design

#### Key User Flow
1. **Hero Header & Search**: High-impact header displaying total cohort hours, 6 program tracks, and an instant keyword search bar (e.g. searching "n8n", "SQL", "CapCut", "scikit-learn", or "Prompting" filters matching weeks across all courses).
2. **Track Filter Bar**: Clean segmented control to filter by program category (`All Programs`, `AI & Automation`, `Virtual Assistance`, `Web Development`, `Content Creation`, `AI Engineer / Data Science`, `Data Analysis`).
3. **Course Overview Summary**: Displays duration, hybrid format, updated tuition badge, certificate criteria, tools stack chips, and 4–5 phase breakdown badges.
4. **Interactive Week Accordion**: Expandable week-by-week cards detailing:
   - **Objectives**: Clear milestone goals for that week.
   - **Core Topics**: Bulleted topic lists and concepts.
   - **Hands-on Exercise**: Practical assignment description.
   - **Weekly Deliverable**: Concrete artifact required for certificate progression.
5. **Portfolio & Capstone Showcase**: Explicit specifications for the final capstone project and evaluation rubric at the bottom of each course syllabus.

#### Visual Identity & Styling
- **Theme**: Premium slate & midnight navy background (`#0F1535` / `#F7F7FC`), deep purple (`#5B5FED`), emerald highlights (`#10B981`), and amber status chips (`#FFC107`).
- **Typography**: Display headlines set in `Outfit`, body prose in `Plus Jakarta Sans`, and technical metadata/deliverables in `JetBrains Mono`.
- **Zero-Pill Discipline**: Clean unboxed metadata labels with `·` separators and subtle hairline borders (`border-slate-200 / border-purple-900/40`).

---

### 3. Key Product Decisions & Trade-Offs

- **Dedicated Structured Data File (`src/data/trainingCurriculumData.ts`)**:
  - *Chosen Approach*: Extract all 6 full 8-to-16-week curricula with updated tuition values into a typed, structured data store rather than hardcoding in JSX.
  - *Why*: Enables client-side instant search, phase filtering, topic indexing, and clean maintainability for future cohort revisions.
- **Direct Route Mapping (`/training` & `/pages/training`)**:
  - *Chosen Approach*: Map canonical `/training` permalink in `App.tsx` alongside navigation links in `Navbar.tsx` and `AcademyNavbar.tsx`.
  - *Why*: Provides clean address bar access for students and direct sharing on social/email.

---

### 4. Technical Architecture & System Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx Router (/training)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         TrainingCurriculumPage                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Hero Header + Global Topic Search + Track Filter Bar             │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Course Curriculum Cards (6 Cohort 2 Programs)                    │  │
│  │  ├─ Course Meta (Duration, Level, Format, Tuition, Tools)        │  │
│  │  ├─ Phase Roadmap Indicators (Foundations ➔ Applied ➔ Capstone)  │  │
│  │  ├─ Week-by-Week Accordion Modules (Topics, Labs, Deliverable)   │  │
│  │  └─ Capstone Requirements & Portfolio Rubric                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     trainingCurriculumData.ts                          │
│  (Updated Prices: AI Content ₦20k, AI Engineer ₦150k, Others ₦60k)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Implementation Steps

1. **Curriculum Data Repository (`src/data/trainingCurriculumData.ts`)**:
   - Create TypeScript interfaces for `TrainingCourse`, `CoursePhase`, `CurriculumWeek`, and `CapstoneSpec`.
   - Populate all 6 complete curricula with updated pricing: AI Content Creation (₦20k), AI Engineer / Data Science (₦150k), and ₦60k for AI Automation, Virtual Assistance, Web Dev, and Data Analysis.
2. **Page Component (`src/pages/TrainingCurriculumPage.tsx`)**:
   - Build responsive layout with global search, program track filters, phase progress bars, expandable week modules, and capstone specifications.
3. **Routing & Permalinks (`src/App.tsx`)**:
   - Add `'training'` to `PageType`.
   - Add route resolver for `/training`, `/pages/training`, and `#training`.
4. **Header Navigation Links (`src/components/Navbar.tsx` & `src/components/AcademyNavbar.tsx`)**:
   - Add `Curriculum` / `Training` link to primary navigation bars.
5. **Verification**:
   - Run `compile_applet` and execute `npm test` to ensure 100% build integrity.
