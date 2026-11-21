import React, { useEffect, useRef } from 'react';

const REDUCED_MOTION = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const IS_TOUCH = typeof window !== 'undefined'
  ? window.matchMedia('(pointer: coarse)').matches
  : false;

export const CustomCursor = () => {
  // Disable entirely for touch devices or reduced-motion
  if (IS_TOUCH || REDUCED_MOTION) return null;

  return <CursorInner />;
};

/** Inner component — only mounts on pointer:fine, no-reduced-motion devices */
function CursorInner() {
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const posRef    = useRef({ x: -200, y: -200 });   // live cursor position (ref, not state)
  const lerpRef   = useRef({ x: -200, y: -200 });   // smoothed ring position
  const hoveredRef = useRef(false);
  const visibleRef = useRef(false);
  const rafRef    = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // ── Event handlers ──────────────────────────────────────────────────────
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    };

    const onOver = (e) => {
      const target = e.target;
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.vlt-btn') ||
        target.closest('.vlt-card');
      hoveredRef.current = !!isClickable;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver, { passive: true });

    // ── RAF loop — reads from refs, writes DOM directly ─────────────────────
    const lerp = (a, b, t) => a + (b - a) * t;

    const loop = () => {
      const px = posRef.current.x;
      const py = posRef.current.y;

      // Snap dot to true cursor
      dot.style.transform = `translate3d(${px - 4}px, ${py - 4}px, 0)`;

      // Lerp ring toward cursor
      lerpRef.current.x = lerp(lerpRef.current.x, px, 0.18);
      lerpRef.current.y = lerp(lerpRef.current.y, py, 0.18);
      const rx = lerpRef.current.x;
      const ry = lerpRef.current.y;

      const size = hoveredRef.current ? 48 : 32;
      ring.style.width     = `${size}px`;
      ring.style.height    = `${size}px`;
      ring.style.transform = `translate3d(${rx - size / 2}px, ${ry - size / 2}px, 0)`;
      if (hoveredRef.current) {
        ring.style.background = 'rgba(0,0,0,0.12)';
      } else {
        ring.style.background = 'transparent';
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
    };
  }, []); // runs once — all reactive values via refs

  return (
    <>
      {/* Crisp dot — snaps to true cursor position */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#0052cc',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'normal',
          opacity: 0,
          willChange: 'transform',
          transition: 'opacity 0.2s',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderRadius: '50%',
          border: '1.5px solid rgba(0, 82, 204, 0.4)',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'normal',
          opacity: 0,
          willChange: 'transform, width, height',
          transition: 'opacity 0.2s, width 0.2s ease, height 0.2s ease, background 0.2s ease',
        }}
      />
    </>
  );
}

export default CustomCursor;
