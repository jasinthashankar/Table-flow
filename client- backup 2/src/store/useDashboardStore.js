import { create } from 'zustand';
import dashboardService from '../services/dashboardService';

const useDashboardStore = create((set) => ({
  adminData: null,
  guestData: null,
  isLoading: false,
  error: null,

  fetchAdminDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getAdminDashboard();
      set({ adminData: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load operational dashboard summary', isLoading: false });
      throw err;
    }
  },

  fetchGuestDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardService.getGuestDashboard();
      set({ guestData: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load operational summary', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

export default useDashboardStore;
