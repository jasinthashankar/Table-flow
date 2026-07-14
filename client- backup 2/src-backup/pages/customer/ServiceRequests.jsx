import React, { useState, useEffect } from 'react';
import { Wrench, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useReservationStore from '../../store/useReservationStore';
import useServiceRequestStore from '../../store/useServiceRequestStore';
import FormField from '../../components/common/FormField';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const REQUEST_TYPES = [
  { type: 'water', label: 'Water Refill 💧' },
  { type: 'cleaning', label: 'Table Cleaning 🧼' },
  { type: 'assistance', label: 'Staff Assistance 🙋' },
  { type: 'birthday_setup', label: 'Birthday/Occasion Greeting 🎂' },
  { type: 'bill_request', label: 'Request Dining Bill 🧾' },
  { type: 'other', label: 'Other Request 📝' }
];

const ServiceRequests = () => {
  const { reservations, fetchReservations } = useReservationStore();
  const { requests, createRequest, fetchMyRequests, cancelRequest, isLoading, error, clearError } = useServiceRequestStore();

  const [reservationId, setReservationId] = useState('');
  const [requestType, setRequestType] = useState('assistance');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReservations(1, 20).catch(() => {});
    fetchMyRequests().catch(() => {});
  }, [fetchReservations, fetchMyRequests]);

  // Filters active reservations eligible for requests (confirmed, guest_arrived, seated)
  const activeReservations = reservations?.filter((r) =>
    ['confirmed', 'guest_arrived', 'seated'].includes(r.status)
  ) || [];

  // Set default reservation choice on load
  useEffect(() => {
    if (activeReservations.length > 0 && !reservationId) {
      setReservationId(activeReservations[0]._id);
    }
  }, [activeReservations, reservationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!reservationId) {
      setFormError('Please select an active dining session reservation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        reservationId,
        requestType,
        message,
        priority
      });
      setMessage('');
      await fetchMyRequests();
    } catch (err) {
      setFormError(err.message || 'Failed to submit service ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this open request?')) return;
    try {
      await cancelRequest(id);
      await fetchMyRequests();
    } catch (err) {
      setFormError(err.message || 'Failed to cancel request ticket.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-sm text-slate-500">Request table assistance or check status of active tickets.</p>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Request Error:</span> {formError || error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 mb-5">
            Create Dining Request
          </h2>

          {activeReservations.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="tf-label">Select Active Booking</label>
                <select
                  className="tf-select text-xs"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  required
                >
                  {activeReservations.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.reservationNumber} • {new Date(r.reservationDate).toLocaleDateString()} ({r.timeSlot})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="tf-label">Request Type</label>
                <select
                  className="tf-select text-xs"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  required
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="tf-label">Priority</label>
                <select
                  className="tf-select text-xs"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="tf-label">Message / Details</label>
                <textarea
                  className="tf-input h-20 resize-none text-xs"
                  placeholder="Describe your request to help dining room floor staff..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary text-sm py-2.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request Ticket</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-xs leading-relaxed">
                No active dining reservations found today. Service requests can only be placed during active table bookings (confirmed, arrived, or seated).
              </p>
              <Link to="/reservations/new" className="btn-secondary text-xs w-full mt-4">
                Book a Table First
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Ticket Log */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 mb-5">
            Active & Past Request Tickets
          </h2>

          {isLoading && requests.length === 0 ? (
            <Skeleton type="row" count={3} cols={4} />
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Ref Booking</th>
                    <th>Request Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <span className="font-semibold block text-slate-800 text-xs">
                          {req.reservation?.reservationNumber || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {req.reservation?.timeSlot}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs font-semibold capitalize text-slate-700">
                          {req.requestType.replace('_', ' ')}
                        </div>
                        {req.message && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                            "{req.message}"
                          </div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Submitted {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className={`text-[10px] font-bold uppercase ${
                          req.priority === 'high' ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-slate-500'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={req.status} className="text-[10px]" />
                      </td>
                      <td>
                        {req.status === 'open' && (
                          <button
                            onClick={() => handleCancel(req._id)}
                            className="p-1 hover:bg-red-50 text-red-600 rounded hover:text-red-700 cursor-pointer"
                            title="Cancel request"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="No service requests placed"
              message="Dining assistance tickets will appear here once placed during your meals."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
