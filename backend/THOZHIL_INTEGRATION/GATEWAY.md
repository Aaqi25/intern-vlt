# THOZHIL — Application Gateway Architecture Document

**Date:** 2026-09-30  
**Gateway Package:** `packages/gateway`  
**Single Browser Origin:** `http://localhost:8080`  

---

## 1. Gateway Purpose & Design

The **Thozhil Application Gateway** provides a unified, single browser-facing origin for the entire platform.

It proxies incoming requests from the single origin (`http://localhost:8080`) to the underlying 4 original applications and the Admin Shell using path-based reverse proxying without requiring any frontend code rewrites.

---

## 2. Route Dispatcher Map

```
BROWSER ORIGIN (http://localhost:8080)
│
├── /dashboard, /interns*     ──> Admin Shell (http://localhost:3000)
├── /resume*                  ──> Project B Resume App (http://localhost:5020)
├── /interview*               ──> Project A Video Interview App (http://localhost:5011)
├── /project-analysis*        ──> Project C Project Analyser App (http://localhost:5032)
├── /coding*                  ──> Project D Coding App (http://localhost:5041)
├── /job-portal*              ──> Unified React Frontend (http://localhost:5173)
├── /api/auth/*               ──> Gateway Admin Auth Bridge
├── /api/interns/*            ──> Gateway Unified Intern Identity API
├── /api/resumes/*, /api/jobs*──> Project B Backend (http://localhost:5020)
├── /api/interviews/*         ──> Project A Backend (http://localhost:5010)
├── /api/logs/*, /api/review* ──> Project C Backend (http://localhost:5030)
├── /api/exams*, /api/v1/*    ──> Project D Backend (http://localhost:5040)
└── /api/job-portal/*         ──> Project E Job Portal API (http://localhost:5050)
```

Project E has its own persistent SQLite database and bearer-token sessions. Its API route is matched before the legacy `/api/jobs*` resume-screener route so Job Portal requests do not reach Project B. The gateway sends non-API browser paths to the unified React frontend (`UNIFIED_FRONTEND_URL`, default `http://localhost:5173`) and forwards `/api/job-portal/*` to `JOB_PORTAL_API_URL` (default `http://localhost:5050`).

---

## 3. WebSocket Upgrade Proxying

The gateway preserves native WebSocket and Socket.IO protocol upgrades:

- `ws://localhost:8080/ws/*` $\rightarrow$ Upgrade proxied to Project A Live Interview Gateway (`ws://localhost:5010/ws/live`).
- `ws://localhost:8080/socket.io/*` $\rightarrow$ Upgrade proxied to Project D Assessment Proctoring Gateway (`http://localhost:5040`).

---

## 4. Same-Browser-Tab Guarantee

All module transitions and navigation between Dashboard, Resume, Video Interview, Project Analysis, Coding, and Intern Details execute inside the **SAME browser tab**. `window.open()` and `target="_blank"` are completely eliminated.
