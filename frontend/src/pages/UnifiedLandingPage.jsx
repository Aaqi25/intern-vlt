import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { VltNavbar, VltFooter } from '../components/vlt';
import {
  Reveal,
  SplitText,
  Parallax,
  HorizontalModuleTrack,
  VelocitySkew,
  ReactiveMarquee,
  ScrollProgressBar,
  StatCounter,
  CustomCursor,
} from '../components/motion';

const MARQUEE_TECH = [
  'DOCKER SANDBOX ISOLATION',
  'SARVAM AI MULTILINGUAL SPEECH',
  'TF-IDF & GEMINI MULTI-FACTOR RESUME NLP',
  'PYTHON 3.12 / GCC 13 / TEMURIN 17',
  'AIR-GAPPED NETWORK EXECUTION',
  'REAL-TIME WEBSOCKET PROCTORING',
  'SOVEREIGN DELIBERATION LEDGER',
  'ZERO-TRUST MONACO IDE',
  'AST STATIC CODE AUDITING',
];

// Featured verified corporate opportunities (Naukri orchestrator + authentic tech roles)
const FEATURED_JOBS = [
  {
    id: 'zoho-fs-01',
    company: 'Zoho Corporation',
    role: 'Senior Full Stack Engineer',
    location: 'Chennai, India',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    salary: '₹18 - 28 LPA',
    department: 'Core SaaS Products',
    tags: ['React', 'Node.js', 'PostgreSQL', 'System Design'],
    evaluationModel: 'Code Sandbox + Technical Interview'
  },
  {
    id: 'freshworks-ai-02',
    company: 'Freshworks',
    role: 'AI / ML Platform Engineer',
    location: 'Chennai / Bengaluru (Hybrid)',
    type: 'Full-Time',
    experience: '2 - 5 Years',
    salary: '₹22 - 35 LPA',
    department: 'Freddy AI Intelligence',
    tags: ['Python', 'PyTorch', 'Gemini APIs', 'FastAPI'],
    evaluationModel: 'Resume NLP Match + Voice Interview'
  },
  {
    id: 'juspay-sys-03',
    company: 'Juspay',
    role: 'High-Throughput Systems Architect',
    location: 'Bengaluru, India',
    type: 'Full-Time',
    experience: '4 - 8 Years',
    salary: '₹28 - 45 LPA',
    department: 'Payment Gateway Infrastructure',
    tags: ['Rust', 'Go', 'Distributed Systems', 'Linux'],
    evaluationModel: 'Hardened Docker Sandbox (C++ / Go)'
  },
  {
    id: 'swiggy-fe-04',
    company: 'Swiggy',
    role: 'Frontend Infrastructure Specialist',
    location: 'Bengaluru / Remote',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    salary: '₹20 - 32 LPA',
    department: 'Consumer Apps Platform',
    tags: ['Next.js', 'TypeScript', 'Performance', 'WebGL'],
    evaluationModel: 'Practical Code Review Challenge'
  },
  {
    id: 'razorpay-sec-05',
    company: 'Razorpay',
    role: 'Cloud Security & Sandbox Engineer',
    location: 'Bengaluru, India',
    type: 'Full-Time',
    experience: '3 - 7 Years',
    salary: '₹25 - 38 LPA',
    department: 'Infrastructure Security',
    tags: ['Docker', 'Kubernetes', 'SIGKILL Quotas', 'AWS'],
    evaluationModel: 'Automated Container Security Audit'
  },
  {
    id: 'cred-data-06',
    company: 'Cred',
    role: 'Data Platform & Streaming Engineer',
    location: 'Bengaluru, India',
    type: 'Full-Time',
    experience: '2 - 5 Years',
    salary: '₹24 - 36 LPA',
    department: 'Financial Intelligence Services',
    tags: ['Kafka', 'Spark', 'PostgreSQL', 'Airflow'],
    evaluationModel: 'Sprint Log Review & Deliberation'
  }
];

