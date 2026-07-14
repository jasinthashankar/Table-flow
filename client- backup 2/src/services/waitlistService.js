import api from './api';

const waitlistService = {
  joinWaitlist: (data) => api.post('/waitlist', data),
  getMyWaitlist: () => api.get('/waitlist/me'),
  cancelWaitlist: () => api.patch('/waitlist/me/cancel'),
  adminGetWaitlist: (params) => api.get('/admin/waitlist', { params }),
  adminUpdateWaitlist: (id, data) => api.patch(`/admin/waitlist/${id}`, data)
};

export default waitlistService;
