// src/api/admin.api.js
import api from './client.js';

export const adminApi = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Appeals
  getAppeals: (params) => api.get('/admin/appeals', { params }),
  updateAppealStatus: (id, status) => api.put(`/admin/appeals/${id}/status`, { status }),

  // Stats
  getStats: () => api.get('/admin/stats'),
};
