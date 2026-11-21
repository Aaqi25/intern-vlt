# THOZHIL Design Specification: VLT-Inspired Liquid Portfolio System

**Reference Target:** [VLT — Vulture Lines](https://www.vulturelines.com/)  
**Platform Target:** THOZHIL Enterprise Recruitment & Assessment Ecosystem  
**Scope:** UI/UX, Typography, Color Architecture, Component Tokens & Motion Mechanics  

---

## 1. Color Architecture & Tokens

The visual language balances stark monochromatic minimalism with warm neutral steps and editorial contrast:

### 1.1 Color Palette (Exact Values)
| Token | Hex / Value | Role & Usage |
|---|---|---|
| `--black` | `#000000` | Deep black, primary text in light mode, background in `theme-dark` |
| `--white` | `#ffffff` | Pure white, canvas background in light mode, text in `theme-dark` |
| `--n-950` | `#0a0a0a` | Deepest dark surface for dark mode cards |
| `--n-900` | `#111111` | Media backdrop in dark theme (`.pcard__media`) |
| `--n-850` | `#181818` | Dark card container borders and footer rule |
| `--n-800` | `#222222` | Hover surface for dark buttons |
| `--n-600` | `#555555` | Secondary muted text in light theme |
| `--n-500` | `#777777` | Tertiary / disabled labels |
| `--n-400` | `#aaaaaa` | Muted secondary text in dark theme |
| `--n-300` | `#d9d9d9` | Subtle divider in light containers |
| `--n-200` | `#eaeaea` | Scrolled navbar border, card outlines |
| `--n-100` | `#f5f5f5` | Elevated neutral background for `theme-grey` sections |

### 1.2 Contextual Theme Tokens
```css
/* Light Canvas (Default) */
:root, .theme-light {
  --fg: var(--black);
  --bg: var(--white);
  --muted: var(--n-600);
  --line: rgba(0, 0, 0, 0.08); /* #00000014 hairline */
  --card-bg: var(--white);
  --card-border: rgba(0, 0, 0, 0.08);
}

/* Deep Obsidian Canvas */
.theme-dark {
  --fg: var(--white);
  --bg: var(--black);
  --muted: var(--n-400);
  --line: rgba(255, 255, 255, 0.12); /* #ffffff1f hairline */
  --card-bg: var(--n-950);
  --card-border: var(--n-850);
}

/* Warm Editorial Grey */
.theme-grey {
  --fg: var(--black);
  --bg: var(--n-100);
  --muted: var(--n-600);
  --line: rgba(0, 0, 0, 0.08);
  --card-bg: var(--white);
  --card-border: rgba(0, 0, 0, 0.06);
}
```

---

## 2. Typography & Editorial Hierarchy

The typography pairs a clean, geometric neo-grotesque sans-serif with an italicized editorial serif for expressive contrast:

- **Primary Sans:** `"Manrope", system-ui, -apple-system, sans-serif`  
  Weights: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold).
- **Accent Serif:** `"Instrument Serif", Georgia, serif`  
  Weight: 400 Italic (used for emotional pull words and high-concept phrasing).
- **Monospace:** `"JetBrains Mono", Menlo, Consolas, monospace`  
  (Used for code snippets, metrics, access codes, timestamps).

### Typography Scale (Fluid Clamp Values)
| Style | Size Clamp | Line Height | Letter Spacing | Weight |
|---|---|---|---|---|
| **Mega Display** | `clamp(5.5rem, 11.5vw, 12.5rem)` | `0.9` | `-0.05em` | 800 |
| **Hero Title** | `clamp(3rem, 10.4vw, 10rem)` | `0.95` | `-0.04em` | 700 / 800 |
| **Section H1** | `clamp(2.9rem, 9vw, 8.5rem)` | `0.98` | `-0.04em` | 700 |
| **Section H2** | `clamp(2.5rem, 7.2vw, 7rem)` | `1.02` | `-0.035em` | 600 |
| **Card H3** | `clamp(1.75rem, 3.6vw, 3.25rem)` | `1.1` | `-0.025em` | 500 |
| **Subtitle H4** | `clamp(1.25rem, 2vw, 1.75rem)` | `1.2` | `-0.02em` | 500 |
| **Lead / Manifesto** | `clamp(1.2rem, 1.9vw, 1.75rem)` | `1.45` | `-0.015em` | 400 |
| **Body Text** | `clamp(1rem, 1.05vw, 1.125rem)` | `1.6` | `normal` | 400 |
| **Caption / Small** | `0.875rem (14px)` | `1.5` | `normal` | 400 / 500 |
| **Label / Eyebrow** | `0.75rem (12px)` | `1` | `0.14em` | 700 (Uppercase) |

---

## 3. Grid, Layout & Spatial Dimensions

- **Gutter Width:** `clamp(28px, 4vw, 72px)`
- **Maximum Container Width:** `1600px` (centered with inline gutter padding)
- **Vertical Section Spacing:** `clamp(5rem, 7.5vw, 7.25rem)`
- **Compact Section Spacing:** `clamp(3rem, 5vw, 4.5rem)`
- **Header Height (`--nav-h`):** `92px` (desktop), `72px` (mobile)
- **Architectural Column Guide Lines:**  
  Subtle background hairline grid (`6 columns` on desktop, `2 columns` on mobile) using `linear-gradient(90deg, #eee 1px, transparent 1px)`.

---

## 4. Component Design System

