# Vixora AI Slop Remediation Checklist

This checklist tracks the systematic eradication of generic AI-generated aesthetics, pseudo-technical clutter, and navigation bloat across the Vixora Digital Hub codebase, aligning the platform with the Universal Frontend Design Constitution.

---

### Progress Tracker

| # | Remediation Item | Target Component / Area | Status |
|:---|:---|:---|:---:|
| **1** | **Top Bar Contract & Navigation Streamlining**<br>Replace 800-line overcrowded cockpit with clean 3-zone contract: Brand — 4–5 single-line links — 1 primary CTA. | `src/components/Navbar.tsx` | ✅ **Completed** |
| **2** | **Zero-Pill Metadata & Eyebrow Cleanup**<br>Remove 200+ formulaic static pill capsules (`WHAT WE DO`, `METHODOLOGY`, `OUR TRACK RECORD`); use quiet unboxed metadata with `·` separators. | `SolutionsSection.tsx`, `BusinessMetrics.tsx`, `ProcessSection.tsx`, `WhyVixora.tsx`, `IndustriesSection.tsx`, `TechnologiesSection.tsx`, `TestimonialsSection.tsx`, `CohortBundlePage.tsx`, `AcademyPage.tsx` | ✅ **Completed** |
| **3** | **Visual Restraint: Sparkles & Fake Pulsing Dots**<br>Purge decorative `<Sparkles />` icons, fake macOS dots, and decorative pulsing green dots (`animate-pulse`) from static headlines, cards, and player headers. | `CohortBundlePage.tsx`, `AcademyPage.tsx`, `PortfolioPage.tsx`, `AboutPage.tsx`, `ResourcesPage.tsx`, `CategoriesPage.tsx`, `StudentPortalPage.tsx`, `CourseHeroSection.tsx`, `CohortTrackSubpage.tsx`, `AdminDashboardPage.tsx`, `ProjectActivityAndTickets.tsx`, `ProjectStatusOverview.tsx` | ✅ **Completed** |
| **4** | **Eradicate Fake macOS Terminal in Hero**<br>Replace fake terminal window header (`vixora-core // architecture`, red/yellow/green dots, fake `ONLINE` badge) with authentic architecture bento spotlight. | `src/components/Hero.tsx` | ✅ **Completed** |
| **5** | **Asymmetric Bento-Grids Over Symmetrical 3-Card Triads**<br>Replace repetitive 3-column card clones with asymmetric bento layouts highlighting marquee capabilities and concrete case outcomes. | `SolutionsSection.tsx`, `WhyVixora.tsx`, `TestimonialsSection.tsx` | ✅ **Completed** |
| **6** | **Copywriting Rigor & Single-Color Display Typography**<br>Replace multi-color neon gradient buzzwords (*"Build Smarter. Automate Faster. Scale Infinitely."*) with concrete business value propositions and authoritative single-color display type. | `Hero.tsx`, `CallToAction.tsx`, `CohortBundlePage.tsx` | ✅ **Completed** |
| **7** | **Typography Discipline: The 2+1 Font Rule**<br>Purge unused handwriting/comic fonts (`Caveat`, `Gochi Hand`) from `index.html`; standardize strictly on `Plus Jakarta Sans` / `Outfit` + `JetBrains Mono` for tabular numerals. | `index.html`, `src/index.css` | ✅ **Completed** |
| **8** | **Mobile Sticky Element Cap (15% Max)**<br>Eliminate competing dual floating corner widgets (`FloatingAiAdvisorWidget` + `FloatingWhatsAppWidget`) that block 22%+ of the mobile viewport. | `FloatingAiAdvisorWidget.tsx`, `FloatingWhatsAppWidget.tsx`, `App.tsx` | ✅ **Completed** |
| **A1** | **Academy Top Bar Contract & De-Cluttering**<br>Streamline `AcademyNavbar.tsx` to clean wordmark, remove decorative green dot, and enforce single-line navigation targets. | `src/components/AcademyNavbar.tsx` | ✅ **Completed** |
| **A2** | **Eradicate Cartoon Stickers & Fake FOMO Countdown**<br>Remove artificial countdown ticker (`08h : 42m : 19s`), squiggles, and sticker labels in `CourseHeroSection.tsx`, replaced with an authentic engineering masterclass hero. | `src/components/course/CourseHeroSection.tsx` | ✅ **Completed** |
| **A3** | **Asymmetric Course Showcase Bento**<br>Unbox static metadata pills across course catalog cards and corporate offerings in `AcademyPage.tsx`. | `src/pages/AcademyPage.tsx` | ✅ **Completed** |
| **A4** | **Sync 5-in-1 Masterclass Consistency Across Vault**<br>Updated all references from outdated "4-in-1" or "4 tracks" to the full 5-in-1 Masterclass curriculum in `AcademyPage.tsx` and `CohortBundlePage.tsx`. | `src/pages/AcademyPage.tsx`, `src/pages/CohortBundlePage.tsx` | ✅ **Completed** |
| **A5** | **Zero-Pill Course Curriculum & Clean Pricing Spec**<br>Replaced static pill envelopes on syllabus weeks, topics, and urgency chips in `CoursePricingSection.tsx` and `CourseCurriculumSection.tsx` with quiet unboxed typography. | `src/components/course/CoursePricingSection.tsx`, `src/components/course/CourseCurriculumSection.tsx` | ✅ **Completed** |

---

### Audit Execution Summary
All 5 items from the `academy.vixoradigitalhub.com` remediation audit (A1 through A5) have been executed:
- **A1**: Clean top bar contract with no decorative green dot, no secondary pill lockups, and single-line navigation targets.
- **A2**: Removed the perpetual countdown timer (`08h : 42m : 19s`), sticker tags, and squiggles, styling `CourseHeroSection.tsx` as an engineering masterclass.
- **A3**: Converted static course badges and corporate offering pills in `AcademyPage.tsx` into clean unboxed text.
- **A4**: Synchronized all vault banners and pricing cards to 5-in-1 Masterclass consistency.
- **A5**: Unboxed syllabus modules, toolbars, and urgency indicators in `CoursePricingSection.tsx` and `CourseCurriculumSection.tsx`.
- **Validation**: 100% build compilation and all 107 Vitest tests passing.
