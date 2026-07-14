import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isInitialised } = useAuthStore();
  if (!isInitialised) return <div className="min-h-screen grid place-items-center bg-[#f5f6f8]"><div className="brand-symbol"><span /><span /><span /></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
