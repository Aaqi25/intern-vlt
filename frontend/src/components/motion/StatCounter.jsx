import React, { useEffect, useRef, useState } from 'react';

const REDUCED_MOTION = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

export const StatCounter = ({
  value,
  prefix = '',
  suffix = '+',
  duration = 1800,
  label = '',
}) => {
  const finalValue = parseInt(value, 10) || 0;
  // If reduced-motion: show final value immediately, no animation
  const [count, setCount] = useState(REDUCED_MOTION ? finalValue : 0);
  const elementRef   = useRef(null);
  const animatedRef  = useRef(REDUCED_MOTION); // mark done if reduced

  useEffect(() => {
    if (REDUCED_MOTION) return; // already showing final value

    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;

          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed  = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Quartic ease-out approximation
            const eased    = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(finalValue * eased));

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(finalValue);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [finalValue, duration]);

  return (
    <div ref={elementRef} className="flex flex-col">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      {label && (
        <span className="text-xs uppercase tracking-[0.14em] font-mono text-neutral-500 mt-2 block">
          {label}
        </span>
      )}
    </div>
  );
};

export default StatCounter;
