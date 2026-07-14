import { create } from 'zustand';
import waitlistService from '../services/waitlistService';

const useWaitlistStore = create((set, get) => ({
  myWaitlistEntries: [], // Should contain the active/past guest waitlist entry
  waitlistQueue: [], // Full admin queue
  isLoading: false,
  error: null,

  joinWaitlist: async (waitlistData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await waitlistService.joinWaitlist(waitlistData);
      set((state) => ({
        myWaitlistEntries: [response.data, ...state.myWaitlistEntries],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to join waitlist', isLoading: false });
      throw err;
    }
  },

  fetchMyWaitlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await waitlistService.getMyWaitlist();
      set({ myWaitlistEntries: response.data || [], isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch waitlist entry', isLoading: false });
      throw err;
    }
  },

  cancelMyWaitlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await waitlistService.cancelWaitlist();
      set((state) => ({
        myWaitlistEntries: state.myWaitlistEntries.map((e) =>
          e.status === 'waiting' || e.status === 'notified' ? response.data : e
        ),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to cancel waitlist entry', isLoading: false });
      throw err;
    }
  },

  fetchAdminQueue: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await waitlistService.adminGetWaitlist(params);
      set({ waitlistQueue: response.data || [], isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch waitlist queue', isLoading: false });
      throw err;
    }
  },

  adminUpdateWaitlist: async (id, waitlistData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await waitlistService.adminUpdateWaitlist(id, waitlistData);
      set((state) => ({
        waitlistQueue: state.waitlistQueue.map((e) => (e._id === id ? response.data : e)),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update waitlist entry', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

export default useWaitlistStore;
