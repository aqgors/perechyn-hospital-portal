// src/api/appeals.api.js
import api from './client.js';

export const appealsApi = {
  getAll: (params) => api.get('/appeals', { params }),
  getById: (id) => api.get(`/appeals/${id}`),
  create: (data) => api.post('/appeals', data),
  update: (id, data) => api.put(`/appeals/${id}`, data),
};
