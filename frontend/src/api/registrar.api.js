// src/api/registrar.api.js
import client from './client.js';

const registrarApi = {
  getAppeals: (params) => client.get('/registrar/appeals', { params }),
  updateAppeal: (id, data) => client.patch(`/registrar/appeals/${id}`, data),
};

export default registrarApi;
