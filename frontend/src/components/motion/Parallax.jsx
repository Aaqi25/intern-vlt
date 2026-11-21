import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Parallax = ({
  children,
  speed = 1.0, // < 1.0 lags behind, > 1.0 moves faster
  direction = 'vertical', // 'vertical' | 'horizontal'
  className = '',
  ...props
}) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const distance = (1 - speed) * 120;

    let tween;
    if (direction === 'vertical') {
      tween = gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );
    } else {
      tween = gsap.fromTo(
        el,
        { x: -distance },
        {
          x: distance,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );
    }

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [speed, direction]);

  return (
    <div ref={targetRef} className={`will-change-transform ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Parallax;
