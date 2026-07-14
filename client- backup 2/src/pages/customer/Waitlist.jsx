import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useWaitlistStore from '../../store/useWaitlistStore';
import FormField from '../../components/common/FormField';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';

const Waitlist = () => {
  const { user } = useAuthStore();
  const { myWaitlistEntries, fetchMyWaitlist, joinWaitlist, cancelMyWaitlist, isLoading, error, clearError } = useWaitlistStore();

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestCount, setGuestCount] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('any');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyWaitlist().catch(() => {});
  }, [fetchMyWaitlist]);

  // Find active entry (status waiting or notified)
  const activeEntry = myWaitlistEntries?.find((e) => ['waiting', 'notified'].includes(e.status)) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!guestName.trim()) {
      setFormError('Guest name is required.');
      return;
    }
    if (!guestPhone.trim() || !/^(?:\+91|0)?[6-9]\d{9}$/.test(guestPhone.trim())) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await joinWaitlist({
        guestName,
        guestPhone,
        guestCount,
        seatingPreference,
        notes
      });
      // Fetch fresh entries on success
      await fetchMyWaitlist();
    } catch (err) {
      setFormError(err.message || 'Failed to join waitlist queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your waitlist entry?')) return;
    try {
      await cancelMyWaitlist();
      await fetchMyWaitlist();
    } catch (err) {
      setFormError(err.message || 'Failed to cancel waitlist entry.');
    }
  };

  if (isLoading && myWaitlistEntries.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <Skeleton type="card" count={1} lines={4} />
      </div>
    );
  }

  return (
    <div className="waitlist-page max-w-xl mx-auto px-4 py-8 space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Waitlist Queue</h1>
          <p className="text-sm text-slate-500">Join the restaurant queue or check your active place in line.</p>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Waitlist error:</span> {formError || error}
          </div>
        </div>
      )}

      {activeEntry ? (
        /* Active waitlist ticket */
        <div className="waitlist-ticket rounded-xl p-8 text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 animate-pulse">
            <Clock size={36} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">You are in the Queue</h2>
            <p className="text-sm text-slate-500 mt-1">We will notify you by phone when your table is ready.</p>
          </div>

          <div className="waitlist-details rounded-lg p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Guest Name</span>
              <span className="font-bold text-slate-800">{activeEntry.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Queue State</span>
              <StatusBadge status={activeEntry.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Wait</span>
              <span className="font-semibold text-slate-800">
                {activeEntry.estimatedWaitMinutes !== null ? `${activeEntry.estimatedWaitMinutes} mins` : 'Estimating...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Party Size</span>
              <span className="font-semibold text-slate-800">{activeEntry.guestCount} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joined Queue</span>
              <span className="font-medium text-slate-600">
                {new Date(activeEntry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="btn-danger w-full text-sm py-2 cursor-pointer"
            >
              Leave Queue
            </button>
          </div>
        </div>
      ) : (
        /* Join Waitlist Form */
        <div className="waitlist-form rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 mb-5">
            Join Waitlist Queue
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Guest Name"
              name="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Name for queue registry"
              required
            />

            <FormField
              label="Contact Phone"
              name="guestPhone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="10-digit Indian phone number"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="tf-label">Guest Count</label>
                <input
                  type="number"
                  className="tf-input"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
              </div>

              <div>
                <label className="tf-label">Seating Preference</label>
                <select
                  className="tf-select"
                  value={seatingPreference}
                  onChange={(e) => setSeatingPreference(e.target.value)}
                >
                  <option value="any">No Preference</option>
                  <option value="couple">Couple Table</option>
                  <option value="window">Window Table</option>
                  <option value="garden">Garden Table</option>
                  <option value="family">Family Booth</option>
                  <option value="group">Large Group Table</option>
                </select>
              </div>
            </div>

            <div>
              <label className="tf-label">Add Note (Optional)</label>
              <textarea
                className="tf-input h-20 resize-none text-xs"
                placeholder="e.g. Accessibility demands, booster seat needed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
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
                  <span>Enrolling in Queue...</span>
                </>
              ) : (
                <>
                  <span>Join Waitlist Queue</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Waitlist;
