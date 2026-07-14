import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, AlertCircle, Edit, Trash2 } from 'lucide-react';
import useWaitlistStore from '../../store/useWaitlistStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminWaitlist = () => {
  const { waitlistQueue, fetchAdminQueue, adminUpdateWaitlist, isLoading, error } = useWaitlistStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Edit states
  const [status, setStatus] = useState('waiting');
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState(15);
  const [notes, setNotes] = useState('');

  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQueue = () => {
    fetchAdminQueue().catch(() => {});
  };

  useEffect(() => {
    loadQueue();
  }, [fetchAdminQueue]);

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setStatus(entry.status);
    setEstimatedWaitMinutes(entry.estimatedWaitMinutes || 15);
    setNotes(entry.notes || '');
    setActionError('');
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await adminUpdateWaitlist(selectedEntry._id, {
        status,
        estimatedWaitMinutes,
        notes
      });
      setShowModal(false);
      loadQueue();
    } catch (err) {
      setActionError(err.message || 'Failed to update waitlist card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Waitlist Queue Board</h1>
          <p className="text-sm text-slate-500">Manage queue wait estimations, update status, and seat walk-in guests.</p>
        </div>
        <button onClick={loadQueue} disabled={isLoading} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table List */}
      <div className="admin-panel overflow-hidden">
        {isLoading && waitlistQueue.length === 0 ? (
          <div className="p-6">
            <Skeleton type="row" count={5} cols={5} />
          </div>
        ) : waitlistQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>Details</th>
                  <th>Est. Wait</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlistQueue.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <span className="font-bold text-slate-800 text-xs">{entry.guestName}</span>
                    </td>
                    <td>
                      <span className="text-slate-600 block text-xs">{entry.guestPhone}</span>
                      {entry.user && (
                        <span className="text-[9px] text-slate-400 block mt-0.5">User ID: {entry.user.email}</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-slate-700 font-semibold">{entry.guestCount} Guests</div>
                      <div className="text-[10px] text-slate-400 capitalize">Pref: {entry.seatingPreference}</div>
                      {entry.notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate">
                          "{entry.notes}"
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-800">
                        {entry.estimatedWaitMinutes !== null ? `${entry.estimatedWaitMinutes}m` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={entry.status} className="text-[10px]" />
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(entry)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                      >
                        Edit / Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Waitlist Queue Empty"
            message="No guests are currently registered on the waitlist queue."
          />
        )}
      </div>

      {/* Modal: Edit Entry */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Update Waitlist Card">
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}

          {selectedEntry && (
            <div className="admin-panel admin-panel--nested p-3 text-xs space-y-1">
              <div><span className="text-slate-400">Guest:</span> <span className="font-semibold text-slate-800">{selectedEntry.guestName}</span></div>
              <div><span className="text-slate-400">Party Size:</span> <span className="font-semibold text-slate-800">{selectedEntry.guestCount} Guests</span></div>
              <div><span className="text-slate-400">Joined line:</span> <span className="font-semibold text-slate-800">{new Date(selectedEntry.joinedAt).toLocaleTimeString()}</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tf-label">Queue Status</label>
              <select
                className="tf-select text-xs"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="waiting">Waiting</option>
                <option value="notified">Notified</option>
                <option value="seated">Seated</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="tf-label">Estimated Wait (Minutes)</label>
              <input
                type="number"
                className="tf-input"
                min="0"
                value={estimatedWaitMinutes}
                onChange={(e) => setEstimatedWaitMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                required
              />
            </div>
          </div>

          <div>
            <label className="tf-label">Waitlist notes (Optional)</label>
            <textarea
              className="tf-input h-16 resize-none text-xs"
              placeholder="e.g. Guest moved to garden table..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-1.5">
              {isSubmitting ? 'Saving...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminWaitlist;
