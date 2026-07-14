import { create } from 'zustand';
import reservationService from '../services/reservationService';

const useReservationStore = create((set, get) => ({
  reservations: [],
  pagination: null,
  isLoading: false,
  error: null,
  availability: null, // Holds { date, guestCount, seatingPreference, slots }
  currentReservation: null,

  fetchAvailability: async (date, guestCount, seatingPreference = 'any') => {
    set({ isLoading: true, error: null, availability: null });
    try {
      const response = await reservationService.getAvailability({
        date,
        guestCount,
        seatingPreference
      });
      set({ availability: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to check table availability', isLoading: false });
      throw err;
    }
  },

  placeReservation: async (reservationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.createReservation(reservationData);
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to book reservation', isLoading: false });
      throw err;
    }
  },

  fetchReservations: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.getReservations({ page, limit });
      set({
        reservations: response.data || [],
        pagination: response.pagination || null,
        isLoading: false
      });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch reservation history', isLoading: false });
    }
  },

  fetchReservationDetails: async (reservationNumber) => {
    set({ isLoading: true, error: null, currentReservation: null });
    try {
      const response = await reservationService.getReservation(reservationNumber);
      set({ currentReservation: response.data || null, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load reservation details', isLoading: false });
      throw err;
    }
  },

  updateReservation: async (reservationNumber, reservationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.updateReservation(reservationNumber, reservationData);
      const current = get().currentReservation;
      if (current && current.reservationNumber === reservationNumber) {
        set({ currentReservation: response.data });
      }
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.reservationNumber === reservationNumber ? response.data : r
        ),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update reservation', isLoading: false });
      throw err;
    }
  },

  cancelReservation: async (reservationNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.cancelReservation(reservationNumber);
      
      const current = get().currentReservation;
      if (current && current.reservationNumber === reservationNumber) {
        set({ currentReservation: response.data });
      }

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.reservationNumber === reservationNumber ? response.data : r
        ),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to cancel reservation', isLoading: false });
      throw err;
    }
  },

  // Admin: Get all reservations
  fetchAdminReservations: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.adminGetReservations(params);
      set({
        reservations: response.data || [],
        pagination: response.pagination || null,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch reservations', isLoading: false });
      throw err;
    }
  },

  // Admin: Assign table
  adminAssignTable: async (reservationNumber, tableId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.adminAssignTable(reservationNumber, { tableId });
      const current = get().currentReservation;
      if (current && current.reservationNumber === reservationNumber) {
        set({ currentReservation: response.data });
      }
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.reservationNumber === reservationNumber ? response.data : r
        ),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to assign table', isLoading: false });
      throw err;
    }
  },

  // Admin: Update status
  adminUpdateStatus: async (reservationNumber, statusData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reservationService.adminUpdateStatus(reservationNumber, statusData);
      const current = get().currentReservation;
      if (current && current.reservationNumber === reservationNumber) {
        set({ currentReservation: response.data });
      }
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.reservationNumber === reservationNumber ? response.data : r
        ),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update reservation status', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

export default useReservationStore;
