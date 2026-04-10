// src/modules/doctor/doctor.routes.js
import { getPatientAppeals, handleAppeal } from './doctor.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export async function doctorRoutes(fastify) {
  fastify.addHook('preHandler', async function (request, reply) {
    await authenticate(request, reply);
    if (reply.sent) return;
    await authorize('DOCTOR')(request, reply);
  });

  fastify.get('/appeals', {
    schema: {
      tags: ['Doctor'],
      summary: 'Отримати чергу звернень пацієнтів',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 50 },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'] },
          search: { type: 'string' },
        },
      },
    },
    handler: getPatientAppeals,
  });

  fastify.patch('/appeals/:id', {
    schema: {
      tags: ['Doctor'],
      summary: 'Обробити звернення (змінити статус/коментар)',
      security: [{ bearerAuth: [] }],
      body: { 
        type: 'object', 
        properties: { 
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'] },
          doctorComment: { type: 'string' }
        } 
      },
    },
    handler: handleAppeal,
  });
}
