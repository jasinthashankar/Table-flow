import React, { useEffect } from 'react';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const AdminCustomers = () => {
  const { customers, fetchCustomers, isLoading, error } = useAuthStore();

  const loadCustomers = () => {
    fetchCustomers().catch(() => {});
  };

  useEffect(() => {
    loadCustomers();
  }, [fetchCustomers]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest Registry Database</h1>
          <p className="text-sm text-slate-500">View registered platform users, contact credentials, and authorization status.</p>
        </div>
        <button onClick={loadCustomers} disabled={isLoading} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading && customers.length === 0 ? (
          <div className="p-6">
            <Skeleton type="row" count={5} cols={4} />
          </div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Enrolled Since</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-bold text-slate-800 text-xs">{c.name}</span>
                    </td>
                    <td>
                      <span className="text-slate-600 block text-xs">{c.email}</span>
                    </td>
                    <td>
                      <span className="text-slate-600 text-xs">{c.phone || 'Not provided'}</span>
                    </td>
                    <td>
                      <span className="text-slate-500 text-xs">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Guest Registry Empty"
            message="No guest records are registered in the database."
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
