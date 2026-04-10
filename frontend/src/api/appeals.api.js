// src/api/appeals.api.js
import api from './client.js';

export const appealsApi = {
  getAll: (params) => api.get('/appeals', { params }),
  getById: (id) => api.get(`/appeals/${id}`),
  create: (data) => api.post('/appeals', data),
  update: (id, data) => api.patch(`/appeals/${id}`, data),
  delete: (id) => api.delete(`/appeals/${id}`),
  getOccupiedSlots: (params) => api.get('/appeals/occupied-slots', { params }),
  getUnreadCount: () => api.get('/appeals/unread-count'),
  markAsRead: (id) => api.post(`/appeals/${id}/read-messages`),
};
