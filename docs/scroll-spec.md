# THOZHIL Smooth Scroll & Motion Mechanics Specification

**Reference:** [VLT — Vulture Lines](https://www.vulturelines.com/)  
**Implementation Target:** THOZHIL Frontend (`/frontend`)  
**Engine:** Lenis (`lenis`) + GSAP (`gsap`) + ScrollTrigger  

---

## 1. Scroll Physics & Inertia Model

### 1.1 Feel & Responsiveness
The reference site achieves its award-winning "liquid" feel through a high-damped interpolation (lerp) combined with decoupled touch behavior:
- **Desktop (Mouse Wheel / Trackpad):**
  - Smooth interpolation with `lerp: 0.085` (or `duration: 1.2` with `easeOutExpo` `[0.22, 1, 0.36, 1]`).
  - No rubber-banding or artificial lag; inputs feel instantaneous, followed by a viscous, silky glide.
  - Zero double-scrollbar artifacting by keeping `overflow-x: clip` and `html { height: auto }`.
- **Mobile (Touch Devices):**
  - `syncTouch: false`: Retains 100% native mobile browser touch inertia (avoiding touch-lag, address bar jumping, or iOS rubber-band glitches).
- **GSAP Integration:**
  - Driven directly by GSAP's high-precision render loop:
    ```javascript
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    ```

---

## 2. Scroll-Driven Layer Speeds & Parallax

| Layer Type | Attribute / Mechanism | Scroll Speed Multiplier | Behavior |
|---|---|---|---|
| **Background Architectural Grid** | CSS fixed / sticky | `0.0` | Stationary hairline column guides |
| **Hero Title ("THOZHIL")** | GSAP scrub X / Y | `0.2` (lateral drift) | Drifts subtly sideways and upward on scroll |
| **Module Cards (Z-depth)** | `data-speed="1.15"` | `1.15` | Floats slightly faster than page scroll |
| **Floating Badges / Tags** | `data-speed="0.85"` | `0.85` | Lags behind page scroll for spatial depth |
| **Stats Numbers** | Triggered count-up | N/A | Triggers when element crosses 80% viewport |

---

## 3. Pinned & Horizontal Sequences

### 3.1 Pinned Recruitment Pipeline
- **Section:** 6-Step Hiring Pipeline (`Apply` → `Resume Screening` → `Project Review` → `AI Interview` → `Coding Test` → `Hiring Decision`).
- **Mechanics:**
  - Container pinned for `300vh` scroll distance using `ScrollTrigger.create({ pin: true, scrub: 1 })`.
  - As user scrolls, the progress bar fills vertically/horizontally.
  - Active step indicators light up, accompanied by card cross-fades (`opacity: 0 -> 1`, `scale: 0.95 -> 1`).

### 3.2 Pinned Horizontal Module Track
- **Section:** 5 Core Modules Showcase (Job Portal, Resume Screener, LogLense, InterviewX, Coding Sandbox).
- **Mechanics:**
  - Pinned full-width section.
  - Vertical scroll maps to horizontal translation (`xPercent: - (100 * (slides - 1)) / slides`).
  - Smooth progress indicator along bottom edge.

---

## 4. Velocity Reactivity & Micro-Interactions

### 4.1 Velocity Skew
- `lenis.on('scroll', (e) => { ... })` measures instantaneous scroll velocity.
- Subtle skew applied to marquee text and selected cards:
  $$\text{skewY} = \text{clamp}(-4^\circ, \text{velocity} \times 0.08, 4^\circ)$$
- GSAP quickTo / ticker smoothly returns skew to `0` when scrolling stops.

### 4.2 Velocity-Responsive Marquee
- Marquee moves continuously via requestAnimationFrame or GSAP loop.
- Direction switches and speed doubles when rapid downward/upward scrolling occurs, decaying back to base cruising speed.

### 4.3 Auto-Hiding Dynamic Navbar
- Uses scroll threshold `8px` and start offset `120px`:
  - Scroll Down $\rightarrow$ `translateY(-100%)`
  - Scroll Up $\rightarrow$ `translateY(0%)`
  - Border activates when `scrollY > 40px`.

---

## 5. Route Isolation & Accessibility Constraints

1. **Strict Route Isolation:**
   - Active ONLY on public marketing pages:
     - `/` (Master Platform Landing)
     - `/login` (Unified Platform Login)
     - `/job-portal` (Landing / Discovery)
   - DISABLED on complex workspaces:
     - `/recruiter/*`, `/candidate/*`, `/intern/*`, `/authority/*`
     - Monaco Editor coding surfaces (`/candidate/coding-workspace`, `/recruiter/coding-assessments`)
     - AI Interview video room (`/candidate/interviews/:id/live`, `/candidate/practice/room`)
2. **Inner Container Protection:**
   - `data-lenis-prevent` applied to tables, modal bodies, dropdown menus, and code consoles to prevent scroll hijacking.
3. **Reduced Motion Compliance (`prefers-reduced-motion: reduce`):**
   - Lenis disabled; native instant scroll restored.
   - Parallax, skew, and text splitting disabled; opacity transitions set to instant or `0.01s`.
