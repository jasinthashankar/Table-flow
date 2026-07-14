import api from './api';

const serviceRequestService = {
  createRequest: (data) => api.post('/service-requests', data),
  getMyRequests: (params = {}) => api.get('/service-requests/me', { params }),
  cancelRequest: (id) => api.patch(`/service-requests/${id}/cancel`),
  adminGetRequests: (params) => api.get('/service-requests', { params }),
  adminUpdateRequest: (id, data) => api.patch(`/service-requests/${id}`, data)
};

export default serviceRequestService;
