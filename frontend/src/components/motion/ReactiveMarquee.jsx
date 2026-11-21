import React, { useEffect, useRef, useCallback } from 'react';
import { useLenis } from '../../context/useLenis';

const REDUCED_MOTION = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export const ReactiveMarquee = ({
  items = [],
  reverse = false,
  className = '',
}) => {
  const { lenis } = useLenis();
  const trackRef  = useRef(null);
  const offsetRef = useRef(0);
  const speedRef  = useRef(1);
  const halfWidthRef = useRef(0); // measured loop point
  const rafRef    = useRef(null);
  const roRef     = useRef(null); // ResizeObserver

  // Measure the actual half-track width for seamless looping
  const measureWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // Track contains 4× the items list; half = 2× one copy
    // We want to loop after exactly 2 copies
    const totalWidth = track.scrollWidth;
    halfWidthRef.current = totalWidth / 2;
  }, []);

  useEffect(() => {
    if (REDUCED_MOTION) return;

    const track = trackRef.current;
    if (!track) return;

    // Measure on mount and on resize
    measureWidth();
    roRef.current = new ResizeObserver(measureWidth);
    roRef.current.observe(track);

    // Lenis velocity listener
    const onScroll = (e) => {
      const vel = e.velocity || 0;
      speedRef.current = 1 + Math.min(4, Math.abs(vel) * 0.25);
    };

    if (lenis) lenis.on('scroll', onScroll);

    // Animation loop
    let lastTime = performance.now();
    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Smooth decay back to base speed
      speedRef.current += (1 - speedRef.current) * 0.05;

      const pxPerSec = 80 * speedRef.current * (reverse ? -1 : 1);
      offsetRef.current -= pxPerSec * delta;

      // Seamless loop using measured half-width
      const half = halfWidthRef.current;
      if (half > 0) {
        // Modulo keeps offset in [−half, 0] range
        offsetRef.current = ((offsetRef.current % half) + half) % half - half;
      }

      if (track) {
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (lenis) lenis.off('scroll', onScroll);
      if (roRef.current) roRef.current.disconnect();
    };
  }, [lenis, reverse, measureWidth]);

  // Duplicate list 4× for enough looping content at all viewport widths
  const displayList = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden whitespace-nowrap select-none py-6 ${className}`}>
      <div
        ref={trackRef}
        className="inline-flex items-center gap-12 will-change-transform"
      >
        {displayList.map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors"
          >
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReactiveMarquee;
