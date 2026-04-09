// src/api/doctors.api.js
import client from './client.js';

export const doctorsApi = {
  getDoctors: () => client.get('/doctors'),
  getDoctorById: (id) => client.get(`/doctors/${id}`),
};
