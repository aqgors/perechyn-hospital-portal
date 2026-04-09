// src/modules/specialties/specialties.routes.js
import { specialtiesController } from './specialties.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export default async function specialtiesRoutes(fastify) {
  fastify.get('/', specialtiesController.getAll);
  fastify.get('/:id', specialtiesController.getById);

  fastify.post('/', {
    preHandler: [authenticate, authorize(['ADMIN'])]
  }, specialtiesController.create);
}
