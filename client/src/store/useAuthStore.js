import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialised: false,
  error: null,

  clearError: () => set({ error: null }),

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (err) {
      // Clear local state anyway to prevent user locks on connection errors
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err.message || 'Logout failed'
      });
    }
  },

  fetchCurrentUser: async () => {
    // If not initialised, set loading true. Otherwise, keep it false to avoid screen flicker.
    const state = get();
    if (!state.isInitialised) {
      set({ isLoading: true });
    }
    
    try {
      const response = await authService.getMe();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        isInitialised: true
      });
      return response.data;
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialised: true
      });
      return null;
    }
  },

  customers: [],
  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.getUsers();
      set({ customers: response.data || [], isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch customer list', isLoading: false });
      throw err;
    }
  }
}));

export default useAuthStore;
