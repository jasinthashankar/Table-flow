import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useReservationStore from '../../store/useReservationStore';
import { Mail, Phone, Calendar, Clock, Wrench, ShieldCheck, User } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const Profile = () => {
  const { user } = useAuthStore();
  const {
    reservations,
    isLoading: reservationsLoading,
    fetchReservations
  } = useReservationStore();

  useEffect(() => {
    fetchReservations(1, 5).catch(() => {});
  }, [fetchReservations]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="profile-page max-w-4xl mx-auto px-4 py-8 space-y-8 page-enter">
      {/* Welcome Board */}
      <div className="profile-hero flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-xl">
        <div>
          <span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Guest Information Card</span>
          <h1 className="text-3xl font-extrabold mt-1 mb-2 text-slate-900 leading-tight">
            {user.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Registered customer since {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase rounded-full">
            Account Role: {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Identity Details Card */}
        <div className="profile-panel md:col-span-1 rounded-xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profile Identity</span>
          </h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</div>
                <div className="text-slate-800 font-medium truncate">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</div>
                <div className="text-slate-800 font-medium">{user.phone || 'Not configured'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Access Level</div>
                <div className="text-slate-800 font-medium capitalize">{user.role} Authorization</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations History Panel */}
        <div className="profile-panel md:col-span-2 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>Recent Reservation History</span>
            <Link to="/reservations" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </h2>

          {reservationsLoading ? (
            <Skeleton type="row" count={3} cols={4} />
          ) : reservations && reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date / Slot</th>
                    <th>Guests</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 5).map((r) => (
                    <tr key={r._id}>
                      <td>
                        <Link to={`/reservations/${r.reservationNumber}`} className="font-bold text-blue-600 hover:text-blue-700">
                          {r.reservationNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700">
                          {new Date(r.reservationDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">{r.timeSlot}</div>
                      </td>
                      <td>{r.guestCount}</td>
                      <td>
                        <StatusBadge status={r.status} className="text-[10px]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Booking Records Found"
              message="You haven't scheduled any reservations yet."
              action={
                <Link to="/reservations/new" className="btn-primary text-xs">
                  Reserve a Table
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
