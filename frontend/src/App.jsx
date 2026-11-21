import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThozhilAuthProvider } from './context/ThozhilAuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SmoothScrollProvider } from './context/SmoothScrollProvider';

// Layout wraps — these are tiny wrappers; keep eager
import { LandingLayout } from './components/layout/LandingLayout';
import { DashboardLayout } from './intern/components/DashboardLayout';
import { AppProvider as InternProvider } from './intern/context/InternContext';

// ─── Lightweight branded page-transition skeleton ─────────────────────────────
const PageShell = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black gap-4">
    <div className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
      <span className="text-xs uppercase tracking-[0.2em] font-mono text-neutral-500 select-none">
        Loading
      </span>
    </div>
    <div className="w-32 h-[2px] bg-neutral-100 overflow-hidden rounded-full">
      <div className="h-full bg-black animate-[loading_1s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
    </div>
  </div>
);

// ─── PUBLIC PAGES (small, eager is fine for entry points) ─────────────────────
import UnifiedLandingPage from './pages/UnifiedLandingPage';
import { Login } from './pages/Login';

// ─── LAZY CHUNKS ──────────────────────────────────────────────────────────────

// Landing (classic) + 404 — rarely visited
const Landing    = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const NotFound   = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Job Portal — large SPA; own chunk
const JobPortalApp = lazy(() => import('./job-portal/JobPortalApp'));

