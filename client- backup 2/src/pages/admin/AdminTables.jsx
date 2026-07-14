import React, { useEffect, useState } from 'react';
import { TableProperties, Plus, Edit2, ShieldAlert, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import useTableStore from '../../store/useTableStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const AdminTables = () => {
  const { tables, fetchTables, createTable, updateTable, deactivateTable, isLoading, error } = useTableStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [location, setLocation] = useState('Main Dining Room');
  const [seatingType, setSeatingType] = useState('standard');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('available');
  const [isActive, setIsActive] = useState(true);

  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTables = () => {
    fetchTables().catch(() => {});
  };

  useEffect(() => {
    loadTables();
  }, [fetchTables]);

  const openAddTable = () => {
    setTableNumber('');
    setCapacity(4);
    setLocation('Main Dining Room');
    setSeatingType('standard');
    setNotes('');
    setActionError('');
    setShowAddModal(true);
  };

  const openEditTable = (table) => {
    setSelectedTable(table);
    setCapacity(table.capacity);
    setLocation(table.location);
    setSeatingType(table.seatingType);
    setNotes(table.notes || '');
    setStatus(table.status);
    setIsActive(table.isActive);
    setActionError('');
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!tableNumber.trim()) {
      setActionError('Table number is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTable({
        tableNumber: tableNumber.trim().toUpperCase(),
        capacity,
        location,
        seatingType,
        notes
      });
      setShowAddModal(false);
      loadTables();
    } catch (err) {
      setActionError(err.message || 'Failed to create table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await updateTable(selectedTable._id, {
        capacity,
        location,
        seatingType,
        status,
        isActive,
        notes
      });
      setShowEditModal(false);
      loadTables();
    } catch (err) {
      setActionError(err.message || 'Failed to update table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this table? It will be marked as unavailable.')) return;
    try {
      await deactivateTable(id);
      loadTables();
    } catch (err) {
      alert(err.message || 'Failed to deactivate table.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Floor Layout & Tables</h1>
          <p className="text-sm text-slate-500">Configure dining tables, locations, capacities, and active cleanup states.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTables} disabled={isLoading} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={openAddTable} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
            <Plus size={14} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout */}
      {isLoading && tables.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Skeleton type="card" count={4} />
        </div>
      ) : tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((t) => (
            <div
              key={t._id}
              className={`tf-card p-5 space-y-3 ${!t.isActive ? 'opacity-60 bg-slate-50 border-dashed' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Table {t.tableNumber}</h3>
                  <span className="text-[10px] text-slate-400 capitalize">{t.seatingType} • {t.location}</span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={t.status} className="text-[9px] px-2" />
                  {!t.isActive && (
                    <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1 rounded uppercase">DEACTIVATED</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div><span className="text-slate-400">Capacity:</span> <span className="font-semibold">{t.capacity} Guests</span></div>
                {t.notes && (
                  <div className="line-clamp-2 italic text-[10px] text-slate-400 mt-1">"{t.notes}"</div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 justify-end">
                <button
                  onClick={() => openEditTable(t)}
                  className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                  title="Edit details"
                >
                  <Edit2 size={12} />
                </button>
                {t.isActive && (
                  <button
                    onClick={() => handleDeactivate(t._id)}
                    className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                    title="Deactivate table"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TableProperties}
          title="No Tables Registered"
          message="Operations has not configured any restaurant tables yet."
          action={
            <button onClick={openAddTable} className="btn-primary text-xs py-1.5 px-3">
              Create Table
            </button>
          }
        />
      )}

      {/* Modal: Add Table */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Dining Table">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}

          <FormField
            label="Table Number"
            name="tableNumber"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. T13, T14"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tf-label">Capacity</label>
              <input
                type="number"
                className="tf-input"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
              />
            </div>

            <div>
              <label className="tf-label">Seating Type</label>
              <select
                className="tf-select text-xs"
                value={seatingType}
                onChange={(e) => setSeatingType(e.target.value)}
                required
              >
                <option value="standard">Standard table</option>
                <option value="couple">Couple table</option>
                <option value="window">Window table</option>
                <option value="garden">Garden table</option>
                <option value="family">Family table</option>
                <option value="group">Feast table</option>
              </select>
            </div>
          </div>

          <FormField
            label="Table Location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Dining Room, Patio, Balcony"
          />

          <div>
            <label className="tf-label">Internal notes (Optional)</label>
            <textarea
              className="tf-input h-16 resize-none text-xs"
              placeholder="e.g. Near kitchen entry, quiet corner..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-1.5">
              {isSubmitting ? 'Saving...' : 'Add Table'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Table */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Update Table Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
              {actionError}
            </div>
          )}

          {selectedTable && (
            <div className="text-xs text-slate-500 font-semibold">
              Editing layout definitions for table: <span className="text-slate-800 font-bold">{selectedTable.tableNumber}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tf-label">Capacity</label>
              <input
                type="number"
                className="tf-input"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
              />
            </div>

            <div>
              <label className="tf-label">Seating Type</label>
              <select
                className="tf-select text-xs"
                value={seatingType}
                onChange={(e) => setSeatingType(e.target.value)}
                required
              >
                <option value="standard">Standard table</option>
                <option value="couple">Couple table</option>
                <option value="window">Window table</option>
                <option value="garden">Garden table</option>
                <option value="family">Family table</option>
                <option value="group">Feast table</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="tf-label">Operational Status</label>
              <select
                className="tf-select text-xs"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="flex flex-col justify-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-slate-350"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active Table Layout</span>
              </label>
            </div>
          </div>

          <FormField
            label="Table Location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Dining Room, Patio, Balcony"
          />

          <div>
            <label className="tf-label">Internal notes (Optional)</label>
            <textarea
              className="tf-input h-16 resize-none text-xs"
              placeholder="e.g. Near kitchen entry, quiet corner..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary text-xs py-1.5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-1.5">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTables;
