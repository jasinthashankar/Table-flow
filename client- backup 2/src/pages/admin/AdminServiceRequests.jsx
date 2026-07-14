import React, { useEffect, useState } from 'react';
import { Wrench, RefreshCw, AlertCircle } from 'lucide-react';
import useServiceRequestStore from '../../store/useServiceRequestStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminServiceRequests = () => {
  const { requests, pagination, fetchAdminRequests, adminUpdateRequest, isLoading, error } = useServiceRequestStore();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reqStatus, setReqStatus] = useState('open');

  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequests = () => {
    fetchAdminRequests({
      page,
      limit: 15,
      status: statusFilter,
      priority: priorityFilter
    }).catch(() => {});
  };

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter, priorityFilter, fetchAdminRequests]);

  const openStatusModal = (req) => {
    setSelectedRequest(req);
    setReqStatus(req.status);
    setActionError('');
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await adminUpdateRequest(selectedRequest._id, {
        status: reqStatus
      });
      setShowModal(false);
      loadRequests();
    } catch (err) {
      setActionError(err.message || 'Failed to update request status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Requests Control Desk</h1>
          <p className="text-sm text-slate-500">Track high priority customer demands, assist table staff, and close completed tickets.</p>
        </div>
        <button onClick={loadRequests} disabled={isLoading} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
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

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-4 text-xs font-semibold">
        <div>
          <label className="tf-label text-[10px] uppercase">Filter Status</label>
          <select
            className="tf-select w-36 text-xs"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="tf-label text-[10px] uppercase">Filter Priority</label>
          <select
            className="tf-select w-36 text-xs"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading && requests.length === 0 ? (
          <div className="p-6">
            <Skeleton type="row" count={5} cols={5} />
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
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
                      <span className="font-bold text-slate-800 text-xs block">
                        {req.reservation?.reservationNumber || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {req.reservation?.timeSlot}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold capitalize text-slate-800">
                        {req.requestType.replace('_', ' ')}
                      </div>
                      {req.message && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-sm truncate">
                          "{req.message}"
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 mt-1">
                        Placed by {req.user?.name || 'Guest'} at {new Date(req.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold uppercase ${
                        req.priority === 'high' ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={req.status} className="text-[10px]" />
                    </td>
                    <td>
                      <button
                        onClick={() => openStatusModal(req)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                      >
                        Set Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No Service Tickets Found"
            message="No guest dining service request tickets match your query parameters."
          />
        )}
      </div>

      {/* Modal: Update Status */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Update Request Status">
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}

          {selectedRequest && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
              <div><span className="text-slate-400">Request:</span> <span className="font-semibold text-slate-800 capitalize">{selectedRequest.requestType.replace('_', ' ')}</span></div>
              <div><span className="text-slate-400">Message:</span> <span className="font-semibold text-slate-800 italic">"{selectedRequest.message || 'None'}"</span></div>
              <div><span className="text-slate-400">Booking Ref:</span> <span className="font-semibold text-slate-800">{selectedRequest.reservation?.reservationNumber || 'N/A'}</span></div>
            </div>
          )}

          <div>
            <label className="tf-label">Operational Status</label>
            <select
              className="tf-select text-xs animate-none"
              value={reqStatus}
              onChange={(e) => setReqStatus(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-1.5">
              {isSubmitting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServiceRequests;
