import React from 'react';
import { ModuleFrame } from '../components/ModuleFrame';

export const JobPortalModulePage: React.FC = () => (
  <ModuleFrame
    moduleName="THOZHIL Job Portal"
    originalProject="Project E — Job Portal"
    targetPort={5173}
    targetUrl="http://localhost:5173/job-portal"
    techStack="React / FastAPI / SQLite"
    description="Employer job posting and applicant management, plus job seeker profiles, private resume access, job search, applications, and status tracking."
  />
);