### 4.1 Navigation Bar (`.nav`)
- **Positioning:** Fixed top (`height: 92px`, `inset: 0 0 auto`, `z-index: 100`).
- **Surface:** `#ffffff` in light sections, transition to glassmorphism or dark on dark routes.
- **Scroll Behavior:**
  - Auto-hides on scroll down past `120px` (`transform: translateY(-100%)`).
  - Re-appears immediately on any upward scroll.
  - Adds hairline border (`border-bottom: 1px solid var(--n-200)`) once scrolled past `40px`.
- **Items:** Brand wordmark, center links with hover line, right CTA button (pill style) and role switcher.

### 4.2 Buttons (`.btn`)
- **Geometry:** Rectangular or slight rounded (`border-radius: 2px` or pill `9999px` for chips).
- **Typography:** `font-size: 0.8125rem`, `font-weight: 700`, `letter-spacing: 0.14em`, `text-transform: uppercase`.
- **Signature "Curtain Fill" Hover Animation:**
  - Relative container with `overflow: hidden`.
  - Inner pseudo-element `::before` anchored at bottom (`transform-origin: bottom; transform: scaleY(0)`).
  - On hover/focus: `transform-origin: top; transform: scaleY(1); transition: transform 0.32s cubic-bezier(.22, 1, .36, 1)`.
  - Text color transitions synchronously from `var(--fg)` to `var(--bg)`.
- **Variants:**
  - `.btn--solid`: Filled background, inverts on hover.
  - `.btn--outline`: Transparent with 1px border, fills on hover.
  - `.btn--text`: Borderless, underline swipe transition (`background-size: 100% 1px` to `0% 1px`).

### 4.3 Feature & Module Cards (`.pcard`)
- **Structure:** Media showcase (ratio 16:10 or 4:3) + bottom metadata block.
- **Hover Micro-Interactions:**
  - Image scale: `transform: scale(1.015)` over `0.9s cubic-bezier(.22, 1, .36, 1)`.
  - Dark gradient shade overlay fades in (`opacity: 0` to `1`).
  - Floating pill badge (`.pcard__view` "OPEN MODULE") scales up from `0.6` to `1.0` with fade in.
  - Title shifts right by `10px` (`transform: translateX(10px)`).

### 4.4 Eyebrows & Badges (`.label`, `.badge`)
- Monospace or uppercase tracked typography (`letter-spacing: 0.14em`).
- Hairline border pills with dot status indicators (`green` for active, `amber` for review, `blue` for in-progress).

### 4.5 Hairline Rule (`.rule`)
- Single-pixel zero-margin divider: `height: 1px; background: var(--line); border: 0;`.

### 4.6 Full-Width Footer (`.footer`)
- Section in `theme-dark` with top border `var(--n-850)`.
- Enormous SVG wordmark `THOZHIL` spanning 100% width with negative letter tracking (`-0.055em`).
- Structured 4-column link directory (Product Modules, Candidates, Employers, Legal).

---

## 5. Motion & Interaction Design System

### 5.1 Easing Curves & Timings
- **Primary Deceleration Curve (`--ease`):** `cubic-bezier(.22, 1, .36, 1)` (easeOutQuint / easeOutExpo).
- **Secondary Symmetrical Curve (`--ease-in-out`):** `cubic-bezier(.76, 0, .24, 1)` (easeInOutQuint).
- **Fast Transition (`--t-fast`):** `0.25s`
- **Standard Transition (`--t`):** `0.32s`
- **Slow Editorial Transition (`--t-slow`):** `0.9s`

### 5.2 Smooth Scroll Mechanics (Lenis + GSAP)
- **Engine:** `@studio-freight/lenis` driven by `gsap.ticker`.
- **Lerp Factor:** `0.085` (gives a silky, fluid liquid momentum while remaining responsive to wheel input).
- **Wheel Multiplier:** `1.0`.
- **Touch Configuration:** `syncTouch: false` (preserves native OS touch inertia on iOS/Android).
- **Route-Aware Isolation:**
  - Enabled on public marketing pages (`/`, `/login`, `/job-portal` landing).
  - Disabled on complex workspace routes (`/recruiter/*`, `/candidate/*`, `/intern/*`, `/authority/*`, Monaco editor).
  - Inner scroll containers marked with `data-lenis-prevent`.

### 5.3 Motion Component Specification
1. **`<Reveal>`:** Fade + translateY (25px -> 0) + optional blur (8px -> 0px) on view entry.
2. **`<SplitText>`:** Line/word masking with `.text-reveal__mask` (`overflow: hidden`) and child `.text-reveal__line` sliding up from `y: 108%` to `0%` with staggered children (`stagger: 0.08s`).
3. **Pinned Recruitment Pipeline:**
   - 6-step hiring sequence pinned via GSAP ScrollTrigger (`pin: true, scrub: 0.8`).
   - Active step highlights and card reveals as vertical scroll progresses.
4. **Horizontal Module Showcase:**
   - Pinned horizontal container translating along the X-axis (`xPercent: -80`) mapped to vertical scroll distance.
5. **Velocity Skew:**
   - Skew angle clamped to `±5deg` proportional to Lenis `velocity`, damped back to `0deg`.
6. **Reactive Infinite Marquee:**
   - Dual-track marquee whose speed increases and reverses direction based on scroll velocity.
7. **Curtain Page Transition:**
   - Deep black full-viewport curtain scaling down on enter and scaling up on route exit (`originY: 0/1`).
8. **Interactive Custom Cursor (Desktop Only):**
   - Sleek 8px dot with trailing 36px ring using mix-blend-mode difference, expanding on link/button hover.
