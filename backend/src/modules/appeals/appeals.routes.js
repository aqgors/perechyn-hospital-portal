// src/modules/appeals/appeals.routes.js
import { getMyAppeals, createAppeal, getAppealById, updateAppeal, deleteAppeal, getOccupiedSlots } from './appeals.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function appealsRoutes(fastify) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', {
    schema: {
      tags: ['Appeals'],
      summary: 'Мої звернення',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE'] },
        },
      },
    },
    handler: getMyAppeals,
  });

  fastify.post('/', {
    schema: {
      tags: ['Appeals'],
      summary: 'Нове звернення',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 200 },
          description: { type: 'string', minLength: 10 },
        },
      },
    },
    handler: createAppeal,
  });

  fastify.get('/:id', {
    schema: { tags: ['Appeals'], summary: 'Деталі звернення', security: [{ bearerAuth: [] }] },
    handler: getAppealById,
  });
  
  fastify.patch('/:id', {
    schema: { tags: ['Appeals'], summary: 'Редагувати звернення', security: [{ bearerAuth: [] }] },
    handler: updateAppeal,
  });

  fastify.delete('/:id', {
    schema: { tags: ['Appeals'], summary: 'Видалити звернення', security: [{ bearerAuth: [] }] },
    handler: deleteAppeal,
  });

  fastify.get('/occupied-slots', {
    schema: {
      tags: ['Appeals'],
      summary: 'Зайняті слоти часу',
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          doctorId: { type: 'string' },
          specialtyId: { type: 'string' },
        },
      },
    },
    handler: getOccupiedSlots,
  });
}
