import React, { useEffect, useState } from 'react';
import { useLenis } from '../../context/useLenis';

export const ScrollProgressBar = () => {
  const { lenis } = useLenis();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!lenis) {
      const handleNativeScroll = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const current = window.scrollY;
        setProgress(total > 0 ? (current / total) * 100 : 0);
      };

      window.addEventListener('scroll', handleNativeScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleNativeScroll);
    }

    const onScroll = (e) => {
      setProgress((e.progress || 0) * 100);
    };

    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenis]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-transparent">
      <div
        className="h-full bg-blue-600 transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
