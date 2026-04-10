// src/modules/registrar/registrar.routes.js
import { getAllAppeals, updateAppeal } from './registrar.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export async function registrarRoutes(fastify) {
  fastify.addHook('preHandler', async (request, reply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    await authorize(['REGISTRAR'])(request, reply);
  });

  fastify.get('/appeals', { handler: getAllAppeals });
  fastify.patch('/appeals/:id', { handler: updateAppeal });
}
