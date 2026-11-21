import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLoader } from '../common/BrandLoader';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <BrandLoader message="Initializing Enterprise Workspace..." subMessage="Loading session security & evaluation modules" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
    return <Navigate to="/recruiter" replace />;
  }

  return children;
};

export default ProtectedRoute;
