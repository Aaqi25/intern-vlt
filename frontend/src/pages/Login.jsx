import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Briefcase, 
  GraduationCap,
  User,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThozhilAuth } from '../context/ThozhilAuthContext';
import { useApp } from '../context/AppContext';
import BrandLogo from '../components/BrandLogo';

import { useApp as useInternApp } from '../intern/context/InternContext';

export const Login = () => {
  const { login, register: registerAccount, loading: authLoading } = useAuth();
  const { syncFromStorage } = useThozhilAuth();
  const { showToast } = useApp();
  const { setRole: setInternRole } = useInternApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const requestedRole = location.state?.defaultTab || location.state?.role || (location.state?.from?.pathname?.includes('candidate') || location.state?.from?.pathname?.includes('intern') ? 'candidate' : 'admin');
  const [activeRole, setActiveRole] = useState(requestedRole); // 'admin' | 'candidate'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: requestedRole === 'admin' ? 'Recruiter Admin' : 'Candidate'
    }
  });

  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');

  // Live password validation checklist
  const passwordCriteria = useMemo(() => {
    const hasMinLength = (passwordValue || '').length >= 8;
    const hasUppercase = /[A-Z]/.test(passwordValue || '');
    const hasNumber = /[0-9]/.test(passwordValue || '');
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue || '');
    const hasMatch = (passwordValue || '').length > 0 && passwordValue === confirmPasswordValue;

    const allPassed = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && hasMatch;

    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      hasMatch,
      allPassed
    };
  }, [passwordValue, confirmPasswordValue]);

  // Stable callback for role switching
  const handleRoleSwitch = useCallback((role) => {
    setActiveRole(role);
    setValue('role', role === 'admin' ? 'Recruiter Admin' : 'Candidate');
  }, [setValue]);

  // Handle URL role changes or tab requests
  React.useEffect(() => {
    if (location.state?.defaultTab) {
      handleRoleSwitch(location.state.defaultTab);
    }
  }, [location.state?.defaultTab, handleRoleSwitch]);

  const onSubmit = async (data) => {
    if (authMode === 'signup' && !passwordCriteria.allPassed) {
      showToast('Please satisfy all password security requirements before signing up.', 'warning');
      return;
    }

    try {
      const role = activeRole === 'admin' ? (data.role || 'Recruiter Admin') : 'Candidate';
      const defaultDest = activeRole === 'admin' ? '/recruiter' : '/candidate/dashboard';
      const dest = (location.state?.from?.pathname && location.state.from.pathname !== '/login' && location.state.from.pathname !== '/')
        ? location.state.from.pathname
        : defaultDest;

      if (authMode === 'signup') {
        await registerAccount({
          name: data.fullName,
          email: data.email,
          password: data.password,
          role
        });
      } else {
        await login({
          email: data.email,
          password: data.password,
          role
        });
      }
      syncFromStorage();

      const internRole = activeRole === 'admin' ? 'authority' : 'intern';
      try {
        localStorage.setItem('role', internRole);
        if (setInternRole) setInternRole(internRole);
      } catch (_) {}

      showToast(authMode === 'signup' ? `Account registered successfully! Welcome to THOZHIL.` : `Welcome back to THOZHIL Portal`, 'primary');
      navigate(dest, { replace: true });
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please verify your credentials.', 'danger');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 sm:px-12">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo imageClassName="h-8 w-auto max-w-[180px]" caption="Enterprise Talent Platform" className="gap-3" />
        </Link>

        <nav aria-label="Account navigation" className="flex items-center gap-6 text-xs uppercase tracking-wider font-semibold">
          <Link to="/job-portal" className="text-slate-600 hover:text-blue-700 transition-colors">
            Browse Opportunities
          </Link>
          <Link
            to="/"
            className="text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Form Centerpiece */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg space-y-6 border border-slate-200 bg-white p-8 sm:p-10 rounded-xl shadow-sm">
          
          {/* Header Title */}
          <div className="text-left space-y-2 border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
              Secure Identity Gateway
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {authMode === 'signup' ? 'Create Your Account' : 'Sign In to THOZHIL'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {authMode === 'signup' 
                ? 'Join thousands of professionals and top enterprises hiring with objective intelligence.'
                : 'Select your workspace persona to unlock recruitment workflows or candidate assessments.'}
            </p>
          </div>

          {/* Auth Mode Toggle: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Role Persona Switcher */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className={`p-3.5 border rounded-lg text-left transition-all duration-200 ${
                activeRole === 'admin'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Briefcase className={`w-4 h-4 ${activeRole === 'admin' ? 'text-blue-700' : 'text-slate-400'}`} />
                {activeRole === 'admin' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <div className="text-xs font-bold tracking-tight text-slate-900">
                Employer / Recruiter
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hiring & Deliberation
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('candidate')}
              className={`p-3.5 border rounded-lg text-left transition-all duration-200 ${
                activeRole === 'candidate'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <GraduationCap className={`w-4 h-4 ${activeRole === 'candidate' ? 'text-blue-700' : 'text-slate-400'}`} />
                {activeRole === 'candidate' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <div className="text-xs font-bold tracking-tight text-slate-900">
                Candidate / Seeker
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Jobs & Evaluations
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            {/* Full Name in Sign Up mode */}
            {authMode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    {...register('fullName', { required: authMode === 'signup' ? 'Full name is required' : false })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full py-2.5 pl-10 pr-4 text-sm font-sans border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                {activeRole === 'admin' ? 'Work Email Address' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email address is required' })}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full py-2.5 pl-10 pr-4 text-sm font-sans border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••••••"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full py-2.5 pl-10 pr-10 text-sm font-sans border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {authMode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Retype Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { required: authMode === 'signup' ? 'Please retype your password' : false })}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full py-2.5 pl-10 pr-10 text-sm font-sans border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {/* Password Security Verification Checklist (Sign Up Only) */}
            {authMode === 'signup' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Password Requirements:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 font-medium">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordCriteria.hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUppercase ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordCriteria.hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecialChar ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordCriteria.hasSpecialChar ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>One special symbol (!@#$)</span>
                  </div>
                  <div className={`sm:col-span-2 flex items-center gap-1.5 ${passwordCriteria.hasMatch ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordCriteria.hasMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={authLoading || (authMode === 'signup' && !passwordCriteria.allPassed)}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                authMode === 'signup' && !passwordCriteria.allPassed
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              <span>
                {authLoading 
                  ? 'Authenticating...' 
                  : authMode === 'signup' 
                    ? `Create ${activeRole === 'admin' ? 'Employer' : 'Candidate'} Account`
                    : `Sign In to ${activeRole === 'admin' ? 'Employer Portal' : 'Candidate Workspace'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Footer Links */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Looking for open listings?{' '}
            <Link to="/job-portal" className="font-semibold text-blue-700 hover:underline">
              Explore Active Opportunities →
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} THOZHIL Ecosystem · Enterprise Career & Autonomous Evaluation Platform.
      </footer>
    </div>
  );
};

export default Login;
