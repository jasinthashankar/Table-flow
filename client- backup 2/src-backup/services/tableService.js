import api from './api';

const tableService = {
  getTables: (params) => api.get('/tables', { params }),
  getTable: (id) => api.get(`/tables/${id}`),
  createTable: (data) => api.post('/tables', data),
  updateTable: (id, data) => api.patch(`/tables/${id}`, data),
  deactivateTable: (id) => api.patch(`/tables/${id}/deactivate`)
};

export default tableService;
