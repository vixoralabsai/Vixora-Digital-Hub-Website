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
| **9** | **Vixora Academy Slop Remediation**<br>Eradicate static pill capsules, floating candy tags, multi-color rainbow gradient headers, and decorative sparkles across all Academy pages (`AcademyPage.tsx`, `CohortBundlePage.tsx`, `CohortTrackSubpage.tsx`). | `AcademyPage.tsx`, `CohortBundlePage.tsx`, `CohortTrackSubpage.tsx`, `AcademyNavbar.tsx` | ✅ **Completed** |

---

### Vixora Academy Remediation Summary
1. **Unboxed Metadata**: Replaced all static course badges and corporate offering pills with quiet, clean unboxed metadata (`·` separators).
2. **Single-Color Display Type**: Replaced multi-color neon gradient text in `CohortBundlePage.tsx` (`from-sky-400 via-teal-300 to-amber-300`) with high-contrast `text-sky-300` typography.
3. **Card Layout Discipline**: Eliminated top floating candy pill tags (`Most Popular • Best Value`) in card pricing, replaced with clean inline header kickers.
4. **Verification**: 100% clean compilation and all 107 Vitest tests passing.
