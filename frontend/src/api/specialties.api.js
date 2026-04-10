// src/api/specialties.api.js
import client from './client.js';

const specialtiesApi = {
  getAll: (params) => client.get('/specialties', { params }),
  getById: (id) => client.get(`/specialties/${id}`),
  create: (data) => client.post('/specialties', data),
  update: (id, data) => client.put(`/specialties/${id}`, data),
  remove: (id) => client.delete(`/specialties/${id}`),
};

export default specialtiesApi;
