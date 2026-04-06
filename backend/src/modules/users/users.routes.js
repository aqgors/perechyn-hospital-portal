// src/modules/users/users.routes.js
import { getMe, updateMe, changePassword } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function usersRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/me', {
    schema: { tags: ['Users'], summary: 'Отримати свій профіль', security: [{ bearerAuth: [] }] },
    handler: getMe,
  });

  fastify.put('/me', {
    schema: {
      tags: ['Users'],
      summary: 'Оновити профіль',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
    handler: updateMe,
  });

  fastify.post('/me/change-password', {
    schema: {
      tags: ['Users'],
      summary: 'Змінити пароль',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string' },
        },
      },
    },
    handler: changePassword,
  });
}
