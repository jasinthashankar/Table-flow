import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Calendar, Clock, Users, Shield, AlertTriangle, MessageSquare } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';

const ReservationDetails = () => {
  const { reservationNumber } = useParams();
  const navigate = useNavigate();
  const { currentReservation, fetchReservationDetails, cancelReservation, isLoading, error } = useReservationStore();

  const [cancelError, setCancelError] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const loadData = () => {
    setCancelError(null);
    if (reservationNumber) {
      fetchReservationDetails(reservationNumber).catch(() => {});
    }
  };

  useEffect(() => {
    loadData();
  }, [reservationNumber]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setIsCanceling(true);
    setCancelError(null);
    try {
      await cancelReservation(reservationNumber);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel reservation');
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading && !currentReservation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton type="card" count={1} lines={6} />
      </div>
    );
  }

  if (error || !currentReservation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Reservation Details Missing</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not load details'}</p>
        <Link to="/dashboard" className="btn-primary text-xs mt-4">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const r = currentReservation;
  const isCancellable = ['pending', 'confirmed'].includes(r.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header breadcrumb */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/reservations" className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{r.reservationNumber}</h1>
            <p className="text-xs text-slate-400">Created on {new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {cancelError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Booking Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned and verified guest dining seat</p>
          </div>
          <StatusBadge status={r.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div>
              <span className="text-slate-400 text-xs block uppercase font-medium">Guest Details</span>
              <span className="font-semibold text-slate-800 text-base block">{r.guestName}</span>
              <span className="text-slate-500 text-xs block">{r.guestEmail}</span>
              <span className="text-slate-500 text-xs block">{r.guestPhone}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block uppercase font-medium">Schedule Details</span>
              <span className="font-medium text-slate-700 block">
                📅 {new Date(r.reservationDate).toLocaleDateString()}
              </span>
              <span className="font-medium text-slate-700 block">
                ⏰ {r.timeSlot}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-slate-400 text-xs block uppercase font-medium">Table Assignment</span>
              {r.assignedTable ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 text-xs">
                  <div className="font-bold text-blue-800 text-sm">Table {r.assignedTable.tableNumber}</div>
                  <div className="text-blue-600 mt-0.5 capitalize">
                    {r.assignedTable.seatingType} table • {r.assignedTable.location}
                  </div>
                  <div className="text-slate-500 mt-1">Capacity: Up to {r.assignedTable.capacity} Guests</div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1 text-xs text-slate-500">
                  Pending Table Assignment by Operations.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-xs block">Party Size</span>
                <span className="font-medium text-slate-700">{r.guestCount} Guests</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Occasion</span>
                <span className="font-medium text-slate-700 capitalize">{r.occasion}</span>
              </div>
            </div>
          </div>
        </div>

        {r.specialRequest && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Special Request notes:</span>
            <p className="text-slate-600 italic">"{r.specialRequest}"</p>
          </div>
        )}

        {isCancellable && (
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className="btn-danger text-xs py-2 px-4 cursor-pointer"
            >
              {isCanceling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        )}
      </div>

      {/* History Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Status History Logs</h3>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
          {r.statusHistory && r.statusHistory.length > 0 ? (
            r.statusHistory.map((log, idx) => (
              <div key={idx} className="flex gap-4 items-start relative text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 capitalize">Status set to: {log.status}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.note && <p className="text-slate-500 font-light italic mt-0.5">"{log.note}"</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-xs">No status change history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
