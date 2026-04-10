// src/api/doctor.api.js
import api from './client.js';

export const doctorApi = {
  getAppeals: (params) => api.get('/doctor/appeals', { params }),
  handleAppeal: (id, data) => api.patch(`/doctor/appeals/${id}`, data),
};
