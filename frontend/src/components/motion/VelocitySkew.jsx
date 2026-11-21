import React, { useEffect, useRef } from 'react';
import { useLenis } from '../../context/useLenis';
import { MOTION_CONFIG } from '../../config/motion';

export const VelocitySkew = ({
  children,
  className = '',
  maxSkew = MOTION_CONFIG.velocity.maxSkewDeg,
  factor = MOTION_CONFIG.velocity.skewFactor,
}) => {
  const { lenis } = useLenis();
  const elementRef = useRef(null);

  useEffect(() => {
    if (!lenis) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const onScroll = (e) => {
      if (!elementRef.current) return;
      const velocity = e.velocity || 0;
      const rawSkew = velocity * factor;
      const clampedSkew = Math.max(-maxSkew, Math.min(maxSkew, rawSkew));
      
      elementRef.current.style.transform = `skewY(${clampedSkew}deg)`;
    };

    lenis.on('scroll', onScroll);

    return () => {
      lenis.off('scroll', onScroll);
    };
  }, [lenis, maxSkew, factor]);

  return (
    <div
      ref={elementRef}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export default VelocitySkew;
