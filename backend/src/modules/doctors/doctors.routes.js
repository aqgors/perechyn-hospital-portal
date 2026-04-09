// src/modules/doctors/doctors.routes.js
import { doctorsController } from './doctors.controller.js';

export async function doctorsRoutes(fastify) {
  fastify.get('/', doctorsController.getAll);
  fastify.get('/:id', doctorsController.getById);
}
