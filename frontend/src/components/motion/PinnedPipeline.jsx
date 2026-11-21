import React, { useEffect, useRef, useState } from 'react';
// containerRef removed — trigger uses triggerRef directly
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FileText, 
  FileCheck2, 
  Code2, 
  Video, 
  BriefcaseBusiness, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Candidate Intake & Application',
    sub: 'Seek Thozhil - Job Seeking Platform',
    icon: BriefcaseBusiness,
    desc: 'Candidates discover vacancies, configure career preferences, and submit verified credentials directly into the unified ATS ledger.',
    metrics: ['Role matching', 'Multi-applicant queues', 'Direct ATS ingestion'],
    to: '/job-portal',
    linkText: 'Explore Vacancies',
  },
  {
    step: '02',
    title: 'AI Resume Screener & Skill Taxonomy',
    sub: 'TF-IDF & Gemini Multi-Factor Scoring',
    icon: FileCheck2,
    desc: 'Automated high-throughput PDF/DOCX parsing extracts skill sets, analyzes experience relevance, and computes structured candidate match scores.',
    metrics: ['Sub-second parsing', 'Local TF-IDF fallback', 'Zero hallucinations'],
    to: '/recruiter/resume-screener',
    linkText: 'Inspect Screener Engine',
  },
  {
    step: '03',
    title: 'Practical Work & Sprint Log Review',
    sub: 'AI Project Analyser',
    icon: FileText,
    desc: 'Interns and contributors submit sprint deliverables and code files. Multi-LLM audit engines evaluate architectural risk, maintainability, and code quality.',
    metrics: ['Sprint-level audit', 'Audio critique generation', 'Risk indexing'],
    to: '/recruiter/intern-logs',
    linkText: 'View Log Auditing',
  },
  {
    step: '04',
    title: 'Conversational AI Video Interview',
    sub: 'AI Video Interviewer Suite',
    icon: Video,
    desc: 'Real-time multilingual voice turns with Sarvam AI STT/TTS, active proctoring observers, face-tracking alerts, and comprehensive scorecard breakdowns.',
    metrics: ['Low-latency audio loop', 'Window blur detection', '4-axis scorecard'],
    to: '/recruiter/interviews',
    linkText: 'Open Interview Suite',
  },
  {
    step: '05',
    title: 'Isolated Multi-Language Coding',
    sub: 'AI Coding Interviewer Sandbox',
    icon: Code2,
    desc: 'Air-gapped execution across Python 3.12, Node 20, C++ GCC 13, and Java 17. Hard 256MB RAM caps, 1 CPU quota, network isolation, and strict 10s SIGKILL limits.',
    metrics: ['network_mode: none', 'cap_drop: ALL', '10s SIGKILL timeout'],
    to: '/recruiter/coding-assessments',
    linkText: 'Test Coding Workspace',
  },
  {
    step: '06',
    title: 'Authority Decision & Sovereign Offer',
    sub: 'Gated Deliberation & Private Ledger',
    icon: CheckCircle2,
    desc: 'Authorities review comprehensive candidate profiles across all four evaluators, attach private internal notes, and log irrevocable decisions.',
    metrics: ['Cross-evaluator rollup', 'Information-hiding projection', 'Instant credentialing'],
    to: '/login',
    linkText: 'Enter Authority Dashboard',
  },
];

export const PinnedPipeline = () => {
  const triggerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const trigger = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const step = Math.min(
          PIPELINE_STEPS.length - 1,
          Math.floor(self.progress * PIPELINE_STEPS.length)
        );
        setActiveStep(step);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const current = PIPELINE_STEPS[activeStep];
  const StepIcon = current.icon;

  return (
    <div ref={triggerRef} className="relative w-full min-h-screen theme-dark bg-[#071324] text-white py-16 flex items-center overflow-hidden border-t border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 w-full">
        
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-mono text-blue-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Autonomous Recruitment Machine
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-white">
              The 6-Stage Recruitment Pipeline
            </h2>
          </div>
          <div className="text-xs uppercase tracking-[0.14em] font-mono text-slate-400">
            Scroll to advance stage [{String(activeStep + 1).padStart(2, '0')} / 06]
          </div>
        </div>

        {/* Dynamic Interactive Stage Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Stage Selector & Progression Bar */}
          <div className="lg:col-span-5 space-y-3">
            {PIPELINE_STEPS.map((s, idx) => {
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 border rounded-md transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'border-blue-500 bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
                      : isPast
                      ? 'border-slate-800 text-slate-300 bg-slate-900/60 hover:border-slate-700'
                      : 'border-slate-850 text-slate-500 bg-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold tracking-wider">
                      {s.step}
                    </span>
                    <span className="text-sm font-sans tracking-tight">
                      {s.title}
                    </span>
                  </div>
                  {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isActive && <ArrowRight className="w-4 h-4 text-white" />}
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Stage Inspection Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#0b1c3d] border border-slate-800 rounded-lg p-8 sm:p-12 relative overflow-hidden">
              
              {/* Background Step Watermark */}
              <div className="absolute -bottom-8 -right-8 text-slate-800/40 font-mono font-black text-9xl select-none pointer-events-none">
                {current.step}
              </div>

              {/* Header */}
              <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.14em] text-blue-400 font-mono block">
                      STAGE {current.step}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {current.sub}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight relative z-10">
                {current.title}
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-xl relative z-10">
                {current.desc}
              </p>

              {/* Technical Assertions / Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800 mb-8 relative z-10">
                {current.metrics.map((metric, i) => (
                  <div key={i} className="bg-[#071324] border border-slate-800 rounded p-3 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {metric}
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <div className="relative z-10">
                <Link
                  to={current.to}
                  className="vlt-btn vlt-btn--solid inline-flex items-center gap-2"
                >
                  <span className="vlt-btn__label">{current.linkText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PinnedPipeline;
