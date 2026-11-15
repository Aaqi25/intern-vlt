# THOZHIL Job Portal — Project E

Project E adds employer vacancy management and a job-seeker portal without changing Projects A–D or their databases. Its React screens are part of the existing `frontend/` application at `/job-portal`; its separate FastAPI service uses SQLite and listens on port `5050`.

## Start locally

1. Install the API requirements once:

   ```powershell
   cd backend/apps/job-portal/api
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   python -m uvicorn main:app --host 127.0.0.1 --port 5050 --reload
   ```

2. In another terminal, run the existing portal frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev -- --port 5173
   ```

3. Open `http://localhost:5173/job-portal`. If using the admin shell, also run it on port `3000`, then choose **THOZHIL Job Portal**. The gateway can be run on port `8080`; it routes `/job-portal/*` to the unified frontend and `/api/job-portal/*` to this API.

The API creates `api/data/job_portal.db` and `api/data/resumes/` by default. Override these paths using `JOB_PORTAL_DATABASE_PATH` and `JOB_PORTAL_RESUMES_PATH`. `JOB_PORTAL_ALLOWED_ORIGINS` is a comma-separated origin list; see `api/.env.example`. The database and uploaded resumes are ignored by Git.

## Accounts and roles

Sign-up requires a name, unique email, password of at least 10 characters, and one of two roles: **Employer** or **Job seeker**. Passwords are PBKDF2-HMAC-SHA256 hashes; API-issued bearer tokens are random, time-limited, stored only as SHA-256 hashes, and can be revoked by signing out. Every employer and job-seeker API is role-checked server-side. The existing gateway and React login implementations use synthetic sessions and are not used to authorize Project E.

## Workflows

- Employers manage their company profile, create/edit draft vacancies, publish/deactivate/delete postings, review applicants, and set applicant status.
- Job seekers search published jobs, filter/sort listings, maintain skills/education/experience, upload a PDF or DOCX resume, apply, track status, and withdraw an application while it is still eligible.
- A unique `(job_id, candidate_id)` database constraint prevents duplicate applications. Published vacancies appear in the public listing endpoint as soon as they are published.
- Resume downloads require the owning candidate session or an employer session with an application to one of that employer's vacancies.

## API overview

Base path: `/api/job-portal`

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- Employer: `GET|PUT /employer/company`, `GET|POST /employer/jobs`, `PUT|PATCH|DELETE /employer/jobs/{job_id}`, `GET /employer/jobs/{job_id}/applications`, `PATCH /employer/applications/{application_id}/status`
- Job seeker: `GET|PUT /candidate/profile`, `PUT|GET /candidate/profile/resume`, `GET /candidate/applications`, `DELETE /candidate/applications/{application_id}`, `POST /jobs/{job_id}/applications`
- Public search/details: `GET /jobs`, `GET /jobs/{job_id}`
- Health: `GET /health`

## Tests and Nx

```powershell
cd backend
python -m pytest apps/job-portal/api/tests -q
npx nx dev job-portal-api
npx nx test job-portal-api
```

The tests cover registration/login, role boundaries, job publication/search, duplicate-application prevention, status tracking, and resume-access restrictions.
