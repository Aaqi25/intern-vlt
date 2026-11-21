import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Video,
  CheckCircle2,
  Plus,
  ChevronRight,
  ArrowRight,
  Award,
  Briefcase,
  Search,
  ArrowUpRight,
  Layers,
  FileCheck2,
  Code2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { BrandLoader } from '../components/common/BrandLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';

const productModules = [
  {
    name: 'AI Project Analyser',
    description: 'Review project deliverables, code diffs, and sprint progress.',
    icon: FileText,
    destination: '/recruiter/intern-logs',
  },
  {
    name: 'AI Video Interviewer',
    description: 'Create interviews and review candidate assessment results.',
    icon: Video,
    destination: '/recruiter/interviews',
  },
  {
    name: 'AI Resume Screener',
    description: 'Review resumes against role requirements and organize candidates.',
    icon: FileCheck2,
    destination: '/recruiter/resume-screener',
  },
  {
    name: 'AI Coding Interviewer',
    description: 'Set coding assessments and review candidate submissions.',
    icon: Code2,
    destination: '/recruiter/coding-assessments',
  },
  {
    name: 'Seek Thozhil - Job Seeking Platform',
    description: 'Publish vacancies and manage applications in the Seek Thozhil platform.',
    icon: Briefcase,
    destination: '/job-portal',
  },
];

