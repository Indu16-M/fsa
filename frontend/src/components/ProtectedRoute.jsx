import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#10b981', fontWeight: 800 }}>
        Loading ShareBite Platform...
      </div>
    );
  }

  // 1. Not authenticated -> always go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const dbRole = user.role; // DB role is source of truth

  // 2. NGO status gates
  if (dbRole === 'ngo') {
    const currentPath = window.location.pathname;
    if (user.status === 'pending_approval' && currentPath !== '/ngo-pending') {
      return <Navigate to="/ngo-pending" replace />;
    }
    if (user.status === 'rejected' && currentPath !== '/ngo-rejected') {
      return <Navigate to="/ngo-rejected" replace />;
    }
  }

  // 3. Role protection check — strict separation per role
  if (allowedRoles.length > 0 && !allowedRoles.includes(dbRole)) {
    if (dbRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (dbRole === 'ngo') {
      if (user.status === 'pending_approval') return <Navigate to="/ngo-pending" replace />;
      if (user.status === 'rejected') return <Navigate to="/ngo-rejected" replace />;
      return <Navigate to="/ngo/dashboard" replace />;
    }
    if (dbRole === 'receiver') return <Navigate to="/receiver/dashboard" replace />;
    if (dbRole === 'donor') return <Navigate to="/donor/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
