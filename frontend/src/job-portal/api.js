const API_BASE = '/api/job-portal';
const TOKEN_KEY = 'thozhil_job_portal_token';

export const getStoredToken = () => sessionStorage.getItem(TOKEN_KEY);

export const storeToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
};

export async function apiRequest(path, { token = getStoredToken(), ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const payload = await response.json();
      message = payload.detail || payload.message || message;
    } catch {
      // Keep the HTTP status message when an upstream returns a non-JSON error.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.blob();
}

export const portalApi = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  company: () => apiRequest('/employer/company'),
  saveCompany: (payload) => apiRequest('/employer/company', { method: 'PUT', body: JSON.stringify(payload) }),
  employerJobs: () => apiRequest('/employer/jobs'),
  createJob: (payload) => apiRequest('/employer/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  updateJob: (id, payload) => apiRequest(`/employer/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateJobStatus: (id, status) => apiRequest(`/employer/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteJob: (id) => apiRequest(`/employer/jobs/${id}`, { method: 'DELETE' }),
  applicants: (jobId) => apiRequest(`/employer/jobs/${jobId}/applications`),
  updateApplicationStatus: (id, status) => apiRequest(`/employer/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  downloadApplicantResume: (id) => apiRequest(`/employer/applications/${id}/resume`),
  jobs: (search = {}) => {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return apiRequest(`/jobs?${params.toString()}`);
  },
  profile: () => apiRequest('/candidate/profile'),
  saveProfile: (payload) => apiRequest('/candidate/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  uploadResume: (file) => apiRequest('/candidate/profile/resume', {
    method: 'PUT',
    headers: { 'X-Resume-Filename': encodeURIComponent(file.name) },
    body: file,
  }),
  downloadResume: () => apiRequest('/candidate/profile/resume'),
  apply: (jobId) => apiRequest(`/jobs/${jobId}/applications`, { method: 'POST' }),
  applications: () => apiRequest('/candidate/applications'),
  withdraw: (id) => apiRequest(`/candidate/applications/${id}`, { method: 'DELETE' }),
};
