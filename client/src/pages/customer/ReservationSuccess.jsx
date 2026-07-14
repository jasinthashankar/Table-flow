import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import Skeleton from '../../components/common/Skeleton';

const ReservationSuccess = () => {
  const { reservationNumber } = useParams();
  const {
    currentReservation,
    fetchReservationDetails,
    isLoading,
  } = useReservationStore();

  useEffect(() => {
    if (reservationNumber) {
      fetchReservationDetails(reservationNumber).catch(() => {});
    }
  }, [reservationNumber, fetchReservationDetails]);

  if (isLoading) {
    return (
      <div className="reservation-success-page max-w-md mx-auto my-20 px-4">
        <Skeleton type="card" count={1} lines={4} />
      </div>
    );
  }

  return (
    <div className="reservation-success-page max-w-md mx-auto my-20 px-4 page-enter">
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(180deg, #182133 0%, #141b2b 100%)',
          border: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,.35)',
        }}
      >
        <div
          className="inline-flex p-3 rounded-full mb-5"
          style={{
            background: 'rgba(46,204,113,.12)',
            color: '#6ee7a8',
          }}
        >
          <CheckCircle size={36} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Reservation Confirmed
        </h1>

        <p className="text-sm text-slate-300 max-w-xs mx-auto mb-6">
          Your table reservation request has been processed and logged in the
          system.
        </p>

        {currentReservation && (
          <div
            className="rounded-2xl p-5 text-left space-y-3 mb-6 text-sm"
            style={{
              background: '#0f1724',
              border: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Ref Number</span>
              <span className="font-bold text-white text-right">
                {currentReservation.reservationNumber}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Guest Name</span>
              <span className="font-semibold text-white text-right">
                {currentReservation.guestName}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Date</span>
              <span className="font-semibold text-white text-right">
                {new Date(
                  currentReservation.reservationDate
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Time Slot</span>
              <span className="font-semibold text-white text-right">
                {currentReservation.timeSlot}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Party Size</span>
              <span className="font-semibold text-white text-right">
                {currentReservation.guestCount} Guests
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to={`/reservations/${reservationNumber}`}
            className="btn-primary w-full text-sm py-2"
          >
            <span>Manage Reservation</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/dashboard"
            className="btn-secondary w-full text-sm py-2"
          >
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;
