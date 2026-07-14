import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, AlertCircle, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const Reservations = () => {
  const { reservations, pagination, fetchReservations, isLoading, error } = useReservationStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReservations(page, 10).catch(() => {});
  }, [fetchReservations, page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1);
  };

  if (isLoading && reservations.length === 0) {
    return (
      <div className="reservations-page max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-slate-200 rounded skeleton" />
          <div className="h-10 w-32 bg-slate-200 rounded skeleton" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Skeleton type="row" count={5} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-page max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservation Registry</h1>
          <p className="text-sm text-slate-500">Track and manage your scheduled bookings at TableFlow.</p>
        </div>
        <Link to="/reservations/new" className="btn-primary text-sm">
          <Plus size={16} />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {reservations && reservations.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Reservation Ref</th>
                    <th>Guest Details</th>
                    <th>Date / Slot</th>
                    <th>Table Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <span className="font-bold text-slate-900">{r.reservationNumber}</span>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-slate-700">{r.guestName}</div>
                        <div className="text-xs text-slate-400">{r.guestPhone}</div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-700">
                          {new Date(r.reservationDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400">{r.timeSlot}</div>
                      </td>
                      <td>
                        <div className="text-sm text-slate-700 font-medium">
                          {r.assignedTable ? `Table ${r.assignedTable.tableNumber}` : 'Assigning Table...'}
                        </div>
                        {r.assignedTable && (
                          <div className="text-xs text-slate-400 capitalize">
                            {r.assignedTable.seatingType} • {r.assignedTable.location}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link to={`/reservations/${r.reservationNumber}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                            View details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm">
                <span className="text-slate-500">
                  Page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ArrowLeft size={12} />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === pagination.totalPages}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No Scheduled Reservations"
            message="Secure your table in advance by creating a new reservation request."
            action={
              <Link to="/reservations/new" className="btn-primary text-xs">
                <span>Book a Table</span>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Reservations;
