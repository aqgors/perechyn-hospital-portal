// src/api/specialties.api.js
import client from './client.js';

export const specialtiesApi = {
  getSpecialties: () => client.get('/specialties'),
  getSpecialtyById: (id) => client.get(`/specialties/${id}`),
};
