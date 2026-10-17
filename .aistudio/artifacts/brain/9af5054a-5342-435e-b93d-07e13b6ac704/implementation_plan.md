# Hero & Academy Video Background Visibility & Scrim Re-tuning

Transform the ambient video backgrounds on both the **Homepage Hero (`Hero.tsx`)** and **Vixora Academy (`AcademyPage.tsx`)** from their currently dark, heavily obscured state into high-visibility, vibrant cinematic backgrounds while preserving crisp text contrast and typography hierarchy.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Design Direction**:
> - **Video Background Luminance**: High visibility with soft edge gradients (top & bottom blends) rather than heavy full-screen dark scrims.
> - **Typography Readability**: Soft localized radial vignettes positioned directly behind copy blocks, paired with subtle text drop-shadows (`drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]`) for contrast.
> - **Dual-Surface Consistency**: Synchronized across both the main digital hub homepage hero and the academy live cohorts hero.

---

## 1. Visual & Stacking Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Hero Section (relative isolate overflow-hidden bg-[#070314]) │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Background Media Layer (absolute inset-0 z-0)         │  │
│  │  - Foundation Dark Tint: subtle dark slate (z-0)      │  │
│  │  - Poster Image Fallback (z-[1])                      │  │
│  │  - Full-Luminance Ambient Video (z-[2], opacity-90)   │  │
│  │  - Top & Bottom Edge Blenders (z-[3], max 40-50%)     │  │
│  │  - Ambient Neon Texture (z-[3], opacity-[0.03])       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Typography Contrast Envelope (relative z-10)          │  │
│  │  - Localized Soft Radial Vignette behind text         │  │
│  │  - High-Contrast Drop-Shadow Headline & Subtitle      │  │
│  │  - Glassmorphic Accent Badges & Action CTAs           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component Adjustments

### A. Homepage Hero (`src/components/Hero.tsx`)
- **Reduce Scrim Opacity**:
  - Replace the heavy horizontal left vignette (`from-[#070314] via-[#070314]/90`) with a balanced, gentle left-gradient (`from-[#070314]/65 via-[#070314]/35 to-transparent`).
  - Tone down vertical edge blending from `from-[#070314]/95` to `from-[#070314]/60 via-transparent to-[#070314]/80`.
- **Maximize Video Presence**:
  - Set active video opacity to `opacity-100` with instant render.
- **Typography Drop-Shadows**:
  - Apply `drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]` on the main headline and value proposition paragraph.
  - Retain the interactive service switcher cards with clear glass backgrounds (`bg-[#0B0520]/80 backdrop-blur-md`).

### B. Academy Page Hero (`src/pages/AcademyPage.tsx`)
- **Reduce Heavy Dark Scrims**:
  - Replace the 80%-90% full-viewport dark veil with a light ambient edge blend (`from-[#070314]/60 via-transparent to-[#070314]/80`).
  - Soften radial center tint from dark purple overlay to a subtle localized glow.
- **Boost Video Opacity**:
  - Increase video opacity from `opacity-40` to `opacity-85` (and `opacity-65` while buffering) so the learning loop is immediately prominent.
- **Headline Contrast Layer**:
  - Add a soft localized radial backing behind the central academy headline (`[radial-gradient(ellipse_at_center,rgba(7,3,20,0.6)_0%,rgba(7,3,20,0.2)_60%,transparent_80%)]`).
  - Add crisp drop-shadow classes on the Dean badge, H1, and lead paragraph for effortless reading against the brighter video motion.

---

## 3. Verification & Validation Plan
1. **Compilation & Type Safety**: Run `lint_applet` (`tsc --noEmit`) and `compile_applet`.
2. **Regression Test Suite**: Run `npm test` across all 5 test suites (Paystack payment, auth, AI advisor, DB migrations).
3. **Visual Verification**: Verify both `/` (Homepage) and `/academy` routes show vibrant, clearly visible background video loops with high-contrast text.