export default function UnifiedLandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedExperience) params.append('experience', selectedExperience);
    navigate(`/job-portal?${params.toString()}`);
  };

  const handleQuickTagClick = (tag) => {
    navigate(`/job-portal?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-clip">
      {/* Skip to main content accessibility link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:font-bold focus:uppercase focus:tracking-wider focus:rounded"
      >
        Skip to content
      </a>

      {/* Scroll Progress Bar at Viewport Top */}
      <ScrollProgressBar />

      {/* Desktop Magnetic Custom Cursor */}
      <CustomCursor />

      {/* Dynamic Auto-Hiding Navbar */}
      <VltNavbar isDark={false} />

      <main id="main" tabIndex="-1" className="outline-none">
        
        {/* ========================================================
            HERO SECTION: Naukri Career Orchestrator + Hyring Presentation
            ======================================================== */}
        <section className="relative min-h-[92svh] flex flex-col justify-between pt-[calc(var(--nav-h,88px)+clamp(1.5rem,3.5vh,3rem))] pb-14 px-6 md:px-12 max-w-[1600px] mx-auto">
          
          {/* Top Platform Identification Badge */}
          <Reveal delay={0.05} className="w-full flex items-center justify-between pb-4 border-b border-slate-200 text-xs font-mono uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-semibold text-slate-700">THOZHIL HIRING ECOSYSTEM</span>
              <span className="hidden sm:inline text-slate-400">·</span>
              <span className="hidden sm:inline">AUTONOMOUS EVALUATION & DIRECT TALENT MATCHING</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-slate-400">
              <span>CHENNAI · BENGALURU · HYDERABAD</span>
            </div>
          </Reveal>

          {/* Central Headline with VLT Parallax Drift */}
          <div className="my-auto py-8 lg:py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Enterprise Career Platform</span>
            </div>

            <Parallax speed={1.08}>
              <h1 className="text-[clamp(2.5rem,6.2vw,5.75rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-slate-900 max-w-5xl">
                Find Careers That Value Your Actual Skills.
                <span className="block text-blue-600 font-normal italic font-serif tracking-tight mt-1">
                  Evaluated Honestly. Hired Directly.
                </span>
              </h1>
            </Parallax>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
              India's premier AI-native recruitment ecosystem connecting ambitious job seekers with verified enterprise opportunities through air-gapped technical evaluations and conversational interview intelligence.
            </p>

            {/* ========================================================
                NAUKRI-STYLE UNIVERSAL JOB SEARCH BAR
                ======================================================== */}
            <div className="mt-8 max-w-4xl bg-white border-2 border-blue-600/20 hover:border-blue-600 rounded-2xl shadow-xl shadow-blue-900/5 p-3 sm:p-4 transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Search Keywords */}
                <div className="md:col-span-5 relative flex items-center">
                  <Search className="w-5 h-5 text-blue-600 absolute left-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Skills, Designations, Companies..."
                    className="w-full pl-11 pr-3 py-3 text-sm font-sans bg-slate-50 md:bg-transparent rounded-lg border border-slate-200 md:border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Experience Dropdown */}
                <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-3 relative flex items-center">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 md:left-5 pointer-events-none" />
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-sm font-sans bg-slate-50 md:bg-transparent rounded-lg border border-slate-200 md:border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer"
                  >
                    <option value="">Experience (All)</option>
                    <option value="fresher">Fresher / Graduate</option>
                    <option value="1-3">1 - 3 Years</option>
                    <option value="3-5">3 - 5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>

                {/* Location Input */}
                <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-3 relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 md:left-5 pointer-events-none" />
                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-9 pr-3 py-3 text-sm font-sans bg-slate-50 md:bg-transparent rounded-lg border border-slate-200 md:border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.99]"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>

              {/* Popular Trend Filters */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Trending:
                </span>
                {['Remote Roles', 'Full Stack Developer', 'Python / AI', 'DevOps & Cloud', 'SDE-2', 'Fresher Opportunities'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md text-slate-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Trust Row */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>5,000+ Verified Openings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>350+ Enterprise Employers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Resume Spammers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Fast-Track Hiring</span>
            </div>
          </div>

        </section>

        {/* ========================================================
            FEATURED CORPORATE OPENINGS (Requirement 4)
            ======================================================== */}
        <section className="py-20 px-6 md:px-12 bg-slate-50/70 border-t border-b border-slate-200">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs uppercase tracking-wider font-mono text-blue-700 font-bold block mb-2">
                  DIRECT RECRUITMENT PIPELINE
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Featured High-Impact Opportunities
                </h2>
              </div>
              <Link 
                to="/job-portal"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
              >
                <span>Browse All 500+ Open Positions</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 6 Corporate Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_JOBS.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group"
                >
                  <div>
                    {/* Top Row: Company & Type */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-sm">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{job.company}</h4>
                          <span className="text-xs text-slate-500">{job.department}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.type}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-3">
                      {job.role}
                    </h3>

                    {/* Metadata: Location, Exp, CTC */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.experience} · <strong>{job.salary}</strong></span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {job.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Evaluation Model & Apply CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-500 truncate" title={job.evaluationModel}>
                      ⚡ {job.evaluationModel}
                    </span>
                    <Link
                      to={`/job-portal?role=${encodeURIComponent(job.role)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all shrink-0"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================
            HYRING-STYLE ARCHITECTURE: The 5 Modules Behind Every Job
            ======================================================== */}
        <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="max-w-4xl mb-16">
            <span className="text-xs uppercase tracking-wider font-mono text-blue-700 font-bold block mb-3">
              THE TALENT OPERATING SYSTEM
            </span>
            <SplitText
              as="h2"
              lines={[
                "Traditional hiring black holes are broken.",
                "THOZHIL powers verified applications through air-gapped Docker coding and conversational AI interviews.",
                "From discovery to offer deliberation — transparent, objective, and verified."
              ]}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-slate-900"
            />
          </div>

          {/* 3 Pillar Cards: Candidate Experience vs Recruiter Control */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-slate-200 rounded-xl bg-white hover:border-blue-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Job Seekers & Graduates</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  One unified verified profile. Complete technical assessments once in an air-gapped IDE and interview directly with AI voice rooms without waiting weeks for initial recruiter responses.
                </p>
              </div>
              <Link 
                to="/job-portal"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 border border-slate-200 rounded-xl bg-white hover:border-blue-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Recruiters & Talent Teams</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Zero resume spam. Our NLP screener extracts skills and runs structured technical evaluations automatically, presenting ranked candidate scorecards with transparent proctoring logs.
                </p>
              </div>
              <Link 
                to="/login"
                state={{ defaultTab: 'admin' }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900"
              >
                <span>Open Recruiter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 border border-slate-200 rounded-xl bg-white hover:border-blue-600 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Engineering Leads & Authorities</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Review real sprint code submissions through the AI Project Analyser, inspect multi-model AI critiques, and record irrevocable hiring decisions on a sovereign, auditable candidate ledger.
                </p>
              </div>
              <Link 
                to="/login"
                state={{ defaultTab: 'admin' }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900"
              >
                <span>Access Authority Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </section>

        {/* ========================================================
            HORIZONTAL MODULE TRACK (Pinned Section)
            ======================================================== */}
        <HorizontalModuleTrack />

        {/* ========================================================
            HARDENED DOCKER SANDBOX (Deep Midnight Navy Showcase)
            ======================================================== */}
        <section id="sandbox" className="theme-dark bg-[#071324] text-white py-24 px-6 md:px-12 border-b border-slate-800">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] font-mono text-blue-400 block mb-2">
                  AIR-GAPPED EXECUTION
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                  Multi-Language Docker Sandbox.
                </h2>
              </div>
              <p className="text-slate-300 max-w-md text-sm leading-relaxed">
                Zero network access, root privilege dropping, hard 256MB memory ceilings, and strict CPU quotas ensure candidate code runs in an isolated, tamper-proof environment.
              </p>
            </div>

            {/* 4 Runtimes Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  lang: 'Python 3.12',
                  tag: 'python:3.12-slim',
                  compile: 'Direct execution',
                  exec: 'python3 solution.py',
                  color: 'text-amber-400',
                },
                {
                  lang: 'Node.js 20',
                  tag: 'node:20-slim',
                  compile: 'V8 JIT compilation',
                  exec: 'node solution.js',
                  color: 'text-emerald-400',
                },
                {
                  lang: 'C++ 17',
                  tag: 'gcc:13',
                  compile: 'g++ -O2 -std=c++17 -o solution',
                  exec: './solution',
                  color: 'text-sky-400',
                },
                {
                  lang: 'Java 17',
                  tag: 'eclipse-temurin:17-jdk-alpine',
                  compile: 'javac Solution.java',
                  exec: 'java Solution',
                  color: 'text-purple-400',
                },
              ].map((r, i) => (
                <div key={i} className="p-6 bg-[#0b1c3d] border border-slate-800 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                        RUNTIME 0{i + 1}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <h3 className={`text-xl font-bold font-sans tracking-tight mb-2 ${r.color}`}>
                      {r.lang}
                    </h3>
                    <code className="text-xs font-mono text-slate-400 block mb-6 pb-4 border-b border-slate-800">
                      {r.tag}
                    </code>
                    <div className="space-y-3 text-xs font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500 block">COMPILE:</span>
                        <span className="text-slate-300">{r.compile}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">EXECUTE:</span>
                        <span className="text-slate-300">{r.exec}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    network_mode: "none"
                  </div>
                </div>
              ))}
            </div>

            {/* Security Table Bar */}
            <div className="mt-8 p-6 bg-[#0b1c3d] border border-slate-800 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">MEMORY LIMIT</span>
                <span className="text-white font-bold">256 MB Hard Cap</span>
              </div>
              <div>
                <span className="text-slate-400 block">CPU QUOTA</span>
                <span className="text-white font-bold">1.0 vCPU Cores</span>
              </div>
              <div>
                <span className="text-slate-400 block">EXECUTION TIMEOUT</span>
                <span className="text-white font-bold">10s (SIGKILL)</span>
              </div>
              <div>
                <span className="text-slate-400 block">CAPABILITIES</span>
                <span className="text-white font-bold">cap_drop=["ALL"]</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            STATS & METRICS COUNTERS
            ======================================================== */}
        <section className="py-20 px-6 md:px-12 bg-white border-b border-slate-200">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <StatCounter
                value="5"
                suffix=""
                label="Integrated Assessment Modules"
              />
              <StatCounter
                value="4"
                suffix=" Runtimes"
                label="Air-Gapped Docker Execution"
              />
              <StatCounter
                value="6"
                suffix=" Stages"
                label="Structured Recruitment Machine"
              />
              <StatCounter
                value="100"
                suffix="%"
                label="Zero Host Network Leakage"
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            VELOCITY-REACTIVE INFINITE MARQUEE
            ======================================================== */}
        <VelocitySkew>
          <section className="theme-dark bg-[#071324] text-white border-b border-slate-800 py-3">
            <ReactiveMarquee items={MARQUEE_TECH} baseSpeed={28} />
          </section>
        </VelocitySkew>

        {/* ========================================================
            FINAL CALL TO ACTION
            ======================================================== */}
        <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="p-10 md:p-16 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-2xl text-white text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
            <span className="text-xs uppercase tracking-widest font-mono text-blue-200 mb-3 block">
              ENTERPRISE RECRUITMENT READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mb-4 text-white">
              Transform Your Recruitment Pipeline Today.
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
              Explore opportunities across top technology leaders, or launch automated evaluation suites for your hiring pipeline.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/job-portal"
                className="px-6 py-3.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm rounded-lg shadow-sm transition-all"
              >
                Browse Active Opportunities
              </Link>
              <Link
                to="/login"
                state={{ defaultTab: 'admin' }}
                className="px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/40 font-bold text-sm rounded-lg transition-all"
              >
                Employer Portal Sign In
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Full-Width Monolithic Wordmark Footer */}
      <VltFooter />
    </div>
  );
}
