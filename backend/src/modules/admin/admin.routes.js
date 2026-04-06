// src/modules/admin/admin.routes.js
import { getAllUsers, updateUser, deleteUser, getAllAppeals, updateAppealStatus, getStats } from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export async function adminRoutes(fastify) {
  // Fastify v4: addHook requires a single function, not an array
  fastify.addHook('preHandler', async function (request, reply) {
    await authenticate(request, reply);
    if (reply.sent) return; // stop if auth already rejected
    await authorize('ADMIN')(request, reply);
  });

  // Users
  fastify.get('/users', {
    schema: { tags: ['Admin'], summary: 'Всі користувачі', security: [{ bearerAuth: [] }] },
    handler: getAllUsers,
  });

  fastify.put('/users/:id', {
    schema: {
      tags: ['Admin'],
      summary: 'Змінити роль користувача',
      security: [{ bearerAuth: [] }],
      body: { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['USER', 'ADMIN'] } } },
    },
    handler: updateUser,
  });

  fastify.delete('/users/:id', {
    schema: { tags: ['Admin'], summary: 'Видалити користувача', security: [{ bearerAuth: [] }] },
    handler: deleteUser,
  });

  // Appeals (Requests)
  fastify.get('/appeals', {
    schema: {
      tags: ['Admin'],
      summary: 'Всі звернення',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE'] },
          search: { type: 'string' },
        },
      },
    },
    handler: getAllAppeals,
  });

  fastify.put('/appeals/:id/status', {
    schema: {
      tags: ['Admin'],
      summary: 'Змінити статус звернення',
      security: [{ bearerAuth: [] }],
      body: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE'] } } },
    },
    handler: updateAppealStatus,
  });

  // Stats
  fastify.get('/stats', {
    schema: { tags: ['Admin'], summary: 'Статистика', security: [{ bearerAuth: [] }] },
    handler: getStats,
  });
}
