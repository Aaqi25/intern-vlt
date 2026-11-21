import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  History, 
  LogOut, 
  Moon, 
  Sun, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Code2, 
  Video, 
  UserCheck, 
  ChevronRight,
  ChevronDown,
  FileCheck2,
  FolderKanban,
  Briefcase,
  MoreVertical,
  User,
  Menu,
  X,
  GitBranch,
  BarChart3,
  PlusCircle,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/InternContext';
import { useAuth } from '../../context/AuthContext';
import { useThozhilAuth } from '../../context/ThozhilAuthContext';
import BrandLogo from '../../components/BrandLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface ProductModule {
  id: string;
  name: string;
  badge?: string;
  icon: React.ReactNode;
  defaultPath: string;
  matchPrefixes: string[];
  subItems: SubMenuItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { role, setRole, theme, setTheme, projects, selectedProjectId, setSelectedProjectId } = useApp();
  const { user: authUser, logout: authLogout } = useAuth();
  const { logout: tzLogout } = useThozhilAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active path
  const currentPath = location.pathname;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track expanded accordion state for product modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const isResume = currentPath.includes('resume');
    const isCoding = currentPath.includes('coding');
    const isInterview = currentPath.includes('/recruiter') || (currentPath.startsWith('/candidate') && !currentPath.includes('resume') && !currentPath.includes('coding'));
    
    return {
      loglense: !isResume && !isCoding && !isInterview,
      resume: isResume,
      interview: isInterview,
      coding: isCoding
    };
  });

  // Ensure active route's module is expanded when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (currentPath.includes('resume')) {
      setExpandedModules(prev => ({ ...prev, resume: true }));
    } else if (currentPath.includes('coding')) {
      setExpandedModules(prev => ({ ...prev, coding: true }));
    } else if (currentPath.includes('/recruiter') || (currentPath.startsWith('/candidate') && !currentPath.includes('resume') && !currentPath.includes('coding'))) {
      setExpandedModules(prev => ({ ...prev, interview: true }));
    } else {
      setExpandedModules(prev => ({ ...prev, loglense: true }));
    }
  }, [currentPath]);

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (authLogout) await authLogout();
      if (tzLogout) await tzLogout();
    } catch (_) {}
    setRole('none');
    window.location.href = '/';
  };

  // 4 Core Product Modules Definitions with Authentic Submenus (Clean Professional Icons Only)
  const productModules: ProductModule[] = role === 'authority' ? [
    {
      id: 'loglense',
      name: 'AI Project Analyser',
      badge: 'Sprint Review',
      icon: <GitBranch size={16} />,
      defaultPath: '/authority',
      matchPrefixes: ['/authority', '/project-analysis', '/history', '/interns'],
      subItems: [
        { name: 'Authority Panel', path: '/authority', icon: <LayoutDashboard size={14} /> },
        { name: 'Sprint Log History', path: '/history', icon: <History size={14} /> },
        { name: 'Contributor Directory', path: '/interns', icon: <Users size={14} /> }
      ]
    },
    {
      id: 'resume',
      name: 'AI Resume Screener',
      icon: <FileCheck2 size={16} />,
      defaultPath: '/recruiter/resume-screener',
      matchPrefixes: ['/recruiter/resume-screener', '/resume'],
      subItems: [
        { name: 'Resume Screening Hub', path: '/recruiter/resume-screener', icon: <FileCheck2 size={14} /> }
      ]
    },
    {
      id: 'interview',
      name: 'AI Video Interviewer',
      icon: <Video size={16} />,
      defaultPath: '/recruiter/interviews',
      matchPrefixes: ['/recruiter'],
      subItems: [
        { name: 'Interviews List', path: '/recruiter/interviews', icon: <Video size={14} /> },
        { name: 'Create Assessment', path: '/recruiter/interviews/new', icon: <PlusCircle size={14} /> },
        { name: 'Candidates Pool', path: '/recruiter/candidates', icon: <Users size={14} /> },
        { name: 'Question Library', path: '/recruiter/questions', icon: <FolderKanban size={14} /> },
        { name: 'Templates', path: '/recruiter/templates', icon: <FileText size={14} /> },
        { name: 'Analytics', path: '/recruiter/analytics', icon: <BarChart3 size={14} /> },
        { name: 'Command Center', path: '/recruiter', icon: <LayoutDashboard size={14} /> }
      ]
    },
    {
      id: 'coding',
      name: 'AI Coding Interviewer',
      icon: <Code2 size={16} />,
      defaultPath: '/recruiter/coding-assessments',
      matchPrefixes: ['/recruiter/coding-assessments', '/coding'],
      subItems: [
        { name: 'Coding Assessments', path: '/recruiter/coding-assessments', icon: <Code2 size={14} /> }
      ]
    }
  ] : [
    {
      id: 'loglense',
      name: 'AI Project Analyser',
      badge: 'Sprint Review',
      icon: <GitBranch size={16} />,
      defaultPath: '/intern',
      matchPrefixes: ['/intern', '/project-analysis', '/history', '/interns'],
      subItems: [
        { name: 'Candidate Dashboard', path: '/intern', icon: <LayoutDashboard size={14} /> },
        { name: 'Sprint Log History', path: '/history', icon: <History size={14} /> },
        { name: 'My Profile', path: '/interns', icon: <Users size={14} /> }
      ]
    },
    {
      id: 'resume',
      name: 'AI Resume Screener',
      icon: <FileCheck2 size={16} />,
      defaultPath: '/candidate/resume-check',
      matchPrefixes: ['/candidate/resume-check', '/resume'],
      subItems: [
        { name: 'Resume Fit Analysis', path: '/candidate/resume-check', icon: <FileCheck2 size={14} /> }
      ]
    },
    {
      id: 'interview',
      name: 'AI Video Interviewer',
      icon: <Video size={16} />,
      defaultPath: '/candidate',
      matchPrefixes: ['/candidate'],
      subItems: [
        { name: 'My Assessments', path: '/candidate', icon: <Video size={14} /> },
        { name: 'Practice Workspace', path: '/candidate/practice', icon: <PlayCircle size={14} /> },
        { name: 'Hardware & Device Check', path: '/candidate/device-check', icon: <CheckCircle2 size={14} /> }
      ]
    },
    {
      id: 'coding',
      name: 'AI Coding Interviewer',
      icon: <Code2 size={16} />,
      defaultPath: '/candidate/coding-workspace',
      matchPrefixes: ['/candidate/coding-workspace', '/coding'],
      subItems: [
        { name: 'Coding Workspace', path: '/candidate/coding-workspace', icon: <Code2 size={14} /> }
      ]
    }
  ];

  const userInitials = authUser?.name
    ? authUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : (role === 'authority' ? 'EM' : 'CA');
    
  const userName = authUser?.name || (role === 'authority' ? 'Employer workspace' : 'Candidate workspace');
  const roleName = role === 'authority' ? 'EMPLOYER / MANAGER' : 'CANDIDATE / INTERN';

  const isLogLenseActive = currentPath === '/authority' || currentPath === '/intern' || currentPath === '/history' || currentPath.startsWith('/interns') || currentPath === '/project-analysis';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200 font-sans">

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
        />
      )}
      <aside 
        data-lenis-prevent
        className={`fixed inset-y-0 left-0 z-30 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-xs transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 md:static md:z-20 md:w-64 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-5 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo imageClassName="h-8 w-auto max-w-[150px]" />
          </Link>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Console
          </span>
        </div>

        {/* Section Label */}
        <div className="pt-4 px-4 pb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            PRODUCT SUITE
          </span>
        </div>

        {/* Expandable Module Navigation */}
        <nav className="p-3 flex-1 space-y-1.5 overflow-y-auto">
          {productModules.map((module) => {
            const isModuleOpen = !!expandedModules[module.id];
            const isAnySubActive = module.subItems.some(sub => currentPath === sub.path || (sub.path !== '/recruiter' && currentPath.startsWith(sub.path)));
            const isModuleActive = isAnySubActive || module.matchPrefixes.some(prefix => currentPath === prefix || currentPath.startsWith(prefix));

            return (
              <div key={module.id} className="space-y-1">
                {/* Product Area Header Button */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer
                    ${isModuleActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 shadow-2xs font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isModuleActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                      {module.icon}
                    </span>
                    <span className="tracking-tight">{module.name}</span>
                    {module.badge && (
                      <span className="rounded bg-blue-100/80 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        {module.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400">
                    {isModuleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </button>

                {/* Expandable Submenu Items */}
                {isModuleOpen && (
                  <div className="ml-4 space-y-0.5 border-l-2 border-slate-200 py-1 pl-4 pr-1 animate-in fade-in duration-200 dark:border-slate-800">
                    {module.subItems.map((sub) => {
                      const isSubActive = currentPath === sub.path || (sub.path === '/authority' && currentPath === '/project-analysis') || (sub.path === '/intern' && currentPath === '/project-analysis');

                      return (
                        <button
                          key={sub.name}
                          type="button"
                          onClick={() => navigate(sub.path)}
                          className={`
                            w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left
                            ${isSubActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={isSubActive ? 'text-white' : 'text-slate-400'}>
                              {sub.icon}
                            </span>
                            <span className="truncate">{sub.name}</span>
                          </div>
                          {isSubActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* 5th Module: Seek Thozhil - Job Seeking Platform */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/job-portal');
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              currentPath.startsWith('/job-portal')
                ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/40 dark:text-blue-300'
                : 'text-slate-700 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/60'
            }`}
          >
            <Briefcase size={16} className={currentPath.startsWith('/job-portal') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
            <span className="truncate">Seek Thozhil - Job Platform</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
          {/* User card with 3-dot slidebar menu */}
          <div className="relative">
            <div className="px-3 py-2 flex items-center justify-between gap-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {userInitials}
              </div>
              <div className="truncate min-w-0 flex-1">
                <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                  {userName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="rounded bg-blue-50 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {roleName}
                  </span>
                </div>
              </div>
              {/* Three Dot Action Button */}
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Account Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Three Dot Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 text-xs animate-in fade-in duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 font-medium truncate">
                  {authUser?.email || 'Account email'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/interns');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  <User size={13} className="text-blue-600" />
                  <span>View Profile & Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(role === 'authority' ? '/intern' : '/authority');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                >
                  <Briefcase size={13} className="text-blue-600" />
                  <span>Switch to {role === 'authority' ? 'Candidate Space' : 'Authority Hub'}</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors text-xs font-semibold gap-2 text-slate-600 dark:text-slate-300 shadow-2xs cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div data-lenis-prevent className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          {/* Left: Project Selector (when on AI Project Analyser) or Module Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {isLogLenseActive ? (
              <>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Active Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    navigate(role === 'authority' ? '/authority' : '/intern');
                  }}
                  className="max-w-[170px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition-all focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:max-w-[220px]"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.code} — {proj.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden text-xs font-bold text-slate-400 sm:inline">Thozhil Platform Console</span>
                <span className="hidden text-slate-300 sm:inline">/</span>
                <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {currentPath.includes('resume') 
                    ? 'AI Resume Screener' 
                    : currentPath.includes('coding') 
                    ? 'AI Coding Interviewer' 
                    : currentPath.includes('job-portal')
                    ? 'Seek Thozhil - Job Seeking Platform'
                    : 'AI Video Interviewer'}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                const nextRole = role === 'authority' ? 'intern' : 'authority';
                setRole(nextRole);
                navigate(nextRole === 'authority' ? '/authority' : '/intern');
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="Click to switch persona"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Role: <strong className="capitalize text-slate-900 dark:text-white">{role}</strong> <span className="ml-0.5 text-[10px] font-normal text-blue-600">(Switch)</span></span>
              <span className="capitalize sm:hidden">{role}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
              title="Toggle Appearance"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="w-full flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
