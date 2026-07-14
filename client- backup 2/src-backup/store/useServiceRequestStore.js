import { create } from 'zustand';
import serviceRequestService from '../services/serviceRequestService';

const useServiceRequestStore = create((set) => ({
  requests: [],
  pagination: null,
  isLoading: false,
  error: null,

  createRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceRequestService.createRequest(requestData);
      set((state) => ({
        requests: [response.data, ...state.requests],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to submit service request', isLoading: false });
      throw err;
    }
  },

  fetchMyRequests: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceRequestService.getMyRequests(params);
      set({
        requests: response.data || [],
        pagination: response.pagination || null,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load service requests', isLoading: false });
      throw err;
    }
  },

  cancelRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceRequestService.cancelRequest(id);
      set((state) => ({
        requests: state.requests.map((r) => (r._id === id ? response.data : r)),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to cancel service request', isLoading: false });
      throw err;
    }
  },

  fetchAdminRequests: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceRequestService.adminGetRequests(params);
      set({
        requests: response.data || [],
        pagination: response.pagination || null,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load administrative requests', isLoading: false });
      throw err;
    }
  },

  adminUpdateRequest: async (id, statusData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceRequestService.adminUpdateRequest(id, statusData);
      set((state) => ({
        requests: state.requests.map((r) => (r._id === id ? response.data : r)),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update service request', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

export default useServiceRequestStore;
