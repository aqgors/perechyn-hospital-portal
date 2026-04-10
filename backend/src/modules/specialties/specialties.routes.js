// src/modules/specialties/specialties.routes.js
import { specialtiesController } from './specialties.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export default async function specialtiesRoutes(fastify) {
  // Public: read-only access
  fastify.get('/', specialtiesController.getAll);
  fastify.get('/:id', specialtiesController.getById);

  // Admin-only: create, edit, delete
  fastify.post('/', {
    preHandler: [authenticate, authorize(['ADMIN'])]
  }, specialtiesController.create);

  fastify.put('/:id', {
    preHandler: [authenticate, authorize(['ADMIN'])]
  }, specialtiesController.update);

  fastify.delete('/:id', {
    preHandler: [authenticate, authorize(['ADMIN'])]
  }, specialtiesController.remove);
}
