import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const LoadingGate = () => (
  <div className="min-h-screen grid place-items-center bg-[#f5f6f8]">
    <div className="flex flex-col items-center gap-4">
      <div className="brand-symbol" aria-hidden="true"><span /><span /><span /></div>
      <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-400">Restoring secure session</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialised } = useAuthStore();
  const location = useLocation();
  if (!isInitialised) return <LoadingGate />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
