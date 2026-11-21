import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  FileText, 
  GitBranch, 
  Video, 
  Code2, 
  ArrowRight 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  {
    id: 'seek-thozhil',
    num: '01',
    title: 'Seek Thozhil - Job Seeking Platform',
    category: 'CAREER DISCOVERY',
    description: 'Enterprise job marketplace connecting verified talent with active corporate vacancies.',
    icon: Briefcase,
    metric: '5,000+ Listed Openings',
    to: '/job-portal',
    roleTag: 'CANDIDATE & EMPLOYER'
  },
  {
    id: 'ai-resume-screener',
    num: '02',
    title: 'AI Resume Screener',
    category: 'RESUME NLP ENGINE',
    description: 'Automated high-throughput resume parsing and multi-factor qualification match scoring.',
    icon: FileText,
    metric: 'Sub-Second Evaluation',
    to: '/recruiter/resume-screener',
    roleTag: 'RECRUITER & HR'
  },
  {
    id: 'ai-project-analyser',
    num: '03',
    title: 'AI Project Analyser',
    category: 'CODE & SPRINT AUDIT',
    description: 'Sprint log review and code diff analysis with multi-model architectural risk audits.',
    icon: GitBranch,
    metric: 'Sprint-Level Verification',
    to: '/recruiter/intern-logs',
    roleTag: 'AUTHORITY & LEAD'
  },
  {
    id: 'ai-video-interviewer',
    num: '04',
    title: 'AI Video Interviewer',
    category: 'CONVERSATIONAL AI',
    description: 'Autonomous conversational video interviews with real-time speech and proctoring analysis.',
    icon: Video,
    metric: 'Real-Time Voice Turns',
    to: '/recruiter/interviews',
    roleTag: 'RECRUITER & CANDIDATE'
  },
  {
    id: 'ai-coding-interviewer',
    num: '05',
    title: 'AI Coding Interviewer',
    category: 'ISOLATED SANDBOX',
    description: 'Air-gapped multi-language coding assessments across Python, Node, C++, and Java.',
    icon: Code2,
    metric: 'Network-Isolated Execution',
    to: '/recruiter/coding-assessments',
    roleTag: 'TECHNICAL EVALUATOR'
  },
];

export const HorizontalModuleTrack = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleModuleClick = (targetPath, roleTag) => {
    if (!isAuthenticated) {
      const defaultTab = roleTag?.includes('CANDIDATE') && !roleTag?.includes('RECRUITER') ? 'candidate' : 'admin';
      navigate('/login', { state: { from: { pathname: targetPath }, defaultTab } });
    } else {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.innerWidth < 1024) return;

    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const totalWidth = track.scrollWidth - window.innerWidth + 96;

    const tween = gsap.to(track, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id="modules" className="relative w-full overflow-hidden bg-slate-50 text-slate-900 py-24 border-b border-slate-200">
      
      {/* Section Header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-mono text-blue-700 font-bold block mb-2">
            INTEGRATED RECRUITMENT SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Five Core Talent Modules.
          </h2>
        </div>
        <p className="text-slate-600 max-w-md text-sm leading-relaxed">
          Each engine powers a specific phase of candidate intake, evaluation, and verified hiring without disconnected third-party tools.
        </p>
      </div>

      {/* Horizontal Track (pinned on desktop, stacked on mobile) */}
      <div 
        ref={trackRef} 
        className="flex flex-col lg:flex-row gap-6 px-6 md:px-12 w-full lg:w-max will-change-transform"
      >
        {MODULES.map((mod) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={mod.id}
              className="w-full lg:w-[440px] p-8 bg-white border border-slate-200 hover:border-blue-600 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold tracking-widest text-blue-600">
                    MODULE [{mod.num}]
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {mod.category}
                  </span>
                </div>

                {/* Professional Clean Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <IconComponent className="w-6 h-6 stroke-[1.75]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {mod.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 mb-8">
                  {mod.description}
                </p>
              </div>

              {/* Card Footer */}
              <div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-5 text-xs font-mono">
                  <span className="text-slate-500">
                    {mod.metric}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">
                    {mod.roleTag}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleModuleClick(mod.to, mod.roleTag)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-800 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-200 group/btn cursor-pointer"
                >
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};

export default HorizontalModuleTrack;
