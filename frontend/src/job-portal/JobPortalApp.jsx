import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest, getStoredToken, portalApi, storeToken } from './api';
import BrandLogo from '../components/BrandLogo';
import './job-portal.css';

const emptyJob = {
  title: '',
  description: '',
  required_skills: '',
  qualifications: '',
  experience_requirements: '',
  employment_type: 'Full-time',
  salary_min: '',
  salary_max: '',
  location: '',
  work_mode: 'On-site',
  vacancy_count: '1',
  application_deadline: '',
};

function messageFrom(error) {
  return error?.message || 'Something went wrong. Please try again.';
}

function AuthScreen({ onAuthenticated }) {
  const { search } = useLocation();
  const [mode, setMode] = useState(() => new URLSearchParams(search).get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState('job_seeker');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = mode === 'register'
        ? await portalApi.register({ ...form, role })
        : await portalApi.login({ email: form.email, password: form.password });
      onAuthenticated(result);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="jp-auth-page">
      <section className="jp-auth-card">
        <Link className="jp-brand" to="/">
          <BrandLogo imageClassName="h-8 w-auto max-w-[190px]" caption="Job portal" className="gap-2.5" />
        </Link>
        <h1>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
        <p className="jp-muted">Find your next opportunity or build your team.</p>
        <div className="jp-tabs" role="tablist" aria-label="Account action">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Sign up</button>
        </div>
        <form className="jp-form" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Account type
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="job_seeker">Regular user / Job seeker</option>
                  <option value="employer">Business operator / Employer</option>
                </select>
              </label>
              <label>
                Name
                <input required minLength="2" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            </>
          )}
          <label>
            Email
            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Password
            <input required type="password" minLength={mode === 'register' ? 10 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {mode === 'register' && <small>Use at least 10 characters.</small>}
          </label>
          {error && <p className="jp-alert error" role="alert">{error}</p>}
          <button className="jp-button primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Login'}</button>
        </form>
        <Link className="jp-back-link" to="/">Back to THOZHIL</Link>
      </section>
    </main>
  );
}

function PortalHeader({ user, active, onNavigate, onLogout }) {
  const items = user.role === 'employer'
    ? [['jobs', 'Vacancies'], ['company', 'Company profile']]
    : [['jobs', 'Find jobs'], ['applications', 'My applications'], ['profile', 'My profile']];

  return (
    <header className="jp-header">
      <Link to="/" className="jp-brand">
        <BrandLogo imageClassName="h-8 w-auto max-w-[190px]" caption="Job portal" className="gap-2.5" />
      </Link>
      <nav aria-label="Job portal">
        {items.map(([id, label]) => (
          <button type="button" key={id} className={active === id ? 'selected' : ''} onClick={() => onNavigate(id)}>{label}</button>
        ))}
      </nav>
      <div className="jp-user-menu">
        <span>{user.name} <small>{user.role === 'employer' ? 'Employer' : 'Job seeker'}</small></span>
        <button type="button" className="jp-button subtle" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  );
}