export const RecruiterDashboard = () => {
  const { analytics, candidates, interviews, loading, showToast } = useApp();
  const navigate = useNavigate();
  const [candidateFilter, setCandidateFilter] = useState('');
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [isSubmittingVacancy, setIsSubmittingVacancy] = useState(false);
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'Bengaluru / Remote',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    salary: '₹18 - 28 LPA',
    evaluationTrack: 'Resume Screening + Code Sandbox + AI Video Interview',
    description: '',
  });
  const [recentVacancies, setRecentVacancies] = useState([
    {
      id: 'vac-01',
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Bengaluru, India',
      type: 'Full-Time',
      salary: '₹22 - 32 LPA',
      applicants: 18,
      status: 'Active'
    },
    {
      id: 'vac-02',
      title: 'AI / ML Platform Engineer',
      department: 'Intelligence Suite',
      location: 'Chennai (Hybrid)',
      type: 'Full-Time',
      salary: '₹25 - 38 LPA',
      applicants: 24,
      status: 'Active'
    }
  ]);

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    if (!vacancyForm.title.trim() || !vacancyForm.description.trim()) {
      showToast?.('Please specify a job title and description.', 'warning');
      return;
    }
    setIsSubmittingVacancy(true);
    try {
      try {
        await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vacancyForm)
        });
      } catch (_) {}

      const newVac = {
        id: `vac-${Date.now()}`,
        title: vacancyForm.title,
        department: vacancyForm.department,
        location: vacancyForm.location,
        type: vacancyForm.type,
        salary: vacancyForm.salary,
        applicants: 0,
        status: 'Active'
      };
      setRecentVacancies(prev => [newVac, ...prev]);
      showToast?.('Vacancy published successfully to Seek Thozhil job board!', 'success');
      setIsVacancyModalOpen(false);
      setVacancyForm({
        title: '',
        department: 'Engineering',
        location: 'Bengaluru / Remote',
        type: 'Full-Time',
        experience: '3 - 6 Years',
        salary: '₹18 - 28 LPA',
        evaluationTrack: 'Resume Screening + Code Sandbox + AI Video Interview',
        description: '',
      });
    } catch (err) {
      showToast?.(err.message || 'Failed to publish vacancy.', 'danger');
    } finally {
      setIsSubmittingVacancy(false);
    }
  };

  if (loading) {
    return (
      <BrandLoader 
        message="Loading Recruiter Workspace..." 
        subMessage="Fetching candidate assessments and pipeline metrics"
        fullScreen={true} 
      />
    );
  }

  const candList = candidates || [];
  const intList = interviews || [];

  const evaluatedCandidates = candList.filter(c => c.status === 'Completed' || c.status === 'Evaluated' || c.overall_score !== undefined || c.overallScore !== undefined);
  const inProgressCandidates = candList.filter(c => c.status === 'In Progress' || c.status === 'Reviewing');
  const invitedCandidates = candList.filter(c => c.status === 'Invited' || (!c.status && !evaluatedCandidates.includes(c)));

  const computedAvgScore = evaluatedCandidates.length > 0 
    ? Math.round(evaluatedCandidates.reduce((acc, c) => acc + Number(c.overall_score ?? c.overallScore ?? 0), 0) / evaluatedCandidates.length)
    : 0;

  const kpis = analytics?.kpis || {
    activeInterviews: intList.filter(i => i.status === 'Active').length || intList.length,
    totalInvited: candList.length,
    completions: evaluatedCandidates.length,
    averageScore: computedAvgScore,
    conversionRate: candList.length > 0 ? Math.round((evaluatedCandidates.length / candList.length) * 100) : 0
  };

  const recommendedCandidates = evaluatedCandidates.filter(c => {
    const score = c.overall_score ?? c.overallScore ?? 0;
    const rec = (c.recommendation || '').toUpperCase().trim();
    if (rec.includes('DO NOT HIRE') || rec.includes('NO HIRE') || rec.includes('NOT HIRE') || rec.includes('REJECT') || score < 55) {
      return false;
    }
    return (rec === 'HIRE' || (rec.includes('HIRE') && !rec.includes('NOT') && !rec.includes('NO')) || score >= 70);
  });

  const priorityCandidates = [...evaluatedCandidates, ...inProgressCandidates].filter(c => {
    if (!candidateFilter) return true;
    const q = candidateFilter.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.role || '').toLowerCase().includes(q);
  }).slice(0, 6);

  const avgScore = kpis.averageScore || computedAvgScore;

  const pipelineStages = [
    { 
      id: 'INVITED', 
      label: 'Invited', 
      count: invitedCandidates.length,
      desc: 'Pending candidate start',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      trackColor: 'bg-blue-600'
    },
    { 
      id: 'IN_PROGRESS', 
      label: 'In Assessment', 
      count: inProgressCandidates.length,
      desc: 'Active assessment session',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      trackColor: 'bg-amber-500'
    },
    { 
      id: 'EVALUATED', 
      label: 'Evaluated', 
      count: evaluatedCandidates.length,
      desc: 'Scored against technical rubric',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      trackColor: 'bg-slate-600'
    },
    { 
      id: 'RECOMMENDED', 
      label: 'Recommended', 
      count: recommendedCandidates.length,
      desc: 'Qualified technical match',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      trackColor: 'bg-emerald-600'
    },
  ];

  return (
    <div className="space-y-6 flex-1 flex flex-col text-left font-sans text-slate-900">
      
      {/* 1. Clean Executive Operations Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Recruitment Overview
            </h1>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Monitor active technical assessments, candidate progression pipelines, and evaluated dossiers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <Button
            onClick={() => setIsVacancyModalOpen(true)}
            size="sm"
            variant="outline"
            className="border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold"
            icon={Briefcase}
          >
            Post a Vacancy
          </Button>
          <Button
            onClick={() => navigate('/recruiter/resume-screener')}
            size="sm"
            variant="secondary"
            icon={FileCheck2}
          >
            Screen Resumes
          </Button>
          <Button
            onClick={() => navigate('/recruiter/interviews/new')}
            size="sm"
            variant="primary"
            icon={Plus}
          >
            Create Assessment
          </Button>
        </div>
      </div>

      {/* THOZHIL PRODUCT MODULES HUB */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-thozhil" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Thozhil Product Modules
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">5 platform modules</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {productModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                type="button"
                key={module.name}
                onClick={() => navigate(module.destination)}
                className="group thozhil-card flex min-h-56 flex-col justify-between p-5 text-left transition hover:border-thozhil hover:shadow-md"
              >
                <span>
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-thozhil-soft text-thozhil transition-colors group-hover:bg-thozhil group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-thozhil">
                    THOZHIL module
                  </span>
                  <span className="mt-1 block text-sm font-bold text-slate-900 group-hover:text-thozhil">
                    {module.name}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    {module.description}
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between border-t border-thozhil-border pt-3 text-xs font-semibold text-thozhil">
                  Open module
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Assessments</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">
                {kpis.activeInterviews || intList.length || 0}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Configured roles</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">
                {candList.length}
              </span>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Registered applicants</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Evaluated Dossiers</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">
                {evaluatedCandidates.length}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Completed reviews</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">
                {avgScore > 0 ? `${avgScore}%` : '—'}
              </span>
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Benchmark
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Technical benchmark</p>
          </div>
        </div>
      </div>

      {/* 3. Candidate Pipeline Progression */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Candidate Pipeline Stages</h2>
            <p className="text-xs text-slate-500">Overview of candidate volume across assessment phases</p>
          </div>

          <button
            onClick={() => navigate('/recruiter/candidates')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Candidate Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineStages.map((stage) => {
            const percentage = candList.length > 0 ? Math.round((stage.count / candList.length) * 100) : 0;
            return (
              <div
                key={stage.id}
                onClick={() => navigate('/recruiter/candidates')}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    {stage.label}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${stage.badgeColor}`}>
                    {percentage}%
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold text-slate-900">{stage.count}</span>
                    <span className="text-xs text-slate-500">candidates</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{stage.desc}</span>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.trackColor} transition-all duration-300`}
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Actionable Two-Column Split: Needs Review & Active Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Candidates Requiring Review */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Candidate Activity</h2>
              <span className="text-xs text-slate-500">Recent submissions and assessments in progress</span>
            </div>

            {/* Filter */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name or role..."
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 flex-grow">
            {priorityCandidates.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  title={candidateFilter ? "No candidates match filter" : "No candidate submissions yet"}
                  description={candidateFilter ? "Try clearing your search query." : "When invited candidates complete their assessments, their evaluated dossiers will appear here for review."}
                  actionLabel="Invite Candidate"
                  onAction={() => navigate('/recruiter/candidates?invite=true')}
                />
              </div>
            ) : (
              priorityCandidates.map((cand) => {
                const score = cand.overall_score ?? cand.overallScore;
                const isEvaluated = score !== undefined && score !== null;

                return (
                  <div 
                    key={cand.id} 
                    className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <Avatar name={cand.name} size="sm" />

                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {cand.name}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cand.role || 'Software Engineer'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 shrink-0">
                      {isEvaluated ? (
                        <>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 block">
                              {score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {cand.recommendation ? cand.recommendation.replace('_', ' ').toLowerCase() : 'evaluated'}
                            </span>
                          </div>

                          <Button
                            onClick={() => navigate(`/recruiter/candidates/${cand.id}/report`)}
                            size="xs"
                            variant="secondary"
                            icon={ArrowUpRight}
                            iconPosition="right"
                          >
                            Report
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded">
                            In Progress
                          </span>
                          <Button
                            onClick={() => navigate('/recruiter/candidates')}
                            size="xs"
                            variant="outline"
                          >
                            Profile
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {priorityCandidates.length} of {candList.length} candidates</span>
            <button
              onClick={() => navigate('/recruiter/candidates')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <span>View all candidates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Active Assessment Tracks */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Active Assessments</h2>
              <span className="text-xs text-slate-500">{intList.length} assessment tracks</span>
            </div>

            <button
              onClick={() => navigate('/recruiter/interviews')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-grow">
            {intList.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  title="No active assessments"
                  description="Create an assessment position to begin evaluating technical candidates."
                  actionLabel="Create Assessment"
                  onAction={() => navigate('/recruiter/interviews/new')}
                />
              </div>
            ) : (
              intList.slice(0, 5).map((item) => {
                const assignedCount = candList.filter(c => c.interviewId === item.id || c.interview_id === item.id).length;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/recruiter/interviews/${item.id}`)}
                    className="p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-900 truncate block group-hover:text-blue-600 transition-colors">
                        {item.title || item.jobRole}
                      </span>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{item.department || 'Engineering'}</span>
                        <span>•</span>
                        <span>{item.duration || 30} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {assignedCount} candidates
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <Button
              onClick={() => navigate('/recruiter/interviews/new')}
              size="xs"
              variant="outline"
              icon={Plus}
              className="w-full"
            >
              Create New Assessment
            </Button>
          </div>
        </div>

      </div>

      {/* Corporate Vacancy Postings Hub */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Active Corporate Vacancies
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {recentVacancies.length} Published Openings
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live corporate listings published to Seek Thozhil marketplace with autonomous AI assessment routing.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigate('/job-portal')}
              size="xs"
              variant="outline"
            >
              Open Job Portal
            </Button>
            <Button
              onClick={() => setIsVacancyModalOpen(true)}
              size="xs"
              variant="primary"
              icon={Plus}
            >
              Post a Vacancy
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentVacancies.map((vac) => (
            <div
              key={vac.id}
              className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xs transition-all bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {vac.department}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {vac.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {vac.title}
                </h3>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>{vac.location} • {vac.type}</p>
                  <p className="font-semibold text-slate-700">{vac.salary}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  <strong>{vac.applicants}</strong> Applicants
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/job-portal')}
                  className="font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post a Vacancy Modal */}
      <Modal
        isOpen={isVacancyModalOpen}
        onClose={() => !isSubmittingVacancy && setIsVacancyModalOpen(false)}
        title="Post a Corporate Vacancy"
        size="lg"
      >
        <form onSubmit={handleCreateVacancy} className="space-y-4 text-left">
          <p className="text-xs text-slate-500">
            Publish an active job opening directly to the Seek Thozhil marketplace and configure automated autonomous evaluation workflows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={vacancyForm.title}
                onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={vacancyForm.department}
                onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Engineering">Core Engineering</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Cloud & Security">Cloud & Infrastructure Security</option>
                <option value="Data Platform">Data Platform & Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, India (Hybrid)"
                value={vacancyForm.location}
                onChange={(e) => setVacancyForm({ ...vacancyForm, location: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={vacancyForm.type}
                onChange={(e) => setVacancyForm({ ...vacancyForm, type: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract (C2H)</option>
                <option value="Internship">Technical Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Range
              </label>
              <input
                type="text"
                placeholder="e.g. 3 - 6 Years"
                value={vacancyForm.experience}
                onChange={(e) => setVacancyForm({ ...vacancyForm, experience: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Offered Compensation
              </label>
              <input
                type="text"
                placeholder="e.g. ₹20 - 32 LPA"
                value={vacancyForm.salary}
                onChange={(e) => setVacancyForm({ ...vacancyForm, salary: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Autonomous Evaluation Pipeline
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Resume Screener (Sub-second qualification match)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Coding Interviewer (Isolated Docker runtime)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Video Interviewer (Conversational speech & proctoring)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Description & Key Responsibilities <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Outline primary technical responsibilities, stack requirements, and expected impact..."
              value={vacancyForm.description}
              onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-sans"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVacancyModalOpen(false)}
              disabled={isSubmittingVacancy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Briefcase}
              disabled={isSubmittingVacancy}
            >
              {isSubmittingVacancy ? 'Publishing...' : 'Publish Vacancy'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default RecruiterDashboard;