// ── Recruiter chunk ───────────────────────────────────────────────────────────
const RecruiterDashboard   = lazy(() => import('./pages/RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));
const InterviewList        = lazy(() => import('./pages/InterviewList').then(m => ({ default: m.InterviewList })));
const CreateInterview      = lazy(() => import('./pages/CreateInterview').then(m => ({ default: m.CreateInterview })));
const InterviewDetails     = lazy(() => import('./pages/InterviewDetails').then(m => ({ default: m.InterviewDetails })));
const CandidateList        = lazy(() => import('./pages/CandidateList').then(m => ({ default: m.CandidateList })));
const Report               = lazy(() => import('./pages/Report').then(m => ({ default: m.Report })));
const InterviewTemplates   = lazy(() => import('./pages/InterviewTemplates').then(m => ({ default: m.InterviewTemplates })));
const QuestionBank         = lazy(() => import('./pages/QuestionBank').then(m => ({ default: m.QuestionBank })));
const Analytics            = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings             = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const ResumeScreenerPage   = lazy(() => import('./pages/ResumeScreenerPage').then(m => ({ default: m.ResumeScreenerPage })));
const InternLogsPage       = lazy(() => import('./pages/InternLogsPage').then(m => ({ default: m.InternLogsPage })));
// Monaco/CodingIDE lives inside here — most expensive; own lazy boundary
const CodingAssessmentsPage = lazy(() => import('./pages/CodingAssessmentsPage').then(m => ({ default: m.CodingAssessmentsPage })));

// ── Candidate chunk ───────────────────────────────────────────────────────────
const CandidateDashboard        = lazy(() => import('./pages/CandidateDashboard').then(m => ({ default: m.CandidateDashboard })));
const CandidatePracticeSandbox  = lazy(() => import('./pages/CandidatePracticeSandbox').then(m => ({ default: m.CandidatePracticeSandbox })));
const CandidatePracticeRoom     = lazy(() => import('./pages/CandidatePracticeRoom').then(m => ({ default: m.CandidatePracticeRoom })));
const CandidateInterviewDetails = lazy(() => import('./pages/CandidateInterviewDetails').then(m => ({ default: m.CandidateInterviewDetails })));
const CandidateDeviceCheck      = lazy(() => import('./pages/CandidateDeviceCheck').then(m => ({ default: m.CandidateDeviceCheck })));
// Real-time rooms — own lazy boundary (WebSocket + media)
const InterviewRoom  = lazy(() => import('./pages/InterviewRoom').then(m => ({ default: m.InterviewRoom })));
const LiveInterview  = lazy(() => import('./pages/LiveInterview').then(m => ({ default: m.LiveInterview })));
const CandidateCompleted = lazy(() => import('./pages/CandidateCompleted').then(m => ({ default: m.CandidateCompleted })));

// ── Intern/Authority chunk ────────────────────────────────────────────────────
const InternDashboard    = lazy(() => import('./intern/pages/InternDashboard').then(m => ({ default: m.InternDashboard })));
const AuthorityDashboard = lazy(() => import('./intern/pages/AuthorityDashboard').then(m => ({ default: m.AuthorityDashboard })));
const HistoryPage        = lazy(() => import('./intern/pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const InternsListPage    = lazy(() => import('./intern/pages/InternsListPage').then(m => ({ default: m.InternsListPage })));
const InternDetailPage   = lazy(() => import('./intern/pages/InternDetailPage').then(m => ({ default: m.InternDetailPage })));

// ─── Shell ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ThozhilAuthProvider>
        <AppProvider>
          <InternProvider>
            <BrowserRouter>
              <SmoothScrollProvider>
                <Suspense fallback={<PageShell />}>
                  <Routes>

                    {/* ── Public entry points (eager) ──────────────────── */}
                    <Route path="/" element={<UnifiedLandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/job-portal/*" element={<JobPortalApp />} />
                    <Route path="/classic-landing" element={<LandingLayout><Landing /></LandingLayout>} />

                    {/* ── Employer alias redirects (no component, tiny) ── */}
                    <Route path="/employer" element={<Navigate to="/recruiter" replace />} />
                    <Route path="/employer/interviewx" element={<Navigate to="/recruiter" replace />} />
                    <Route path="/employer/resume-screener" element={<Navigate to="/recruiter/resume-screener" replace />} />
                    <Route path="/employer/coding-assessments" element={<Navigate to="/recruiter/coding-assessments" replace />} />
                    <Route path="/employer/loglense" element={<Navigate to="/recruiter/intern-logs" replace />} />

                    {/* ── Recruiter / Employer Portal ───────────────────── */}
                    <Route path="/recruiter" element={
                      <ProtectedRoute><DashboardLayout><RecruiterDashboard /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews" element={
                      <ProtectedRoute><DashboardLayout><InterviewList /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/new" element={
                      <ProtectedRoute><DashboardLayout><CreateInterview /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/create" element={
                      <ProtectedRoute><DashboardLayout><CreateInterview /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/:id" element={
                      <ProtectedRoute><DashboardLayout><InterviewDetails /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/candidates" element={
                      <ProtectedRoute><DashboardLayout><CandidateList /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/candidates/:id/report" element={
                      <ProtectedRoute><DashboardLayout><Report /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/:id/report" element={
                      <ProtectedRoute><DashboardLayout><Report /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/:id/review" element={
                      <ProtectedRoute><DashboardLayout><Report /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/reports/:id" element={
                      <ProtectedRoute><DashboardLayout><Report /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/templates" element={
                      <ProtectedRoute><DashboardLayout><InterviewTemplates /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/questions" element={
                      <ProtectedRoute><DashboardLayout><QuestionBank /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/analytics" element={
                      <ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/settings" element={
                      <ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/resume-screener" element={
                      <ProtectedRoute><DashboardLayout><ResumeScreenerPage /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/intern-logs" element={
                      <ProtectedRoute><DashboardLayout><InternLogsPage /></DashboardLayout></ProtectedRoute>
                    } />
                    <Route path="/recruiter/coding-assessments" element={
                      <ProtectedRoute><DashboardLayout><CodingAssessmentsPage /></DashboardLayout></ProtectedRoute>
                    } />

                    {/* ── Candidate Workspace Routes ────────────────────── */}
                    <Route path="/candidate" element={<ProtectedRoute><DashboardLayout><CandidateDashboard /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/dashboard" element={<ProtectedRoute><DashboardLayout><CandidateDashboard /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/device-check" element={<ProtectedRoute><DashboardLayout><CandidateDeviceCheck /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/device-check/:id" element={<ProtectedRoute><DashboardLayout><CandidateDeviceCheck /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id/device-check" element={<ProtectedRoute><DashboardLayout><CandidateDeviceCheck /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/practice" element={<ProtectedRoute><DashboardLayout><CandidatePracticeSandbox /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/practice/room" element={<ProtectedRoute><CandidatePracticeRoom /></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id" element={<ProtectedRoute><DashboardLayout><CandidateInterviewDetails /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id/async" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id/room" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                    <Route path="/candidate/room/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                    <Route path="/interviews/:id/room" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id/live" element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />
                    <Route path="/interviews/:id/live" element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />
                    <Route path="/candidate/interviews/:id/completed" element={<ProtectedRoute><DashboardLayout><CandidateCompleted /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/completed/:id" element={<ProtectedRoute><DashboardLayout><CandidateCompleted /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/coding-workspace" element={<ProtectedRoute><DashboardLayout><CodingAssessmentsPage isCandidate={true} /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/candidate/loglense" element={<Navigate to="/intern" replace />} />
                    <Route path="/candidate/resume-check" element={<ProtectedRoute><DashboardLayout><ResumeScreenerPage isCandidate={true} /></DashboardLayout></ProtectedRoute>} />

                    {/* ── Intern & Authority ────────────────────────────── */}
                    <Route path="/intern" element={<ProtectedRoute><InternDashboard /></ProtectedRoute>} />
                    <Route path="/authority" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                    <Route path="/project-analysis" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/interns" element={<ProtectedRoute><InternsListPage /></ProtectedRoute>} />
                    <Route path="/interns/:id" element={<ProtectedRoute><InternDetailPage /></ProtectedRoute>} />

                    {/* ── 404 ───────────────────────────────────────────── */}
                    <Route path="*" element={<LandingLayout><NotFound /></LandingLayout>} />

                  </Routes>
                </Suspense>
              </SmoothScrollProvider>
            </BrowserRouter>
          </InternProvider>
        </AppProvider>
      </ThozhilAuthProvider>
    </AuthProvider>
  );
}

export default App;
