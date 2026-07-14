import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const NotFound = () => {
  const { isAuthenticated, user } = useAuthStore();
  const target = isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/';
  return (
    <div className="min-h-[70vh] grid place-items-center px-5 page-enter">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#172033] text-white"><Map size={25} /></div>
        <span className="eyebrow">404 · Off the floor plan</span>
        <h1 className="mt-5 mb-3 font-['DM_Serif_Display'] text-5xl font-normal tracking-[-.04em]">This route is not part of service.</h1>
        <p className="mb-7 text-sm leading-7 text-slate-500">The page may have moved during the TableFlow pivot or may no longer be active.</p>
        <Link to={target} className="btn-primary"><ArrowLeft size={16} /> Return to TableFlow</Link>
      </div>
    </div>
  );
};

export default NotFound;
