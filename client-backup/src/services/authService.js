import api from './api';

/**
 * Auth API services mapping to backend auth controllers
 */
const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  getUsers: async () => {
    return await api.get('/auth/users');
  }
};

export default authService;
