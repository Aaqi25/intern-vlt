import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import BrandLogo from '../BrandLogo';

export const VltFooter = () => {
  return (
    <footer className="theme-dark border-t border-neutral-850 pt-20 pb-12 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Top Grid: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-neutral-850">
          
          {/* Col 1: About Platform */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <Link to="/" className="inline-block mb-4">
              <BrandLogo 
                imageClassName="h-8 w-auto max-w-[180px] brightness-0 invert" 
                caption="Enterprise Talent Operating System" 
                className="gap-3 text-white" 
              />
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mb-6">
              THOZHIL unites job discovery, resume intelligence, work-log analysis, conversational AI video interviewing, and hardened Docker coding evaluation into one sovereign hiring engine.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-neutral-900 border border-neutral-800 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ALL GREEN
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-400">
                <Cpu className="w-3 h-3 text-neutral-400" />
                DOCKER ISOLATION: ACTIVE
              </span>
            </div>
          </div>

          {/* Col 2: Core Modules */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.14em] text-neutral-500 font-bold mb-5 font-sans">
              Platform Modules
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/job-portal" className="text-neutral-300 hover:text-white transition-colors">
                  Seek Thozhil - Job Seeking Platform
                </Link>
              </li>
              <li>
                <Link to="/recruiter/resume-screener" className="text-neutral-300 hover:text-white transition-colors">
                  AI Resume Screener
                </Link>
              </li>
              <li>
                <Link to="/recruiter/intern-logs" className="text-neutral-300 hover:text-white transition-colors">
                  AI Project Analyser
                </Link>
              </li>
              <li>
                <Link to="/recruiter/interviews" className="text-neutral-300 hover:text-white transition-colors">
                  AI Video Interviewer
                </Link>
              </li>
              <li>
                <Link to="/recruiter/coding-assessments" className="text-neutral-300 hover:text-white transition-colors">
                  AI Coding Interviewer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Candidate Experience */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.14em] text-neutral-500 font-bold mb-5 font-sans">
              Candidate Hub
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/job-portal" className="text-neutral-300 hover:text-white transition-colors">
                  Explore Opportunities
                </Link>
              </li>
              <li>
                <Link to="/candidate/practice" className="text-neutral-300 hover:text-white transition-colors">
                  Interview Practice Room
                </Link>
              </li>
              <li>
                <Link to="/candidate/coding-workspace" className="text-neutral-300 hover:text-white transition-colors">
                  Monaco Code Workspace
                </Link>
              </li>
              <li>
                <Link to="/intern" className="text-neutral-300 hover:text-white transition-colors">
                  Intern Sprint Logs
                </Link>
              </li>
              <li>
                <Link to="/login" state={{ defaultTab: 'candidate' }} className="text-neutral-300 hover:text-white transition-colors">
                  Candidate Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Recruiter & Governance */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.14em] text-neutral-500 font-bold mb-5 font-sans">
              Recruiter & Admin
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/recruiter" className="text-neutral-300 hover:text-white transition-colors">
                  Recruiter Command Center
                </Link>
              </li>
              <li>
                <Link to="/recruiter/candidates" className="text-neutral-300 hover:text-white transition-colors">
                  Applicant Pipeline
                </Link>
              </li>
              <li>
                <Link to="/authority" className="text-neutral-300 hover:text-white transition-colors">
                  Authority Governance
                </Link>
              </li>
              <li>
                <Link to="/recruiter/analytics" className="text-neutral-300 hover:text-white transition-colors">
                  Evaluation Scorecards
                </Link>
              </li>
              <li>
                <Link to="/login" state={{ defaultTab: 'admin' }} className="text-neutral-300 hover:text-white transition-colors">
                  Employer Sign In
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Giant Monolithic Wordmark: THOZHIL */}
        <div className="py-12 select-none border-b border-neutral-850">
          <svg
            viewBox="0 0 1400 240"
            className="w-full h-auto overflow-visible text-white/95"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-sans font-extrabold"
              fill="currentColor"
              style={{
                fontSize: 'clamp(110px, 18.5vw, 250px)',
                letterSpacing: '-0.06em',
                fontWeight: 900
              }}
            >
              THOZHIL
            </text>
          </svg>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} THOZHIL Ecosystem. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Security: Network-Isolated Sandboxing</span>
            <span>Zero Data Leakage Engine</span>
            <span>Privacy Filtered Deliberations</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default VltFooter;
