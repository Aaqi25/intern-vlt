import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cpu } from 'lucide-react';
import { VltButton } from './VltButton';
import BrandLogo from '../BrandLogo';
import { MOTION_CONFIG } from '../../config/motion';

export const VltNavbar = ({ isDark = false }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          // Detect scrolled distance
          setScrolled(currentScrollY > MOTION_CONFIG.navbar.scrolledAt);

          // Detect direction for auto-hiding
          if (Math.abs(diff) > MOTION_CONFIG.navbar.threshold) {
            if (diff > 0 && currentScrollY > MOTION_CONFIG.navbar.hideOffset) {
              setHidden(true);
            } else {
              setHidden(false);
            }
            lastScrollY = currentScrollY;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClasses = [
    'fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
    hidden ? '-translate-y-full' : 'translate-y-0',
    scrolled
      ? isDark
        ? 'bg-[#071324]/95 backdrop-blur-md border-b border-slate-800 shadow-sm'
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs'
      : isDark
      ? 'bg-[#071324]/40 backdrop-blur-sm border-b border-transparent'
      : 'bg-white/70 backdrop-blur-sm border-b border-transparent',
  ].join(' ');

  const textClasses = isDark ? 'text-white' : 'text-slate-900';
  const mutedClasses = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-700';

  return (
    <header className={navClasses} style={{ height: 'var(--nav-h, 88px)' }}>
      <div className="max-w-[1600px] mx-auto h-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo 
            imageClassName="h-8 w-auto max-w-[170px]" 
            caption="Enterprise Platform" 
            className="gap-3" 
          />
        </Link>

        {/* Center: Module Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link 
            to="/job-portal" 
            className={`${mutedClasses} hover:${textClasses} transition-colors duration-200`}
          >
            Seek Thozhil
          </Link>
          <a 
            href="#modules" 
            className={`${mutedClasses} hover:${textClasses} transition-colors duration-200`}
          >
            Modules
          </a>
          <a 
            href="#sandbox" 
            className={`${mutedClasses} hover:${textClasses} transition-colors duration-200 flex items-center gap-1.5`}
          >
            <Cpu className="w-3.5 h-3.5 text-neutral-500" />
            AI Coding Sandbox
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/login"
            state={{ defaultTab: 'candidate' }}
            className={`text-xs font-bold uppercase tracking-[0.14em] px-3 py-2 ${mutedClasses} hover:${textClasses} transition-colors`}
          >
            Candidate Sign In
          </Link>

          <VltButton
            to="/login"
            state={{ defaultTab: 'admin' }}
            variant="solid"
            size="sm"
            showArrow
          >
            Employer Portal
          </VltButton>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 ${textClasses}`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className={`lg:hidden fixed inset-x-0 top-[88px] min-h-[calc(100vh-88px)] p-6 flex flex-col justify-between ${
            isDark ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          data-lenis-prevent
        >
          <nav className="flex flex-col gap-6 text-sm font-semibold uppercase tracking-[0.14em] pt-4">
            <Link to="/job-portal" className="py-2 border-b border-black/10">
              Seek Thozhil - Job Platform
            </Link>
            <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/10">
              Capabilities & Modules
            </a>
            <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-black/10">
              AI Coding Sandbox
            </a>
          </nav>

          <div className="flex flex-col gap-3 pb-8">
            <VltButton
              to="/login"
              state={{ defaultTab: 'admin' }}
              variant="solid"
              size="md"
              className="w-full justify-center"
            >
              Sign In as Employer / Admin
            </VltButton>
            <VltButton
              to="/login"
              state={{ defaultTab: 'candidate' }}
              variant="outline"
              size="md"
              className="w-full justify-center"
            >
              Sign In as Candidate
            </VltButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default VltNavbar;
