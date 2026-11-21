import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_CONFIG } from '../config/motion';

gsap.registerPlugin(ScrollTrigger);

const SmoothScrollContext = createContext({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useLenis = () => useContext(SmoothScrollContext);

// Routes where smooth scroll should be DISABLED to preserve native high-performance interaction
const DISABLED_ROUTE_PREFIXES = [
  '/recruiter',
  '/candidate',
  '/intern',
  '/authority',
  '/interviews',
  '/reports',
];

export const SmoothScrollProvider = ({ children }) => {
  const location = useLocation();
  const lenisRef = useRef(null);
  const [lenisInstance, setLenisInstance] = useState(null);

  // Check if current route should bypass smooth scrolling
  const isDashboardRoute = DISABLED_ROUTE_PREFIXES.some(prefix => 
    location.pathname.startsWith(prefix)
  );

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis with tuned parameters
    const lenis = new Lenis({
      lerp: MOTION_CONFIG.lenis.lerp,
      duration: MOTION_CONFIG.lenis.duration,
      smoothWheel: MOTION_CONFIG.lenis.smoothWheel,
      syncTouch: MOTION_CONFIG.lenis.syncTouch,
      touchMultiplier: MOTION_CONFIG.lenis.touchMultiplier,
      wheelMultiplier: MOTION_CONFIG.lenis.wheelMultiplier,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP Ticker for frame-perfect animation synchrony
    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  // Handle route change: scroll to top and refresh ScrollTrigger
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) {
      window.scrollTo(0, 0);
      return;
    }

    if (isDashboardRoute) {
      // Disable Lenis on complex workspaces (Monaco, live interview, dashboards)
      lenis.stop();
      window.scrollTo(0, 0);
    } else {
      // Enable Lenis on public marketing pages
      lenis.start();
      lenis.scrollTo(0, { immediate: true });
    }

    // Refresh ScrollTrigger after DOM renders new route
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, isDashboardRoute]);

  const scrollTo = (target, options = {}) => {
    if (lenisRef.current && !isDashboardRoute) {
      lenisRef.current.scrollTo(target, options);
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  };

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

export default SmoothScrollProvider;
// ↑ Default export kept for App.jsx import compatibility.
// useLenis is also re-exported from './useLenis.js' for components that only need the hook,
// which silences the fast-refresh warning in those files.
// SmoothScrollProvider itself is a component, so exporting both here is acceptable.
