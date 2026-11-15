import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Code2,
  FileCheck2,
  FileText,
  GraduationCap,
  Menu,
  X,
  Video,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const modules = [
  {
    name: 'AI Project Analyser / LogLense',
    description: 'Review project work, track sprint progress, and give candidates useful feedback.',
    icon: FileText,
    destination: '/authority',
    role: 'admin',
  },
  {
    name: 'AI Video Interviewer',
    description: 'Run structured video interviews and review candidate responses.',
    icon: Video,
    destination: '/recruiter/interviews',
    role: 'admin',
  },
  {
    name: 'AI Resume Screener',
    description: 'Compare resumes with role requirements and organize your candidate pipeline.',
    icon: FileCheck2,
    destination: '/recruiter/resume-screener',
    role: 'admin',
  },
  {
    name: 'AI Coding Interviewer',
    description: 'Set coding assessments and evaluate submissions in the coding workspace.',
    icon: Code2,
    destination: '/recruiter/coding-assessments',
    role: 'admin',
  },
  {
    name: 'Job Portal',
    description: 'Find jobs and internships, publish vacancies, and track applications.',
    icon: BriefcaseBusiness,
    destination: '/job-portal',
  },
];

const audiences = [
  {
    title: 'Job seekers, students & freshers',
    description: 'Explore job and internship opportunities, apply, and keep your applications together.',
    icon: GraduationCap,
    action: 'Explore opportunities',
    destination: '/job-portal',
  },
  {
    title: 'Employers & recruiters',
    description: 'Publish roles, review applications, and use assessment tools throughout hiring.',
    icon: Building2,
    action: 'Post a vacancy',
    destination: '/job-portal',
  },
  {
    title: 'Assessment teams',
    description: 'Open the platform workspaces for interviews, resumes, coding, and project analysis.',
    icon: FileCheck2,
    action: 'Open assessment workspace',
    destination: '/login',
    role: 'admin',
    from: '/recruiter',
  },
];

function loginState(destination, role) {
  return { from: { pathname: destination }, defaultTab: role };
}

