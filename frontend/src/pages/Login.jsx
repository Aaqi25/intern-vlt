import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye,
  EyeOff,
  Briefcase,
  GraduationCap,
  Code2,
  FileCheck2,
  Video,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThozhilAuth } from '../context/ThozhilAuthContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import BrandLogo from '../components/BrandLogo';

import { useApp as useInternApp } from '../intern/context/InternContext';

export const Login = () => {
  const { login, loading: authLoading, authError, isAuthenticated } = useAuth();
  const { login: thozhilLogin } = useThozhilAuth();
  const { showToast } = useApp();
  const { setRole: setInternRole } = useInternApp();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedRole = location.state?.defaultTab || location.state?.role || (location.state?.from?.pathname?.includes('candidate') || location.state?.from?.pathname?.includes('intern') ? 'candidate' : 'admin');
  const [activeTab, setActiveTab] = useState(requestedRole); // 'admin' | 'candidate'
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: requestedRole === 'admin' ? 'Recruiter Admin' : 'Candidate'
    }
  });

  // Handle URL role changes or tab requests
  React.useEffect(() => {
    if (location.state?.defaultTab) {
      handleTabSwitch(location.state.defaultTab);
    }
  }, [location.state?.defaultTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setValue('role', tab === 'admin' ? 'Recruiter Admin' : 'Candidate');
  };

  const onSubmit = async (data) => {
    try {
      const role = activeTab === 'admin' ? (data.role || 'Recruiter Admin') : 'Candidate';
      const defaultLogLenseDest = activeTab === 'admin' ? '/authority' : '/intern';
      const dest = (location.state?.from?.pathname && location.state.from.pathname !== '/login' && location.state.from.pathname !== '/')
        ? location.state.from.pathname
        : defaultLogLenseDest;

      await login({
        email: data.email,
        password: data.password,
        role
      });
      await thozhilLogin({
        email: data.email,
        password: data.password,
        role: activeTab === 'admin' ? 'employer' : 'candidate'
      });

      const internRole = activeTab === 'admin' ? 'authority' : 'intern';
      try {
        localStorage.setItem('role', internRole);
        if (setInternRole) setInternRole(internRole);
      } catch (_) {}

      showToast(`Welcome to LogLense Portal`, 'primary');
      navigate(dest, { replace: true });
    } catch (err) {
      showToast(err.message || 'Sign in failed. Please check your credentials.', 'danger');
    }
  };

  return (
    <div className="min-h-screen bg-thozhil-background text-slate-900 flex flex-col justify-between font-sans relative overflow-x-hidden">
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-thozhil-border bg-white px-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo imageClassName="h-8 w-auto max-w-[180px]" caption="Unified platform" className="gap-3" />
        </Link>

        <nav aria-label="Account navigation" className="flex items-center gap-3">
          <Link to="/job-portal" className="hidden text-sm font-semibold text-slate-600 hover:text-thozhil sm:inline">
            Jobs & internships
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 hover:text-thozhil transition-colors"
          >
            Back to home
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg space-y-5 rounded-[var(--radius-panel)] border border-thozhil-border bg-white p-6 shadow-[var(--shadow-card-hover)] sm:p-8">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-thozhil-border bg-thozhil-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-thozhil-strong">
              <span className="h-2 w-2 rounded-full bg-thozhil" aria-hidden="true" />
              THOZHIL unified platform
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to THOZHIL
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600">
              Choose your account type to access the hiring and assessment workspaces.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-thozhil-border bg-thozhil-background p-1.5">
            <button
              type="button"
              onClick={() => handleTabSwitch('admin')}
              className={`relative flex cursor-pointer flex-col justify-between rounded-lg border-2 p-3 text-left transition-all ${
                activeTab === 'admin'
                  ? 'border-thozhil bg-white text-slate-900 shadow-sm'
                  : 'border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeTab === 'admin' ? 'bg-thozhil-soft text-thozhil' : 'bg-slate-200/70 text-slate-600'}`}>
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                {activeTab === 'admin' && (
                  <span className="h-2 w-2 rounded-full bg-thozhil" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Employer / Recruiter</div>
                <div className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Hiring workspaces
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('candidate')}
              className={`relative flex cursor-pointer flex-col justify-between rounded-lg border-2 p-3 text-left transition-all ${
                activeTab === 'candidate'
                  ? 'border-thozhil bg-white text-slate-900 shadow-sm'
                  : 'border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeTab === 'candidate' ? 'bg-thozhil-soft text-thozhil' : 'bg-slate-200/70 text-slate-600'}`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                {activeTab === 'candidate' && (
                  <span className="h-2 w-2 rounded-full bg-thozhil" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight text-slate-900 sm:text-sm">Job seeker / Candidate</div>
                <div className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Jobs & assessments
                </div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {activeTab === 'admin' ? 'Employer / Admin Email' : 'Candidate Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email address is required' })}
                  placeholder="Email address"
                  autoComplete="email"
                  className="thozhil-control w-full py-3 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:bg-white"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="thozhil-control w-full py-3 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-thozhil"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={authLoading}
              className="thozhil-button-primary mt-1 w-full justify-center py-3 text-sm"
            >
              {authLoading ? 'Signing in...' : `Enter ${activeTab === 'admin' ? 'Employer Portal' : 'Candidate Portal'}`}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Need a job seeker or employer account?{' '}
            <Link to="/job-portal" className="font-semibold text-thozhil hover:text-thozhil-strong">
              Visit the Job Portal
            </Link>
          </p>

          <div className="border-t border-thozhil-border pt-4">
            <span className="mb-3 block text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              THOZHIL platform modules
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 sm:grid-cols-5">
              <div className="flex items-center gap-1.5 rounded-xl border border-thozhil-border bg-thozhil-background p-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-thozhil" />
                <span className="truncate">LogLense</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-thozhil-border bg-thozhil-background p-2">
                <Video className="h-3.5 w-3.5 shrink-0 text-thozhil" />
                <span className="truncate">Video Interviewer</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-thozhil-border bg-thozhil-background p-2">
                <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-thozhil" />
                <span className="truncate">Resume Screener</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-thozhil-border bg-thozhil-background p-2">
                <Code2 className="h-3.5 w-3.5 shrink-0 text-thozhil" />
                <span className="truncate">Coding Interviewer</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-thozhil-border bg-thozhil-background p-2">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-thozhil" />
                <span className="truncate">Job Portal</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 border-t border-thozhil-border bg-white py-4 text-center text-xs text-slate-500">
        THOZHIL jobs, recruitment & assessment
      </footer>
    </div>
  );
};

