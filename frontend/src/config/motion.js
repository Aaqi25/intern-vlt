/**
 * THOZHIL Motion & Smooth Scroll Master Configuration
 * All tunable parameters for Lenis smooth-scroll, GSAP triggers,
 * velocity skew, and interactive layer animations.
 */

export const MOTION_CONFIG = {
  // Lenis Smooth Scroll Physics
  lenis: {
    lerp: 0.085,             // Silkiness/inertia factor (lower = smoother glide, 0.08–0.1)
    duration: 1.2,           // Fallback duration for programmatic scrollTo
    smoothWheel: true,       // Smooth mouse wheel scrolling
    syncTouch: false,        // Retain 100% native mobile touch inertia
    touchMultiplier: 1.5,
    wheelMultiplier: 1.0,
    infinite: false,
  },

  // Easing Curves (Matches VLT reference)
  easing: {
    // Primary deceleration quintic curve (fast entry, silky deceleration)
    quintOut: [0.22, 1, 0.36, 1],
    // Symmetrical quintic ease-in-out for pinned transitions
    quintInOut: [0.76, 0, 0.24, 1],
    // Elastic spring feel
    spring: { stiffness: 120, damping: 28 },
  },

  // CSS Timing Variables
  timing: {
    fast: 0.25,
    normal: 0.32,
    slow: 0.9,
    stagger: 0.08,
  },

  // Velocity Reactivity Limits
  velocity: {
    maxSkewDeg: 3.5,         // Max skew angle in degrees
    skewFactor: 0.05,        // Multiplier from scroll velocity to skew
    marqueeBoost: 2.2,       // Speed multiplier when fast-scrolling
  },

  // Navbar Dynamic Scroll Behavior
  navbar: {
    threshold: 8,            // Scroll delta threshold to detect direction change (px)
    scrolledAt: 40,          // Distance from top to apply border/glass state (px)
    hideOffset: 120,         // Distance from top before navbar auto-hides on down-scroll (px)
  },

  // Parallax Layer Speeds
  parallax: {
    heroDrift: 0.2,          // Horizontal drift on hero titles
    foregroundFast: 1.15,    // Fast-moving floating elements
    backgroundSlow: 0.85,    // Slow-moving backdrop layers
  },
};

export default MOTION_CONFIG;