export default function UnifiedLandingPage() {
  const navigate = useNavigate();
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openWorkspace = (destination, role = 'admin') => {
    setProductsOpen(false);
    setMobileMenuOpen(false);
    navigate('/login', { state: loginState(destination, role) });
  };

  const openJobs = () => {
    setProductsOpen(false);
    setMobileMenuOpen(false);
    navigate('/job-portal');
  };

  const renderModuleLink = (module, compact = false) => {
    const Icon = module.icon;
    const open = module.destination === '/job-portal'
      ? openJobs
      : () => openWorkspace(module.destination, module.role);

    return (
      <button
        key={module.name}
        type="button"
        onClick={open}
        className={`group flex w-full items-start gap-3 rounded-xl text-left transition-colors hover:bg-[var(--thozhil-brand-soft)] ${
          compact ? 'p-3' : 'p-5'
        }`}
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--thozhil-brand-soft)] text-thozhil">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-900 group-hover:text-thozhil">
            {module.name}
          </span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">
            {module.description}
          </span>
          {!compact && (
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-thozhil">
              Explore module <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-thozhil-background text-slate-900">
      <header className="sticky top-0 z-30 border-b border-thozhil-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" aria-label="THOZHIL home" className="shrink-0">
            <BrandLogo
              imageClassName="h-9 w-auto max-w-[190px]"
              caption="Unified platform"
              className="gap-3"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
            <a href="#platform" className="text-sm font-medium text-slate-600 hover:text-thozhil">
              Platform
            </a>
            <a href="#modules" className="text-sm font-medium text-slate-600 hover:text-thozhil">
              Modules
            </a>
            <Link to="/job-portal" className="text-sm font-medium text-slate-600 hover:text-thozhil">
              Jobs & internships
            </Link>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setProductsOpen(false);
              }}
            >
              <button
                type="button"
                aria-expanded={productsOpen}
                aria-haspopup="true"
                onClick={() => setProductsOpen((open) => !open)}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-thozhil"
              >
                Products <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {productsOpen && (
                <div className="absolute right-0 top-full mt-3 w-[min(90vw,28rem)] rounded-2xl border border-thozhil-border bg-white p-2 shadow-xl">
                  {modules.map((module) => renderModuleLink(module, true))}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => openWorkspace('/intern', 'candidate')}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Candidate sign in
            </button>
            <Link
              to="/job-portal?mode=register"
              className="thozhil-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              Create an account <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-thozhil-border text-slate-700 md:hidden"
          >
            {mobileMenuOpen
              ? <X className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>

          {mobileMenuOpen && (
            <nav aria-label="Mobile navigation" className="flex w-full flex-col gap-1 border-t border-thozhil-border py-3 md:hidden">
              <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Platform
              </a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Modules
              </a>
              <Link to="/job-portal" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Jobs & internships
              </Link>
              {modules.map((module) => renderModuleLink(module, true))}
              <button
                type="button"
                onClick={() => openWorkspace('/intern', 'candidate')}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-thozhil hover:bg-[var(--thozhil-brand-soft)]"
              >
                Candidate sign in
              </button>
              <Link to="/job-portal?mode=register" onClick={() => setMobileMenuOpen(false)} className="thozhil-button-primary mt-2 inline-flex justify-center px-4 py-2.5 text-sm">
                Create an account
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main>
        <section id="platform" className="border-b border-thozhil-border bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-thozhil-border bg-thozhil-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                <span className="h-2 w-2 rounded-full bg-thozhil" aria-hidden="true" />
                THOZHIL careers & hiring
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                One platform for{' '}
                <span className="text-thozhil">jobs, internships, and smarter hiring.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                Find opportunities, build your skills, and connect with employers. Hiring teams can discover talent and assess candidates in the same THOZHIL ecosystem.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openJobs}
                  className="thozhil-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"
                >
                  Find jobs & internships <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => openWorkspace('/recruiter', 'admin')}
                  className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-thozhil-border bg-white px-5 text-sm font-semibold text-slate-800 hover:border-thozhil hover:text-thozhil"
                >
                  Employer & recruiter sign in
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                New to THOZHIL?{' '}
                <Link to="/job-portal?mode=register" className="font-semibold text-thozhil underline-offset-4 hover:underline">
                  Create a job seeker or employer account
                </Link>
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-thozhil-border bg-thozhil-background p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-thozhil-border bg-white p-5 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-thozhil">THOZHIL platform</p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                    Career opportunities and hiring tools, together.
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                    Choose the workspace for your next step.
                  </p>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-thozhil-soft text-thozhil sm:flex">
                  <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-thozhil-border bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-thozhil-soft text-thozhil">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Jobs & internships</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Explore opportunities</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-thozhil-border bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-thozhil-soft text-thozhil">
                    <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">AI candidate assessment</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Review skills and experience</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-thozhil-border bg-white p-4 sm:col-span-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-thozhil-soft text-thozhil">
                    <Video className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Recruitment workspaces</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Manage roles, applications, and assessments</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-thozhil">Built for every side of the journey</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Opportunities for people. Practical tools for hiring teams.
            </h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              const onClick = audience.destination === '/job-portal'
                ? openJobs
                : () => openWorkspace(audience.from, audience.role);
              return (
                <article key={audience.title} className="thozhil-card flex flex-col p-5 sm:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--thozhil-brand-soft)] text-thozhil">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{audience.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{audience.description}</p>
                  <button
                    type="button"
                    onClick={onClick}
                    className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-thozhil hover:text-thozhil-strong"
                  >
                    {audience.action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="modules" className="border-y border-thozhil-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-thozhil">Connected THOZHIL modules</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  From opportunity discovery to candidate assessment
                </h2>
              </div>
              <Link to="/job-portal" className="inline-flex items-center gap-2 text-sm font-semibold text-thozhil hover:text-thozhil-strong">
                Browse opportunities <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <article key={module.name} className="thozhil-card">
                  {renderModuleLink(module)}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <BrandLogo imageClassName="h-7 w-auto max-w-[160px]" caption="Jobs, internships & hiring" className="gap-3" />
            <p className="mt-2 text-xs text-slate-500">One THOZHIL platform for opportunity and assessment.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <Link to="/job-portal" className="hover:text-thozhil">Jobs & internships</Link>
            <button type="button" onClick={() => openWorkspace('/intern', 'candidate')} className="text-left hover:text-thozhil">
              Candidate assessment
            </button>
            <button type="button" onClick={() => openWorkspace('/recruiter', 'admin')} className="text-left hover:text-thozhil">
              Employer workspace
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
