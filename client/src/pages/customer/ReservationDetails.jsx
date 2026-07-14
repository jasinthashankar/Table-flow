import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';

const ReservationDetails = () => {
  const { reservationNumber } = useParams();
  const {
    currentReservation,
    fetchReservationDetails,
    cancelReservation,
    isLoading,
    error,
  } = useReservationStore();

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
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton type="card" count={1} lines={6} />
      </div>
    );
  }

  if (error || !currentReservation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <h2 className="text-lg font-bold text-white">Reservation Details Missing</h2>
        <p className="mt-1 text-sm text-slate-400">
          {error || 'Could not load details'}
        </p>
        <Link to="/dashboard" className="btn-primary mt-4 text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const reservation = currentReservation;
  const isCancellable = ['pending', 'confirmed'].includes(reservation.status);

  return (
    <div className="reservation-details-page mx-auto max-w-3xl space-y-6 px-4 py-8 page-enter">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/reservations"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            aria-label="Back to reservations"
          >
            <ArrowLeft size={16} />
          </Link>

          <div>
            <h1 className="mb-0 text-xl font-bold text-white">
              {reservation.reservationNumber}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Created on {new Date(reservation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="btn-secondary flex cursor-pointer items-center gap-2 px-3 py-2 text-xs"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {cancelError && (
        <div className="flex items-start gap-2 rounded-xl border border-[#ff786c]/25 bg-[#ff786c]/10 p-4 text-sm text-[#ffb4ad]">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171f2c] to-[#101722] p-6 shadow-[0_22px_55px_rgba(0,0,0,.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-[.14em] text-[#91a4ff]">
              Reservation overview
            </span>
            <h2 className="mb-1 mt-2 text-lg font-semibold text-white">
              Booking Summary
            </h2>
            <p className="text-xs text-slate-400">
              Assigned and verified guest dining seat
            </p>
          </div>

          <StatusBadge status={reservation.status} />
        </div>

        <div className="grid grid-cols-1 gap-8 py-6 text-sm md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">
                Guest details
              </span>
              <span className="block text-base font-semibold text-white">
                {reservation.guestName}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                {reservation.guestEmail}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                {reservation.guestPhone}
              </span>
            </div>

            <div>
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">
                Schedule details
              </span>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <span aria-hidden="true">📅</span>
                  <span>
                    {new Date(reservation.reservationDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <span aria-hidden="true">⏰</span>
                  <span>{reservation.timeSlot}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">
                Table assignment
              </span>

              {reservation.assignedTable ? (
                <div className="rounded-xl border border-[#7186ff]/25 bg-[#7186ff]/10 p-4 text-xs">
                  <div className="text-sm font-bold text-[#b6c1ff]">
                    Table {reservation.assignedTable.tableNumber}
                  </div>
                  <div className="mt-1 capitalize text-[#91a4ff]">
                    {reservation.assignedTable.seatingType} table ·{' '}
                    {reservation.assignedTable.location}
                  </div>
                  <div className="mt-2 text-slate-400">
                    Capacity: Up to {reservation.assignedTable.capacity} guests
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#111925] p-4 text-xs text-slate-300">
                  Pending table assignment by operations.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <span className="block text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-500">
                  Party size
                </span>
                <span className="mt-2 block text-sm font-semibold text-white">
                  {reservation.guestCount} guests
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <span className="block text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-500">
                  Occasion
                </span>
                <span className="mt-2 block text-sm font-semibold capitalize text-white">
                  {reservation.occasion || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {reservation.specialRequest && (
          <div className="rounded-xl border border-white/[0.07] bg-[#111925] p-4 text-xs">
            <span className="mb-2 block font-semibold text-white">
              Special request notes
            </span>
            <p className="mb-0 italic leading-6 text-slate-300">
              “{reservation.specialRequest}”
            </p>
          </div>
        )}

        {isCancellable && (
          <div className="mt-6 flex justify-end border-t border-white/[0.07] pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCanceling}
              className="btn-danger cursor-pointer px-4 py-2 text-xs"
            >
              {isCanceling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#171f2c] to-[#101722] p-6 shadow-[0_18px_45px_rgba(0,0,0,.24)]">
        <div className="mb-5">
          <span className="block text-[10px] font-extrabold uppercase tracking-[.14em] text-[#91a4ff]">
            Reservation timeline
          </span>
          <h3 className="mb-0 mt-2 text-base font-semibold text-white">
            Status History Logs
          </h3>
        </div>

        <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-white/[0.08]">
          {reservation.statusHistory && reservation.statusHistory.length > 0 ? (
            reservation.statusHistory.map((log, index) => (
              <div
                key={`${log.status}-${log.timestamp}-${index}`}
                className="relative flex items-start gap-4 text-xs"
              >
                <div className="z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#7186ff]/30 bg-[#172033]">
                  <div className="h-2 w-2 rounded-full bg-[#7186ff]" />
                </div>

                <div className="min-w-0 flex-1 rounded-xl border border-white/[0.065] bg-white/[0.025] px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold capitalize text-white">
                      Status set to: {log.status}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {log.note && (
                    <p className="mb-0 mt-2 italic leading-5 text-slate-400">
                      “{log.note}”
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">
              No status change history found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReservationDetails;