function JobForm({ initialJob, onSave, onCancel }) {
  const [form, setForm] = useState(() => initialJob ? {
    ...initialJob,
    required_skills: (initialJob.required_skills || []).join(', '),
    salary_min: initialJob.salary_min ?? '',
    salary_max: initialJob.salary_max ?? '',
    vacancy_count: String(initialJob.vacancy_count || 1),
    application_deadline: initialJob.application_deadline || '',
  } : emptyJob);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      required_skills: form.required_skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      salary_min: form.salary_min === '' ? null : Number(form.salary_min),
      salary_max: form.salary_max === '' ? null : Number(form.salary_max),
      vacancy_count: Number(form.vacancy_count),
      application_deadline: form.application_deadline || null,
    };
    try {
      await onSave(payload);
    } catch (saveError) {
      setError(messageFrom(saveError));
    } finally {
      setBusy(false);
    }
  };

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return (
    <form className="jp-form jp-job-form" onSubmit={submit}>
      <div className="jp-form-heading">
        <h2>{initialJob ? 'Edit vacancy' : 'Create a vacancy'}</h2>
        <button type="button" className="jp-button subtle" onClick={onCancel}>Cancel</button>
      </div>
      <div className="jp-form-grid">
        <label>Job title<input required minLength="2" maxLength="160" value={form.title} onChange={update('title')} /></label>
        <label>Location<input required value={form.location} onChange={update('location')} placeholder="City or region" /></label>
        <label>Employment type
          <select value={form.employment_type} onChange={update('employment_type')}>
            {['Full-time', 'Part-time', 'Internship', 'Contract'].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Work mode
          <select value={form.work_mode} onChange={update('work_mode')}>
            {['On-site', 'Hybrid', 'Remote'].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Minimum salary (optional)<input type="number" min="0" value={form.salary_min} onChange={update('salary_min')} /></label>
        <label>Maximum salary (optional)<input type="number" min="0" value={form.salary_max} onChange={update('salary_max')} /></label>
        <label>Vacancies<input required type="number" min="1" value={form.vacancy_count} onChange={update('vacancy_count')} /></label>
        <label>Application deadline<input type="date" value={form.application_deadline} onChange={update('application_deadline')} /></label>
      </div>
      <label>Required skills <small>Comma-separated</small><input required value={form.required_skills} onChange={update('required_skills')} placeholder="Python, SQL, Communication" /></label>
      <label>Qualifications<textarea value={form.qualifications} onChange={update('qualifications')} rows="2" /></label>
      <label>Experience requirements<textarea value={form.experience_requirements} onChange={update('experience_requirements')} rows="2" /></label>
      <label>Job description<textarea required minLength="20" value={form.description} onChange={update('description')} rows="6" /></label>
      {error && <p className="jp-alert error" role="alert">{error}</p>}
      <button className="jp-button primary" disabled={busy}>{busy ? 'Saving…' : initialJob ? 'Save changes' : 'Save as draft'}</button>
    </form>
  );
}

function EmployerPortal({ user, onLogout }) {
  const [active, setActive] = useState('jobs');
  const [company, setCompany] = useState({ company_name: '', website: '', description: '', location: '' });
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [applicantJob, setApplicantJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [companyResult, jobsResult] = await Promise.all([portalApi.company(), portalApi.employerJobs()]);
    setCompany(companyResult.company || { company_name: '', website: '', description: '', location: '' });
    setJobs(jobsResult.jobs);
  };

  useEffect(() => {
    load().catch((loadError) => setError(messageFrom(loadError)));
  }, []);

  const saveCompany = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await portalApi.saveCompany(company);
      setCompany(result.company);
      setNotice('Company profile saved.');
    } catch (saveError) {
      setError(messageFrom(saveError));
    }
  };

  const saveJob = async (payload) => {
    if (editing?.id) await portalApi.updateJob(editing.id, payload);
    else await portalApi.createJob(payload);
    setEditing(null);
    await load();
    setNotice(editing?.id ? 'Vacancy updated.' : 'Vacancy saved as a draft.');
  };

  const changeJobStatus = async (job, status) => {
    setError('');
    try {
      await portalApi.updateJobStatus(job.id, status);
      await load();
      setNotice(`Vacancy ${status.toLowerCase()}.`);
    } catch (statusError) {
      setError(messageFrom(statusError));
    }
  };

  const removeJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Existing applications will remain in the records.`)) return;
    try {
      await portalApi.deleteJob(job.id);
      await load();
      setNotice('Vacancy deleted.');
    } catch (deleteError) {
      setError(messageFrom(deleteError));
    }
  };

  const viewApplicants = async (job) => {
    setError('');
    try {
      const result = await portalApi.applicants(job.id);
      setApplicantJob(job);
      setApplicants(result.applicants);
      setActive('applicants');
    } catch (applicantError) {
      setError(messageFrom(applicantError));
    }
  };

  const changeApplicationStatus = async (applicant, status) => {
    try {
      await portalApi.updateApplicationStatus(applicant.application_id, status);
      setApplicants((current) => current.map((item) => item.application_id === applicant.application_id
        ? { ...item, application_status: status }
        : item));
    } catch (statusError) {
      setError(messageFrom(statusError));
    }
  };

  const downloadResume = async (applicant) => {
    try {
      const blob = await portalApi.downloadApplicantResume(applicant.application_id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = applicant.resume_filename || 'candidate-resume';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(messageFrom(downloadError));
    }
  };

  return (
    <>
      <PortalHeader user={user} active={active} onNavigate={(section) => { setActive(section); setApplicantJob(null); setEditing(null); }} onLogout={onLogout} />
      <main className="jp-main">
        <div className="jp-page-title">
          <div><p className="jp-eyebrow">EMPLOYER WORKSPACE</p><h1>{active === 'applicants' ? `Applicants · ${applicantJob?.title || ''}` : active === 'company' ? 'Company profile' : 'Your vacancies'}</h1></div>
          {active === 'jobs' && !editing && <button className="jp-button primary" onClick={() => { setEditing({}); setNotice(''); }}>Post a job</button>}
        </div>
        {notice && <p className="jp-alert success">{notice}</p>}
        {error && <p className="jp-alert error" role="alert">{error}</p>}

        {active === 'company' && (
          <form className="jp-panel jp-form" onSubmit={saveCompany}>
            <h2>Business details</h2>
            <label>Company name<input required minLength="2" value={company.company_name} onChange={(event) => setCompany({ ...company, company_name: event.target.value })} /></label>
            <label>Website<input type="url" value={company.website || ''} onChange={(event) => setCompany({ ...company, website: event.target.value })} placeholder="https://" /></label>
            <label>Location<input value={company.location || ''} onChange={(event) => setCompany({ ...company, location: event.target.value })} /></label>
            <label>About the company<textarea rows="5" value={company.description || ''} onChange={(event) => setCompany({ ...company, description: event.target.value })} /></label>
            <button className="jp-button primary">Save company profile</button>
          </form>
        )}

        {active === 'jobs' && editing && (
          <section className="jp-panel"><JobForm initialJob={editing.id ? editing : null} onSave={saveJob} onCancel={() => setEditing(null)} /></section>
        )}

        {active === 'jobs' && !editing && (
          <section className="jp-list">
            {!company.company_name && <p className="jp-alert">Set up your <button className="jp-inline-button" onClick={() => setActive('company')}>company profile</button> before publishing a job.</p>}
            {jobs.length === 0 && <div className="jp-panel jp-empty"><h2>No vacancies yet</h2><p>Create a draft, then publish it to make it visible to job seekers.</p></div>}
            {jobs.map((job) => (
              <article className="jp-panel jp-job-row" key={job.id}>
                <div className="jp-job-heading"><div><p className="jp-eyebrow">{job.company_name} · {job.location}</p><h2>{job.title}</h2></div><span className={`jp-status ${job.status.toLowerCase()}`}>{job.status}</span></div>
                <p className="jp-muted">{job.employment_type} · {job.work_mode} · {job.vacancy_count} vacancy{job.vacancy_count === 1 ? '' : 'ies'}</p>
                <div className="jp-skill-list">{job.required_skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <div className="jp-actions">
                  <button className="jp-button subtle" onClick={() => viewApplicants(job)}>Applicants</button>
                  <button className="jp-button subtle" onClick={() => { setEditing(job); setNotice(''); }}>Edit</button>
                  {job.status === 'PUBLISHED'
                    ? <button className="jp-button subtle" onClick={() => changeJobStatus(job, 'INACTIVE')}>Deactivate</button>
                    : <button className="jp-button subtle" disabled={!company.company_name} onClick={() => changeJobStatus(job, 'PUBLISHED')}>Publish</button>}
                  {job.status === 'INACTIVE' && <button className="jp-button subtle" onClick={() => changeJobStatus(job, 'PUBLISHED')}>Republish</button>}
                  <button className="jp-button danger" onClick={() => removeJob(job)}>Delete</button>
                </div>
              </article>
            ))}
          </section>
        )}

        {active === 'applicants' && (
          <section className="jp-list">
            <button className="jp-button subtle" onClick={() => setActive('jobs')}>← Back to vacancies</button>
            {applicants.length === 0 && <div className="jp-panel jp-empty"><h2>No applicants yet</h2><p>Applications for this vacancy will appear here.</p></div>}
            {applicants.map((applicant) => (
              <article className="jp-panel" key={applicant.application_id}>
                <div className="jp-job-heading"><div><h2>{applicant.name}</h2><p className="jp-muted">{applicant.email} · Applied {new Date(applicant.applied_at).toLocaleDateString()}</p></div><span className="jp-status">{applicant.application_status}</span></div>
                {applicant.headline && <p><strong>{applicant.headline}</strong></p>}
                {applicant.summary && <p>{applicant.summary}</p>}
                <p className="jp-muted">{applicant.location || 'Location not set'}</p>
                <div className="jp-skill-list">{(applicant.skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div>
                <details className="jp-details"><summary>Profile details</summary><p><strong>Education:</strong> {(applicant.education || []).join(' · ') || 'Not provided'}</p><p><strong>Experience:</strong> {(applicant.experience || []).join(' · ') || 'Not provided'}</p></details>
                <div className="jp-actions">
                  {applicant.resume_filename && <button className="jp-button subtle" onClick={() => downloadResume(applicant)}>Download resume</button>}
                  <label className="jp-status-picker">Application status
                    <select value={applicant.application_status} onChange={(event) => changeApplicationStatus(applicant, event.target.value)}>
                      {!['SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED'].includes(applicant.application_status) && <option value={applicant.application_status} disabled>{applicant.application_status}</option>}
                      {['SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

function CandidatePortal({ user, onLogout }) {
  const [active, setActive] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({ headline: '', summary: '', location: '', skills: [], education: [], experience: [], resume_filename: null });
  const [filters, setFilters] = useState({ title: '', company: '', skill: '', location: '', employment_type: '', sort: 'recent' });
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const loadJobs = async (search = filters) => {
    const result = await portalApi.jobs(search);
    setJobs(result.jobs);
  };

  const loadApplications = async () => {
    const result = await portalApi.applications();
    setApplications(result.applications);
  };

  const loadProfile = async () => {
    const result = await portalApi.profile();
    setProfile(result.profile);
  };

  useEffect(() => {
    Promise.all([loadJobs({}), loadApplications(), loadProfile()]).catch((loadError) => setError(messageFrom(loadError)));
  }, []);

  const navigate = async (section) => {
    setActive(section);
    setSelected(null);
    setNotice('');
    setError('');
    try {
      if (section === 'jobs') await loadJobs();
      if (section === 'applications') await loadApplications();
      if (section === 'profile') await loadProfile();
    } catch (loadError) {
      setError(messageFrom(loadError));
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await portalApi.saveProfile(profile);
      setProfile(result.profile);
      setNotice('Candidate profile saved.');
    } catch (saveError) {
      setError(messageFrom(saveError));
    }
  };

  const apply = async (job) => {
    setLoading(true);
    setError('');
    try {
      await portalApi.apply(job.id);
      await Promise.all([loadApplications(), loadJobs()]);
      setNotice(`Application submitted for ${job.title}.`);
    } catch (applyError) {
      setError(messageFrom(applyError));
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (application) => {
    try {
      await portalApi.withdraw(application.application_id);
      await loadApplications();
      setNotice('Application withdrawn.');
    } catch (withdrawError) {
      setError(messageFrom(withdrawError));
    }
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const result = await portalApi.uploadResume(file);
      setProfile({ ...profile, resume_filename: result.resume_filename });
      setNotice('Resume uploaded securely.');
    } catch (uploadError) {
      setError(messageFrom(uploadError));
    }
  };

  const downloadResume = async () => {
    try {
      const blob = await portalApi.downloadResume();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = profile.resume_filename || 'resume';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(messageFrom(downloadError));
    }
  };

  const appliedJobIds = new Set(applications.map((application) => application.job_id));

  return (
    <>
      <PortalHeader user={user} active={active} onNavigate={navigate} onLogout={onLogout} />
      <main className="jp-main">
        <div className="jp-page-title"><div><p className="jp-eyebrow">JOB SEEKER WORKSPACE</p><h1>{active === 'jobs' ? 'Explore opportunities' : active === 'applications' ? 'Your applications' : 'Your profile'}</h1></div></div>
        {notice && <p className="jp-alert success">{notice}</p>}
        {error && <p className="jp-alert error" role="alert">{error}</p>}

        {active === 'jobs' && (
          <>
            <form className="jp-panel jp-search" onSubmit={(event) => { event.preventDefault(); loadJobs().catch((loadError) => setError(messageFrom(loadError))); }}>
              <label>Job title<input value={filters.title} onChange={(event) => setFilters({ ...filters, title: event.target.value })} placeholder="e.g. Product designer" /></label>
              <label>Company<input value={filters.company} onChange={(event) => setFilters({ ...filters, company: event.target.value })} /></label>
              <label>Skills<input value={filters.skill} onChange={(event) => setFilters({ ...filters, skill: event.target.value })} /></label>
              <label>Location<input value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })} /></label>
              <label>Employment
                <select value={filters.employment_type} onChange={(event) => setFilters({ ...filters, employment_type: event.target.value })}>
                  <option value="">All types</option>
                  {['Full-time', 'Part-time', 'Internship', 'Contract'].map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>Sort
                <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
                  <option value="recent">Most recent</option><option value="salary_desc">Salary: high to low</option><option value="salary_asc">Salary: low to high</option><option value="deadline">Closing soon</option>
                </select>
              </label>
              <button className="jp-button primary">Search jobs</button>
            </form>
            {selected && (
              <section className="jp-panel jp-job-detail">
                <button className="jp-button subtle" onClick={() => setSelected(null)}>← Back to results</button>
                <p className="jp-eyebrow">{selected.company_name} · {selected.location}</p><h2>{selected.title}</h2>
                <p className="jp-muted">{selected.employment_type} · {selected.work_mode} · {selected.vacancy_count} vacancy{selected.vacancy_count === 1 ? '' : 'ies'}</p>
                <div className="jp-skill-list">{selected.required_skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <h3>About the role</h3><p className="jp-preserve-lines">{selected.description}</p>
                {selected.qualifications && <><h3>Qualifications</h3><p className="jp-preserve-lines">{selected.qualifications}</p></>}
                {selected.experience_requirements && <><h3>Experience</h3><p className="jp-preserve-lines">{selected.experience_requirements}</p></>}
                {selected.salary_min != null && <p><strong>Salary:</strong> {selected.salary_min.toLocaleString()} – {(selected.salary_max ?? selected.salary_min).toLocaleString()}</p>}
                <button className="jp-button primary" disabled={loading || appliedJobIds.has(selected.id)} onClick={() => apply(selected)}>{appliedJobIds.has(selected.id) ? 'Already applied' : loading ? 'Applying…' : 'Apply for this job'}</button>
              </section>
            )}
            {!selected && (
              <section className="jp-list">
                {jobs.length === 0 && <div className="jp-panel jp-empty"><h2>No matching jobs found</h2><p>Adjust your search filters or check back later.</p></div>}
                {jobs.map((job) => (
                  <article className="jp-panel jp-job-row" key={job.id}>
                    <div className="jp-job-heading"><div><p className="jp-eyebrow">{job.company_name} · {job.location}</p><h2>{job.title}</h2></div><span className="jp-status">{job.work_mode}</span></div>
                    <p className="jp-muted">{job.employment_type} · {job.vacancy_count} vacancy{job.vacancy_count === 1 ? '' : 'ies'}{job.application_deadline ? ` · Apply by ${job.application_deadline}` : ''}</p>
                    {job.salary_min != null && <p>Salary range: {job.salary_min.toLocaleString()} – {(job.salary_max ?? job.salary_min).toLocaleString()}</p>}
                    <div className="jp-skill-list">{job.required_skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                    <div className="jp-actions"><button className="jp-button subtle" onClick={() => setSelected(job)}>View details</button><button className="jp-button primary" disabled={loading || appliedJobIds.has(job.id)} onClick={() => apply(job)}>{appliedJobIds.has(job.id) ? 'Applied' : 'Apply'}</button></div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {active === 'applications' && (
          <section className="jp-list">
            {applications.length === 0 && <div className="jp-panel jp-empty"><h2>No applications yet</h2><p>Browse open vacancies and apply to start tracking your applications here.</p></div>}
            {applications.map((application) => (
              <article className="jp-panel jp-job-row" key={application.application_id}>
                <div className="jp-job-heading"><div><p className="jp-eyebrow">{application.company_name} · {application.location}</p><h2>{application.title}</h2></div><span className="jp-status">{application.application_status}</span></div>
                <p className="jp-muted">Applied {new Date(application.applied_at).toLocaleDateString()} · {application.employment_type} · {application.work_mode}</p>
                {['APPLIED', 'SHORTLISTED'].includes(application.application_status) && <button className="jp-button danger" onClick={() => withdraw(application)}>Withdraw application</button>}
              </article>
            ))}
          </section>
        )}

        {active === 'profile' && (
          <form className="jp-panel jp-form" onSubmit={saveProfile}>
            <h2>Candidate profile</h2>
            <label>Professional headline<input value={profile.headline || ''} onChange={(event) => setProfile({ ...profile, headline: event.target.value })} /></label>
            <label>Location<input value={profile.location || ''} onChange={(event) => setProfile({ ...profile, location: event.target.value })} /></label>
            <label>About you<textarea rows="4" value={profile.summary || ''} onChange={(event) => setProfile({ ...profile, summary: event.target.value })} /></label>
            <label>Skills <small>One per line</small><textarea rows="3" value={(profile.skills || []).join('\n')} onChange={(event) => setProfile({ ...profile, skills: event.target.value.split('\n') })} /></label>
            <label>Education <small>One qualification per line</small><textarea rows="3" value={(profile.education || []).join('\n')} onChange={(event) => setProfile({ ...profile, education: event.target.value.split('\n') })} /></label>
            <label>Experience <small>One role per line</small><textarea rows="3" value={(profile.experience || []).join('\n')} onChange={(event) => setProfile({ ...profile, experience: event.target.value.split('\n') })} /></label>
            <button className="jp-button primary">Save profile</button>
            <div className="jp-upload">
              <label>Resume (PDF or DOCX, up to 5 MB)<input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={uploadResume} /></label>
              {profile.resume_filename && <p>Current resume: <strong>{profile.resume_filename}</strong> <button type="button" className="jp-inline-button" onClick={downloadResume}>Download your resume</button></p>}
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export default function JobPortalApp() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    apiRequest('/auth/me', { token })
      .then((result) => setUser(result.user))
      .catch(() => storeToken(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const acceptSession = (result) => {
    storeToken(result.access_token);
    setUser(result.user);
  };

  const signOut = async () => {
    try {
      await portalApi.logout();
    } catch (logoutError) {
      console.warn('Job Portal sign-out request failed; clearing the local session.', logoutError);
    } finally {
      storeToken(null);
      setUser(null);
    }
  };

  if (checkingSession) return <div className="job-portal"><div className="jp-loading">Loading your Job Portal session…</div></div>;
  if (!user) return <div className="job-portal"><AuthScreen onAuthenticated={acceptSession} /></div>;
  if (user.role === 'employer') return <div className="job-portal"><EmployerPortal user={user} onLogout={signOut} /></div>;
  if (user.role === 'job_seeker') return <div className="job-portal"><CandidatePortal user={user} onLogout={signOut} /></div>;
  return <div className="job-portal"><div className="jp-auth-page"><p className="jp-alert error">This account has no permitted Job Portal role.</p><button className="jp-button subtle" onClick={signOut}>Sign out</button></div></div>;
}
