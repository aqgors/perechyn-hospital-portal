// src/modules/auth/auth.routes.js — маршрути авторизації
import { register, login, refresh, logout, forgotPassword, verifyCode, resetPassword } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function authRoutes(fastify) {
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Реєстрація нового користувача',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string', minLength: 2, maxLength: 100 },
          email:    { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
    },
    handler: register,
  });

  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Вхід до системи',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: login,
  });

  fastify.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Оновлення access токена',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
    handler: refresh,
  });

  fastify.post(
    '/logout',
    {
      schema: { tags: ['Auth'], summary: 'Вихід із системи', security: [{ bearerAuth: [] }] },
      preHandler: authenticate,
    },
    logout
  );

  fastify.post('/forgot-password', {
    schema: { tags: ['Auth'], summary: 'Запит коду відновлення паролю' },
    handler: forgotPassword,
  });

  fastify.post('/verify-code', {
    schema: { tags: ['Auth'], summary: 'Верифікація коду підтвердження' },
    handler: verifyCode,
  });

  fastify.post('/reset-password', {
    schema: { tags: ['Auth'], summary: 'Скидання паролю' },
    handler: resetPassword,
  });
}
