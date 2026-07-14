import api from './api';

const dashboardService = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getGuestDashboard: () => api.get('/dashboard/guest')
};

export default dashboardService;
