import React from 'react';

const STATUS_CLASSES = {
  // Reservation
  pending:      'badge-pending',
  confirmed:    'badge-confirmed',
  guest_arrived:'badge-guest_arrived',
  seated:       'badge-seated',
  completed:    'badge-completed',
  cancelled:    'badge-cancelled',
  no_show:      'badge-no_show',
  // Waitlist
  waiting:      'badge-waiting',
  notified:     'badge-notified',
  expired:      'badge-expired',
  // Service Request
  open:         'badge-open',
  in_progress:  'badge-in_progress',
  // Table
  available:    'badge-available',
  occupied:     'badge-occupied',
  cleaning:     'badge-cleaning',
  unavailable:  'badge-unavailable',
  reserved:     'badge-reserved',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  guest_arrived: 'Guest Arrived',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  waiting: 'Waiting',
  notified: 'Notified',
  expired: 'Expired',
  open: 'Open',
  in_progress: 'In Progress',
  available: 'Available',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  unavailable: 'Unavailable',
  reserved: 'Reserved',
};

const StatusBadge = ({ status, className = '' }) => {
  const badgeClass = STATUS_CLASSES[status] || 'badge-no_show';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
