import React, { useEffect, useState } from 'react';
import { CalendarDays, AlertCircle, RefreshCw, CheckCircle, Search, ArrowLeft, ArrowRight, User } from 'lucide-react';
import useReservationStore from '../../store/useReservationStore';
import useTableStore from '../../store/useTableStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const AdminReservations = () => {
  const { reservations, pagination, fetchAdminReservations, adminUpdateStatus, adminAssignTable, isLoading, error } = useReservationStore();
  const { tables, fetchTables } = useTableStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedRes, setSelectedRes] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  const [resStatus, setResStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [assignedTableId, setAssignedTableId] = useState('');

  const [actionError, setActionError] = useState('');

  const loadReservations = () => {
    fetchAdminReservations({
      page,
      limit: 10,
      search,
      status: statusFilter,
      date: dateFilter
    }).catch(() => {});
  };

  useEffect(() => {
    loadReservations();
    fetchTables().catch(() => {});
  }, [page, statusFilter, dateFilter, fetchAdminReservations, fetchTables]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReservations();
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1);
  };

  const openStatusChange = (res) => {
    setSelectedRes(res);
    setResStatus(res.status);
    setStatusNote('');
    setActionError('');
    setShowStatusModal(true);
  };

  const openTableAssign = (res) => {
    setSelectedRes(res);
    setAssignedTableId(res.assignedTable?._id || '');
    setActionError('');
    setShowTableModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await adminUpdateStatus(selectedRes.reservationNumber, {
        status: resStatus,
        note: statusNote
      });
      setShowStatusModal(false);
      loadReservations();
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    }
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!assignedTableId) {
      setActionError('Please select a table to assign.');
      return;
    }
    try {
      await adminAssignTable(selectedRes.reservationNumber, assignedTableId);
      setShowTableModal(false);
      loadReservations();
    } catch (err) {
      setActionError(err.message || 'Failed to assign table.');
    }
  };

  // Filters tables suitable for the reservation guestCount
  const eligibleTables = selectedRes
    ? tables.filter((t) => t.capacity >= selectedRes.guestCount && t.isActive)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations Control Panel</h1>
          <p className="text-sm text-slate-500">Assign tables, verify details, and check operational states.</p>
        </div>
        <button
          onClick={loadReservations}
          disabled={isLoading}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
        >
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

      {/* Filter panel */}
      <div className="admin-panel p-4 flex flex-col md:flex-row md:items-end gap-4 text-xs font-semibold">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            className="tf-input"
            placeholder="Search by ID, guest name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary py-2 px-4 cursor-pointer">
            <Search size={14} />
            <span>Search</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:flex gap-2">
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="guest_arrived">Guest Arrived</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label className="tf-label text-[10px] uppercase">Filter Date</label>
            <input
              type="date"
              className="tf-input w-36 py-1.5"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="admin-panel overflow-hidden">
        {isLoading && reservations.length === 0 ? (
          <div className="p-6">
            <Skeleton type="row" count={5} cols={6} />
          </div>
        ) : reservations.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Guest Information</th>
                    <th>Schedule Details</th>
                    <th>Assigned Table</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <span className="font-bold text-slate-800 text-xs">{r.reservationNumber}</span>
                      </td>
                      <td>
                        <div className="text-xs font-semibold text-slate-800">{r.guestName}</div>
                        <div className="text-[10px] text-slate-400">{r.guestEmail} • {r.guestPhone}</div>
                        {r.occasion !== 'none' && (
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded capitalize mt-0.5 inline-block">
                            {r.occasion.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="text-xs text-slate-700 font-semibold">
                          {new Date(r.reservationDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">{r.timeSlot} ({r.guestCount} guests)</div>
                      </td>
                      <td>
                        {r.assignedTable ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-800">
                              Table {r.assignedTable.tableNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {r.assignedTable.location}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openTableAssign(r)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            Assign Table
                          </button>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={r.status} className="text-[10px]" />
                      </td>
                      <td>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button
                            onClick={() => openStatusChange(r)}
                            className="text-slate-600 hover:text-slate-800 cursor-pointer"
                          >
                            Set Status
                          </button>
                          {r.assignedTable && (
                            <button
                              onClick={() => openTableAssign(r)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              Reassign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ArrowLeft size={12} />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === pagination.totalPages}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-1"
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
            title="No Bookings Found"
            message="No scheduled reservations match your filter queries."
          />
        )}
      </div>

      {/* Modal: Set Status */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Reservation Status">
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}
          <div>
            <label className="tf-label">Select Status</label>
            <select
              className="tf-select text-xs"
              value={resStatus}
              onChange={(e) => setResStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="guest_arrived">Guest Arrived</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label className="tf-label">Status change note (Optional)</label>
            <textarea
              className="tf-input h-20 resize-none text-xs"
              placeholder="e.g. Guest checked in at welcome counter..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowStatusModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs py-1.5">
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Table */}
      <Modal isOpen={showTableModal} onClose={() => setShowTableModal(false)} title="Assign Restaurant Table">
        <form onSubmit={handleTableSubmit} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}

          {selectedRes && (
            <div className="admin-panel admin-panel--nested p-3 text-xs space-y-1">
              <div><span className="text-slate-400">Ref:</span> <span className="font-semibold text-slate-800">{selectedRes.reservationNumber}</span></div>
              <div><span className="text-slate-400">Guest:</span> <span className="font-semibold text-slate-800">{selectedRes.guestName}</span></div>
              <div><span className="text-slate-400">Guests Size:</span> <span className="font-semibold text-slate-800">{selectedRes.guestCount} Guests</span></div>
              <div><span className="text-slate-400">Preference:</span> <span className="font-semibold text-slate-800 capitalize">{selectedRes.seatingPreference}</span></div>
            </div>
          )}

          <div>
            <label className="tf-label">Select Available Table</label>
            <select
              className="tf-select text-xs animate-none"
              value={assignedTableId}
              onChange={(e) => setAssignedTableId(e.target.value)}
            >
              <option value="">-- Choose Table --</option>
              {eligibleTables.map((t) => (
                <option key={t._id} value={t._id}>
                  Table {t.tableNumber} (Cap: {t.capacity} • {t.location} • Status: {t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTableModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs py-1.5">
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminReservations;
