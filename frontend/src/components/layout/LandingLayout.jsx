import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import BrandLogo from '../BrandLogo';

export const LandingLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-thozhil-background flex flex-col font-sans text-slate-900 selection:bg-thozhil-soft selection:text-thozhil-ink">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-thozhil-border bg-white px-4 py-3 shadow-xs sm:px-6 md:px-12">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <BrandLogo imageClassName="h-8 w-auto max-w-[190px]" caption="Unified platform" className="gap-3" />
        </Link>

        {/* Center menu navigation links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
          <Link to="/job-portal" className="hover:text-thozhil transition-colors">
            Jobs & internships
          </Link>
          <Link to="/candidate" className="hover:text-thozhil transition-colors">
            Candidate Assessment
          </Link>
          <Link to="/recruiter" className="hover:text-thozhil transition-colors">
            Employer Workspace
          </Link>
          <Link to="/recruiter/analytics" className="hover:text-thozhil transition-colors">
            Analytics
          </Link>
        </nav>

        {/* Dual Direct Portal Access Controls & Sign in */}
        <div className="flex items-center space-x-2.5">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline-block"
          >
            Sign in
          </Link>
          <Button 
            onClick={() => navigate('/candidate')} 
            variant="outline" 
            size="sm"
          >
            Candidate Portal
          </Button>
          <Button 
            onClick={() => navigate('/recruiter')} 
            variant="primary"
            size="sm"
          >
            Employer Portal
          </Button>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Modern Clean Footer */}
      <footer className="border-t border-thozhil-border bg-white px-6 py-8 text-center text-xs text-slate-500 select-none md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <BrandLogo imageClassName="h-7 w-auto max-w-[160px]" caption="Jobs, recruitment & assessment" className="gap-3" />
            <span className="hidden text-slate-400 sm:inline">|</span>
            <span>One THOZHIL platform for opportunity and assessment</span>
          </div>
          <div className="flex space-x-6 text-xs font-medium">
            <Link to="/job-portal" className="text-slate-600 hover:text-thozhil transition-colors">Job Portal</Link>
            <Link to="/candidate" className="text-slate-600 hover:text-thozhil transition-colors">Candidate Hub</Link>
            <Link to="/recruiter" className="text-slate-600 hover:text-thozhil transition-colors">Employer Hub</Link>
            <Link to="/login" className="text-slate-600 hover:text-thozhil transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
