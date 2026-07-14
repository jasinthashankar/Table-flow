import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isInitialised } = useAuthStore();
  if (!isInitialised) return <div className="min-h-screen grid place-items-center bg-[#f4f1eb]"><div className="brand-symbol"><span /><span /><span /></div></div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
};

export default PublicOnlyRoute;
