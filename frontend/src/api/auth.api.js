// src/api/auth.api.js
import api from './client.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  changePassword: (data) => api.post('/users/me/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyCode: (data) => api.post('/auth/verify-code', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
