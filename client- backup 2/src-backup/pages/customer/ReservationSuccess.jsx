import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, CalendarDays, ArrowRight, TableProperties } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import Skeleton from '../../components/common/Skeleton';

const ReservationSuccess = () => {
  const { reservationNumber } = useParams();
  const { currentReservation, fetchReservationDetails, isLoading } = useReservationStore();

  useEffect(() => {
    if (reservationNumber) {
      fetchReservationDetails(reservationNumber).catch(() => {});
    }
  }, [reservationNumber, fetchReservationDetails]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-20 px-4">
        <Skeleton type="card" count={1} lines={4} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-20 px-4 page-enter">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-5">
          <CheckCircle size={36} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Reservation Confirmed
        </h1>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
          Your table reservation request has been processed and logged in the system.
        </p>

        {currentReservation && (
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-left space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Ref Number</span>
              <span className="font-bold text-slate-800">{currentReservation.reservationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guest Name</span>
              <span className="font-semibold text-slate-800">{currentReservation.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(currentReservation.reservationDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time Slot</span>
              <span className="font-semibold text-slate-800">{currentReservation.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Party Size</span>
              <span className="font-semibold text-slate-800">{currentReservation.guestCount} Guests</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to={`/reservations/${reservationNumber}`} className="btn-primary w-full text-sm py-2">
            <span>Manage Reservation</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/dashboard" className="btn-secondary w-full text-sm py-2">
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;
