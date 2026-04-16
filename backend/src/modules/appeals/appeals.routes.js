// src/modules/appeals/appeals.routes.js
import {
  getMyAppeals, createAppeal, getAppealById, updateAppeal,
  deleteAppeal, getOccupiedSlots, getUnreadCount, markAsRead
} from './appeals.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function appealsRoutes(fastify) {
  // ─── PUBLIC (no auth required) ──────────────────────────────────────────────
  // IMPORTANT: Must be registered BEFORE /:id to avoid being shadowed by the param route
  fastify.get('/occupied-slots', {
    schema: {
      tags: ['Appeals'],
      summary: 'Зайняті слоти часу',
      querystring: {
        type: 'object',
        properties: {
          date:        { type: 'string' },
          doctorId:    { type: 'string' },
          specialtyId: { type: 'string' },
        },
      },
    },
    handler: getOccupiedSlots,
  });

  // ─── PROTECTED (auth required) ───────────────────────────────────────────────
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', {
    schema: {
      tags: ['Appeals'],
      summary: 'Мої звернення',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page:   { type: 'integer', default: 1 },
          limit:  { type: 'integer', default: 10 },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'] },
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
        required: ['title', 'description', 'specialtyId'],
        additionalProperties: true,
        properties: {
          title:           { type: 'string', minLength: 5, maxLength: 200 },
          description:     { type: 'string', minLength: 20 },
          specialtyId:     { type: 'string' },
          doctorId:        { type: 'string', nullable: true },
          appointmentDate: { type: 'string', nullable: true },
          appointmentTime: { type: 'string', nullable: true },
        },
      },
    },
    handler: createAppeal,
  });

  fastify.get('/unread-count', {
    schema: { tags: ['Appeals'], summary: 'Кількість непрочитаних повідомлень', security: [{ bearerAuth: [] }] },
    handler: getUnreadCount,
  });

  fastify.get('/:id', {
    schema: { tags: ['Appeals'], summary: 'Деталі звернення', security: [{ bearerAuth: [] }] },
    handler: getAppealById,
  });

  fastify.post('/:id/read-messages', {
    schema: { tags: ['Appeals'], summary: 'Позначити повідомлення прочитаними', security: [{ bearerAuth: [] }] },
    handler: markAsRead,
  });

  fastify.patch('/:id', {
    schema: { tags: ['Appeals'], summary: 'Редагувати звернення', security: [{ bearerAuth: [] }] },
    handler: updateAppeal,
  });

  fastify.delete('/:id', {
    schema: { tags: ['Appeals'], summary: 'Видалити звернення', security: [{ bearerAuth: [] }] },
    handler: deleteAppeal,
  });
}
