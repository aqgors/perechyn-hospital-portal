// src/modules/admin/admin.routes.js
import { getAllUsers, updateUser, deleteUser, getStats } from './admin.controller.js';
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
      body: { 
        type: 'object', 
        required: ['role'], 
        properties: { 
          role: { type: 'string', enum: ['USER', 'ADMIN', 'DOCTOR', 'REGISTRAR'] },
          specialtyId: { type: ['string', 'null'] },
          bioUA: { type: ['string', 'null'] },
          bioEN: { type: ['string', 'null'] },
          photoUrl: { type: ['string', 'null'] },
        } 
      },
    },
    handler: updateUser,
  });

  fastify.delete('/users/:id', {
    schema: { tags: ['Admin'], summary: 'Видалити користувача', security: [{ bearerAuth: [] }] },
    handler: deleteUser,
  });


  // Stats
  fastify.get('/stats', {
    schema: { tags: ['Admin'], summary: 'Статистика', security: [{ bearerAuth: [] }] },
    handler: getStats,
  });
}
