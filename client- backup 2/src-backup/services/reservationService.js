import api from './api';

export const getAvailability = (params) =>
  api.get('/reservations/availability', { params });

export const createReservation = (payload) =>
  api.post('/reservations', payload);

// Get guest's own reservations
export const getReservations = (params = {}) =>
  api.get('/reservations/me', { params });

export const getReservation = (reservationNumber) =>
  api.get(`/reservations/${reservationNumber}`);

// Guest update eligible reservation
export const updateReservation = (reservationNumber, payload) =>
  api.patch(`/reservations/${reservationNumber}`, payload);

export const cancelReservation = (reservationNumber) =>
  api.patch(`/reservations/${reservationNumber}/cancel`);

// Admin: Get all reservations
export const adminGetReservations = (params = {}) =>
  api.get('/reservations', { params });

// Admin: Assign table
export const adminAssignTable = (reservationNumber, payload) =>
  api.patch(`/reservations/${reservationNumber}/assign-table`, payload);

// Admin: Update reservation status
export const adminUpdateStatus = (reservationNumber, payload) =>
  api.patch(`/reservations/${reservationNumber}/status`, payload);

const reservationService = {
  getAvailability,
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  adminGetReservations,
  adminAssignTable,
  adminUpdateStatus
};

export default reservationService;
